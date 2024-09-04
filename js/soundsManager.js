// Functions
function playSound(audioElement) {
  audioElement.play();
}

function pauseSound(audioElement) {
  audioElement.pause();
}

function stopSound(audioElement) {
  audioElement.pause();
  audioElement.currentTime = 0;
}

function changeSound(audioElement, newSound) {
  audioElement.src = newSound;
  audioElement.load();
  audioElement.loop = true;
}

function changeSoundVolume(audioElement, newVolume) {
  audioElement.volume = newVolume / 100;
}

function playSoundFadeIn(audioElement, fadeDuration) {
  let intervalTime = 50;
  let targetVolume = audioElement.volume;
  audioElement.volume = 0;
  audioElement.play();

  let step = (targetVolume / fadeDuration) * intervalTime;

  let fadeInInterval = setInterval(() => {
    if (audioElement.volume < targetVolume) {
      audioElement.volume = Math.min(audioElement.volume + step, targetVolume);
    } else {
      clearInterval(fadeInInterval);
    }
  }, intervalTime);
}

function stopSoundFadeOut(audioElement, fadeDuration) {
  let intervalTime = 50;
  let step = (audioElement.volume / fadeDuration) * intervalTime;

  let fadeOutInterval = setInterval(() => {
    if (audioElement.volume > 0) {
      audioElement.volume = Math.max(audioElement.volume - step, 0);
    } else {
      clearInterval(fadeOutInterval);
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  }, intervalTime);
}
