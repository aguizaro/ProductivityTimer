// Dial class --------------------------------------------------------------------------------

class Dial {
  constructor(x, y, innerRadius, outerRadius) {
    this.x = x;
    this.y = y;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.angle = 0;
    this.outerDialPG = createGraphics(
      this.outerRadius * 2 + 10,
      this.outerRadius * 2 + 10
    );
    this.innerDialPG = createGraphics(
      this.outerRadius * 2 + 10,
      this.outerRadius * 2 + 10
    );
    this.innerFillPG = createGraphics(
      this.innerRadius * 2 + 10,
      this.innerRadius * 2 + 10
    );
    this.outerFillPG = createGraphics(
      this.outerRadius * 2 + 10,
      this.outerRadius * 2 + 10
    );
  }

  updateOuterDial(dialHover = false) {
    this.outerDialPG.clear();
    this.outerDialPG.stroke(189, 255, 242, 10);
    if (dialHover) {
      this.outerDialPG.stroke(0, 237, 255, 60);
    }
    this.outerDialPG.strokeWeight(5);
    this.outerDialPG.noFill();
    this.outerDialPG.ellipse(
      this.outerDialPG.width / 2,
      this.outerDialPG.height / 2,
      this.outerRadius * 2
    );
  }

  updateInnerDial(dialHover = false) {
    this.innerDialPG.clear();
    this.innerDialPG.stroke(189, 255, 242, 10);
    if (dialHover) {
      this.innerDialPG.stroke(0, 237, 255, 60);
    }
    this.innerDialPG.strokeWeight(5);
    this.innerDialPG.noFill();
    let numSegments = 24;
    let angleStep = TWO_PI / numSegments;
    for (let i = 0; i < numSegments; i++) {
      if (i % 2 === 0) {
        this.innerDialPG.arc(
          this.innerDialPG.width / 2,
          this.innerDialPG.height / 2,
          this.innerRadius * 2,
          this.innerRadius * 2,
          i * angleStep,
          (i + 1) * angleStep
        );
      }
    }
  }

  updateInnerFill(angle) {
    this.innerFillPG.clear();
    this.innerFillPG.fill(0, 10, 190, 160);
    this.innerFillPG.stroke(0, 0, 255, 200);
    this.innerFillPG.strokeWeight(3);
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
    if (angle === 0) return;

    this.outerFillPG.fill(0, 100, 202, 130);
    this.outerFillPG.stroke(255, 255, 255, 200);
    this.outerFillPG.strokeWeight(3);

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

  display(dialHover = false, innerAngle = null, outerAngle = null) {
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
    // this.updateInnerDial(dialHover);
    // this.updateOuterDial(dialHover);
    // image(this.innerDialPG, 0, 0);
    // image(this.outerDialPG, 0, 0);
    pop();
  }
}
