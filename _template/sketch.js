function setup() {
    const canvasSize = min(windowWidth, windowHeight);
    createCanvas(canvasSize, canvasSize);
}

function windowResized() {
    const canvasSize = min(windowWidth, windowHeight);
    resizeCanvas(canvasSize, canvasSize);
}