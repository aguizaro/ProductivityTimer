// Productivity Timer by Tony Guizar
// P5.js sketch that creates a productivity timer that counts down from a specified time

// Global variables
const MAX_TIME = 1000 * 60 * 60 * 12; // 12 hours

// Timer
let timer;
let totalTime;
let hoveringOverTitle = false;

// Dial
let dial;
let hoveringOverDial = false;
let isDialMoving = false;

// UI elements
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
let numParticles = 1000;
let dialX, dialY, dialOuterRadius, dialInnerRadius;

// Perlin Noise
let buffer;
let noiseScale = 0.1; //density of noise
let noiseOffset = 0;
let angleOffset = 0;
const BASE_ANGLE_SPEED = 0.0003; // speed of noise rotation
let angleSpeed = BASE_ANGLE_SPEED;
//Button colors
let pauseColor, resumeColor, resetColor, startColor;

// preload --------------------------------------------------------------------------------------
function preload() {
  digitalFont = loadFont(`./digital-7-mono.ttf`);
  titleFont = loadFont(`./Oldtimer.ttf`);
}

// setup ---------------------------------------------------------------------------------------

function setup() {
  frameRate(60);
  createCanvas(600, 720);
  buffer = createGraphics(width / 4, height / 4); // Create a smaller off-screen buffer
  buffer.pixelDensity(1); // Ensure the pixel density of the buffer is set to 1 for accurate scaling

  pauseColor = color(17, 142, 214);
  resumeColor = color(0, 120, 120);
  resetColor = color(69, 0, 219);
  startColor = color(34, 128, 242);

  dialX = width / 2;
  dialY = height / 2 + 25;
  dialOuterRadius = 225;
  dialInnerRadius = 150;

  dial = new Dial(dialX, dialY, dialInnerRadius, dialOuterRadius);

  // load local storage data -----------------------

  const data = localStorage.getItem("currentTimer");
  const totalTimeValue = parseInt(localStorage.getItem("totalTime"));

  timer = new Timer();
  timer.name = "Untitled Timer";

  // set local storage data -------------------------

  if (data) {
    // load saved timer
    const timerData = JSON.parse(data);
    timer.loadTimer(timerData);
  }
  if (totalTimeValue) {
    totalTime = totalTimeValue;
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

  if (timer.remainingTime > 0 && !timer.isRunning && timer.startTime === 0) {
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
  image(buffer, 0, 0, width, height);

  //print all timer props
  if (timer.duration != 0 && !mouseDown) {
    let minuteAngle = map(timer.remainingTime, 0, 60000, 0, TWO_PI);
    let totalAngle = map(timer.remainingTime, 0, totalTime, 0, TWO_PI);
    dial.display(hoveringOverDial, minuteAngle, totalAngle);
  } else {
    dial.display(hoveringOverDial);
  }

  timer.display(hoveringOverTitle, hoveringOverDial);

  for (let particle of particles) {
    particle.display(mouseSpeed);
  }

  if (!isDialMoving && hoveringOverDial) {
    push();
    fill(189, 255, 242, 255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("click and drag to set timer", dial.x, dial.y + dial.outerRadius + 30);
    pop();
  }

  if (hoveringOverTitle) {
    push();
    fill(189, 255, 242, 255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("click to edit timer name", width / 2, height / 11 + 50);
    pop();
  }
}

// Perlin Noise -------------------------------------------------------------------------

function drawNoiseBackground() {
  buffer.loadPixels();
  for (let y = 0; y < buffer.height; y++) {
    for (let x = 0; x < buffer.width; x++) {
      let angle =
        atan2(y - buffer.height / 2, x - buffer.width / 2) + angleOffset;
      let radius = dist(x, y, buffer.width / 2, buffer.height / 2);

      // noise value based on the angle and radius
      let noiseValue = noise(
        cos(angle) * radius * noiseScale,
        sin(angle) * radius * noiseScale
      );
      let bright = map(noiseValue, 0, 1, 0, 255);

      // flat buffer index = ((x + y * bufferWidth) * 4) ---> 4 channels (RGBA)
      let index = (y * buffer.width + x) * 4;

      buffer.pixels[index] = 50; // Red
      buffer.pixels[index + 1] = bright; // Green
      buffer.pixels[index + 2] = 171; // Blue
      buffer.pixels[index + 3] = 200; // Alpha
    }
  }
  buffer.updatePixels();

  // speed up rotation when timer is running
  angleSpeed = timer.isRunning ? BASE_ANGLE_SPEED * 5 : BASE_ANGLE_SPEED;
  angleOffset += angleSpeed;
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
  totalTime = 0;
  styleButton(pauseButton, pauseColor, true);
  styleButton(startButton, startColor, true);
  localStorage.removeItem("currentTimer");
  localStorage.removeItem("totalTime");
}

function startTimer() {
  timer.startTimer(timer.remainingTime / 1000, timer.name);
  totalTime = timer.remainingTime;
  styleButton(startButton, startColor, true);

  pauseButton.html("Pause");
  pauseButton.mousePressed(pauseTimer);
  styleButton(pauseButton, pauseColor);
  localStorage.setItem("totalTime", totalTime);
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

// mouse interaction -------------------------------------------------------------------------
function mouseDragged() {
  if (!mouseDown) return;
  isDialMoving = true;

  let angle = -atan2(mouseY - dial.y, mouseX - dial.x);

  if (previousMouseX != null && previousMouseY != null) {
    let dx = mouseX - previousMouseX;
    let dy = mouseY - previousMouseY;
    let distance = sqrt(dx * dx + dy * dy);
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
      //angleSpeed = -BASE_ANGLE_SPEED * 8;
    } else if (angle > dial.angle) {
      timer.remainingTime -= timeAdjustment;
      //angleSpeed = BASE_ANGLE_SPEED * 8;
    }

    timer.remainingTime = constrain(timer.remainingTime, 0, MAX_TIME);
    if (timer.remainingTime > 0) {
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
  isDialMoving = false;
  angleSpeed = BASE_ANGLE_SPEED;

  //round to nearest 30 seconds
  timer.remainingTime = Math.round(timer.remainingTime / 30000) * 30000;
  if (timer.remainingTime === 0) {
    styleButton(startButton, startColor, true);
  }

  localStorage.setItem("currentTimer", JSON.stringify(timer));
  dial.angle = 0;
  mouseDown = false;
  mouseSpeed = 0;
  previousMouseX = null;
  previousMouseY = null;
  previousTime = null;
}

function mousePressed() {
  checkHover();
  if (
    mouseX > 0 &&
    mouseX < width &&
    mouseY > 0 &&
    mouseY < height / 7 + 10 &&
    timer.startTime == 0
  ) {
    const inputName = prompt("Enter timer name", timer.name);
    if (inputName != null && inputName != "") {
      timer.name = inputName;
    } else {
      timer.name = "Untitled Timer";
    }
    localStorage.setItem("currentTimer", JSON.stringify(timer));
    return;
  }

  mouseDown =
    mouseX > 0 &&
    mouseX < width &&
    mouseY > height / 7 + 10 &&
    mouseY < height - 25 &&
    !timer.isRunning &&
    timer.duration == 0;

  // initial mouse position and time
  previousMouseX = mouseX;
  previousMouseY = mouseY;
  previousTime = millis();
}

//mouse hover --------------------------------------------------------------------------------
function mouseMoved() {
  checkHover();
}

function checkHover() {
  //check if hovering over title or dial
  if (
    mouseX > 0 &&
    mouseX < width &&
    mouseY > 0 &&
    mouseY < height / 7 + 10 &&
    timer.startTime == 0
  ) {
    hoveringOverTitle = true;
    hoveringOverDial = false;
    return;
  } else {
    hoveringOverTitle = false;
  }

  if (dial == null) return;

  if (
    mouseX > 0 &&
    mouseX < width &&
    mouseY > height / 7 + 10 &&
    mouseY < height - 25 &&
    !timer.isRunning &&
    timer.duration == 0
  ) {
    hoveringOverDial = true;
  } else {
    hoveringOverDial = false;
  }
}

//window focus --------------------------------------------------------------------------------
window.onfocus = function () {
  mouseDown = false;
  hoveringOverDial = false;
  hoveringOverTitle = false;
};
window.onblur = function () {
  mouseDown = false;
  hoveringOverDial = false;
  hoveringOverTitle = false;
};
