// Copies only the publishable files into _site/ for GitHub Pages.
import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./serve.ts";
import { discoverSketches } from "./sketches.ts";

const out = join(ROOT, "_site");
await rm(out, { recursive: true, force: true });
await mkdir(out);
for (const f of ["index.html", "common", "vendor", "thumbs"]) await cp(join(ROOT, f), join(out, f), { recursive: true });
for (const s of await discoverSketches()) await cp(join(ROOT, s.id), join(out, s.id), { recursive: true });
console.log("Built _site/");
