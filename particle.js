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
  updatePosition() {
    //update when canvas is resized
    this.x = this.dialX + this.radius * cos(this.angle);
    this.y = this.dialY + this.radius * sin(this.angle);
  }

  update(speed = 0) {
    if (isNaN(speed)) {
      speed = 0;
    }
    // random walk behavior
    let randomStep = p5.Vector.random2D();
    randomStep.mult(0.01);
    this.position.add(randomStep);

    // acceleration based on speed input
    this.acceleration = p5.Vector.random2D();
    this.acceleration.mult(speed);
    this.velocity.add(this.acceleration);

    this.velocity.mult(0.98); // deccelerate the particle over time
    this.velocity.limit(10); // maximum speed

    this.position.add(this.velocity);
    this.acceleration.mult(0); // clear acceleration
    this.checkEdges();

    if (this.velocity.mag() < 0.5) {
      this.velocity.setMag(0.5);
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

      // reflect the velocity vector off the normal
      let normal = fromCenter.copy();
      normal.normalize();
      this.velocity = this.velocity.copy().reflect(normal);

      this.color = color(random(0, 100), 0, random(100, 210), random(50, 255));
      this.size = random(4, 8);
    }
  }

  influenceDirection(dir) {
    let fromCenter = p5.Vector.sub(
      this.position,
      createVector(this.dialX, this.dialY)
    );
    // vector perpendicular to the radial vector (normal vector from the center of the dial)
    let tangent = createVector(-fromCenter.y, fromCenter.x);
    tangent.normalize();
    tangent.mult(dir);

    this.velocity.add(tangent);
  }

  display(speed, timerRunning) {
    if (timerRunning) {
      //push the particles in a counter-clockwise direction when the timer is running
      this.influenceDirection(-0.01);
      speed = 0.3;
    } else {
      this.influenceDirection(0.0025);
    }
    this.update(speed / 2); // mouse speed incerases the speed of the particles

    push();
    fill(this.color);
    noStroke();

    ellipse(this.position.x, this.position.y, this.size, this.size);
    pop();
  }
}
