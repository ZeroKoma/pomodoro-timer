let videoId;

function getYouTubeID(url) {
  try {
    let urlObj = new URL(url);
    let match =
      urlObj.href.match(/[?&]v=([^&]+)/) ||
      urlObj.href.match(/youtu\.be\/([^?]+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

let player;

function playVideo() {
  const storedVideoBackgroundSoundVolume = getLocalStorageItem(
    "videoBackgroundVolume"
  );
  temp = storedVideoBackgroundSoundVolume
    ? storedVideoBackgroundSoundVolume
    : 0;
  setVolumeSliderValue("videoBackgroundSlider", temp);
  changeVideoSoundVolume(temp);
  setLocalStorageItem("videoBackgroundVolume", temp);
  if (player) player.playVideo();
}

function stopVideo() {
  if (player) player.stopVideo();
}

function pauseVideo() {
  if (player) player.pauseVideo();
}

function changeVideoSoundVolume(newVolume) {
  if (player) {
    player.setVolume(newVolume);
  }
}

document
  .getElementById("changeVideoIdInput")
  .addEventListener("click", changeVideo);

function setInitialVideo(url) {
  videoId = getYouTubeID(url);
  loadVideo();
}

function changeVideo() {
  const url = document.getElementById("videoIdInput").value;
  if (url && url.length !== 0) {
    videoId = getYouTubeID(url);
    if (videoId) {
      player.destroy();
      loadVideo();
      setLocalStorageItem("videoBackgroundURL", url);
    }
    document.getElementById("videoIdInput").value = "";
  }
}

function loadVideo() {
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  playerVars = {
    showinfo: 0,
    controls: 0,
    loop: 1,
    rel: 0,
    iv_load_policy: 3,
    cc_load_policy: 1,
  };

  options = {
    height: "360",
    width: "640",
    videoId: videoId,
    playerVars: playerVars,
    events: {
      onReady: onPlayerReady,
    },
  };
  window.YT.ready(function () {
    if (videoId) player = new YT.Player("yt-background", options);
  });

  function onPlayerReady() {
    console.log("Player Ready!");
  }
}
