const DESIGN_SIZE = 900;
const SPHERE_RADIUS = 100; // px at DESIGN_SIZE
const SPIN_SPEED = 0.01; // rad per frame
const POINT_WEIGHT = 2;
const POINTS_RANGE = [2, 50]; // points per lon/lat ring
const SCALE_RANGE = [0.01, 4]; // sphere scale, silence to loud bass
const POINTS_EASE = 0.15;
const SCALE_EASE = 0.1;

let sphereScale = 0;
let lonCount = 0;
let latCount = 0;

function setup() {
  createCanvas(Kit.size(), Kit.size(), WEBGL);
  strokeWeight(POINT_WEIGHT);
  Kit.init();
  Kit.audio.init(); // after Kit.init()
}

function windowResized() {
  resizeCanvas(Kit.size(), Kit.size());
}

function draw() {
  Kit.audio.update();
  background(Palette.ink);
  rotateX(frameCount * SPIN_SPEED);
  rotateY(frameCount * SPIN_SPEED);

  const target = (band) => round(map(Kit.audio.energy(band), 0, 255, ...POINTS_RANGE));
  lonCount = lerp(lonCount, target("lowMid"), POINTS_EASE);
  latCount = lerp(latCount, target("treble"), POINTS_EASE);
  sphereScale = lerp(sphereScale, map(Kit.audio.energy("bass"), 0, 255, ...SCALE_RANGE), SCALE_EASE);
  scale(sphereScale * (width / DESIGN_SIZE));

  stroke(Palette.white);
  for (let i = 0; i < lonCount; i++) {
    const lon = map(i, 0, lonCount, -PI, PI);
    for (let j = 0; j < latCount; j++) {
      const lat = map(j, 0, latCount, -HALF_PI, HALF_PI);
      point(
        SPHERE_RADIUS * sin(lon) * cos(lat),
        SPHERE_RADIUS * sin(lon) * sin(lat),
        SPHERE_RADIUS * cos(lon)
      );
    }
  }
}
