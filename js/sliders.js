//

function getTimeSliderValue(sliderId) {
  const sliderValue = document.getElementById(sliderId).value;
  return parseInt(sliderValue);
}

function setTimeSliderValue(sliderId, value) {
  document.getElementById(sliderId).value = value;
  showTimeSliderValue(sliderId + "Text", value);
}

function showTimeSliderValue(sliderId, value) {
  document.getElementById(sliderId).textContent = value;
}

function getVolumeSliderValue(sliderId) {
  const sliderValue = document.getElementById(sliderId).value;
  return parseInt(sliderValue);
}

function setVolumeSliderValue(sliderId, value) {
  document.getElementById(sliderId).value = value;
  showVolumeSliderValue(sliderId + "Text", value);
}

function showVolumeSliderValue(sliderId, value) {
  if (value === 0) document.getElementById(sliderId).textContent = "0";
  else document.getElementById(sliderId).textContent = value;
}
