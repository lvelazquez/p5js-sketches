// Loads every sketch headless, fails on console errors / page errors / failed requests,
// and checks the accessibility contract (aria-label, Space pause, reduced motion).
import { chromium, type Page } from "playwright";
import { serve } from "./serve.ts";
import { discoverSketches } from "./sketches.ts";

const SETTLE_MS = 2500;
const { url, server } = await serve();
const browser = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const sketches = await discoverSketches();
const failures: string[] = [];

async function open(path: string, reducedMotion: "reduce" | "no-preference") {
  const context = await browser.newContext({ viewport: { width: 900, height: 700 }, reducedMotion });
  const page = await context.newPage();
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console.error: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => problems.push(`request failed: ${r.url()}`));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  await page.goto(`${url}/${path}/`);
  await page.waitForSelector("canvas");
  return { page, context, problems };
}

const pausedLabel = (page: Page) => page.locator(".kit-controls button").first().innerText();

for (const s of [...sketches, { id: "_template", title: "", description: "", audio: false, category: "" }]) {
  const issues: string[] = [];
  const { page, context, problems } = await open(s.id, "no-preference");
  await page.waitForTimeout(SETTLE_MS);
  const label = await page.locator("canvas").getAttribute("aria-label");
  if (!label || label.length < 20) issues.push(`canvas aria-label missing or too short: ${label}`);
  if ((await page.locator("canvas").getAttribute("role")) !== "img") issues.push("canvas role=img missing");

  if ((await pausedLabel(page)) !== "Pause") issues.push("expected running state at load");
  await page.keyboard.press("Space");
  if ((await pausedLabel(page)) !== "Play") issues.push("Space did not pause");
  await page.keyboard.press("Space");
  if ((await pausedLabel(page)) !== "Pause") issues.push("Space did not resume");

  if (s.audio) {
    const mic = page.getByRole("button", { name: "Start microphone" });
    if ((await mic.count()) !== 1) issues.push("missing Start microphone button");
    else {
      const before = await page.evaluate("Kit.audio.live");
      if (before) issues.push("microphone live before a user gesture");
      await mic.click();
      await page.getByRole("button", { name: "Stop microphone" }).waitFor({ timeout: 5000 }).catch(() => issues.push("mic did not start after click"));
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: "Stop microphone" }).click().catch(() => {});
      if (await page.evaluate("Kit.audio.live")) issues.push("mic still live after Stop");
    }
  }
  issues.push(...problems);
  await context.close();

  // Reduced motion: must come up paused after the warm-up.
  const rm = await open(s.id, "reduce");
  await rm.page.waitForTimeout(SETTLE_MS + 1500);
  if ((await pausedLabel(rm.page)) !== "Play") issues.push("reduced motion: sketch did not start paused");
  issues.push(...rm.problems.map((p) => `(reduced motion) ${p}`));
  await rm.context.close();

  console.log(`${issues.length ? "FAIL" : "ok  "} ${s.id}${issues.length ? "\n  - " + issues.join("\n  - ") : ""}`);
  failures.push(...issues.map((i) => `${s.id}: ${i}`));
}

await browser.close();
server.close();
if (failures.length) {
  console.error(`\n${failures.length} problem(s)`);
  process.exit(1);
}
console.log(`\nAll ${sketches.length + 1} pages passed.`);
