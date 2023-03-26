
let a = [];
let angle = 0;

function getDynDim() {
  return round(round(width * 0.95) / 10) * 10;
}

let lineSize = 125;
let cellNum = 3;

function windowResized() {
  const size = Math.min(windowWidth, windowHeight);
  resizeCanvas(size, size);
}

function setup() {
  maxDist = dist(width / 2, height / 2, width, height);
  const size = Math.min(windowWidth, windowHeight);
  createCanvas(size, size);
  a = [];
  dim = getDynDim();
  colorScheme = colorSchemes.bright;
  cellSize = dim / cellNum;

  gridNum = round(dim / cellSize);
  prevGridNum = gridNum;
}

function draw() {
  noCursor();
  background(70);
  strokeWeight(3);
  const d = dist(width / 2, height / 2, mouseX, mouseY);
  cellNum = round((d / maxDist) * 2);
  cellSize = dim / cellNum;
  lineSize = cellSize;
  dim = getDynDim();
  gridNum = round(dim / cellSize);

  if (gridNum != prevGridNum) {
    for (let i = 0; i < gridNum; i++) {
      a[i] = []
      for (let j = 0; j < gridNum; j++) {
        a[i][j] = ({
          num: random(2, 8),
          color: colorScheme[floor(random(colorScheme.length))],
          angle: random(0.1, 1),
          angleVelocity: 0,
          angleAcceleration: random(0.005, 0.01),
        });
      }
    }
  }

  translate((width / 2) - (dim / 2), (height / 2) - (dim / 2));
  noFill();
  for (let i = 0; i < gridNum; i++) {
    for (let j = 0; j < gridNum; j++) {

      a[i][j].angleVelocity += a[i][j].angleAcceleration;
      a[i][j].angle += a[i][j].angleVelocity;

      stroke(a[i][j].color);
      push();
      translate(i * cellSize + cellSize / 2, j * cellSize + cellSize / 2);
      rotate(a[i][j].angle);
      for (let i = 1; i <= a[i][j].num; i++) {
        line(
          -lineSize / 2,
          0,
          lineSize / 2,
          0
        );
      }

      pop();
    }
  }

  prevGridNum = gridNum;
}