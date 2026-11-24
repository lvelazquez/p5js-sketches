// Generates index.html (the gallery) from each sketch's <title> and <meta name="description">.
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./serve.ts";
import { discoverSketches, thumbName, type Sketch } from "./sketches.ts";

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const label = (category: string) => category.charAt(0).toUpperCase() + category.slice(1);

const card = (s: Sketch) => `        <li class="card">
          <a href="${s.id}/">
            <img src="thumbs/${thumbName(s.id)}" width="480" height="480" loading="lazy" alt="Preview of the ${esc(s.title)} sketch" />
            <span class="card-body">
              <span class="card-title">${esc(s.title)}${s.audio ? ' <span class="badge">microphone</span>' : ""}</span>
              <span class="card-desc">${esc(s.description)}</span>
            </span>
          </a>
        </li>`;

const sketches = await discoverSketches();
const categories = [...new Set(sketches.map((s) => s.category))];
const sections = categories
  .map(
    (c) => `    <section aria-labelledby="cat-${c}">
      <h2 id="cat-${c}">${label(c)}</h2>
      <ul class="grid">
${sketches.filter((s) => s.category === c).map(card).join("\n")}
      </ul>
    </section>`
  )
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>p5.js sketches</title>
    <meta name="description" content="A gallery of generative p5.js sketches." />
    <style>
      :root {
        --color-ground: #fafafa;
        --color-text: #1a1a1a;
        --color-muted: #555;
        --color-card: #fff;
        --color-border: #d4d4d4;
        --color-accent: #0b5cad;
        --color-focus: #0b5cad;
        --space-1: 4px;
        --space-2: 8px;
        --space-3: 16px;
        --space-4: 24px;
        --radius: 8px;
        --font: system-ui, -apple-system, "Segoe UI", sans-serif;
        --card-min: 240px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --color-ground: #121212;
          --color-text: #f0f0f0;
          --color-muted: #b0b0b0;
          --color-card: #1c1c1c;
          --color-border: #3a3a3a;
          --color-accent: #7ab7ff;
          --color-focus: #ffd92f;
        }
      }
      body { margin: 0; background: var(--color-ground); color: var(--color-text); font-family: var(--font); line-height: 1.45; }
      header, main { max-width: 1200px; margin: 0 auto; padding: var(--space-4) var(--space-3); }
      header { padding-bottom: 0; }
      h1 { margin: 0 0 var(--space-2); }
      h2 { margin: var(--space-4) 0 var(--space-3); }
      p { color: var(--color-muted); margin: 0; }
      .grid { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-3); grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr)); }
      .card a { display: block; height: 100%; color: inherit; text-decoration: none; background: var(--color-card); border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden; }
      .card a:hover { border-color: var(--color-accent); }
      .card a:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
      .card img { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; background: var(--color-border); }
      .card-body { display: block; padding: var(--space-3); }
      .card-title { display: block; font-weight: 600; }
      .card-desc { display: block; color: var(--color-muted); font-size: 0.9rem; margin-top: var(--space-1); }
      .badge { font-size: 0.75rem; font-weight: 500; border: 1px solid var(--color-border); border-radius: 999px; padding: 0 var(--space-2); margin-left: var(--space-1); color: var(--color-muted); }
    </style>
  </head>
  <body>
    <header>
      <h1>p5.js sketches</h1>
      <p>Generative sketches. Every sketch pauses with Space and starts paused if your system asks for reduced motion.</p>
    </header>
    <main>
${sections}
    </main>
  </body>
</html>
`;

await writeFile(join(ROOT, "index.html"), html);
console.log(`index.html: ${sketches.length} sketches`);
