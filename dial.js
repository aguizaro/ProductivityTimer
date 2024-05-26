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
    let outerDialPG = createGraphics(
      this.outerRadius * 2 + 10,
      this.outerRadius * 2 + 10
    );
    outerDialPG.stroke(189, 255, 242, 255);
    outerDialPG.strokeWeight(5);
    outerDialPG.noFill();
    outerDialPG.ellipse(
      outerDialPG.width / 2,
      outerDialPG.height / 2,
      this.outerRadius * 2
    );
    return outerDialPG;
  }

  innerDial() {
    let innerDialPG = createGraphics(
      this.innerRadius * 2 + 10,
      this.innerRadius * 2 + 10
    );
    push();
    innerDialPG.stroke(189, 255, 242, 255);
    innerDialPG.strokeWeight(5);
    innerDialPG.noFill();
    let numSegments = 180;
    let angleStep = TWO_PI / numSegments;
    for (let i = 0; i < numSegments; i++) {
      if (i % 2 === 0) {
        innerDialPG.arc(
          innerDialPG.width / 2,
          innerDialPG.height / 2,
          this.innerRadius * 2,
          this.innerRadius * 2,
          i * angleStep,
          (i + 1) * angleStep
        );
      }
    }
    pop();
    return innerDialPG;
  }

  innerFillAngle(angle) {
    let innerFillPG = createGraphics(
      this.innerRadius * 2 + 10,
      this.innerRadius * 2 + 10
    );

    innerFillPG.fill(0, 10, 190, 120);

    if (degrees(angle) % 360 <= 360 && degrees(angle) % 360 >= 358) {
      //do something every minute
    }

    innerFillPG.noStroke();
    innerFillPG.arc(
      innerFillPG.width / 2,
      innerFillPG.height / 2,
      this.innerRadius * 2,
      this.innerRadius * 2,
      -HALF_PI,
      -HALF_PI + angle
    );
    return innerFillPG;
  }

  outerFillAngle(angle) {
    let outerFillPG = createGraphics(
      this.outerRadius * 2 + 10,
      this.outerRadius * 2 + 10
    );

    outerFillPG.fill(0, 100, 202, 120);
    outerFillPG.noStroke();
    outerFillPG.beginShape();

    // Draw the outer arc
    for (let a = -HALF_PI; a <= -HALF_PI + angle; a += 0.01) {
      let x = outerFillPG.width / 2 + this.outerRadius * cos(a);
      let y = outerFillPG.height / 2 + this.outerRadius * sin(a);
      outerFillPG.vertex(x, y);
    }

    // Draw the inner arc in reverse
    for (let a = -HALF_PI + angle; a >= -HALF_PI; a -= 0.01) {
      let x = outerFillPG.width / 2 + this.innerRadius * cos(a);
      let y = outerFillPG.height / 2 + this.innerRadius * sin(a);
      outerFillPG.vertex(x, y);
    }

    outerFillPG.endShape(CLOSE);

    return outerFillPG;
  }

  display(innerAngle = null, outerAngle = null) {
    if (innerAngle) {
      // If inner angle is provided, draw the fill
      push();
      translate(this.x, this.y);
      imageMode(CENTER);
      let innerFillGraphics = this.innerFillAngle(innerAngle);
      image(innerFillGraphics, 0, 0);
      pop();
    }

    if (outerAngle) {
      // If outer angle is provided, draw the fill
      push();
      translate(this.x, this.y);
      imageMode(CENTER);
      let outerFillGraphics = this.outerFillAngle(outerAngle);
      image(outerFillGraphics, 0, 0);
      pop();
    }

    // Draw the dial with rotation
    push();
    translate(this.x, this.y);
    rotate(-this.angle);
    imageMode(CENTER);
    image(this.innerDialGraphics, 0, 0);
    image(this.outerDialGraphics, 0, 0);
    pop();
  }
}
