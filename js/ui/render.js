// js/ui/render.js
import { elements } from "./dom.js"; // Import full object

export function renderTime(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const formatted = `${mins}:${secs}`;

  // Using elements.timeDisplay
  elements.timeDisplay.textContent = formatted;
  document.title = `(${formatted}) Pomodoro`;
}

export function renderEndTime(seconds) {
  const endTimeElement = document.getElementById("endTimeValue");
  if (!endTimeElement) {
    return;
  }

  if (seconds > 0) {
    const currentTime = new Date();
    const endTime = new Date(currentTime.getTime() + seconds * 1000);
    const hours = endTime.getHours().toString().padStart(2, "0");
    const minutes = endTime.getMinutes().toString().padStart(2, "0");
    endTimeElement.textContent = `${hours}:${minutes}`;
  } else {
    endTimeElement.textContent = "-- : --";
  }
}

/**
 * Renders the current cycle count and handles visibility.
 */
export function renderCycle(mode, cycleCount, visible = true) {
  if (!elements.cycleDisplay || !elements.cycleValue) return;

  if (visible) {
    elements.cycleDisplay.classList.remove("d-none");
    
    let displayText = "";
    if (mode === "pomodoro") {
      displayText = `Pomodoro ${cycleCount + 1}`;
    } else if (mode === "shortBreak") {
      displayText = "Break";
    } else if (mode === "longBreak") {
      displayText = "Long Break";
    } else {
      displayText = mode;
    }
    
    elements.cycleValue.textContent = displayText;
  } else {
    elements.cycleDisplay.classList.add("d-none");
  }
}
