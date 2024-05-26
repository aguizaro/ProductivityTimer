// Dial class --------------------------------------------------------------------------------

class Dial {
  constructor(x, y, innerRadius, outerRadius) {
    this.x = x;
    this.y = y;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.angle = 0;
    this.outerDialGraphics = this.outerDial();
    this.innerDialGraphics = this.innerDial();
  }

  outerDial() {
    let pg = createGraphics(
      this.outerRadius * 2 + 10,
      this.outerRadius * 2 + 10
    );
    pg.stroke(189, 255, 242, 255);
    pg.strokeWeight(5);
    pg.noFill();
    pg.ellipse(pg.width / 2, pg.height / 2, this.outerRadius * 2);
    return pg;
  }

  innerDial() {
    let pg = createGraphics(
      this.innerRadius * 2 + 10,
      this.innerRadius * 2 + 10
    );
    pg.stroke(189, 255, 242, 255);
    pg.strokeWeight(5);
    pg.noFill();
    let numSegments = 24;
    let angleStep = TWO_PI / numSegments;
    for (let i = 0; i < numSegments; i++) {
      if (i % 2 === 0) {
        pg.arc(
          pg.width / 2,
          pg.height / 2,
          this.innerRadius * 2,
          this.innerRadius * 2,
          i * angleStep,
          (i + 1) * angleStep
        );
      }
    }
    return pg;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(0); // Start the dial at the top
    rotate(-this.angle);
    imageMode(CENTER);
    image(this.innerDialGraphics, 0, 0);
    image(this.outerDialGraphics, 0, 0);
    pop();
  }
}
