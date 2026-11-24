import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./serve.ts";

export interface Sketch {
  /** Path relative to the repo root, e.g. "grids/rotating-lines". */
  id: string;
  category: string;
  title: string;
  description: string;
  audio: boolean;
}

const decode = (s: string) =>
  s.replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");

/** Sketches are `<category>/<name>/index.html`; folders starting with `_` or `.` are skipped. */
export async function discoverSketches(): Promise<Sketch[]> {
  const sketches: Sketch[] = [];
  for (const category of (await readdir(ROOT)).sort()) {
    if (/^[_.]/.test(category) || ["node_modules", "common", "vendor", "tools", "thumbs"].includes(category)) continue;
    if (!(await stat(join(ROOT, category))).isDirectory()) continue;
    for (const name of (await readdir(join(ROOT, category))).sort()) {
      if (name.startsWith("_")) continue;
      let html: string;
      try {
        html = await readFile(join(ROOT, category, name, "index.html"), "utf8");
      } catch {
        continue;
      }
      const title = /<title>(.*?)<\/title>/s.exec(html)?.[1];
      const description = /<meta name="description" content="(.*?)"/s.exec(html)?.[1];
      if (!title || !description) throw new Error(`${category}/${name}/index.html needs <title> and <meta name="description">`);
      sketches.push({
        id: `${category}/${name}`,
        category,
        title: decode(title),
        description: decode(description),
        audio: html.includes('name="sketch:audio"'),
      });
    }
  }
  return sketches;
}

/** Thumbnail file name for a sketch id. */
export const thumbName = (id: string) => `${id.replace("/", "-")}.jpg`;
