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
    this.innerFillPG = createGraphics(
      this.innerRadius * 2 + 10,
      this.innerRadius * 2 + 10
    );
    this.outerFillPG = createGraphics(
      this.outerRadius * 2 + 10,
      this.outerRadius * 2 + 10
    );
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

  updateInnerFill(angle) {
    this.innerFillPG.clear();
    this.innerFillPG.fill(0, 10, 190, 120);
    this.innerFillPG.noStroke();
    this.innerFillPG.arc(
      this.innerFillPG.width / 2,
      this.innerFillPG.height / 2,
      this.innerRadius * 2,
      this.innerRadius * 2,
      -HALF_PI,
      -HALF_PI + angle
    );
  }

  updateOuterFill(angle) {
    this.outerFillPG.clear();
    this.outerFillPG.fill(0, 100, 202, 120);
    this.outerFillPG.noStroke();
    this.outerFillPG.beginShape();

    for (let a = -HALF_PI; a <= -HALF_PI + angle; a += 0.01) {
      let x = this.outerFillPG.width / 2 + this.outerRadius * cos(a);
      let y = this.outerFillPG.height / 2 + this.outerRadius * sin(a);
      this.outerFillPG.vertex(x, y);
    }

    for (let a = -HALF_PI + angle; a >= -HALF_PI; a -= 0.01) {
      let x = this.outerFillPG.width / 2 + this.innerRadius * cos(a);
      let y = this.outerFillPG.height / 2 + this.innerRadius * sin(a);
      this.outerFillPG.vertex(x, y);
    }

    this.outerFillPG.endShape(CLOSE);
  }

  display(innerAngle = null, outerAngle = null) {
    if (innerAngle !== null && outerAngle !== null) {
      this.updateInnerFill(innerAngle);
      this.updateOuterFill(outerAngle);

      push();
      translate(this.x, this.y);
      imageMode(CENTER);
      image(this.innerFillPG, 0, 0);
      image(this.outerFillPG, 0, 0);
      pop();
    }

    push();
    translate(this.x, this.y);
    rotate(-this.angle);
    imageMode(CENTER);
    image(this.innerDialGraphics, 0, 0);
    image(this.outerDialGraphics, 0, 0);
    pop();
  }
}
