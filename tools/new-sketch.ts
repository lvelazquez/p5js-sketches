// Usage: npm run new -- <category>/<name> "Title" "One-sentence description"
import { cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./serve.ts";

const [id, title, description] = process.argv.slice(2);
if (!id || !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(id) || !title || !description) {
  console.error('Usage: npm run new -- <category>/<name> "Title" "One-sentence description"');
  process.exit(1);
}
const dest = join(ROOT, id);
await cp(join(ROOT, "_template"), dest, { recursive: true, errorOnExist: true, force: false });
const file = join(dest, "index.html");
const html = (await readFile(file, "utf8"))
  .replaceAll('"../', '"../../') // template sits one level up from a real sketch
  .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*"/, `$1${description}"`)
  .replace(/(<h1 class="visually-hidden">).*?(<\/h1>)/, `$1${title}$2`);
await writeFile(file, html);
console.log(`Created ${id}/. Next: edit ${id}/sketch.js, then npm run gallery && npm run thumbs`);
