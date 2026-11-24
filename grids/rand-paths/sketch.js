const GRID_DIVISIONS = 10;
const PATH_COUNT = 30;
const GRID_FILL = 0.85; // fraction of the canvas used by the path area
const CANVAS_SNAP = 10;
const DRAW_MS = 2000; // time to draw (and to retract) the paths
const STROKE_WEIGHT = 10;
const PATH_ALPHA_HEX = "AA";
const LENGTH_RANGE = [0.45, 0.5]; // fractions of the path area
const FADE_ALPHA = 100; // background alpha per frame
const EASING = "quinticInOut";

function snapPolarToGrid(angle, length, gridSize) {
  const x = cos(angle) * length;
  const y = sin(angle) * length;
  return createVector(round(x / gridSize) * gridSize, round(y / gridSize) * gridSize);
}

class RandGridPath {
  constructor(areaSize, gridSize) {
    const colorIndex = floor(random(Palette.cools.length));
    this.color = Palette.cools[colorIndex] + PATH_ALPHA_HEX;
    this.colorStatic = Palette.cools[(colorIndex + 1) % Palette.cools.length];
    const startAngle = random(-PI, PI);
    const length = random(areaSize * LENGTH_RANGE[0], areaSize * LENGTH_RANGE[1]);
    this.start = snapPolarToGrid(startAngle, length, gridSize);
    this.end = snapPolarToGrid(startAngle + PI, length, gridSize);
    this.path = [this.start];

    // Random walk on the grid from start toward end, one axis per step.
    let x = this.start.x;
    let y = this.start.y;
    while (x !== this.end.x && y !== this.end.y) {
      if (random() > 0.5) x += gridSize * Math.sign(this.end.x - x);
      else y += gridSize * Math.sign(this.end.y - y);
      this.path.push(createVector(x, y));
    }
  }

  /** Draw the path up to fraction t (0..1) of its length. */
  update(t) {
    const last = this.path.length - 1;
    const pos = constrain(t * this.path.length, 0, last);
    const from = this.path[floor(pos)];
    const to = this.path[ceil(pos)];
    const tip = p5.Vector.lerp(from, to, pos % 1);

    stroke(this.color);
    strokeWeight(STROKE_WEIGHT);
    strokeJoin(MITER);
    strokeCap(ROUND);
    noFill();
    beginShape();
    for (let i = 0; i < floor(pos); i++) {
      vertex(this.path[i].x, this.path[i].y);
      vertex(this.path[i + 1].x, this.path[i + 1].y);
    }
    endShape();
    if (t < 1) line(from.x, from.y, tip.x, tip.y);
    stroke(this.colorStatic);
    point(this.end.x, this.end.y);
  }
}

let areaSize;
let gridSize;
let paths = [];
let startTime;
let isReverse = false;

function canvasSide() {
  return floor(Kit.size() / CANVAS_SNAP) * CANVAS_SNAP;
}

function buildPaths() {
  areaSize = round(width * GRID_FILL);
  gridSize = round(areaSize / GRID_DIVISIONS);
  paths = Array.from({ length: PATH_COUNT }, () => new RandGridPath(areaSize, gridSize));
}

function setup() {
  createCanvas(canvasSide(), canvasSide());
  startTime = Kit.millis();
  buildPaths();
  Kit.init();
}

function windowResized() {
  resizeCanvas(canvasSide(), canvasSide());
  buildPaths();
}

function draw() {
  const raw = constrain((Kit.millis() - startTime) / DRAW_MS, 0, 1);
  if (raw >= 1) {
    // Finished one direction: swap to retract, or reroll after retracting.
    if (isReverse) buildPaths();
    isReverse = !isReverse;
    startTime = Kit.millis();
    return;
  }
  const progress = ease(isReverse ? 1 - raw : raw, EASING);
  background(Kit.withAlpha(Palette.paper, FADE_ALPHA));
  translate((width - areaSize) / 2, (height - areaSize) / 2);
  translate(areaSize / 2, areaSize / 2);
  paths.forEach((p) => p.update(progress));
}
