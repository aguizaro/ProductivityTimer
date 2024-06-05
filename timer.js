// Timer class -------------------------------------------------------------------------------
let MAX_DESCRIPTION_LENGTH = 90;
let padding = 10;

class Timer {
  constructor() {
    this.name = "";
    this.startTime = 0;
    this.duration = 0;
    this.isRunning = false;
    this.remainingTime = -1;
    this.taskComplete = false;
    this.description = "";
    this.isPaused = false;
    this.timeExpired = false;
    this.totalDuration = 0;
    //create button off screen
    this.removeTaskButton = new RemoveTaskButton(-100, -100, 50);
    // override the checkPressed function for the button
    this.removeTaskButton.checkPressed = () => {
      if (this.removeTaskButton.isHovered) {
        timerHistory.splice(timerHistory.indexOf(this), 1);
        localStorage.setItem("timerHistory", JSON.stringify(timerHistory));
      }
    };
  }

  // load timer data from a JSON object
  loadTimer(timerData) {
    this.name = timerData.name;
    this.startTime = timerData.startTime;
    this.duration = timerData.duration;
    this.isRunning = timerData.isRunning;
    this.remainingTime = timerData.remainingTime;
    this.taskComplete = timerData.taskComplete;
    this.description = timerData.description;
    this.isPaused = timerData.isPaused;
    this.timeExpired = timerData.timeExpired;
    this.totalDuration = timerData.totalDuration;
  }

  // start the timer with a given number of seconds and a name
  startTimer(seconds, timerName) {
    this.name = timerName;
    this.startTime = Date.now();
    this.duration = seconds * 1000; // Convert to milliseconds
    this.totalDuration = this.duration;
    this.isRunning = true;
    this.remainingTime = this.duration;
    this.isPaused = false;
  }

  pauseTimer() {
    this.isRunning = false;
    this.isPaused = true;
    localStorage.setItem("currentTimer", JSON.stringify(this));
  }

  // This is the function that is called when the timer is done
  stopTimer() {
    this.isRunning = false;
    this.isPaused = false;
    this.remainingTime = 0;
    this.timeExpired = true;
    styleButton(pauseButton, pauseColor, true);
    localStorage.setItem("currentTimer", JSON.stringify(this));
  }

  resumeTimer() {
    this.startTime = Date.now();
    this.duration = this.remainingTime;
    this.isRunning = true;
    this.isPaused = false;
    localStorage.setItem("currentTimer", JSON.stringify(this));
  }

  // clear all timer data
  resetTimer() {
    this.isRunning = false;
    this.startTime = 0;
    this.duration = 0;
    this.taskComplete = false;
    this.remainingTime = -1;
    this.name = "Untitled Task";
    this.description = "";
    this.isPaused = false;
    this.timeExpired = false;
    this.totalDuration = 0;
    localStorage.setItem("currentTimer", JSON.stringify(this));
  }

  cloneTimer() {
    const newTimer = new Timer();
    newTimer.loadTimer(this);
    return newTimer;
  }

  update() {
    if (this.isRunning) {
      const elapsed = Date.now() - this.startTime;
      this.remainingTime = this.duration - elapsed;
      localStorage.setItem("currentTimer", JSON.stringify(this));
      if (this.remainingTime <= 0) {
        this.stopTimer();
      }
    }
  }

  display(nameHover = false, dialHover = false) {
    this.update();
    textFont(titleFont, 42);
    fill(189, 255, 242);
    if (nameHover) {
      fill(0, 237, 255);
    }
    if (timer.timeExpired) {
      fill(189, 255, 242, 120);
    }
    textAlign(CENTER, CENTER);
    text(this.name, width / 2, height / 11);

    const timeRemaining = this.toHMSRemaining();
    textFont(digitalFont, timerDigitSize);
    fill(189, 255, 242, 255);
    if (dialHover) {
      fill(0, 237, 255);
    }
    if (timer.timeExpired) {
      fill(189, 255, 242, 120);
    }

    textAlign(CENTER, CENTER);
    text(timeRemaining, width / 2, height / 2 + 25);
  }

