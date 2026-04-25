import { getLocalStorageItem, setLocalStorageItem } from "../utils/storage.js";
import { state, DEFAULTS } from "../state/store.js";

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

export function playVideo() {
  // Only play if player exists AND video is enabled
  if (player && state.videoEnabled) {
    player.setVolume(state.audio.videoVolume);
    player.playVideo();
  }
}

export function stopVideo() {
  if (player) player.stopVideo();
}

export function pauseVideo() {
  if (player) player.pauseVideo();
}

export function changeVideoSoundVolume(newVolume) {
  if (player) {
    player.setVolume(newVolume);
  }
}

export function setInitialVideo(url) {
  videoId = getYouTubeID(url);
  loadVideo();
}

function isUrlInLocalStorage(url) {
  const savedList = getLocalStorageItem("videosList") || [];
  let result = false;
  savedList.forEach((element) => {
    if (element.url === url) result = true;
  });
  return result;
}

function saveVideosListLocal() {
  let savedList = getLocalStorageItem("videosList") || [];
  const url = new URL(player.getVideoUrl());
  const videoId = url.searchParams.get("v");
  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  if (!isUrlInLocalStorage(cleanUrl))
    savedList.push({
      name: player.getVideoData().title,
      url: cleanUrl,
    });
  setLocalStorageItem("videosList", savedList);
}

export function changeVideo(url = null) {
  let urlToAdd;
  if (!url || typeof url !== "string")
    urlToAdd = document.getElementById("videoIdInput").value;
  else urlToAdd = url;
  if (urlToAdd && urlToAdd.length !== 0) {
    videoId = getYouTubeID(urlToAdd);
    if (videoId) {
      if (player) player.destroy();
      loadVideo();
      if (!isUrlInLocalStorage(urlToAdd))
        setLocalStorageItem("videoBackgroundURL", urlToAdd);
    }
    document.getElementById("videoIdInput").value = "";
  }
}

export function changeVideoFromList(event) {
  const index = event.target.dataset.id;
  const savedList = getLocalStorageItem("videosList");
  if (index >= 0 && index < savedList.length) {
    changeVideo(savedList[index].url);
  }
}

export function showVideosList() {
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

    videoItem.appendChild(videoName);

    // Only add delete button if it is NOT the default video
    if (video.url !== DEFAULTS.videoUrl) {
      const deleteButton = document.createElement("span");
      deleteButton.innerText = "x";
      deleteButton.classList.add("delete-button");
      deleteButton.style.cursor = "pointer";
      deleteButton.style.marginLeft = "10px";
      deleteButton.setAttribute("title", "Delete Video from List");

      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent click from propagating to the video item
        deleteVideo(index);
      });
      videoItem.appendChild(deleteButton);
    }

    div.appendChild(videoItem);
  });
  document.querySelectorAll(".video-item").forEach((item) => {
    const firstChild = item.firstElementChild;
    if (firstChild) {
      firstChild.addEventListener("click", changeVideoFromList);
    }
  });
}

export function deleteVideo(index) {
  const list = getLocalStorageItem("videosList") || [];
  list.splice(index, 1);
  setLocalStorageItem("videosList", list);
  showVideosList();
}

function loadVideo() {
  const playerVars = {
    showinfo: 0,
    rel: 0,
    controls: 0,
    loop: 1,
    playlist: videoId,
    origin: window.location.origin // Helps with secure communication on localhost
  };

  const options = {
    height: "360",
    width: "640",
    videoId: videoId,
    playerVars: playerVars,
    events: {
      onReady: onPlayerReady,
    },
  };

  const checkYT = () => {
    if (window.YT && window.YT.Player) {
      if (videoId) player = new YT.Player("yt-background", options);
    } else {
      setTimeout(checkYT, 100);
    }
  };
  checkYT();

  function onPlayerReady() {
    saveVideosListLocal();
    showVideosList();
    if (state.status === "running") {
      playVideo();
    }
  }
}
