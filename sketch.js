// Productivity Timer by Tony Guizar
// P5.js sketch that creates a productivity timer that counts down from a specified time

// Global variables
const MAX_TIME = 1000 * 60 * 60 * 12; // 12 hours

// scrolling
let scrollOffset = 0;
const scrollYStart = 250;
const scrollYDiff = 105;
const widthPadding = 40;
let maxScrollOffset;

// Interface State - these are mutually exclusive
const InterfaceState = {
  TIMER: true,
  TASKS: false,
};

// Canvas
let canvas;
const MAX_CANVAS_WIDTH = 1000;
const MIN_CANVAS_WIDTH = 500;
const MAX_DIAL_RADIUS = 250;
const MAX_NUM_PARTICLES = 3000;

// Timer
let timer;
let hoveringOverTitle = false;
let timerHistory = [];
let timerDigitSize;

// Dial
let dial;
let hoveringOverDial = false;
let isDialMoving = false;

// UI elements
let pauseButton;
let startButton;
let resetButton;
let nameInput;
let switchViewButton;
let pauseColor,
  resumeColor,
  resetColor,
  startColor,
  completeColor,
  switchViewColor;

// Fonts
let digitalFont;
let titleFont;

// Mouse variables
let previousMouseX, previousMouseY, previousTime;
let mouseSpeed = 0;
let mouseDown = false;

// Particles
let particles = [];
let numParticles;
let dialX, dialY, dialOuterRadius, dialInnerRadius;

// Perlin Noise
let buffer;
let noiseScale = 0.1;
let noiseOffset = 0;
let angleOffset = 0;
const BASE_ANGLE_SPEED = 0.0003; // speed of noise rotation
let angleSpeed = BASE_ANGLE_SPEED;

// preload --------------------------------------------------------------------------------------
function preload() {
  digitalFont = loadFont(`./digital-7-mono.ttf`);
  titleFont = loadFont(`./Oldtimer.ttf`);
}

// setup ---------------------------------------------------------------------------------------

