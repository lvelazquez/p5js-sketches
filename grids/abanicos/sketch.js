
let a = [];
let angle = 0;
const colors = ["#C31717", "#E59315", "#D5EA2B", "#10A11A", "#1995D2"];

function getDynDim() {
  return round(round(width * 0.95) / 10) * 10;
}

let lineSize = 125;
let cellNum = 3;

function setup() {
  maxDist = dist(width / 2, height / 2, width, height);
  const w = Math.min(window.innerWidth, window.innerHeight);
  createCanvas(w, w);
  a = [];
  dim = getDynDim();
  
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
          color: colors[floor(random(colors.length))],
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
      for(let i=1;i<=a[i][j].num;i++) {
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