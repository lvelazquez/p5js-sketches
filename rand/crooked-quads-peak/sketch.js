// TODO control shapes more rigourously
// TODO add sound
const randRange = 40;
const rectWidth = 500;
const rectHeight = 100;
const quadNums = 3;

let counter = 0;
const crookedQuads = [];

class CrookedQuad {
  constructor(w, h) {
    this.colors = [
      [(145), (145), (145)],
      [(65), (92), (106)],
      [(47), (161), (187)],
      [(255), (217), (47)],
      [(251), (94), (9)]
    ];
    this.width = w;
    this.height = h;
    this.color = this.colors[int(random(this.colors.length))];
    this.targetColor = this.colors[int(random(this.colors.length))];
    this.center = createVector(width / 2 - w / 2, height / 2 - w / 2);
    this.current = getRandomQuad(this.center.x, this.center.y, w, h);
    this.target = getRandomQuad(this.center.x, this.center.y, w, h);
    this.targetColor = this.colors[int(random(this.colors.length))];
  }

  changeTarget() {
    const isInverted = random(1) > 0.5; // !this.isInverted;
    const newWidth = isInverted ? rectHeight : rectWidth;
    const newHeight = isInverted ? rectWidth : rectHeight;
    const newCenterX = getRandomRange(width / 2 - newWidth / 2, randomGaussian(50, 10));
    const newCenterY = getRandomRange(height / 2 - newHeight / 2, randomGaussian(50, 10));
    this.center = createVector(newCenterX, newCenterY);
    this.target = getRandomQuad(this.center.x, this.center.y, newWidth, newHeight);
    this.width = newWidth;
    this.height = newHeight;
    this.targetColor = this.colors[int(random(this.colors.length))];
  }

  update() {
    this.current = this.current.map((coord, i) => lerp(this.current[i], this.target[i], 0.4));
    this.color = lerpColor(color(this.color), color(this.targetColor), 0.2);
    fill(color(this.color));
    quad.apply(null, this.current);

  }
}

function getRandomQuad(x, y, width, height) {
  return [
    randomGaussian(x, randRange/2),
    randomGaussian(y, randRange/2),
    randomGaussian(x + width, randRange/2),
    randomGaussian(y, randRange/2),
    randomGaussian(x + width, randRange/2),
    randomGaussian(y + height, randRange/2),
    randomGaussian(x, randRange/2),
    randomGaussian(y + height, randRange/2)
  ];
}

function getRandomRange(num, range) {
  return random(num - range, num + range);
}

function setup() {
  createCanvas(900, 900);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
  peakDetect = new p5.PeakDetect(20,2000,0.2);
  peakDetect.onPeak(()=> crookedQuads.forEach(crookedQuad => crookedQuad.changeTarget()));
  for (let i = 0; i < quadNums; i++) {
    crookedQuads.push(new CrookedQuad(500, 200));
  }
}

function draw() {
  const bgColor = map(fft.getEnergy("bass"), 0, 255, 200, 255);
  background(bgColor, 200);
  noStroke();
  fft.analyze();
  peakDetect.update(fft);  
  crookedQuads.forEach(crookedQuad => {
    crookedQuad.update(fft);
  });  
}