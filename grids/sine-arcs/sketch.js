const GRID_CELLS = 3; // cells per side
const SIDES_RANGE = [2, 8]; // symmetry re-roll after each collapse
const INITIAL_SIDES = 15;
const ARCS_PER_ROSETTE_RANGE = [2, 10];
const MOTION_SPEED = 0.08; // divided by sides
const COLORS_PER_ROSETTE = 5;
const COLOR_ALPHA = 0.8;
const STROKE_WEIGHT_RANGE = [2, 3];
const COLLAPSE_THRESHOLD = 0.02; // arc half-angle below which the symmetry re-rolls
const RESEED_DELAY_MS = 100;
const TRAIL_ALPHA = 15; // background alpha per frame
const CENTER_DOT = 5;

function randomChannel() {
  return round(random(255));
}

class SineArcs {
  constructor(x, y, w) {
    this.reseedId = 0;
    this.arcsNum = floor(random(...ARCS_PER_ROSETTE_RANGE));
    this.arcIncrement = w / this.arcsNum;
    this.origin = createVector(x, y);
    this.angle = 0;
    this.arcLength = 0;
    this.rotateAngle = random(1);
    this.motionAngle = 0;
    this.setSides(INITIAL_SIDES);
  }

  setSides(num) {
    this.sides = num;
    this.arcMax = PI / this.sides;
    this.motionIncrement = MOTION_SPEED / this.sides;
    this.colors = Array.from(
      { length: COLORS_PER_ROSETTE },
      () => `rgba(${randomChannel()}, ${randomChannel()}, ${randomChannel()}, ${COLOR_ALPHA})`
    );
  }

  draw() {
    push();
    translate(this.origin.x, this.origin.y);
    rotate(this.rotateAngle);
    ellipse(0, 0, CENTER_DOT);
    for (let j = 0; j < this.sides; j++) {
      this.arcLength = 0;
      stroke(this.colors[j % this.colors.length]);
      strokeWeight(map(cos(this.motionAngle), -1, 1, ...STROKE_WEIGHT_RANGE));

      push();
      rotate(this.angle);
      for (let i = 0; i < this.arcsNum; i++) {
        noFill();
        const sinArc = floor(map(sin(this.motionAngle), -1, 1, 0.001, this.arcMax) * 100) / 100;
        if (sinArc < COLLAPSE_THRESHOLD && i === 0) {
          clearTimeout(this.reseedId);
          this.reseedId = setTimeout(() => this.setSides(floor(random(...SIDES_RANGE))), RESEED_DELAY_MS);
        }
        arc(0, 0, this.arcLength, this.arcLength, -sinArc, sinArc);
        this.arcLength += this.arcIncrement;
      }
      pop();
      this.motionAngle += this.motionIncrement;
      this.angle += TWO_PI / this.sides;
    }
    this.rotateAngle += 0.01;
    pop();
  }
}

let rosettes = [];

function buildRosettes() {
  const cell = width / GRID_CELLS;
  rosettes = [];
  for (let col = 0; col < GRID_CELLS; col++) {
    for (let row = 0; row < GRID_CELLS; row++) {
      rosettes.push(new SineArcs(col * cell, row * cell, cell));
    }
  }
}

function setup() {
  createCanvas(Kit.size(), Kit.size());
  buildRosettes();
  strokeCap(SQUARE);
  frameRate(60);
  Kit.init();
}

function windowResized() {
  rosettes.forEach((r) => clearTimeout(r.reseedId));
  resizeCanvas(Kit.size(), Kit.size());
  buildRosettes();
}

function draw() {
  background(Kit.withAlpha(Palette.ink, TRAIL_ALPHA));
  translate(width / GRID_CELLS / 2, width / GRID_CELLS / 2);
  rosettes.forEach((r) => r.draw());
}
