// scale motion speed to lenght of motion so speed is the same amount of time regardless of distance

class SineArcs {

    constructor(x, y, w) {
        this.colors = Array.from(new Array(10)).map(() => `rgb(${round(random(255))}, ${round(random(255))}, ${round(random(255))})`);
        this.debounceId = 0;
        this.arcsNum = random(2, 10) >> 0;
        this.maxY = w / 2;
        this.increment = this.maxY / this.arcsNum;
        this.arcIncrement = (w / this.arcsNum);
        this.setSides(15);
        this.originY = 0;
        this.origin = createVector(x, y);
        this.angle = 0;
        this.arcLength = 0;
        this.rotateAngle = random(0, 1);
        this.motionAngle = 0;
    }

    setSides(num) {
        // this.origin = createVector(random(width), random(width));
        this.sides = num;
        this.arcMax = PI / this.sides;
        this.motionIncrement = 0.08 / this.sides;
        this.colors = Array.from(new Array(5)).map(() => `rgba(${round(random(255))}, ${round(random(255))}, ${round(random(255))}, 0.8)`);
    }

    draw() {
        push();

        translate(this.origin.x, this.origin.y);
        rotate(this.rotateAngle);
        ellipse(0, 0, 5);
        for (let j = 0; j < this.sides; j++) {
            this.originY = 0;
            this.arcLength = 0;
            let clr = this.colors[floor(j % this.colors.length)];
            stroke(clr);
            const stweight = map(cos(this.motionAngle), -1, 1, 2, 3);
            strokeWeight(stweight);

            push();
            rotate(this.angle);

            for (let i = 0; i < this.arcsNum; i++) {
                noFill();
                const sinArc = ((map(sin(this.motionAngle), -1, 1, 0.001, this.arcMax) * 100) >> 0) / 100;
                if (sinArc < 0.02 && i === 0) {
                    clearTimeout(this.debounceId);
                    this.debounceId = setTimeout(() => this.setSides(random(2, 8) >> 0), 100);
                }
                arc(0, 0, this.arcLength, this.arcLength, -sinArc, sinArc);
                this.arcLength += this.arcIncrement;
            }
            pop();
            this.motionAngle += this.motionIncrement;
            this.angle += (TWO_PI / this.sides);
        }


        this.rotateAngle += 0.01;
        pop();
    }
}


function setup() {
    const canvasSize = min(windowWidth, windowHeight);
    createCanvas(canvasSize, canvasSize);
    sineArcs = [];
    for (let col = 0; col < width; col += (width / 3)) {
        for (let row = 0; row < width; row += (width / 3)) {
            sineArcs.push(
                new SineArcs(col, row, width / 3)
            );
        }
    }

    rotateAngle = 0;
    strokeCap(SQUARE);
    frameRate(60);
}


function draw() {
    background(0, 15);
    translate((width / 2) / 3, (width / 2) / 3);
    sineArcs.forEach(sineArc => {
        sineArc.draw();
    });
}