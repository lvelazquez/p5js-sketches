const LINE_COUNT = 10;
const SEGMENTS_RANGE = [10, 20];
const PEAK_AMPLITUDE = 40; // max vertical offset of a vertex, px at 800px canvas
const DESIGN_SIZE = 800; // px the constants above were tuned at
const DRAW_MS = 2000;
const HOLD_MS = 1500; // pause on the finished drawing before it redraws
const EASING = "quadraticOut";
const LINE_WEIGHT = 2;

class RandLine {
  constructor(segments, amplitude) {
    this.segments = segments;
    const step = width / segments;
    this.vectors = Array.from({ length: segments + 1 }, (_, i) =>
      createVector(i * step, random(-amplitude, amplitude))
    );
  }

  /** Draw the line up to fraction t (0..1) of its length, with a red tracer at the tip. */
  update(t) {
    const pos = constrain(t * this.segments, 0, this.segments);
    const from = this.vectors[floor(pos)];
    const to = this.vectors[ceil(pos)];
    const tip = p5.Vector.lerp(from, to, pos % 1);

    stroke(Palette.ink);
    strokeWeight(LINE_WEIGHT);
    noFill();
    beginShape();
    for (let i = 0; i <= this.segments; i++) {
      const v = this.vectors[i];
      point(v.x, v.y);
      if (floor(pos) > i) {
        vertex(v.x, v.y);
        vertex(this.vectors[i + 1].x, this.vectors[i + 1].y);
      }
    }
    endShape();
    stroke(Palette.signal);
    line(from.x, from.y, tip.x, tip.y);
    point(tip.x, tip.y);
  }
}

let startTime;
let lines = [];

function buildLines() {
  const amplitude = PEAK_AMPLITUDE * (width / DESIGN_SIZE);
  lines = Array.from(
    { length: LINE_COUNT },
    () => new RandLine(round(random(...SEGMENTS_RANGE)), amplitude)
  );
  startTime = Kit.millis();
}

function setup() {
  createCanvas(Kit.size(), Kit.size());
  buildLines();
  Kit.init();
}

function windowResized() {
  resizeCanvas(Kit.size(), Kit.size());
  buildLines();
}

function draw() {
  background(Palette.paper);
  const elapsed = Kit.millis() - startTime;
  if (elapsed > DRAW_MS + HOLD_MS) buildLines();
  const t = ease(constrain(elapsed / DRAW_MS, 0, 1), EASING);
  const rowHeight = height / lines.length;
  lines.forEach((l, i) => {
    push();
    translate(0, rowHeight * i + rowHeight / 2);
    l.update(t);
    pop();
  });
}