  toHMSRemaining() {
    if (this.remainingTime < 0) return "00:00:00";
    const hours = floor(this.remainingTime / 3600000);
    const minutes = floor((this.remainingTime % 3600000) / 60000);
    const seconds = floor((this.remainingTime % 60000) / 1000);

    const paddedHours = this.padNumber(hours);
    const paddedMinutes = this.padNumber(minutes);
    const paddedSeconds = this.padNumber(seconds);

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  toHMSElapsed() {
    const elapsed = this.totalDuration - this.remainingTime;
    if (elapsed < 0) return "00:00:00";
    const hours = floor(elapsed / 3600000);
    const minutes = floor((elapsed % 3600000) / 60000);
    const seconds = floor((elapsed % 60000) / 1000);

    const paddedHours = this.padNumber(hours);
    const paddedMinutes = this.padNumber(minutes);
    const paddedSeconds = this.padNumber(seconds);

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  toHMSTotal() {
    if (this.totalDuration < 0) return "00:00:00";
    const hours = floor(this.totalDuration / 3600000);
    const minutes = floor((this.totalDuration % 3600000) / 60000);
    const seconds = floor((this.totalDuration % 60000) / 1000);

    const paddedHours = this.padNumber(hours);
    const paddedMinutes = this.padNumber(minutes);
    const paddedSeconds = this.padNumber(seconds);

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  padNumber(number) {
    return number < 10 ? "0" + number : number;
  }

  equals(timer) {
    return (
      this.name === timer.name &&
      this.startTime === timer.startTime &&
      this.duration === timer.duration &&
      this.isRunning === timer.isRunning &&
      this.remainingTime === timer.remainingTime &&
      this.taskComplete === timer.taskComplete &&
      this.description === timer.description
    );
  }

  displayAsCurrentTask(x, y) {
    let elapsed = this.toHMSElapsed();
    let total = this.toHMSTotal();
    if (this.totalDuration === 0) {
      total = this.toHMSRemaining();
    }
    let heightOffset = 0;

    if (this.timeExpired) {
      if (this.taskComplete) {
        fill(0, 100, 0, 180); // green for completed tasks
      } else {
        fill(100, 0, 0, 180); // red for expired tasks
      }
    } else if (this.startTime === 0) {
      fill(0, 0, 0, 60); // light black for non active tasks
    } else {
      fill(0, 0, 0, 180); // black for active tasks
    }
    noStroke();
    rect(x - padding, y - padding, width - padding * 4, 130);

    // Draw the text
    fill(189, 255, 242);
    textFont(titleFont, 24);
    textAlign(LEFT, TOP);
    text(`${this.name}`, x, y);
    heightOffset += 40;
    textFont(titleFont, 14);
    if (this.description.length > 0) {
      const maxDesc =
        this.description.length > MAX_DESCRIPTION_LENGTH
          ? this.description.substring(0, MAX_DESCRIPTION_LENGTH) + "..."
          : this.description;
      text(maxDesc, x, y + heightOffset);
      heightOffset += 30;
    } else {
      heightOffset += 10;
    }
    textFont(digitalFont, 48);
    text(`${elapsed} / ${total}`, x, y + heightOffset);
  }

  // slightly smaller than displayAsCurrentTask
  displayAsHistoryTask(x, y) {
    let elapsed = this.toHMSElapsed();
    let total = this.toHMSTotal();
    let heightOffset = 0;

    if (this.timeExpired) {
      if (this.taskComplete) {
        fill(0, 100, 0, 180); // green for completed tasks
      } else {
        fill(100, 0, 0, 180); // red for expired tasks
      }
    } else {
      fill(0, 0, 0, 120); // black for active tasks - will never be displayed in history
    }
    noStroke();
    rect(x - padding, y - padding, width - padding * 4, 100);
    this.removeTaskButton.display(x + width - 120, y + 20);

    fill(189, 255, 242);
    textFont(titleFont, 18);
    textAlign(LEFT, TOP);
    text(`${this.name}`, x, y);
    heightOffset += 30;
    textFont(titleFont, 11);
    if (this.description.length > 0) {
      const maxDesc =
        this.description.length > MAX_DESCRIPTION_LENGTH
          ? this.description.substring(0, MAX_DESCRIPTION_LENGTH) + "..."
          : this.description;
      text(maxDesc, x, y + heightOffset);
      heightOffset += 20;
    }
    textFont(digitalFont, 32);
    text(`${elapsed} / ${total}`, x, y + heightOffset);
  }
}

// Custom button class for removing tasks -------------------------------------------------------------

class RemoveTaskButton {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.w = size;
    this.h = size;
    this.isHovered = false;
    this.highlightColor = color(250, 0, 100);
    this.normalColor = color(100, 100, 200, 200);
  }

  display(x, y) {
    this.x = x;
    this.y = y;
    if (this.isMouseOver()) {
      fill(this.highlightColor);
      this.isHovered = true;
    } else {
      fill(this.normalColor);
      this.isHovered = false;
    }

    rect(this.x, this.y, this.w, this.h);

    fill(255);
    textFont(titleFont, 20);
    textAlign(CENTER, CENTER);
    text("x", this.x + this.w / 2, this.y + this.h / 2);
  }

  isMouseOver() {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    );
  }

  checkPressed() {
    // override this function inside the Timer class
  }
}
