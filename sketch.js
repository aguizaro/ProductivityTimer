// Productivity Timer by Tony Guizar
// P5.js sketch that creates a productivity timer that counts down from a specified time

// Global variables
const MAX_TIME = 1000 * 60 * 60 * 12; // 12 hours

// Objects
let timer;
let dial;
let pauseButton;
let startButton;
let resetButton;
let nameInput;

// Fonts
let digitalFont;
let titleFont;

// Mouse variables
let previousMouseX, previousMouseY, previousTime;
let mouseSpeed = 0;
let mouseDown = false;

// Particles
let particles = [];
let numParticles = 200;
let dialX, dialY, dialOuterRadius, dialInnerRadius;

// Open Simplex Noise
let noiseScale = 0.01;
let noiseOffset = 0;

//Button colors
let pauseColor, resumeColor, resetColor, startColor;

// preload --------------------------------------------------------------------------------------
function preload() {
  digitalFont = loadFont("/digital-7-mono.ttf");
  titleFont = loadFont("/Oldtimer.ttf");
}

// setup ---------------------------------------------------------------------------------------

function setup() {
  frameRate(60);
  createCanvas(600, 700);

  pauseColor = color(17, 142, 214);
  resumeColor = color(21, 115, 230);
  resetColor = color(69, 0, 219);
  startColor = color(34, 128, 242);

  dialX = width / 2;
  dialY = height / 2;
  dialOuterRadius = 200;
  dialInnerRadius = 150;

  dial = new Dial(dialX, dialY, dialInnerRadius, dialOuterRadius);

  // load local storage data -----------------------

  const data = localStorage.getItem("currentTimer");
  const dialValue = parseInt(localStorage.getItem("dialValue"));

  // create/load timer ---------------------------------
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

  // create particles ---------------------
  for (let i = 0; i < numParticles; i++) {
    let angle = random(TWO_PI);
    let radius = random(dialInnerRadius, dialOuterRadius);
    let x = dialX + radius * cos(angle);
    let y = dialY + radius * sin(angle);
    particles.push(
      new Particle(x, y, dialX, dialY, dialInnerRadius, dialOuterRadius)
    );
  }

  //create buttons ---------------------------------
  const buttonDiv = createDiv();
  buttonDiv.class("buttonDiv");
  if (timer.isRunning) {
    pauseButton = createButton("Pause");
    pauseButton.mousePressed(pauseTimer);
    styleButton(pauseButton, pauseColor);
  } else {
    pauseButton = createButton("Resume");
    pauseButton.mousePressed(resumeTimer);
    styleButton(pauseButton, resumeColor);
  }
  if (timer.remainingTime === 0) {
    styleButton(pauseButton, pauseColor, true);
  }
  resetButton = createButton("Reset");
  resetButton.mousePressed(resetTimer);
  styleButton(resetButton, resetColor);

  startButton = createButton("Start");
  startButton.mousePressed(startTimer);
  styleButton(startButton, startColor, true);

  if (dialValue > 0 && !timer.isRunning) {
    pauseButton.html("Pause");
    styleButton(pauseButton, pauseColor, true);
    styleButton(startButton, startColor);
  }
  buttonDiv.child(pauseButton);
  buttonDiv.child(resetButton);
  buttonDiv.child(startButton);
}

// update loop --------------------------------------------------------------------------------

function draw() {
  background(255);
  drawNoiseBackground();

  //print all timer props
  if (timer.duration != 0 && !mouseDown) {
    let minuteAngle = map(timer.remainingTime, 0, 60000, 0, TWO_PI);
    let totalAngle = map(timer.remainingTime, 0, timer.totalTime, 0, TWO_PI);
    dial.display(minuteAngle, totalAngle);
  } else {
    dial.display();
  }

  timer.update();
  timer.display();

  for (let particle of particles) {
    particle.update(mouseSpeed);
    particle.display();
  }
}

// Open Simplex Noise -------------------------------------------------------------------------
function drawNoiseBackground() {
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      let noiseValue = noise(x * noiseScale, y * noiseScale, noiseOffset);
      let bright = map(noiseValue, 0, 1, 0, 255);
      fill(50, bright, 171, 200);
      noStroke();
      rect(x, y, 10, 10);
    }
  }
  noiseOffset += 0.01; // Adjust to control the speed of noise movement
}

// Button Functions --------------------------------------------------------------------------

function pauseTimer() {
  timer.pauseTimer();
  pauseButton.html("Resume");
  pauseButton.mousePressed(resumeTimer);
  styleButton(pauseButton, resumeColor);
}

function resumeTimer() {
  timer.resumeTimer();
  pauseButton.html("Pause");
  pauseButton.mousePressed(pauseTimer);
  styleButton(pauseButton, pauseColor);
}

function resetTimer() {
  timer.resetTimer();
  styleButton(pauseButton, pauseColor, true);
  styleButton(startButton, startColor, true);
  localStorage.removeItem("dialValue");
  localStorage.removeItem("currentTimer");
}

function startTimer() {
  timer.startTimer(timer.remainingTime / 1000, "Productivity Timer");
  styleButton(startButton, startColor, true);

  pauseButton.html("Pause");
  pauseButton.mousePressed(pauseTimer);
  styleButton(pauseButton, pauseColor);

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

// mouse interaction -------------------------------------------------------------------------
function mouseDragged() {
  if (!mouseDown) return;

  let angle = -atan2(mouseY - dial.y, mouseX - dial.x);

  if (previousMouseX != null && previousMouseY != null) {
    let dx = mouseX - previousMouseX;
    let dy = mouseY - previousMouseY;
    let distance = sqrt(dx * dy + dy * dy);
    let currentTime = millis();
    let timeElapsed = currentTime - previousTime;

    // adjust input based on mouse speed
    mouseSpeed = distance / timeElapsed;
    if (isNaN(mouseSpeed)) {
      mouseSpeed = 0;
    }
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
      styleButton(startButton, startColor);
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
    styleButton(startButton, startColor, true);
  }

  localStorage.setItem("dialValue", timer.remainingTime);
  dial.angle = 0;
  mouseDown = false;
  mouseSpeed = 0;
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
    !timer.isRunning &&
    timer.duration == 0;

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
