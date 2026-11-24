// Starter sketch. Shared helpers: Kit (common/sketch-kit.js), Palette, ease().
const GRID_DIVISIONS = 10;
const CELL_STROKE = Palette.ink;
const CELL_FILL = Palette.paper;

let cellSize;

function setup() {
  createCanvas(Kit.size(), Kit.size());
  cellSize = width / GRID_DIVISIONS;
  stroke(CELL_STROKE);
  fill(CELL_FILL);
  Kit.init(); // aria-label, Pause/Space, reduced motion: keep this last in setup()
}

function windowResized() {
  resizeCanvas(Kit.size(), Kit.size());
  cellSize = width / GRID_DIVISIONS;
}

function draw() {
  background(Palette.white);
  for (let col = 0; col < GRID_DIVISIONS; col++) {
    for (let row = 0; row < GRID_DIVISIONS; row++) {
      const wobble = sin(Kit.millis() / 600 + col + row) * cellSize * 0.1;
      rect(col * cellSize, row * cellSize, cellSize + wobble, cellSize + wobble);
    }
  }
}
