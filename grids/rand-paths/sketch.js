function drawGrid(size, gridSize) {
  for (let col = 0; col <= size; col += gridSize)
    for (let row = 0; row <= size; row += gridSize) {
      point(col, row);
    }
}

function snapPolarToGrid(angle, length, gridSize) {
  const x = cos(angle) * length;
  const y = sin(angle) * length;
  return createVector(
    round(round(x / gridSize) * gridSize),
    round(round(y / gridSize) * gridSize)
  );
}

class RandGridPath {
  constructor(size, gridSize) {
    const colorIndex = round(random(0, colorScheme.length - 1));
    this.isComplete = false;
    this.color = colorScheme[colorIndex] + "AA";
    this.colorStatic = colorScheme[(colorIndex + 1) % colorScheme.length];
    this.size = size;
    this.startAngle = round(random(-PI, PI), 2);
    this.endAngle = this.startAngle + PI;
    this.length = round(random(size * 0.45, size * 0.5), 2);
    this.start = snapPolarToGrid(this.startAngle, this.length, gridSize);
    this.end = snapPolarToGrid(this.endAngle, this.length, gridSize);
    const totalX = this.end.x - this.start.x;
    const totalY = this.end.y - this.start.y;
    this.path = [this.start];
    this.animated = { currentIndex: 0, current: this.start, prev: this.start };
    let currentX = this.start.x;
    let currentY = this.start.y;
    let dirX = Math.sign(totalX);
    let dirY = Math.sign(totalY);
    let pDirX = 0,
      pDirY = 0,
      limitDir = 0;
    // TODO fix bounds
    while (currentX !== this.end.x && currentY !== this.end.y) {
      const coinToss = random() > 0.5;
      dirX = Math.sign(this.end.x - currentX);
      dirY = Math.sign(this.end.y - currentY);

      if (pDirX == dirX && pDirY == dirY) {
        limitDir++;       
      } else {
        limitDir = 0;
      }

      if (coinToss) {
        if(currentX <= width) {
          currentX += gridSize * dirX;
        }        
      } else {
        currentY += gridSize * dirY;
      }

        
      this.path[this.path.length] = createVector(currentX, currentY);

      pDirX = dirX;
      pDirY = dirY;
    }
  }

  update(t) {
    this.normSegments = min(max(t * this.path.length, 0), this.path.length);
    const v1Index = floor(this.normSegments);
    const v2Index = ceil(this.normSegments);
    const v1 = this.path[v1Index];
    const v2 = this.path[v2Index];
    const normPerSegment = this.normSegments % 1;
    const interpolatedVector = p5.Vector.lerp(v1, v2, normPerSegment);

    stroke(this.color);
    strokeWeight(10);
    strokeJoin(MITER);
    strokeCap(ROUND);
    noFill();
    beginShape();
    for (let i = 0; i <= this.path.length; i++) {
      if (floor(this.normSegments) > i) {
        vertex(this.path[i].x, this.path[i].y);
        vertex(this.path[i + 1].x, this.path[i + 1].y);
      }
    }
    endShape();    
    if (t < 1) {
      line(
        this.path[v1Index].x,
        this.path[v1Index].y,
        interpolatedVector.x,
        interpolatedVector.y
      );
    }    
    stroke(this.colorStatic);
    point(this.end.x, this.end.y);
  }
}

function windowResized () {
  const canvasSize = floor(min(windowWidth,windowHeight) / 10) * 10;
  resizeCanvas(canvasSize, canvasSize);
  size = round(min(width, height) * 0.85);
  gridSize = round(size / gridDivision);  
  paths = Array.from({ length: linesNum }).map(
    () => new RandGridPath(size, gridSize)
  );
}

function setup() {
  const canvasSize = round(min(windowWidth,windowHeight) / 10) * 10;     
  createCanvas(canvasSize, canvasSize);  
  size = round(canvasSize * 0.85);
  
  colorScheme = colorSchemes.cools;
  gridDivision = 10;
  linesNum = 30;
  startTime = millis();
  duration = 2000;  
  gridSize = round(size / gridDivision);  
  isReverse = false;
  paths = Array.from({ length: linesNum }).map(
    () => new RandGridPath(size, gridSize)
  );
  
}

function draw() {
  stroke(0);
  let elapsed = millis() - startTime;
  let progress = elapsed / duration;
  progress = constrain(progress, 0, 1);
  progress = isReverse ? ease(abs(progress - 1), "quinticInOut") : ease(progress, "quinticInOut");
  if (progress >= 1) {
    isReverse = true;
    startTime = millis();
    progress = 0;
  } else if (progress <= 0 && isReverse) {
    paths = Array.from({ length: linesNum }).map(
      () => new RandGridPath(size, gridSize)
    );
    isReverse = false;
    startTime = millis();
    progress = 0;
  } else {
    background(220, 100);
    translate((width - size) / 2, (height - size) / 2);
    // drawGrid(size, gridSize);
    translate(size / 2, size / 2);
    paths.forEach((p) => p.update(progress));
  }
}
