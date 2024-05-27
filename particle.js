class Particle {
  constructor(x, y, dialX, dialY, dialInnerRadius, dialOuterRadius) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector(0, 0);
    this.dialX = dialX;
    this.dialY = dialY;
    this.dialInnerRadius = dialInnerRadius;
    this.dialOuterRadius = dialOuterRadius;
    this.color = color(random(0, 100), 0, random(100, 210), random(50, 255));
    this.size = random(4, 8);
  }

  update(speed) {
    if (isNaN(speed)) {
      speed = 0;
    }
    // random walk behavior
    let randomStep = p5.Vector.random2D();
    randomStep.mult(0.01);
    this.position.add(randomStep);

    // acceleration based on speed input
    this.acceleration = p5.Vector.random2D();
    this.acceleration.mult(speed / 2);
    this.velocity.add(this.acceleration);

    this.velocity.mult(0.98); // deccelerate the particle over time
    this.velocity.limit(4); // maximum speed

    this.position.add(this.velocity);
    this.acceleration.mult(0); // clear acceleration
    this.checkEdges();

    if (this.velocity.mag() < 0.4) {
      this.velocity.setMag(0.4);
    }
  }

  checkEdges() {
    let distance = dist(
      this.position.x,
      this.position.y,
      this.dialX,
      this.dialY
    );
    if (distance < this.dialInnerRadius || distance > this.dialOuterRadius) {
      let fromCenter = p5.Vector.sub(
        this.position,
        createVector(this.dialX, this.dialY)
      );
      if (distance < this.dialInnerRadius) {
        fromCenter.setMag(this.dialInnerRadius);
      } else {
        fromCenter.setMag(this.dialOuterRadius);
      }
      this.position = p5.Vector.add(
        createVector(this.dialX, this.dialY),
        fromCenter
      );

      // Reverse the direction (bounce back)
      this.velocity.mult(-1); // Reverse the direction of velocity
      this.color = color(random(0, 100), 0, random(100, 210), random(50, 255));
      this.size = random(4, 8);
    }
  }
  display(speed) {
    this.update(speed * 20);
    push();
    fill(this.color);
    noStroke();

    ellipse(this.position.x, this.position.y, this.size, this.size);
    pop();
  }
}
