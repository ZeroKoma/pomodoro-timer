import { initEvents } from "./core/events.js";
import { renderTime, renderEndTime } from "./ui/render.js";
import { state, DEFAULTS } from "./state/store.js";
import { elements } from "./ui/dom.js";
import "./utils/dragContent.js";
import { getLocalStorageItem, setLocalStorageItem } from "./utils/storage.js";
import { setInitialVideo, showVideosList } from "./core/video.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Connect buttons
  initEvents();

  // 2. Render initial state (25:00)
  renderTime(state.timeRemaining);
  renderEndTime(state.timeRemaining);

  // 3. Initialize time sliders
  elements.pomoInput.value = state.config.pomodoro;
  document.getElementById("focusSliderText").textContent =
    state.config.pomodoro;
  elements.shortInput.value = state.config.shortBreak;
  document.getElementById("breakSliderText").textContent =
    state.config.shortBreak;

  // 3.5 Initialize audio sliders
  elements.tickSlider.value = state.audio.tickVolume;
  document.getElementById("tickTockSliderText").textContent =
    state.audio.tickVolume;
  elements.backgroundSlider.value = state.audio.backgroundVolume;
  document.getElementById("backgroundSliderText").textContent =
    state.audio.backgroundVolume;

  if (elements.videoSlider) {
    elements.videoSlider.value = state.audio.videoVolume;
    if (elements.videoSliderText)
      elements.videoSliderText.textContent = state.audio.videoVolume;
  }

  // Initialize red thumb for sliders at zero
  [
    elements.tickSlider, elements.backgroundSlider, elements.videoSlider, 
    elements.alarmSlider, elements.pomoInput, elements.shortInput
  ].forEach(slider => {
    if (slider) slider.classList.toggle("slider-zero", parseInt(slider.value) === 0);
  });

  // 3.5.5 Initialize video toggle
  if (elements.videoToggle) {
    elements.videoToggle.checked = state.videoEnabled;
  }
  document.body.classList.toggle("bg-black", !state.videoEnabled);
  if (elements.videoContainer) {
    elements.videoContainer.style.display = state.videoEnabled
      ? "block"
      : "none";
  }

  // 3.6 Initialize active sound icon based on persisted state
  elements.ambientIcons?.forEach((icon) => {
    if (icon.getAttribute("data-sound") === state.audio.backgroundSound) {
      icon.classList.add("active");
    } else {
      icon.classList.remove("active");
    }
  });

  // 3.6.5 Ensure video list always contains the default video on refresh
  let storedVideoList = getLocalStorageItem("videosList") || [];
  const hasDefault = storedVideoList.some(
    (video) => video.url === DEFAULTS.videoUrl,
  );
  if (!hasDefault) {
    storedVideoList.unshift({
      name: "Lofi Hip Hop - Default",
      url: DEFAULTS.videoUrl,
    });
    setLocalStorageItem("videosList", storedVideoList);
  }

  // 3.7 Initialize Video Background
  setInitialVideo(state.videoUrl);
  showVideosList();

  // 4. Update current time and start interval
  const updateClock = () => {
    document.getElementById("currentTime").textContent =
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  updateClock(); // Immediate update
  setInterval(updateClock, 1000);
});
