class RandArc {
    constructor(size) {
        this.angle = random(PI);
        this.arcSize = size;
        this.angleSpeed = random(0.0001, 0.003);
        this.arcLength = random(HALF_PI, PI);
        this.color = random(colorSchemes.cools);
    }

    draw() {
        stroke(this.color);
        rotate(this.angle);
        arc(0, 0, this.arcSize, this.arcSize, 0, this.arcLength);
        this.angle += this.angleSpeed;
    }
}

function setup() {
    const canvasSize = min(windowWidth, windowHeight);
    createCanvas(canvasSize, canvasSize);
    let arcSize = 0;
    let arcNum = 10;
    let arcInc = (width - 10) / arcNum;
    noFill();
    strokeWeight(10);
    arcs = [];
    for (let i = 0; i < arcNum; i++) {
        arcSize += arcInc;
        arcs.push(
            new RandArc(arcSize)
        );
    }

}

function draw() {
    background(0);
    translate(width / 2, height / 2);
    arcs.forEach(arc => arc.draw());
}