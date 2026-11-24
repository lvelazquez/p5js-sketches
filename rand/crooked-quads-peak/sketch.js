const QUAD_COUNT = 3;
const DESIGN_SIZE = 900; // px the pixel constants below were tuned at
const WIDE_RECT = { w: 500, h: 100 };
const START_RECT = { w: 500, h: 200 };
const CORNER_JITTER = 40; // gaussian spread of corner positions
const CENTER_OFFSET = { mean: 50, sd: 10 }; // gaussian range around the canvas center
const SHAPE_EASE = 0.4; // per-frame lerp toward the target quad
const COLOR_EASE = 0.2; // per-frame lerp toward the target colour
const FLIP_CHANCE = 0.5; // chance a new target is tall instead of wide
const BASS_TO_BACKGROUND = [200, 255]; // bass energy -> background gray
const BACKGROUND_ALPHA = 200;

let quads = [];
let unit = 1; // canvas size / DESIGN_SIZE

const px = (v) => v * unit;
const randomSwatch = () => Palette.quads[floor(random(Palette.quads.length))];

function randomQuad(x, y, w, h) {
  const j = px(CORNER_JITTER) / 2;
  return [
    randomGaussian(x, j), randomGaussian(y, j),
    randomGaussian(x + w, j), randomGaussian(y, j),
    randomGaussian(x + w, j), randomGaussian(y + h, j),
    randomGaussian(x, j), randomGaussian(y + h, j),
  ];
}

function randomAround(center, range) {
  return random(center - range, center + range);
}

class CrookedQuad {
  constructor(w, h) {
    this.color = color(randomSwatch());
    this.targetColor = color(randomSwatch());
    const x = width / 2 - w / 2;
    const y = height / 2 - h / 2;
    this.current = randomQuad(x, y, w, h);
    this.target = randomQuad(x, y, w, h);
  }

  changeTarget() {
    const tall = random() < FLIP_CHANCE;
    const w = px(tall ? WIDE_RECT.h : WIDE_RECT.w);
    const h = px(tall ? WIDE_RECT.w : WIDE_RECT.h);
    const range = randomGaussian(px(CENTER_OFFSET.mean), px(CENTER_OFFSET.sd));
    const cx = randomAround(width / 2 - w / 2, range);
    const cy = randomAround(height / 2 - h / 2, randomGaussian(px(CENTER_OFFSET.mean), px(CENTER_OFFSET.sd)));
    this.target = randomQuad(cx, cy, w, h);
    this.targetColor = color(randomSwatch());
  }

  update() {
    this.current = this.current.map((v, i) => lerp(v, this.target[i], SHAPE_EASE));
    this.color = lerpColor(this.color, this.targetColor, COLOR_EASE);
    fill(this.color);
    quad(...this.current);
  }
}

function buildQuads() {
  unit = width / DESIGN_SIZE;
  quads = Array.from({ length: QUAD_COUNT }, () => new CrookedQuad(px(START_RECT.w), px(START_RECT.h)));
}

function setup() {
  createCanvas(Kit.size(), Kit.size());
  noStroke();
  buildQuads();
  Kit.init();
  Kit.audio.init(() => quads.forEach((q) => q.changeTarget())); // after Kit.init()
}

function windowResized() {
  resizeCanvas(Kit.size(), Kit.size());
  buildQuads();
}

function draw() {
  Kit.audio.update();
  const gray = map(Kit.audio.energy("bass"), 0, 255, ...BASS_TO_BACKGROUND);
  background(gray, BACKGROUND_ALPHA);
  quads.forEach((q) => q.update());
}
