// js/ui/dom.js
export const elements = {
  // Main UI
  timeDisplay: document.getElementById("time"),
  timerLabel: document.getElementById("timerLabel"),
  cycleDisplay: document.getElementById("cycleDisplay"),
  cycleValue: document.getElementById("cycleValue"),

  // Buttons (Using 'stop' which is your original ID)
  btnStart: document.getElementById("start"),
  btnPause: document.getElementById("pause"),
  btnStop: document.getElementById("stop"),

  // Sliders (Based on your original scripts.js)
  tickSlider: document.getElementById("tickTockSlider"),
  ambientIcons: document.querySelectorAll(".music-icon"),
  backgroundSlider: document.getElementById("backgroundSlider"),
  alarmSlider: document.getElementById("alarmSlider"),
  videoSlider: document.getElementById("videoBackgroundSlider"),
  videoSliderText: document.getElementById("videoBackgroundSliderText"),

  // Time configuration inputs (Updated to match HTML)
  timePanel: document.getElementById("sliders-time-panel"),
  pomoInput: document.getElementById("focusSlider"),
  shortInput: document.getElementById("breakSlider"),
  longInput: document.getElementById("longInput"), // Assuming it will be added

  // Video Toggle
  videoToggle: document.getElementById("video-toggle-switch"),
  videoLabel: document.getElementById("video-toggle-label"),
  videoContainer: document.querySelector(".video-background"),

  // Collapsible panels
  toggleVolumeBtn: document.getElementById("toggle-volume-panel-button"),
  volumePanel: document.getElementById("sliders-volume-panel"),
  toggleYoutubeBtn: document.getElementById("change-video-url-panel-button"),
  youtubePanel: document.getElementById("change-youtube-url-form"),
};
