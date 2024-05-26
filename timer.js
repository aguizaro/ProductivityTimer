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
    fill(189, 255, 242);
    textAlign(CENTER, CENTER);
    text(this.name, width / 2, height / 10);

    const hours = floor(this.remainingTime / 3600000);
    const minutes = floor((this.remainingTime % 3600000) / 60000);
    const seconds = floor((this.remainingTime % 60000) / 1000);

    const paddedHours = this.padNumber(hours);
    const paddedMinutes = this.padNumber(minutes);
    const paddedSeconds = this.padNumber(seconds);

    textFont(digitalFont, 72);
    fill(189, 255, 242);
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
