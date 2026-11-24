# p5.js sketches

Generative sketches built with [p5.js](https://p5js.org/). Open `index.html` (served) for the gallery, which lists every sketch with a thumbnail and description.

| Folder | Sketches |
| --- | --- |
| `audioviz/` | `spherical-viz` (microphone) |
| `grids/` | `rand-paths`, `rotating-lines`, `sine-arcs` |
| `mandalas/` | `arcs`, `round-arcs` |
| `rand/` | `crooked-quads-peak` (microphone), `rand-peaks` |

Once Pages is enabled the gallery is served from `https://lvelazquez.github.io/p5js-sketches/`.

## Run locally

Sketches are plain static files (no bundler), so they only need a static server. Requires Node 22.18 or newer.

```sh
npm install
npm run dev      # regenerates index.html and serves http://127.0.0.1:8080/
```

Any static server works (`python3 -m http.server`). Opening a sketch with `file://` also works except for the microphone, which browsers only allow on `localhost` or HTTPS.

## Controls and accessibility

- Every sketch has a **Pause/Play** button and responds to **Space**.
- If your system sets `prefers-reduced-motion: reduce`, a sketch runs about 1.5 seconds and then starts paused. Press Space or Play to animate.
- Each canvas is `role="img"` with an `aria-label` built from the page title and description, and is keyboard focusable.
- Canvases resize with the window.
- Microphone sketches never request the microphone on load. Press **Start microphone** (and **Stop microphone** to release it). Until then a built-in demo signal drives the visuals.

## Add a sketch

```sh
npm run new -- grids/my-sketch "My sketch" "One sentence describing it."
```

This copies `_template/` to `grids/my-sketch/` and fixes its relative paths. Then:

1. Edit `grids/my-sketch/sketch.js`. Keep `Kit.init()` as the last line of `setup()`. For audio, also call `Kit.audio.init(onPeak)` right after it and read `Kit.audio.energy("bass")` instead of using `p5.AudioIn` directly.
2. Use `Palette` (`common/palette.js`) and named constants at the top of the file rather than literals. Use `Kit.millis()` instead of `millis()` for timing so Pause works.
3. Add `<script src="../../vendor/p5.sound.min.js">` and `<meta name="sketch:audio" content="microphone" />` to its `index.html` only if it uses sound.
4. `npm run gallery` (rebuilds `index.html`) and `npm run thumbs` (rebuilds `thumbs/`), then commit both.
5. `npm run check` before pushing.

## Shared code

| File | Purpose |
| --- | --- |
| `common/palette.js` | `Palette` colour tokens and schemes |
| `common/ease.js` | `ease(t, name)` easing functions |
| `common/sketch-kit.js` | `Kit`: canvas size, aria, pause/Space, reduced motion, audio start/stop |
| `common/style.css` | Page and control styles |
| `vendor/` | p5.js 1.11.13 and p5.sound, vendored (copied from the `p5` npm package) |

## Checks

`npm run check` serves the repo and loads every sketch in headless Chromium, failing on any console error, page error or failed request. It also verifies the aria-label, Space to pause and resume, reduced-motion start, and (for audio sketches) that the microphone only starts after a click. `npm run typecheck` type-checks the tooling (TypeScript, strict). CI runs both on every pull request.

## Deploy

`.github/workflows/pages.yml` publishes the gallery and sketches to GitHub Pages on every push to the default branch. One-time setup: Settings, Pages, Source: GitHub Actions.

## Why plain JavaScript sketches

The sketches are global-mode p5 scripts loaded by `<script>` tags so they run on any static host with no build step. The tooling in `tools/` (gallery, thumbnails, checks, server) is TypeScript with `strict`, run directly by Node.

## Updating p5

```sh
npm install --no-save p5@<version>
cp node_modules/p5/lib/p5.min.js node_modules/p5/lib/addons/p5.sound.min.js vendor/
npm run check
```

p5 2.x changes several APIs and is not yet used here.
