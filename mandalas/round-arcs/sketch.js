const ARC_COUNT = 10;
const ARC_STROKE_WEIGHT = 10;
const ARC_MARGIN = 10; // px between the outer arc and the canvas edge
const ANGLE_SPEED_RANGE = [0.0001, 0.003]; // rad per frame
const ARC_LENGTH_RANGE = [Math.PI / 2, Math.PI]; // radians swept

class RandArc {
  constructor(diameter) {
    this.angle = random(Math.PI);
    this.diameter = diameter;
    this.angleSpeed = random(...ANGLE_SPEED_RANGE);
    this.arcLength = random(...ARC_LENGTH_RANGE);
    this.color = random(Palette.cools);
  }

  draw() {
    stroke(this.color);
    rotate(this.angle);
    arc(0, 0, this.diameter, this.diameter, 0, this.arcLength);
    this.angle += this.angleSpeed;
  }
}

let arcs = [];

function buildArcs() {
  const step = (width - ARC_MARGIN) / ARC_COUNT;
  arcs = Array.from({ length: ARC_COUNT }, (_, i) => new RandArc(step * (i + 1)));
}

function setup() {
  createCanvas(Kit.size(), Kit.size());
  noFill();
  strokeWeight(ARC_STROKE_WEIGHT);
  buildArcs();
  Kit.init();
}

function windowResized() {
  resizeCanvas(Kit.size(), Kit.size());
  buildArcs();
}

function draw() {
  background(Palette.ink);
  translate(width / 2, height / 2);
  arcs.forEach((a) => a.draw());
}
