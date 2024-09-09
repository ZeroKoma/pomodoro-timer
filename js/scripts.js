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

  let focusTimeAccumulated = 0;
  let breakTimeAccumulated = 0;
  let totalTimeAccumulated = 0;

  const volumeUpIcon = `<svg style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="green" class="bi bi-volume-up" viewBox="0 0 16 16">
  <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/>
  <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/>
  <path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"/>
</svg>`;

  const volumeMuteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="firebrick" class="bi bi-volume-mute" viewBox="0 0 16 16">
    <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>
  </svg>`;

  /* FUNCTIONS */

  function switchToBreakMode() {
    isBreak = true;
    timeLeft = getLocalStorageItem("breakTime") * 60;
    changeTimerLabel("Break Time");
    updateDisplay();
    updateProgressBar();
    TimeInactive();
    playSoundFadeIn(alarmSound, SOUND_FADE_DURATION);
    stopSoundFadeOut(backgroundSound, SOUND_FADE_DURATION);
    changeSelectedButton("stop");
    showAlert("It's time to break!");
    setTimeout(() => {
      displayAccumulatedTimes();
    }, 200);
  }

  function switchToPomodoroMode() {
    isBreak = false;
    timeLeft = getLocalStorageItem("focusTime") * 60;
    changeTimerLabel("Focus Time");
    if (cicleOn) {
      TimeInactive();
      playSoundFadeIn(alarmSound, SOUND_FADE_DURATION);
      stopSoundFadeOut(backgroundSound, SOUND_FADE_DURATION);
      changeSelectedButton("stop");
      showAlert("It's time to focus!");
      setTimeout(() => {
        displayAccumulatedTimes();
      }, 200);
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
            updateBreakTimeAccumulated(breakTime);
            showTimeBreakPanel();
            switchToPomodoroMode();
          } else {
            updateFocusTimeAccumulated(focusTime);
            switchToBreakMode();
            showTimeBreakPanel();
          }
        }
      }, 1000);
    }
  }

  function startTimerButton() {
    TimeActive();
    cicleOn = true;
    timerOn();
    hideTimeBreakPanel();
    pauseButtonRemoveBlinking();
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
      pauseButtonAddBlinking();
      TimeInactive();
      changeSelectedButton("pause");
      showTimeBreakPanel();
      clearInterval(timer);
      isRunning = false;
      stopSoundFadeOut(backgroundSound, SOUND_FADE_DURATION);
    }
  }

  function stopTimerButton() {
    pauseButtonRemoveBlinking();
    TimeInactive();
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
    updateTotalTimeAccumulated();
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

  function saveAccumulatedTimes() {
    setLocalStorageItem("focusTimeAccumulated", focusTimeAccumulated);
    setLocalStorageItem("breakTimeAccumulated", breakTimeAccumulated);
    setLocalStorageItem("totalTimeAccumulated", totalTimeAccumulated);
  }

  function updateTotalTimeAccumulated() {
    totalTimeAccumulated = focusTimeAccumulated + breakTimeAccumulated;
  }

  function updateFocusTimeAccumulated(sessionTime) {
    focusTimeAccumulated += sessionTime;
    saveAccumulatedTimes(
      focusTimeAccumulated,
      breakTimeAccumulated,
      updateTotalTimeAccumulated()
    );
  }

  function updateBreakTimeAccumulated(sessionTime) {
    breakTimeAccumulated += sessionTime;
    saveAccumulatedTimes(
      focusTimeAccumulated,
      breakTimeAccumulated,
      updateTotalTimeAccumulated()
    );
  }

  function resetAccumulatedTimesIfNewDay() {
    const today = new Date().toLocaleDateString();
    const storedDate = getLocalStorageItem("lastDate");

    if (storedDate !== today) {
      focusTimeAccumulated = 0;
      breakTimeAccumulated = 0;
      totalTimeAccumulated = 0;

      setLocalStorageItem("lastDate", today);
      saveAccumulatedTimes(
        focusTimeAccumulated,
        breakTimeAccumulated,
        totalTimeAccumulated
      );
    } else {
      focusTimeAccumulated = getLocalStorageItem("focusTimeAccumulated") || 0;
      breakTimeAccumulated = getLocalStorageItem("breakTimeAccumulated") || 0;
      totalTimeAccumulated = getLocalStorageItem("totalTimeAccumulated") || 0;
    }
  }

  function formatTime(timeInSeconds) {
    timeInSeconds = timeInSeconds * 60;
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours}h and ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  }

  function displayAccumulatedTimes() {
    document.getElementById("time-results").style.opacity = 1;
    document.getElementById("focus-time-accumulated").innerText =
      formatTime(focusTimeAccumulated);
    document.getElementById("break-time-accumulated").innerText =
      formatTime(breakTimeAccumulated);
    document.getElementById("total-time-accumulated").innerText =
      formatTime(totalTimeAccumulated);
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

  function pauseButtonAddBlinking() {
    document.getElementById("pause").classList.add("blinking");
  }

  function pauseButtonRemoveBlinking() {
    document.getElementById("pause").classList.remove("blinking");
  }

  function showAlert(message) {
    const modalHtml = `
      <div class="modal fade" id="alertModal" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog mt-5">
          <div class="modal-content p-2">
            <div class="row">
              <div class="col-12 pt-2 pe-4 text-end">
                <div id="alert-volume-icon" class="blinking" title="Stop Alarma Sound"></div>
              </div>
            </div>
            <div id="time-results" class="modal-body fw-light d-flex justify-content-center">
            <div class="mb-4">
                <h4 class="text-center mb-3">TODAY</h4>
                <div class="time-row">
                    <span class="time-label">Focus Time:</span>
                    <span  id="focus-time-accumulated"  class="time-value">10min</span>
                </div>
                <div class="time-row">
                    <span class="time-label">Break Time:</span>
                    <span id="break-time-accumulated" class="time-value">1h</span>
                </div>
                <div class="time-row border-top mt-2 pt-1">
                    <span class="time-label">Total Time:</span>
                    <span id="total-time-accumulated" class="time-value">1h and 10min</span>
                </div>
              </div>
            </div>
            <div class="modal-footer d-flex justify-content-center align-items-center">
              <div class=" flex-fill text-center ps-4">
                <span class="me-3">
                  <img width="25" height="25" class="mb-1" alt="Pomodoro icon" src="imgs/favicon.png"/>
                </span>
                ${message}
              </div>
              <button id="modalOkButton" type="button" class="btn btn-secondary ms-auto" data-bs-dismiss="modal">
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const volumeIconClickHandler = () => {
      stopSound(alarmSound, SOUND_FADE_DURATION);
      volumeIcon.innerHTML = volumeMuteIcon;
      volumeIcon.classList.remove("blinking");
    };

    const modalOkButtonClickHandler = () => {
      stopSound(alarmSound, SOUND_FADE_DURATION);
      volumeIcon.removeEventListener("click", volumeIconClickHandler);
      modalOkButton.removeEventListener("click", modalOkButtonClickHandler);
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
    };

    document.body.insertAdjacentHTML("beforeend", modalHtml);
    const modal = new bootstrap.Modal(document.getElementById("alertModal"));
    modal.show();

    const volumeIcon = document.getElementById("alert-volume-icon");
    const alarmVolume = getLocalStorageItem("alarmSoundVolume");
    if (alarmVolume > 0) {
      volumeIcon.innerHTML = volumeUpIcon;
      volumeIcon.addEventListener("click", volumeIconClickHandler);
    } else {
      volumeIcon.innerHTML = volumeMuteIcon;
      volumeIcon.classList.remove("blinking");
    }

    const modalOkButton = document.getElementById("modalOkButton");
    modalOkButton.addEventListener("click", modalOkButtonClickHandler);
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

  function TimeActive() {
    document.getElementById("time").classList.add("time-active");
  }

  function TimeInactive() {
    document.getElementById("time").classList.remove("time-active");
  }

  function initApp() {
    resetAccumulatedTimesIfNewDay();
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
    temp =
      storedalarmSoundVolume || storedalarmSoundVolume === 0
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
