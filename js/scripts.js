// script.js

document.addEventListener("DOMContentLoaded", () => {
  let timer;
  const FOCUS_TIME_DEFAULT = 25; // 25; // 25 minutes
  const BREAK_TIME_DEFAULT = 5; // 5 minutes
  const ALARM_SOUND_DEFAULT_VOLUME = 5; // 5%
  let focusTime = FOCUS_TIME_DEFAULT;
  let breakTime = BREAK_TIME_DEFAULT;
  let timeLeft = focusTime;
  let isRunning = false;
  let isBreak = false;
  let cicleOn = false;

  let tickTockSound = new Audio("sounds/clock-tick1.wav");
  let backgroundSound = new Audio();
  backgroundSound.loop = true;
  let alarmSound = new Audio("sounds/alarma-2.mp3");
  alarmSound.loop = true;
  const SOUND_FADE_DURATION = 500;
  const progressBar = document.getElementById("progress-bar");

  const timeDisplay = document.getElementById("time");
  const startButton = document.getElementById("start");
  const pauseButton = document.getElementById("pause");
  const stopButton = document.getElementById("stop");
  const tickTockSlider = document.getElementById("tickTockSlider");
  const backgroundSlider = document.getElementById("backgroundSlider");
  const alarmSlider = document.getElementById("alarmSlider");

  /* FUNCTIONS */

  function switchToBreakMode() {
    isBreak = true;
    timeLeft = getLocalStorageItem("breakTime") * 60;
    changeTimerLabel("Break Time");
    updateDisplay();
    updateProgressBar();
    playSoundFadeIn(alarmSound, SOUND_FADE_DURATION);
    stopSoundFadeOut(backgroundSound, SOUND_FADE_DURATION);
    changeSelectedButton("stop");
    showAlert("It's time to break!");
  }

  function switchToPomodoroMode() {
    isBreak = false;
    timeLeft = getLocalStorageItem("focusTime") * 60;
    changeTimerLabel("Focus Time");
    if (cicleOn) {
      playSoundFadeIn(alarmSound, SOUND_FADE_DURATION);
      stopSoundFadeOut(backgroundSound, SOUND_FADE_DURATION);
      changeSelectedButton("stop");
      showAlert("It's time to focus!");
    }
    updateDisplay();
    updateProgressBar();
  }

  function timerOn() {
    if (!isRunning) {
      if (isBreak) changeTimerLabel("Break Time");
      else changeTimerLabel("Focus Time");
      changeSelectedButton("start");
      isRunning = true;
      timer = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateDisplay();
          updateProgressBar();
          if (getVolumeSliderValue("tickTockSlider") > 0)
            playSound(tickTockSound);
        } else {
          clearInterval(timer);
          isRunning = false;
          if (isBreak) {
            showTimeBreakPanel();
            switchToPomodoroMode();
          } else {
            switchToBreakMode();
            showTimeBreakPanel();
          }
        }
      }, 50);
    }
  }

  function startTimerButton() {
    cicleOn = true;
    timerOn();
    hideTimeBreakPanel();
    if (backgroundSound.src && backgroundSound.src !== "") {
      changeSoundVolume(
        backgroundSound,
        getLocalStorageItem("backgroundVolume")
      );
      playSoundFadeIn(backgroundSound, SOUND_FADE_DURATION);
    }
    updateEndTime();
  }

  function pauseTimerButton() {
    if (isRunning) {
      // changeTimerLabel(newText);
      changeSelectedButton("pause");
      showTimeBreakPanel();
      clearInterval(timer);
      isRunning = false;
      stopSoundFadeOut(backgroundSound, SOUND_FADE_DURATION);
    }
  }

  function stopTimerButton() {
    changeSelectedButton("stop");
    document.getElementById("endTimeValue").textContent = "-- : --";
    clearInterval(timer);
    isRunning = false;
    cicleOn = false;
    stopSoundFadeOut(backgroundSound, SOUND_FADE_DURATION);
    showTimeBreakPanel();
    switchToPomodoroMode();
    changeTimerLabel("Pomodoro Timer");
    resetProgressBar();
  }

  function getFocusSliderValue() {
    focusTime = getTimeSliderValue("focusSlider");
    if (!isBreak) {
      timeLeft = focusTime * 60;
      updateDisplay();
      updateEndTime();
    }
    setTimeSliderValue("focusSlider", focusTime);
    setLocalStorageItem("focusTime", focusTime);
  }

  function getBreakSliderValue() {
    breakTime = getTimeSliderValue("breakSlider");
    if (isBreak) {
      timeLeft = breakTime * 60;
      updateDisplay();
      updateEndTime();
    }
    setTimeSliderValue("breakSlider", breakTime);
    setLocalStorageItem("breakTime", breakTime);
  }

  function currentTime() {
    document.getElementById("currentTime").innerHTML =
      new Date().toLocaleTimeString();
  }

  function updateEndTime() {
    const currentTime = new Date();
    const endTime = new Date(currentTime.getTime() + timeLeft * 1000);
    const hours = endTime.getHours().toString().padStart(2, "0");
    const minutes = endTime.getMinutes().toString().padStart(2, "0");
    document.getElementById("endTimeValue").textContent = `${hours}:${minutes}`;
  }

  function getTickTockVolumeValue() {
    const value = getVolumeSliderValue("tickTockSlider");
    showVolumeSliderValue("tickTockSliderText", value);
    changeSoundVolume(tickTockSound, value);
    setLocalStorageItem("tickTockSoundVolume", value);
  }

  function getBackgroundVolumeValue() {
    const value = getVolumeSliderValue("backgroundSlider");
    showVolumeSliderValue("backgroundSliderText", value);
    changeSoundVolume(backgroundSound, value);
    setLocalStorageItem("backgroundVolume", value);
  }

  function getAlarmVolumeValue() {
    const value = getVolumeSliderValue("alarmSlider");
    showVolumeSliderValue("alarmSliderText", value);
    changeSoundVolume(alarmSound, value);
    setLocalStorageItem("alarmSoundVolume", value);
  }

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    document.title = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function updateProgressBar() {
    const totalTime = (isBreak ? breakTime : focusTime) * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", progress);
  }

  function resetProgressBar() {
    progressBar.style.width = "0%";
    progressBar.setAttribute("aria-valuenow", 0);
  }

  function changeTimerLabel(newText) {
    document.getElementById("timerLabel").textContent = newText;
  }

  function removeActiveButtons() {
    document.getElementById("start").classList.remove("active");
    document.getElementById("pause").classList.remove("active");
    document.getElementById("stop").classList.remove("active");
  }

  function changeSelectedButton(button) {
    removeActiveButtons();
    document.getElementById(button).classList.add("active");
  }

  function showAlert(message) {
    const modalHtml = `
      <div class="modal fade" id="alertModal" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-sm mt-5">
          <div class="modal-content p-2">
            <div class="modal-body d-flex align-items-center justify-content-center">
              <span class="me-3">
                <img width="25" height="25" class="mb-1" alt="Pomodoro icon" src="imgs/favicon.png"/>
              </span>
              ${message}
            </div>
            <div class="modal-footer">
              <button id="modalOkButton" type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    const modal = new bootstrap.Modal(document.getElementById("alertModal"));
    modal.show();

    document.getElementById("modalOkButton").addEventListener("click", () => {
      stopSound(alarmSound, SOUND_FADE_DURATION);
      const modalElement = document.getElementById("alertModal");
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();
      modalElement.addEventListener(
        "hidden.bs.modal",
        () => {
          modalElement.remove();
        },
        { once: true }
      );
    });
  }

  function showTimeBreakPanel() {
    const div = document.getElementById("sliders-time-panel");
    div.classList.remove("hidden");
    div.style.height = div.offsetHeight + "px";
    div.style.height = "";
  }

  function hideTimeBreakPanel() {
    const div = document.getElementById("sliders-time-panel");
    div.style.height = div.scrollHeight + "px";
    requestAnimationFrame(() => {
      div.classList.add("hidden");
      div.style.height = "0";
    });
  }

  function initApp() {
    // Init focus/break sliders
    focusSlider.addEventListener("input", () => {
      focusSliderText.textContent = focusSlider.value;
      getFocusSliderValue();
      updateEndTime();
    });
    breakSlider.addEventListener("input", () => {
      getBreakSliderValue();
    });

    // Init Volume sliders
    tickTockSlider.addEventListener("input", getTickTockVolumeValue);
    backgroundSlider.addEventListener("input", getBackgroundVolumeValue);
    alarmSlider.addEventListener("input", getAlarmVolumeValue);

    // Init Background music icons
    const backgroundAmbientIcons = document.querySelectorAll(".music-icon");
    backgroundAmbientIcons.forEach((icon) => {
      icon.addEventListener("click", function () {
        backgroundAmbientIcons.forEach((i) => i.classList.remove("active"));
        this.classList.add("active");
        const soundSrc = this.getAttribute("data-sound");
        if (soundSrc === "none") {
          setLocalStorageItem("backgroundSoundFile", "");
          stopSoundFadeOut(backgroundSound, SOUND_FADE_DURATION);
          setTimeout(() => {
            changeSound(backgroundSound, "");
          }, SOUND_FADE_DURATION);
        } else {
          setLocalStorageItem("backgroundSoundFile", soundSrc);
          changeSoundVolume(
            backgroundSound,
            getLocalStorageItem("backgroundVolume")
          );
          changeSound(backgroundSound, soundSrc);
          playSoundFadeIn(backgroundSound, SOUND_FADE_DURATION);
        }
      });
    });

    // Init Buttons play, pause and stop
    startButton.addEventListener("click", startTimerButton);
    pauseButton.addEventListener("click", pauseTimerButton);
    stopButton.addEventListener("click", stopTimerButton);

    // Init real time
    setInterval(function () {
      currentTime();
    }, 10);

    // Init localstorage
    const storedFocusTime = getLocalStorageItem("focusTime");
    if (storedFocusTime) {
      setTimeSliderValue("focusSlider", storedFocusTime);
      showTimeSliderValue("focusSliderText", storedFocusTime);
    } else {
      setTimeSliderValue("focusSlider", FOCUS_TIME_DEFAULT);
      setLocalStorageItem("focusTime", FOCUS_TIME_DEFAULT);
    }
    const storedBreakTime = getLocalStorageItem("breakTime");
    if (storedBreakTime) {
      setTimeSliderValue("breakSlider", storedBreakTime);
    } else {
      setTimeSliderValue("breakSlider", BREAK_TIME_DEFAULT);
      setLocalStorageItem("breakTime", BREAK_TIME_DEFAULT);
    }
    // Init Music Icons and sound file from localStorage
    const storedSoundFile = getLocalStorageItem("backgroundSoundFile");
    if (storedSoundFile) {
      changeSound(backgroundSound, storedSoundFile);
      const musicIcons = document.querySelectorAll("[data-sound]");
      musicIcons.forEach((icon) => {
        icon.classList.remove("active");
        if (storedSoundFile === icon.dataset.sound) {
          icon.classList.add("active");
        }
      });
    }
    const storedticktockSoundVolume = getLocalStorageItem(
      "tickTockSoundVolume"
    );
    let temp = storedticktockSoundVolume ? storedticktockSoundVolume : 0;
    setVolumeSliderValue("tickTockSlider", temp);
    changeSoundVolume(tickTockSound, temp);
    setLocalStorageItem("tickTockSoundVolume", temp);

    const storedBackgroundSoundVolume = getLocalStorageItem("backgroundVolume");
    temp = storedBackgroundSoundVolume ? storedBackgroundSoundVolume : 0;
    setVolumeSliderValue("backgroundSlider", temp);
    changeSoundVolume(backgroundSound, temp);
    setLocalStorageItem("backgroundVolume", temp);

    const storedalarmSoundVolume = getLocalStorageItem("alarmSoundVolume");
    temp = storedalarmSoundVolume
      ? storedalarmSoundVolume
      : ALARM_SOUND_DEFAULT_VOLUME;
    setVolumeSliderValue("alarmSlider", temp);
    changeSoundVolume(alarmSound, temp);
    setLocalStorageItem("alarmSoundVolume", temp);

    focusTime = getLocalStorageItem("focusTime");
    breakTime = getLocalStorageItem("breakTime");
    timeLeft = focusTime * 60;

    // Init progress figure

    updateDisplay();
  }

  initApp();
});
