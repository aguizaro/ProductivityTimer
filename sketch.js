// Productivity Timer by Tony Guizar
// P5.js sketch that creates a productivity timer that counts down from a specified time

// Global variables
const MAX_TIME = 1000 * 60 * 60 * 24; // 24 hours

let timer;
let dial;
let pauseButton;
let startButton;
let resetButton;
let nameInput;

let digitalFont;
let titleFont;

let previousMouseX, previousMouseY, previousTime;
let mouseSpeed = 0;
let mouseDown = false;

// preload --------------------------------------------------------------------------------------
function preload() {
  digitalFont = loadFont("/digital-7-mono.ttf");
  titleFont = loadFont("/Oldtimer.ttf");
}

// setup ---------------------------------------------------------------------------------------

function setup() {
  createCanvas(600, 700);
  background(255);

  dial = new Dial();

  // load local storage data -----------------------

  const data = localStorage.getItem("currentTimer");
  const dialValue = parseInt(localStorage.getItem("dialValue"));

  timer = new Timer();
  timer.name = "Productivity Timer";

  if (data) {
    const timerData = JSON.parse(data);
    timer.loadTimer(timerData);
  } else {
    if (dialValue) {
      timer.remainingTime = parseInt(dialValue);
    }
  }

  //create buttons ---------------------------------
  const buttonDiv = createDiv();
  buttonDiv.class("buttonDiv");
  if (timer.isRunning) {
    pauseButton = createButton("Pause");
    pauseButton.mousePressed(pauseTimer);
    styleButton(pauseButton, "red");
  } else {
    pauseButton = createButton("Resume");
    pauseButton.mousePressed(resumeTimer);
    styleButton(pauseButton, "green");
  }
  if (timer.remainingTime === 0) {
    styleButton(pauseButton, "red", true);
  }
  buttonDiv.child(pauseButton);

  resetButton = createButton("Reset");
  resetButton.mousePressed(resetTimer);
  styleButton(resetButton, "orange");

  startButton = createButton("Start");
  startButton.mousePressed(startTimer);

  if (timer.remainingTime === 0) {
    styleButton(startButton, "blue", true);
  } else {
    styleButton(startButton, "blue");

    pauseButton.html("Pause");
    styleButton(pauseButton, "red", true);
  }
  buttonDiv.child(resetButton);
  buttonDiv.child(startButton);
}

// update loop --------------------------------------------------------------------------------

function draw() {
  background(255);
  timer.update();
  timer.display();
  //dial.update(timer.remainingTime, timer.duration);
  dial.display();
}

// Button Functions --------------------------------------------------------------------------

function pauseTimer() {
  timer.pauseTimer();
  pauseButton.html("Resume");
  pauseButton.mousePressed(resumeTimer);
  styleButton(pauseButton, "green");
}

function resumeTimer() {
  timer.resumeTimer();
  pauseButton.html("Pause");
  pauseButton.mousePressed(pauseTimer);
  styleButton(pauseButton, "red");
}

function resetTimer() {
  timer.resetTimer();
  styleButton(pauseButton, "red", true);
  styleButton(startButton, "blue", true);
  localStorage.removeItem("dialValue");
  localStorage.removeItem("currentTimer");
}

function startTimer() {
  timer.resumeTimer();
  styleButton(startButton, "blue", true);

  pauseButton.html("Pause");
  pauseButton.mousePressed(pauseTimer);
  styleButton(pauseButton, "red");

  localStorage.removeItem("dialValue");
}

function styleButton(btn, col, disabled = false) {
  btn.style("font-size", "24px");
  btn.style("padding", "10px 20px");
  btn.style("color", "white");
  btn.style("border", "none");
  btn.style("border-radius", "5px");
  btn.style("margin", "10px");

  let currentColor = col;

  if (disabled) {
    currentColor = decreaseAlpha(col, 225);
    btn.attribute("disabled", "");
  } else {
    btn.removeAttribute("disabled");
  }

  btn.style("background-color", currentColor);

  btn.mouseOver(() => {
    btn.style("transform", "scale(1.05)");
  });

  btn.mouseOut(() => {
    btn.style("transform", "scale(1)");
  });
}

function decreaseAlpha(col, amount) {
  let r = red(col);
  let g = green(col);
  let b = blue(col);
  let a = alpha(col);

  a = constrain(a - amount, 0, 255);

  return color(r, g, b, a);
}

function saveButtonStates() {
  localStorage.setItem("pauseButton", pauseButton.html());
}

// Timer class -------------------------------------------------------------------------------

class Timer {
  constructor() {
    this.name = "";
    this.startTime = 0;
    this.duration = 0;
    this.isRunning = false;
    this.remainingTime = 0;
  }

  loadTimer(timerData) {
    this.name = timerData.name;
    this.startTime = timerData.startTime;
    this.duration = timerData.duration;
    this.isRunning = timerData.isRunning;
    this.remainingTime = timerData.remainingTime;
  }

