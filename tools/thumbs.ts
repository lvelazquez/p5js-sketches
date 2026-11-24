// Regenerates thumbs/<category>-<name>.jpg for the gallery. Sketches are random, so
// thumbnails differ on every run; commit them only when you add or change a sketch.
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { ROOT, serve } from "./serve.ts";
import { discoverSketches, thumbName } from "./sketches.ts";

const THUMB_SIZE = 480;
const DEFAULT_WAIT_MS = 3000;
/** Sketches whose best frame is not at the default wait (ms). */
const WAIT_MS: Record<string, number> = {
  "grids/rand-paths": 1600,
  "rand/rand-peaks": 2600,
};

await mkdir(join(ROOT, "thumbs"), { recursive: true });
const { url, server } = await serve();
const browser = await chromium.launch();
for (const s of await discoverSketches()) {
  const page = await browser.newPage({ viewport: { width: THUMB_SIZE, height: THUMB_SIZE } });
  await page.goto(`${url}/${s.id}/`);
  await page.addStyleTag({ content: ".kit-controls{display:none!important}" });
  await page.waitForTimeout(WAIT_MS[s.id] ?? DEFAULT_WAIT_MS);
  await page.screenshot({ path: join(ROOT, "thumbs", thumbName(s.id)), type: "jpeg", quality: 82 });
  console.log("thumb", s.id);
  await page.close();
}
await browser.close();
server.close();