function setup() {
  frameRate(60);

  // scale dimensions based on window width ----------

  let = canvasWidth = min(
    Math.floor(windowWidth / 100) * 100,
    MAX_CANVAS_WIDTH
  );
  canvas = createCanvas(canvasWidth, 700);
  buffer = createGraphics(width / 4, height / 4); // create a smaller off-screen buffer
  buffer.pixelDensity(1); // set to 1 for accurate scaling

  pauseColor = color(17, 142, 214);
  resumeColor = color(0, 120, 120);
  resetColor = color(69, 0, 219);
  startColor = color(34, 128, 242);
  completeColor = color(0, 150, 0);
  switchViewColor = color(255, 0, 0);

  dialX = width / 2;
  dialY = height / 2 + 25;
  dialOuterRadius = min(width / 2 - 10, MAX_DIAL_RADIUS);
  dialInnerRadius = dialOuterRadius / 1.6;
  numParticles = min(dialOuterRadius * 10, MAX_NUM_PARTICLES);
  timerDigitSize = dialInnerRadius / 2;

  dial = new Dial(dialX, dialY, dialInnerRadius, dialOuterRadius);

  // load local storage data -----------------------

  const currentTimerSavedData = localStorage.getItem("currentTimer");
  const currentViewData = localStorage.getItem("currentView");
  const timerHistoryData = localStorage.getItem("timerHistory");

  timer = new Timer();
  timer.name = "Untitled Task";

  // set local storage data -------------------------

  if (currentTimerSavedData) {
    const timerData = JSON.parse(currentTimerSavedData);
    timer.loadTimer(timerData);
  }
  if (timerHistoryData) {
    timerHistory = JSON.parse(timerHistoryData).map((t) => {
      const newTimer = new Timer();
      newTimer.loadTimer(t);
      return newTimer;
    });
  }
  if (currentViewData == "tasks") {
    InterfaceState.TIMER = false;
    InterfaceState.TASKS = true;
  } else {
    InterfaceState.TIMER = true;
    InterfaceState.TASKS = false;
  }

  maxScrollOffset = timerHistory.length * scrollYDiff - height + scrollYStart; // 80 is the spacing between tasks, 250 is initial y-offset

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
  switchViewButton = createButton("View");
  styleButton(switchViewButton, switchViewColor);
  switchViewButton.mousePressed(toggleView);
  if (timer.isRunning) {
    pauseButton = createButton("Pause");
    pauseButton.mousePressed(pauseTimer);
    styleButton(pauseButton, pauseColor);
  } else if (timer.remainingTime > 0) {
    pauseButton = createButton("Resume");
    pauseButton.mousePressed(resumeTimer);
    styleButton(pauseButton, resumeColor);
  } else {
    pauseButton = createButton("Pause");
    pauseButton.mousePressed(pauseTimer);
    styleButton(pauseButton, pauseColor, true);
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
  buttonDiv.child(switchViewButton);
  buttonDiv.child(pauseButton);
  buttonDiv.child(resetButton);
  buttonDiv.child(startButton);

  // create modal
  setupModal();

  // mouse exits canvas
  canvas.mouseOut(() => {
    if (mouseDown) return;

    hoveringOverDial = false;
    hoveringOverTitle = false;
  });
}

// user properties --------------------------------------------------------------------------------

// async function getCurrentSunlight() {
//   let lat, lon, sunrise, sunset;
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition((position) => {
//       lat = position.coords.latitude;
//       lon = position.coords.longitude;
//     });
//   } else {
//     console.log("Geolocation is not supported by this browser.");
//   }

//   let url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`;

//   const data = await fetch(url);
//   const json = await data.json();
//   sunrise = new Date(json.results.sunrise);
//   sunset = new Date(json.results.sunset);

//   let now = new Date();
//   let currentTime = now.getTime();
//   let sunriseTime = sunrise.getTime();
//   let sunsetTime = sunset.getTime();

//   return `Sunrise: ${sunriseTime}, Sunset: ${sunsetTime}, Current: ${currentTime}`;
// }

// update loop --------------------------------------------------------------------------------

function draw() {
  background(255);

  if (timerHistory.length < 5) {
    // reset scroll offset if there are less than 5 tasks
    scrollOffset = 0;
  } else {
    scrollOffset = constrain(scrollOffset, -maxScrollOffset, 0);
  }
  maxScrollOffset = timerHistory.length * scrollYDiff - height + scrollYStart;
  MAX_DESCRIPTION_LENGTH = width / 10;

  //display perlin noise background
  drawNoiseBackground();
  image(buffer, 0, 0, width, height);

  // display task view if active
  if (InterfaceState.TASKS) {
    textFont(titleFont, 48);
    fill(189, 255, 242);
    textAlign(CENTER, CENTER);
    text("Task View", width / 2, widthPadding);

    if (timerHistory.length === 0 && timer.startTime === 0) {
      textFont(titleFont, 24);
      fill(189, 255, 242);
      textAlign(CENTER, CENTER);
      text("No tasks completed yet", width / 2, height / 2);
    }
    // display task history
    timerHistory
      .slice()
      .reverse()
      .forEach((t, i) => {
        const yPos = scrollYStart + i * scrollYDiff + scrollOffset;
        if (yPos > height || yPos < scrollYStart - 60) {
          return;
        }
        t.displayAsHistoryTask(
          40,
          scrollYStart + i * scrollYDiff + scrollOffset
        );
      });

    // display current task
    timer.update();
    timer.displayAsCurrentTask(widthPadding, 100);

    //display horizontal line
    push();
    stroke(255);
    strokeWeight(1);
    line(widthPadding, 100 + 130, width - widthPadding, 100 + 130);
    pop();
    return; // exit draw loop
  }

  //update and display particles
  for (let particle of particles) {
    particle.dialX = dial.x;
    particle.dialY = dial.y;
    particle.updatePosition();
    particle.display(mouseSpeed, timer.isRunning);
  }

  //display dial elements
  if (timer.totalDuration != 0 && !mouseDown) {
    let minuteAngle = map(timer.remainingTime, 0, 60000, 0, TWO_PI);
    let totalAngle = map(
      timer.remainingTime,
      0,
      timer.totalDuration,
      0,
      TWO_PI
    );
    dial.display(hoveringOverDial, minuteAngle, totalAngle);
  } else {
    dial.display(hoveringOverDial);
  }

  // display timer countdown and timer name
  timer.display(hoveringOverTitle, hoveringOverDial);

  // display user instructions on hover
  if (hoveringOverDial) {
    if (timer.remainingTime == 0) {
      push();
      fill(189, 255, 242, 255);
      textAlign(CENTER, CENTER);
      textFont(titleFont, 16);
      fill(255);
      text(
        "press reset button to set a new timer",
        dial.x,
        dial.y + dial.outerRadius + 30
      );
      pop();
    } else if (!isDialMoving && timer.totalDuration == 0) {
      push();
      fill(189, 255, 242, 255);
      textAlign(CENTER, CENTER);
      textFont(titleFont, 16);
      fill(255);
      text(
        "click and drag to set timer",
        dial.x,
        dial.y + dial.outerRadius + 30
      );
      pop();
    }
  }
  if (hoveringOverTitle) {
    push();
    fill(189, 255, 242, 255);
    textAlign(CENTER, CENTER);
    textFont(titleFont, 16);
    fill(255);
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
        sin(angle) * radius * noiseScale,
        noiseOffset
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
  angleSpeed =
    timer.isRunning && InterfaceState.TIMER
      ? BASE_ANGLE_SPEED * 4
      : -BASE_ANGLE_SPEED;
  angleOffset += angleSpeed;
  noiseOffset += 0.01;
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
  // add timer to history
  timer.timeExpired = true;
  if (timer.startTime != 0) timerHistory.push(timer.cloneTimer());

  // reset timer
  timer.resetTimer();

  // reset buttons
  styleButton(pauseButton, pauseColor, true);
  startButton.html("Start");
  startButton.mousePressed(startTimer);
  styleButton(startButton, startColor, true);
  styleButton(resetButton, resetColor, true);

  // update data
  localStorage.setItem("timerHistory", JSON.stringify(timerHistory));
  localStorage.removeItem("currentTimer");
}

function startTimer() {
  // start timer
  timer.startTimer(timer.remainingTime / 1000, timer.name);

  // update buttons
  startButton.html("Complete Task");
  startButton.mousePressed(completeTask);
  styleButton(startButton, completeColor);

  pauseButton.html("Pause");
  pauseButton.mousePressed(pauseTimer);
  styleButton(pauseButton, pauseColor);
}

function completeTask() {
  timer.taskComplete = true;
  resetTimer(); // timer is saved to tasks and then reset
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

function toggleView() {
  InterfaceState.TIMER = !InterfaceState.TIMER;
  InterfaceState.TASKS = !InterfaceState.TASKS;
  localStorage.setItem("currentView", InterfaceState.TIMER ? "timer" : "tasks");
}

// Utility Functions --------------------------------------------------------------------------

// string cannot be empty or contain only whitespace
function isValidString(str) {
  return !(str.trim().length === 0);
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
    let rotationDirection = 0;
    if (angle < dial.angle) {
      timer.remainingTime += timeAdjustment;
      rotationDirection = 5 * mouseSpeed;
    } else if (angle > dial.angle) {
      timer.remainingTime -= timeAdjustment;
      rotationDirection = -5 * mouseSpeed;
    }

    timer.remainingTime = constrain(timer.remainingTime, 0, MAX_TIME);
    if (timer.remainingTime > 0) {
      styleButton(startButton, startColor);
      styleButton(resetButton, resetColor);
    }

    if (rotationDirection != 0) {
      dial.angle = angle;
      for (let particle of particles) {
        particle.influenceDirection(rotationDirection * mouseSpeed);
      }
    }
  }
  previousMouseX = mouseX;
  previousMouseY = mouseY;
  previousTime = millis();
}

function mouseReleased() {
  if (!mouseDown) return;

  checkHover();

  isDialMoving = false;
  angleSpeed = BASE_ANGLE_SPEED;

  //round to nearest 15 seconds
  timer.remainingTime = Math.round(timer.remainingTime / 15000) * 15000;
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
  if (isModalOpen()) {
    return;
  }

  timerHistory.forEach((t, i) => {
    t.removeTaskButton.checkPressed();
  });

  checkHover();
  if (
    mouseX > 0 &&
    mouseX < width &&
    mouseY > 0 &&
    mouseY < height / 7 + 10 &&
    timer.startTime == 0
  ) {
    openModal();
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

  if (mouseDown) {
    // for (let particle of particles) {
    //   particle.velocity.mult(0);
    // }
  }

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
  if (!timer || timer.remainingTime == 0 || timer.isPaused || isModalOpen())
    return false;
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
    !timer.isRunning
  ) {
    hoveringOverDial = true;
  } else {
    hoveringOverDial = false;
  }
}

// mouse scroll --------------------------------------------------------------------------------

function mouseWheel(event) {
  if (!InterfaceState.TASKS) return;
  scrollOffset += event.delta;
  return false;
}

//window functions --------------------------------------------------------------------------------
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

function windowResized() {
  let = canvasWidth = max(
    min(Math.floor(windowWidth / 100) * 100, MAX_CANVAS_WIDTH),
    MIN_CANVAS_WIDTH
  );

  resizeCanvas(canvasWidth, 700);

  // recreate buffer with new dimensions
  buffer.clear();
  buffer = createGraphics(width / 4, height / 4);
  buffer.pixelDensity(1);

  // update size properties
  dialX = width / 2;
  dialY = height / 2 + 25;
  dialOuterRadius = min(width / 2 - 10, MAX_DIAL_RADIUS);
  dialInnerRadius = dialOuterRadius / 1.6;
  numParticles = min(dialOuterRadius * 10, MAX_NUM_PARTICLES);
  timerDigitSize = dialInnerRadius / 2;

  dial.x = dialX;
  dial.y = dialY;

  //recreate particles
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let angle = random(TWO_PI);
    let radius = random(dialInnerRadius, dialOuterRadius);
    let x = dialX + radius * cos(angle);
    let y = dialY + radius * sin(angle);
    particles.push(
      new Particle(x, y, dialX, dialY, dialInnerRadius, dialOuterRadius)
    );
  }
}

// Keyboard events --------------------------------------------------------------------------

function keyPressed() {
  if (keyCode === ENTER && !isModalOpen()) {
    toggleView();
    return false;
  }

  if (keyCode === ESCAPE && isModalOpen()) {
    closeModal();
  }

  if (keyCode === ENTER && isModalOpen()) {
    applyModalData(timer);
    return false;
  }
}
