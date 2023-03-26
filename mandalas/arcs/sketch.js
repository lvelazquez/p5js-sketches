function getRandomColor() {
    return color((random(255)), (random(255)), (random(255)), random())
}

const CHANGE_INTERVAL_MS = 300;
const MAX_LENGTH = window.innerWidth / 2;
const MIN_RADIUS = MAX_LENGTH * 0.01;
const MAX_RADIUS = MAX_LENGTH * 0.7;

class Arc {
    constructor() {
        this.radius = random(MIN_RADIUS, MAX_RADIUS);
        this.newRadius = random(MIN_RADIUS, MAX_RADIUS);
        this.weight = min(random(20, 100), this.radius - 5);
        this.newWeight = min(random(20, 100), this.newRadius - 5);
        const angle = map(this.radius, MIN_RADIUS, MAX_RADIUS, QUARTER_PI, HALF_PI);
        const area = (angle / 2) * (this.radius ** 2);
        const maxArea = TWO_PI / 2 * (windowWidth / 2) ** 2;
        this.rotationSpeed = random(0.001, 0.01);
        this.rotation = random(0, TWO_PI);
        this.color = getRandomColor();
        this.newColor = getRandomColor();
    }

    reset() {
        this.color = this.newColor;
        this.radius = this.newRadius;
        this.weight = this.newWeight;
        const angle = map(this.radius, MIN_RADIUS, MAX_RADIUS, QUARTER_PI, HALF_PI);
        // TODO make proportial to size/segment area?
        this.rotationSpeed = random(0.001, 0.01);
        this.newRadius = random(MIN_RADIUS, MAX_RADIUS);
        this.newWeight = min(random(20, 100), this.newRadius - 5);
        this.newColor = getRandomColor();
    }

    draw(frameProgress) {

        const progress = frameProgress / CHANGE_INTERVAL_MS;
        strokeWeight(lerp(this.weight, this.newWeight, progress));
        stroke(lerpColor(this.color, this.newColor, progress));
        this.rotation += this.rotationSpeed;
        rotate(this.rotation);
        const radius = lerp(this.radius, this.newRadius, progress);
        arc(0, 0, radius, radius, 0, map(radius, MIN_RADIUS, MAX_RADIUS, QUARTER_PI, HALF_PI));
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    strokeCap(SQUARE);
    colorMode(HSB, 250, 10, 50, 0.4);
    // colors = Array.from(new Array(5)).map(()=> Array.from(new Array(4)).map(()=> Math.round(Math.random() * 255)));
    arcs = Array.from(new Array(10)).map(() => new Arc());
}

function draw() {
    background(100, 10);
    noFill();
    const frameProgress = frameCount % CHANGE_INTERVAL_MS;
    if (frameProgress == 0) {
        arcs.forEach(arc => arc.reset());
    }
    translate(width / 2, height / 2);
    arcs.forEach(arc => {
        arc.draw(frameProgress);
    });
}