// js/state/store.js
import { getLocalStorageItem, setLocalStorageItem } from "../utils/storage.js";

// 1. Define key name constants to avoid typos
const KEYS = {
  FOCUS: "focusTime",
  SHORT: "breakTime",
  LONG: "longBreakTime",
  CYCLES: "completedCycles",
};

// 2. Default values for first-time users
export const DEFAULTS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  videoUrl: "https://www.youtube.com/watch?v=NIju0uaZue8",
};

// 3. Rehydration: Try to load saved values or use defaults
const initialConfig = {
  pomodoro: Math.max(1, getLocalStorageItem(KEYS.FOCUS) || DEFAULTS.pomodoro),
  shortBreak: Math.max(
    1,
    getLocalStorageItem(KEYS.SHORT) || DEFAULTS.shortBreak,
  ),
  longBreak: Math.max(1, getLocalStorageItem(KEYS.LONG) || DEFAULTS.longBreak),
};

export const state = {
  timeRemaining: initialConfig.pomodoro * 60,
  status: "idle",
  mode: "pomodoro",
  config: initialConfig,
  cycles: getLocalStorageItem(KEYS.CYCLES) || 0,
  videoEnabled: getLocalStorageItem("videoBackgroundEnabled") ?? true,
  videoUrl: "", // Initialized below
  audio: {
    tickVolume: getLocalStorageItem("tickTockSoundVolume") ?? 5,
    backgroundVolume: getLocalStorageItem("backgroundVolume") ?? 50,
    alarmVolume: getLocalStorageItem("alarmSoundVolume") ?? 80,
    backgroundSound: getLocalStorageItem("backgroundSoundFile") || "none",
    videoVolume: getLocalStorageItem("videoBackgroundVolume") ?? 10,
  },
};

// Ensure the video URL is in localStorage and state
state.videoUrl = getLocalStorageItem("videoBackgroundURL") || DEFAULTS.videoUrl;
if (!getLocalStorageItem("videoBackgroundURL")) {
  setLocalStorageItem("videoBackgroundURL", DEFAULTS.videoUrl);
}

/**
 * Updates the state and persists changes if necessary
 */
export function updateState(newState) {
  // Merge the new state with the current one
  Object.assign(state, newState);

  // If config is updated, save it automatically
  if (newState.config) {
    persistConfig(state.config);
  }

  // Persist volumes if they change
  if (newState.audio) {
    persistAudio(state.audio);
  }

  // Persist video URL if it changes
  if (newState.videoUrl) {
    setLocalStorageItem("videoBackgroundURL", state.videoUrl);
  }

  // If cycles are updated, save them
  if (newState.cycles !== undefined) {
    setLocalStorageItem(KEYS.CYCLES, state.cycles);
  }

  // Persist video visibility state
  if (newState.videoEnabled !== undefined) {
    setLocalStorageItem("videoBackgroundEnabled", state.videoEnabled);
  }

  // Notify the rest of the app that something changed
  document.dispatchEvent(new CustomEvent("stateChange", { detail: state }));
}

// Private function to keep the export clean
function persistConfig(config) {
  setLocalStorageItem(KEYS.FOCUS, config.pomodoro);
  setLocalStorageItem(KEYS.SHORT, config.shortBreak);
  setLocalStorageItem(KEYS.LONG, config.longBreak);
  console.log("💾 Configuration saved to LocalStorage");
}

function persistAudio(audio) {
  setLocalStorageItem("tickTockSoundVolume", audio.tickVolume);
  setLocalStorageItem("backgroundVolume", audio.backgroundVolume);
  setLocalStorageItem("alarmSoundVolume", audio.alarmVolume);
  setLocalStorageItem("backgroundSoundFile", audio.backgroundSound);
  setLocalStorageItem("videoBackgroundVolume", audio.videoVolume);
}
