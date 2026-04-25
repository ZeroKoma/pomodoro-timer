// js/core/timer.js
import { state, updateState } from "../state/store.js";
import { renderTime, renderEndTime, renderCycle } from "../ui/render.js";
import { audioManager } from "../utils/audio.js";
import { playVideo, pauseVideo, stopVideo as stopYTVideo } from "./video.js";
import { elements } from "../ui/dom.js";

let intervalId = null;
let endTime = null;

function clearExistingAlerts() {
  const alerts = document.querySelectorAll(".alert-timer");
  alerts.forEach((alert) => alert.remove());
}

export function start() {
  clearExistingAlerts();
  if (state.status === "running") return;

  updateState({ status: "running" });
  const SPEED_FACTOR = 1; // 1 for default
  endTime = Date.now() + (state.timeRemaining * 1000) / SPEED_FACTOR;
  audioManager.playBackground();

  // Show cycle info as soon as Start is pressed
  renderCycle(state.mode, state.cycles, true);

  if (state.videoEnabled) {
    playVideo();
  }

  intervalId = setInterval(() => {
    const now = Date.now();
    const remaining = Math.round((endTime - now) / 1000);

    if (remaining <= 0) {
      completePhase();
    } else {
      updateState({ timeRemaining: remaining });
      renderTime(remaining);
      renderEndTime(remaining);
      audioManager.playTick();
    }
  }, 1000 / SPEED_FACTOR);
}

export function pause() {
  if (state.status !== "running") return;
  clearExistingAlerts();
  clearInterval(intervalId);
  intervalId = null;
  endTime = null;
  updateState({ status: "paused" });
  audioManager.stopTick();
  audioManager.stopBackground();
  pauseVideo();
}

export function stop() {
  clearExistingAlerts();
  clearInterval(intervalId);
  intervalId = null;
  endTime = null;
  updateState({
    status: "idle",
    mode: "pomodoro",
    timeRemaining: state.config.pomodoro * 60, // Reset to original configuration time based on current mode
    cycles: 0,
  });
  // Hide cycle info on Stop
  renderCycle(state.mode, 0, false);
  audioManager.stopTick();
  audioManager.stopBackground();
  stopYTVideo();
}

export function updateEndTime(newSeconds) {
  if (intervalId) {
    // if running
    endTime = Date.now() + newSeconds * 1000;
  }
}

function showBootstrapAlert(message, type = "info") {
  const alertId = `bootstrap-alert-${Date.now()}`;
  const alert = document.createElement("div");
  alert.id = alertId;
  alert.className = `alert alert-dismissible fade show alert-timer position-fixed top-0 start-50 translate-middle-x mt-3 shadow`;
  alert.setAttribute("role", "alert");
  alert.style.zIndex = "1080";
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  document.body.appendChild(alert);

  // Al cerrar la notificación de Bootstrap, quitamos el difuminado
  alert.addEventListener("closed.bs.alert", () => {
    elements.videoContainer?.classList.remove("paused-effect");
  });
}

function getModeDisplayName(mode) {
  switch (mode) {
    case "pomodoro":
      return "Pomodoro";
    case "shortBreak":
      return "Break";
    case "longBreak":
      return "Long Break";
    default:
      return mode;
  }
}

/**
 * Core state machine logic
 */
function completePhase() {
  const isPomodoro = state.mode === "pomodoro";
  const completedMode = state.mode; // Store the mode that just finished

  // Stop current interval without resetting cycles
  clearInterval(intervalId);
  intervalId = null;
  endTime = null;
  audioManager.stopTick();
  audioManager.stopBackground();

  // Activamos el difuminado al terminar el ciclo
  elements.videoContainer?.classList.add("paused-effect");

  // Pausamos el video de fondo al finalizar la fase
  pauseVideo();

  let nextMode;
  let newCycles = state.cycles;

  if (isPomodoro) {
    newCycles++;
    // If completed cycles are divisible by 4, it's long break time
    nextMode = newCycles % 4 === 0 ? "longBreak" : "shortBreak";
  } else {
    // If we were in any break mode, return to pomodoro
    nextMode = "pomodoro";
  }

  // Update global state
  // By passing 'config' and 'cycles', the store.js we made earlier will save them to LocalStorage automatically
  updateState({
    mode: nextMode,
    cycles: newCycles,
    timeRemaining: state.config[nextMode] * 60,
    status: "idle",
  });

  // Visual and sound notification
  audioManager.playAlarm();
  const nextDisplay =
    nextMode === "pomodoro"
      ? `Pomodoro ${state.cycles + 1}`
      : getModeDisplayName(nextMode);
  showBootstrapAlert(
    `Finished <span class="alert-value-finished">${getModeDisplayName(completedMode)}</span>. Next: <span class="alert-value-next">${nextDisplay}</span>`,
    "success",
  );

  // Update UI for the new phase
  renderTime(state.timeRemaining);
  renderEndTime(state.timeRemaining);
  renderCycle(state.mode, state.cycles, true);
}
