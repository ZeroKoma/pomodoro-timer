// Stored time in minutes
// Stored volume values between 0 and 100 (%)
// STORED ITEMS
// tickTockSoundVolume
// alarmSoundVolume
// backgroundSoundFile
// backgroundVolume
// focusTime
// breakTime

function setLocalStorageItem(key, value) {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error("LocalStorage set error", error);
  }
}

function getLocalStorageItem(key) {
  try {
    const serializedValue = localStorage.getItem(key);
    return serializedValue !== null ? JSON.parse(serializedValue) : null;
  } catch (error) {
    console.error("LocalStorage get error", error);
    return null;
  }
}

function removeLocalStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("LocalStorage remove error", error);
  }
}

function clearLocalStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("LocalStorage clear error", error);
  }
}
