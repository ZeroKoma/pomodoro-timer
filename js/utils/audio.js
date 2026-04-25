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
sounds.background.loop = true;

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
    audioElement.volume = 0;
    audioElement.play().catch(e => console.warn("Audio blocked", e));
    
    const step = targetVolume / (duration / 50);
    const interval = setInterval(() => {
      if (audioElement.volume < targetVolume) {
        audioElement.volume = Math.min(audioElement.volume + step, targetVolume);
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