  startTimer(seconds, timerName = "untitled timer") {
    this.name = timerName;
    this.startTime = Date.now();
    this.duration = seconds * 1000; // Convert to milliseconds
    this.isRunning = true;
    this.remainingTime = this.duration;
  }

  pauseTimer() {
    this.isRunning = false;
    localStorage.setItem("currentTimer", JSON.stringify(this));
  }

  resumeTimer() {
    this.startTime = Date.now();
    this.duration = this.remainingTime;
    this.isRunning = true;
    localStorage.setItem("currentTimer", JSON.stringify(this));
  }

  resetTimer() {
    this.isRunning = false;
    this.startTime = 0;
    this.duration = 0;
    this.remainingTime = this.duration;
    localStorage.setItem("currentTimer", JSON.stringify(this));
    localStorage.removeItem("dialValue");
  }

  update() {
    if (this.isRunning) {
      const elapsed = Date.now() - this.startTime;
      this.remainingTime = this.duration - elapsed;
      localStorage.setItem("currentTimer", JSON.stringify(this));
      if (this.remainingTime <= 0) {
        this.remainingTime = 0;
        this.pauseTimer();
      }
    }
  }

  display() {
    textFont(titleFont, 42);
    textAlign(CENTER, CENTER);
    text(this.name, width / 2, height / 10);

    const hours = floor(this.remainingTime / 3600000);
    const minutes = floor((this.remainingTime % 3600000) / 60000);
    const seconds = floor((this.remainingTime % 60000) / 1000);

    const paddedHours = this.padNumber(hours);
    const paddedMinutes = this.padNumber(minutes);
    const paddedSeconds = this.padNumber(seconds);

    textFont(digitalFont, 72);
    fill(105, 0, 150, 255);
    textAlign(CENTER, CENTER);
    text(
      `${paddedHours}:${paddedMinutes}:${paddedSeconds}`,
      width / 2,
      height / 2
    );
  }

  padNumber(number) {
    return number < 10 ? "0" + number : number;
  }
}

// Dial class --------------------------------------------------------------------------------

class Dial {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.diameter = 400;
    this.angle = 0;
    this.patternGraphics = this.createPattern();
  }

  createPattern() {
    let pg = createGraphics(this.diameter * 1.5, this.diameter * 1.5);
    pg.stroke(100, 100, 255);
    pg.strokeWeight(20);
    pg.fill(255, 100, 200, 15);
    let numSegments = 24;
    let angleStep = TWO_PI / numSegments;
    for (let i = 0; i < numSegments; i++) {
      if (i % 2 === 0) {
        pg.arc(
          pg.width / 2,
          pg.height / 2,
          this.diameter,
          this.diameter,
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
    image(this.patternGraphics, 0, 0);
    pop();
  }
}

// mouse interaction -------------------------------------------------------------------------
function mouseDragged() {
  if (!mouseDown) return;

  let angle = -atan2(mouseY - dial.y, mouseX - dial.x);

  if (previousMouseX != null && previousMouseY != null) {
    let dx = mouseX - previousMouseX;
    let dy = mouseY - previousMouseY;
    let distance = sqrt(dx * dy + dy * dy);
    if (isNaN(distance)) {
      distance = 0;
    }
    let currentTime = millis();
    let timeElapsed = currentTime - previousTime;

    // adjust input based on mouse speed
    mouseSpeed = distance / timeElapsed;
    let timeAdjustment = mouseSpeed * 60000;
    timeAdjustment = constrain(timeAdjustment, 0, 120000);

    // determine direction - clockwise or counterclockwise
    if (angle < dial.angle) {
      timer.remainingTime += timeAdjustment;
    } else if (angle > dial.angle) {
      timer.remainingTime -= timeAdjustment;
    }

    timer.remainingTime = constrain(timer.remainingTime, 0, MAX_TIME);
    if (timer.remainingTime > 0) {
      localStorage.setItem("dialValue", timer.remainingTime);
      styleButton(startButton, "blue");
    }

    dial.angle = angle;
  }
  previousMouseX = mouseX;
  previousMouseY = mouseY;
  previousTime = millis();
}

function mouseReleased() {
  if (!mouseDown) return;

  //round to nearest 30 seconds
  timer.remainingTime = Math.round(timer.remainingTime / 30000) * 30000;
  if (timer.remainingTime === 0) {
    styleButton(startButton, "blue", true);
  } else {
    localStorage.setItem("dialValue", timer.remainingTime);
  }
  dial.angle = 0;
  mouseDown = false;
  previousMouseX = null;
  previousMouseY = null;
  previousTime = null;
}

function mousePressed() {
  mouseDown =
    mouseX > 0 &&
    mouseX < width &&
    mouseY > 0 &&
    mouseY < height &&
    !timer.isRunning;

  if (mouseX > 0 && mouseX < width) {
    if (mouseY > 0 && mouseY < height / 8 + 50) {
      console.log("clicked on title");
    } else {
      //hide input box
    }
  }

  // initial mouse position and time
  previousMouseX = mouseX;
  previousMouseY = mouseY;
  previousTime = millis();
}
