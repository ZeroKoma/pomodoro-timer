const videoId = "mwf1vgCgMLw";

let player;

function playVideo() {
    const storedVideoBackgroundSoundVolume = getLocalStorageItem("videoBackgroundVolume");
    temp = storedVideoBackgroundSoundVolume ? storedVideoBackgroundSoundVolume : 0;
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
        player.setVolume(newVolume)
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
    autoplay:1
  };

  options = {
    height: "360",
    width: "640",
    videoId: videoId,
    playerVars: playerVars,
    events: {
        onReady: onPlayerReady,
      }
  };
  window.YT.ready(function() {
      if (videoId) player = new YT.Player("yt-background", options);
  })

  function onPlayerReady(){
    console.log('Player ready!!!!')
  }
 
}
