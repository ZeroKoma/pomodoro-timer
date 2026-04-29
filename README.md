# Pomodoro Timer

An application built with Vanilla JavaScript. This tool implements the Pomodoro technique, helping users maintain focus by breaking work into intervals, traditionally 25 minutes in length, separated by short breaks.

## Features

- Customizable Intervals: Adjust the duration for Pomodoro sessions, Short Breaks, and Long Breaks to fit your personal workflow.
- Automated Cycle Tracking: The system automatically tracks completed sessions and suggests a Long Break after every four Pomodoro cycles.
- Background Video Integration: Enhance your focus environment with YouTube background videos, featuring automatic playback and pause functionality synced with the timer.
- Ambient Audio Management: Independent volume controls for a ticking clock sound, ambient background music, and session completion alarms.
- Native Notifications: Integrated system notifications to alert you when a phase is finished, even if the browser tab is not in focus.
- Smart Interface: Includes a focus-oriented UI that hides configuration panels during active sessions and auto-closes settings after periods of inactivity.
- End Time Estimation: Real-time calculation showing exactly what time your current session will conclude.
- Persistent State: Your settings, audio preferences, and current cycle progress are saved locally to ensure continuity across browser sessions.

## Getting Started

1. Clone the repository to your local machine.
2. Open the index.html file in a modern web browser.
3. Grant the requested notification permissions to enable system-level alerts.

## How to Use

- Start: Initiates the timer, starts background audio/video, and hides settings panels to minimize distractions.
- Pause: Temporarily stops the countdown and applies a visual blur effect to the background video to signal a break in focus.
- Stop: Resets the timer to the beginning of the Pomodoro cycle and clears session progress.
- Settings: Access the volume and time configuration panels by clicking the respective icons. Sliders allow for precise adjustment of audio levels and session lengths.

## Technical Architecture

The application is built using a modular JavaScript architecture:

- Core Logic: Manages the state machine for timer phases and interval calculations.
- Event System: Handles user interactions and automated UI responses like the auto-close timer for panels.
- State Management: Centralized store that synchronizes application data with LocalStorage.
- UI Rendering: Dedicated modules for updating the DOM, managing Bootstrap alerts, and handling video effects.
- Notification Manager: Wraps the Web Notifications API for cross-browser compatibility.

## Requirements

- A modern web browser with ES6 module support.
- Internet connection for YouTube video playback.
