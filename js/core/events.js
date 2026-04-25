// js/core/events.js
import { elements } from "../ui/dom.js";
import { start, pause, stop, updateEndTime } from "./timer.js";
import { updateState, state } from "../state/store.js";
import { renderTime, renderEndTime } from "../ui/render.js";
import { audioManager } from "../utils/audio.js";
import { changeVideoSoundVolume, changeVideo, showVideosList, playVideo, pauseVideo } from "./video.js";

let endTimeIntervalId = null;
let autoCloseTimer = null;

/**
 * Closes the sound and video panels if they are open.
 */
const closeOpenPanels = () => {
  elements.volumePanel?.classList.add("hidden");
  elements.youtubePanel?.classList.add("hidden");
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
};

/**
 * Resets the 10-second timer to close panels due to inactivity.
 */
const resetAutoCloseTimer = () => {
  if (autoCloseTimer) clearTimeout(autoCloseTimer);
  autoCloseTimer = null;
  
  const isVolumeOpen = !elements.volumePanel?.classList.contains("hidden");
  const isYoutubeOpen = !elements.youtubePanel?.classList.contains("hidden");

  if (isVolumeOpen || isYoutubeOpen) {
    autoCloseTimer = setTimeout(closeOpenPanels, 10000);
  }
};

function startAutoUpdateEndTime() {
  if (endTimeIntervalId) return; // Already active
  
  endTimeIntervalId = setInterval(() => {
    if (state.status !== "running") {
      renderEndTime(state.timeRemaining);
    } else {
      // If running, stop this interval
      clearInterval(endTimeIntervalId);
      endTimeIntervalId = null;
    }
  }, 60000); // Every minute
}

function stopAutoUpdateEndTime() {
  if (endTimeIntervalId) {
    clearInterval(endTimeIntervalId);
    endTimeIntervalId = null;
  }
}

function setPauseFade(active) {
  if (!elements.btnPause) return;
  elements.btnPause.classList.toggle("blinking", active);
}

function setActiveButton(button) {
  [elements.btnStart, elements.btnPause, elements.btnStop].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle("active", btn === button);
  });
}

