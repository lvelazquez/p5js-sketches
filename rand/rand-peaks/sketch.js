class RandLine {
    constructor(num) {
      this.segments = num;
      this.segmentLength = round(width / this.segments);
      this.vectors = Array.from({ length: this.segments + 1 }, (_, i) =>
        createVector(i * this.segmentLength, 0 + random(-40, 40))
      );
      this.originalPositions = this.vectors.map((vec) => vec.copy());
      this.velocities = this.vectors.map((_) => createVector());
      this.accelerations = this.vectors.map((_) => createVector());
    }
  
    update(t) {
      this.normSegments = min(max(t * this.segments, 0), this.segments);
      const v1Index = floor(this.normSegments);
      const v2Index = ceil(this.normSegments);
      const v1 = this.vectors[v1Index];
      const v2 = this.vectors[v2Index];
      const normPerSegment = this.normSegments % 1;
      const interpolatedVector = p5.Vector.lerp(v1, v2, normPerSegment);
      
      const springConstant = 0.1;
      const dampingFactor = 0.8;
      for (let i = 1; i < this.vectors.length - 1; i++) {
        const currentPos = this.vectors[i];
        const originalPos = this.originalPositions[i];
        const displacement = p5.Vector.sub(currentPos, originalPos);
        const springForce = p5.Vector.mult(displacement, -springConstant);
        const dampingForce = p5.Vector.mult(this.velocities[i], -dampingFactor);
        const totalForce = p5.Vector.add(springForce, dampingForce);
        this.accelerations[i].set(totalForce);
      }
      
      const dt = 1 / frameRate();
      for (let i = 1; i < this.vectors.length - 1; i++) {
        this.velocities[i].add(p5.Vector.mult(this.accelerations[i], dt));
        this.vectors[i].add(p5.Vector.mult(this.velocities[i], dt));
      }
      
      for (let i = 1; i < this.vectors.length - 1; i++) {
        const currentPos = this.vectors[i];
        const originalPos = this.originalPositions[i];
        const displacement = p5.Vector.sub(currentPos, originalPos);
        const distance = displacement.mag();
        if (distance < 5 && this.velocities[i].mag() < 0.1) {
          this.vectors[i].set(originalPos);
          this.velocities[i].set(0, 0);
          this.accelerations[i].set(0, 0);
        }
        else {
          const springForce = p5.Vector.mult(displacement, -springConstant);
          const dampingForce = p5.Vector.mult(this.velocities[i], -dampingFactor);
          const totalForce = p5.Vector.add(springForce, dampingForce);
          this.accelerations[i].set(totalForce);
        }
      }
  
      stroke(0);
      strokeWeight(2);
      noFill();
      beginShape();
      for (let i = 0; i <= this.segments; i++) {
        let vec = this.vectors[i];
        point(vec.x, vec.y);
        if (floor(this.normSegments) > i) {
          vertex(this.vectors[i].x, this.vectors[i].y);
          vertex(this.vectors[i + 1].x, this.vectors[i + 1].y);
        }
      }
      endShape();
      stroke(255, 0, 0);
      line(
        this.vectors[v1Index].x,
        this.vectors[v1Index].y,
        interpolatedVector.x,
        interpolatedVector.y
      );
      point(interpolatedVector.x, interpolatedVector.y);
    }
  }
  
  function setup() {
    createCanvas(800, 800);
    startTime = millis();
    duration = 2000;  
    lines = Array.from({ length: 10 }).map(
      (o) => new RandLine(round(random(10, 20)))
    );
  }
  
  let normValue = 0;
  function draw() {
    background(220);
    
    let elapsed = millis() - startTime;
    let t = elapsed / duration;
    t = constrain(t, 0, 1); // clamp interpolation value to range [0, 1]
    t = ease(t, "quadraticOut"); // ease(t, "springy"); // apply easing equation to interpolation value    
    const inc = height/lines.length;
    lines.forEach((line, i) => {
      push();
      translate(0, (inc+1)*i)
      line.update(t);
      pop();
    });
  }
  