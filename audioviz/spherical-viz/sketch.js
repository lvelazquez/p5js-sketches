// hacef franjas horizontales y verticales
// scatter points
// map a texture
// unite points with a arcs and random glitchy shapes

function setup() {
    createCanvas(900, 900, WEBGL);
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);
    peakDetect = new p5.PeakDetect(20, 2000, 0.2);
    peakDetect.onPeak(() => {
        bgColor = random(255);
        strokeColor = abs(bgColor - 255);
    });
    s = 0;
    totalX = 0;
    totalY = 0;
}

function draw() {
    background(0);
    fft.analyze();
    peakDetect.update(fft);

    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
    totalX = lerp(totalX, round(map(fft.getEnergy("lowMid"), 0, 255, 2, 50)), 0.15);
    totalY = lerp(totalY, round(map(fft.getEnergy("treble"), 0, 255, 2, 50)), 0.15);
    const r = 100;
    const a = [];
    s = lerp(s, map(fft.getEnergy("bass"), 0, 255, 0.01, 4), 0.1);
    scale(s);
    for (let i = 0; i < totalX; i++) {
        const lon = map(i, 0, totalX, -PI, PI);
        a[i] = [];
        for (let j = 0; j < totalY; j++) {
            const lat = map(j, 0, totalY, -HALF_PI, HALF_PI);
            const x = r * sin(lon) * cos(lat);
            const y = r * sin(lon) * sin(lat);
            const z = r * cos(lon);
            a[i][j] = { x, y, z };
        }
    }
    stroke(255);
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a[i].length; j++) {
            const { x, y, z } = a[i][j];
            point(x, y, z)
        }
    }
}