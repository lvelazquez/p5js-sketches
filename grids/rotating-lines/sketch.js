const GRID_SNAP = 10; // grid area is rounded to a multiple of this
const GRID_FILL = 0.95; // fraction of the canvas used by the grid
const STROKE_WEIGHT = 3;
const MAX_CELLS_PER_SIDE = 2; // reached with the pointer at a canvas corner
const SPIN_RANGE = [0.1, 1]; // initial angle, radians
const SPIN_ACCELERATION_RANGE = [0.005, 0.01]; // rad/frame^2

let spokes = [];
let gridDim;
let cellSize;
let gridNum;
let prevGridNum;
let maxDist;
const scheme = Palette.bright;

function gridDimension() {
  return round(round(width * GRID_FILL) / GRID_SNAP) * GRID_SNAP;
}

function measure() {
  maxDist = dist(width / 2, height / 2, width, height);
  gridDim = gridDimension();
}

function setup() {
  createCanvas(Kit.size(), Kit.size());
  noFill();
  strokeWeight(STROKE_WEIGHT);
  measure();
  gridNum = prevGridNum = 0;
  Kit.init();
}

function windowResized() {
  resizeCanvas(Kit.size(), Kit.size());
  measure();
  prevGridNum = 0; // force the spokes to rebuild
}

function draw() {
  background(Palette.slate);
  const d = dist(width / 2, height / 2, mouseX, mouseY);
  // At least 1 cell: 0 would make cellSize infinite and blank the canvas.
  const cellsPerSide = max(1, round((d / maxDist) * MAX_CELLS_PER_SIDE));
  cellSize = gridDim / cellsPerSide;
  gridNum = round(gridDim / cellSize);

  if (gridNum !== prevGridNum) {
    spokes = Array.from({ length: gridNum }, () =>
      Array.from({ length: gridNum }, () => ({
        color: random(scheme),
        angle: random(...SPIN_RANGE),
        angleVelocity: 0,
        angleAcceleration: random(...SPIN_ACCELERATION_RANGE),
      }))
    );
    prevGridNum = gridNum;
  }

  translate((width - gridDim) / 2, (height - gridDim) / 2);
  for (let i = 0; i < gridNum; i++) {
    for (let j = 0; j < gridNum; j++) {
      const s = spokes[i][j];
      s.angleVelocity += s.angleAcceleration;
      s.angle += s.angleVelocity;
      stroke(s.color);
      push();
      translate(i * cellSize + cellSize / 2, j * cellSize + cellSize / 2);
      rotate(s.angle);
      line(-cellSize / 2, 0, cellSize / 2, 0);
      pop();
    }
  }
}
