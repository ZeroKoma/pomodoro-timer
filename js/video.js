let videoId;
let player;

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

function isUrlInLocalStorage(url) {
  console.log("- isUrlInLocalStorage: url: ", url);
  const savedList = getLocalStorageItem("videosList");
  let result = false;
  savedList.forEach((element) => {
    console.log("- isUrlInLocalStorage: forEach: element.url: ", element.url);
    if (element.url === url) result = true;
  });
  return result;
}

function saveVideosListLocal() {
  let savedList = getLocalStorageItem("videosList");
  const url = new URL(player.getVideoUrl());
  const videoId = url.searchParams.get("v");
  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  if (!isUrlInLocalStorage(cleanUrl))
    savedList.push({
      name: player.getVideoData().title,
      url: cleanUrl,
    });
  setLocalStorageItem("videosList", savedList);
  // setTimeout(() => {
  //   showVideosList();
  // }, 1000);
}

function changeVideo(url = null) {
  let urlToAdd;
  if (!url || typeof url !== "string")
    urlToAdd = document.getElementById("videoIdInput").value;
  else urlToAdd = url;
  if (urlToAdd && urlToAdd.length !== 0) {
    videoId = getYouTubeID(urlToAdd);
    if (videoId) {
      player.destroy();
      loadVideo();
      if (!isUrlInLocalStorage(urlToAdd))
        setLocalStorageItem("videoBackgroundURL", urlToAdd);
    }
    document.getElementById("videoIdInput").value = "";
  }
}

function changeVideoFromList(event) {
  const index = event.target.dataset.id;
  const savedList = getLocalStorageItem("videosList");
  if (index >= 0 && index < savedList.length) {
    changeVideo(savedList[index].url);
  }
}

function showVideosList() {
  let div = document.getElementById("videos-list");
  const list = getLocalStorageItem("videosList") || [];

  div.innerHTML = "";

  list.forEach((video, index) => {
    const videoItem = document.createElement("div");
    videoItem.classList.add("video-item");

    const videoName = document.createElement("span");
    videoName.innerText = (index + 1).toString() + "- " + video.name;
    videoName.setAttribute("title", video.name);
    videoName.setAttribute("data-id", index);

    const deleteButton = document.createElement("span");
    deleteButton.innerText = "x";
    deleteButton.classList.add("delete-button");
    deleteButton.style.cursor = "pointer";
    deleteButton.style.marginLeft = "10px";
    deleteButton.setAttribute("title", "Delete Video from List");

    deleteButton.addEventListener("click", () => {
      deleteVideo(index);
    });
    videoItem.appendChild(videoName);
    videoItem.appendChild(deleteButton);
    div.appendChild(videoItem);
  });
  document.querySelectorAll(".video-item").forEach((item) => {
    const firstChild = item.firstElementChild;
    if (firstChild) {
      firstChild.addEventListener("click", changeVideoFromList);
    }
  });
}

function deleteVideo(index) {
  const list = getLocalStorageItem("videosList") || [];
  list.splice(index, 1);
  setLocalStorageItem("videosList", list);
  showVideosList();
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
    playlist: videoId,
    rel: 0,
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
    saveVideosListLocal();
    showVideosList()
    playVideo();
  }
}