export function initEvents() {
  // --- MAIN BUTTONS ---
  if (elements.btnStart) {
    elements.btnStart.addEventListener("click", () => {
      start();
      renderEndTime(state.timeRemaining);
      stopAutoUpdateEndTime(); // Stop automatic updates when playing
      setPauseFade(false);
      setActiveButton(elements.btnStart);
      elements.timeDisplay.classList.add("time-active");

      // Hide all panels to focus
      elements.timePanel?.classList.add("hidden");
      elements.volumePanel?.classList.add("hidden");
      elements.youtubePanel?.classList.add("hidden");
      elements.videoContainer?.classList.remove("paused-effect");
    });
  }

  if (elements.btnPause) {
    elements.btnPause.addEventListener("click", () => {
      if (state.status !== "running") return;
      pause();
      renderEndTime(state.timeRemaining);
      startAutoUpdateEndTime(); // Reactivate automatic updates on pause
      setPauseFade(true);
      setActiveButton(elements.btnPause);
      elements.timeDisplay.classList.remove("time-active");

      // Show time panel for adjustments
      elements.timePanel?.classList.remove("hidden");
      elements.videoContainer?.classList.add("paused-effect");
    });
  }

  if (elements.btnStop) {
    elements.btnStop.addEventListener("click", () => {
      stop();
      const resetTime = state.config[state.mode] * 60;
      updateState({ timeRemaining: resetTime, status: "idle" });
      renderTime(resetTime);
      renderEndTime(resetTime);
      startAutoUpdateEndTime(); // Reactivate automatic updates on idle
      setPauseFade(false);
      setActiveButton(elements.btnStop);
      elements.timeDisplay.classList.remove("time-active");

      // Show time panel for adjustments
      elements.timePanel?.classList.remove("hidden");
      elements.videoContainer?.classList.remove("paused-effect");
    });
  }

  // --- AUDIO SLIDERS ---
  if (elements.tickSlider) {
    elements.tickSlider.addEventListener("input", (e) => {
      const vol = parseInt(e.target.value);
      e.target.classList.toggle("slider-zero", vol === 0);
      document.getElementById("tickTockSliderText").textContent = vol;
      updateState({ audio: { ...state.audio, tickVolume: vol } });
      audioManager.updateVolumes();
      resetAutoCloseTimer();
    });
  }

  // --- AMBIENT SOUND ICONS ---
  elements.ambientIcons?.forEach((icon) => {
    icon.addEventListener("click", () => {
      // UI: Update active class visually
      elements.ambientIcons.forEach((i) => i.classList.remove("active"));
      icon.classList.add("active");

      const soundSrc = icon.getAttribute("data-sound");
      updateState({ audio: { ...state.audio, backgroundSound: soundSrc } });
      
      // Notify manager (assuming changeBackground is implemented in audio.js)
      audioManager.changeBackground?.(soundSrc);
      resetAutoCloseTimer();
    });
  });

  if (elements.backgroundSlider) {
    elements.backgroundSlider.addEventListener("input", (e) => {
      const vol = parseInt(e.target.value);
      e.target.classList.toggle("slider-zero", vol === 0);
      document.getElementById("backgroundSliderText").textContent = vol;
      updateState({ audio: { ...state.audio, backgroundVolume: vol } });
      audioManager.updateVolumes();
      resetAutoCloseTimer();
    });
  }

  if (elements.videoSlider) {
    elements.videoSlider.addEventListener("input", (e) => {
      const vol = parseInt(e.target.value);
      e.target.classList.toggle("slider-zero", vol === 0);
      if (elements.videoSliderText) elements.videoSliderText.textContent = vol;
      updateState({ audio: { ...state.audio, videoVolume: vol } });
      changeVideoSoundVolume(vol);
      resetAutoCloseTimer();
    });
  }

  if (elements.alarmSlider) {
    elements.alarmSlider.addEventListener("input", (e) => {
      const vol = parseInt(e.target.value);
      e.target.classList.toggle("slider-zero", vol === 0);
      document.getElementById("alarmSliderText").textContent = vol;
      updateState({ audio: { ...state.audio, alarmVolume: vol } });
      audioManager.updateVolumes();
      resetAutoCloseTimer();
    });
  }

  if (elements.videoToggle) {
    elements.videoToggle.addEventListener("change", (e) => {
      const enabled = e.target.checked;
      updateState({ videoEnabled: enabled });
      if (elements.videoContainer) {
        elements.videoContainer.style.display = enabled ? "block" : "none";
      }
      document.body.classList.toggle("bg-black", !enabled);
      
      // If video is disabled, pause playback
      if (!enabled) pauseVideo();
      // If enabled and timer is running, resume it
      else if (state.status === "running") playVideo();
      resetAutoCloseTimer();
    });
  }

  if (elements.youtubePanel) {
    document.getElementById("changeVideoIdInput")?.addEventListener("click", () => {
      changeVideo();
      resetAutoCloseTimer();
    });
  }

  // --- CONFIGURATION INPUTS ---
  if (elements.pomoInput) {
    elements.pomoInput.addEventListener("input", (e) => {
      const newMins = Math.max(1, parseInt(e.target.value));
      e.target.classList.toggle("slider-zero", newMins === 0);
      document.getElementById("focusSliderText").textContent = newMins;
      updateState({ config: { ...state.config, pomodoro: newMins } });

      // Always update End Time as preview
      renderEndTime(newMins * 60);

      if (state.mode === "pomodoro") {
        updateState({ timeRemaining: newMins * 60 });
        renderTime(state.timeRemaining);
        updateEndTime(state.timeRemaining);
        
        // Reactivate auto-updates if not playing
        if (state.status !== "running") {
          startAutoUpdateEndTime();
        }
      }
    });
  }

  if (elements.shortInput) {
    elements.shortInput.addEventListener("input", (e) => {
      const newMins = Math.max(1, parseInt(e.target.value));
      e.target.classList.toggle("slider-zero", newMins === 0);
      document.getElementById("breakSliderText").textContent = newMins;
      updateState({ config: { ...state.config, shortBreak: newMins } });

      if (state.mode === "shortBreak" && (state.status === "idle" || state.status === "paused")) {
        updateState({ timeRemaining: newMins * 60 });
        renderTime(state.timeRemaining);
      }
    });
  }

  // --- PANEL MANAGEMENT ---
  if (elements.toggleVolumeBtn) {
    elements.toggleVolumeBtn.addEventListener("click", () => {
      elements.volumePanel.classList.toggle("hidden");
      // Close youtube panel if volume panel is opened
      if (elements.youtubePanel) elements.youtubePanel.classList.add("hidden");
      resetAutoCloseTimer();
    });
  }

  // Shared function to open/close YouTube panel
  const toggleYoutubePanel = () => {
    const isOpening = elements.youtubePanel.classList.contains("hidden");
    elements.youtubePanel.classList.toggle("hidden");
    
    if (isOpening) {
      showVideosList();
    }

    if (elements.volumePanel) elements.volumePanel.classList.add("hidden");
    resetAutoCloseTimer();
  };

  if (elements.toggleYoutubeBtn) {
    elements.toggleYoutubeBtn.addEventListener("click", toggleYoutubePanel);
  }

  if (elements.videoLabel) {
    elements.videoLabel.addEventListener("click", toggleYoutubePanel);
  }

  // --- GLOBAL ACTIVITY LISTENERS TO RESET TIMER ---
  // Detects if the user stops moving the mouse or interacting in general
  document.addEventListener("mousemove", resetAutoCloseTimer);
  document.addEventListener("click", resetAutoCloseTimer);
  document.addEventListener("keypress", resetAutoCloseTimer);

  // Start auto-updates on load
  startAutoUpdateEndTime();
}
