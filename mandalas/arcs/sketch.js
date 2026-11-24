const ARC_COUNT = 10;
const CHANGE_INTERVAL_FRAMES = 300; // frames between morph targets
const RADIUS_RANGE = [0.01, 0.7]; // fractions of half the canvas width
const WEIGHT_RANGE = [20, 100];
const WEIGHT_RADIUS_INSET = 5; // weight never exceeds radius minus this
const ROTATION_SPEED_RANGE = [0.001, 0.01]; // rad per frame
const SWEEP_RANGE = [Math.PI / 4, Math.PI / 2]; // arc sweep, small to large radius
const FADE_ALPHA = 10; // background alpha per frame (trail length)
const HSB_MODE = { h: 250, s: 10, b: 50, a: 0.4 };
const BACKGROUND_HUE = 100;

let minRadius;
let maxRadius;

function randomColor() {
  return color(random(255), random(255), random(255), random());
}

function randomWeight(radius) {
  return min(random(...WEIGHT_RANGE), radius - WEIGHT_RADIUS_INSET);
}

class Arc {
  constructor() {
    this.radius = random(minRadius, maxRadius);
    this.newRadius = random(minRadius, maxRadius);
    this.weight = randomWeight(this.radius);
    this.newWeight = randomWeight(this.newRadius);
    this.rotationSpeed = random(...ROTATION_SPEED_RANGE);
    this.rotation = random(TWO_PI);
    this.color = randomColor();
    this.newColor = randomColor();
  }

  reset() {
    this.color = this.newColor;
    this.radius = this.newRadius;
    this.weight = this.newWeight;
    this.rotationSpeed = random(...ROTATION_SPEED_RANGE);
    this.newRadius = random(minRadius, maxRadius);
    this.newWeight = randomWeight(this.newRadius);
    this.newColor = randomColor();
  }

  draw(progress) {
    strokeWeight(lerp(this.weight, this.newWeight, progress));
    stroke(lerpColor(this.color, this.newColor, progress));
    this.rotation += this.rotationSpeed;
    rotate(this.rotation);
    const radius = lerp(this.radius, this.newRadius, progress);
    arc(0, 0, radius, radius, 0, map(radius, minRadius, maxRadius, ...SWEEP_RANGE));
  }
}

let arcs = [];

function buildArcs() {
  const half = width / 2;
  minRadius = half * RADIUS_RANGE[0];
  maxRadius = half * RADIUS_RANGE[1];
  arcs = Array.from({ length: ARC_COUNT }, () => new Arc());
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  strokeCap(SQUARE);
  colorMode(HSB, HSB_MODE.h, HSB_MODE.s, HSB_MODE.b, HSB_MODE.a);
  buildArcs();
  Kit.init();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildArcs();
}

function draw() {
  background(BACKGROUND_HUE, FADE_ALPHA);
  noFill();
  const frameProgress = frameCount % CHANGE_INTERVAL_FRAMES;
  if (frameProgress === 0) arcs.forEach((a) => a.reset());
  translate(width / 2, height / 2);
  arcs.forEach((a) => a.draw(frameProgress / CHANGE_INTERVAL_FRAMES));
}
