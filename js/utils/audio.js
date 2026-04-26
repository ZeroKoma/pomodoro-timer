// js/utils/audio.js
import { state } from "../state/store.js";

const sounds = {
  tick: new Audio("sounds/clock-tick1.wav"),
  alarm: new Audio("sounds/alarma-2.mp3"),
  background: new Audio(),
};

// Initial configuration
sounds.tick.loop = false;
sounds.alarm.loop = false;
sounds.background.loop = false; // Disable native loop to handle the fade manually

let isFadingOut = false;

export const audioManager = {
  playTick() {
    if (state.audio.tickVolume > 0) {
      sounds.tick.volume = state.audio.tickVolume / 100;
      sounds.tick
        .play()
        .catch((e) => console.warn("Audio blocked by the browser", e));
    }
  },

  stopTick() {
    sounds.tick.pause();
    sounds.tick.currentTime = 0;
  },

  playAlarm() {
    sounds.alarm.volume = state.audio.alarmVolume / 100;
    sounds.alarm.play();
  },

  changeBackground(src) {
    if (!src || src === "none") {
      this.stopBackground();
      return;
    }

    // Only change src if different to avoid cuts
    if (!sounds.background.src.includes(src)) {
      sounds.background.src = src;
    }

    this.playWithFade(sounds.background, state.audio.backgroundVolume / 100);
  },

  playWithFade(audioElement, targetVolume, duration = 1000) {
    audioElement.currentTime = 0; // Ensure it starts from second 0
    audioElement.volume = 0;
    audioElement.play().catch((e) => console.warn("Audio blocked", e));

    const step = targetVolume / (duration / 50);
    const interval = setInterval(() => {
      if (audioElement.volume < targetVolume) {
        audioElement.volume = Math.min(
          audioElement.volume + step,
          targetVolume,
        );
      } else {
        clearInterval(interval);
      }
    }, 50);
  },

  stopBackground(duration = 800) {
    const step = sounds.background.volume / (duration / 50);
    const interval = setInterval(() => {
      if (sounds.background.volume > 0.05) {
        sounds.background.volume -= step;
      } else {
        clearInterval(interval);
        sounds.background.pause();
        sounds.background.currentTime = 0;
      }
    }, 50);
  },

  playBackground() {
    if (state.audio.backgroundSound && state.audio.backgroundSound !== "none") {
      this.changeBackground(state.audio.backgroundSound);
    }
  },

  updateVolumes() {
    sounds.tick.volume = state.audio.tickVolume / 100;
    sounds.alarm.volume = state.audio.alarmVolume / 100;
    sounds.background.volume = state.audio.backgroundVolume / 100;
  },
};

// Events to handle smooth loop (Manual cross-fade)
sounds.background.addEventListener("play", () => {
  isFadingOut = false;
});

sounds.background.addEventListener("ended", () => {
  // When it ends, we restart using the existing fade-in logic
  audioManager.playBackground();
});

sounds.background.addEventListener("timeupdate", () => {
  const fadeThreshold = 2; // Seconds before the end to start fading out
  if (
    sounds.background.duration > 0 &&
    sounds.background.currentTime >
      sounds.background.duration - fadeThreshold &&
    !isFadingOut &&
    state.status === "running"
  ) {
    isFadingOut = true;
    const step = sounds.background.volume / (fadeThreshold * 20); // 20 steps per second (50ms interval)
    const fadeOutInterval = setInterval(() => {
      if (sounds.background.volume > 0.01) {
        sounds.background.volume = Math.max(0, sounds.background.volume - step);
      } else {
        clearInterval(fadeOutInterval);
      }
    }, 50);
  }
});
