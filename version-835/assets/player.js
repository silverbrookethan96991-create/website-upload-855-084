function initVideoPlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var loaded = false;

  if (!video || !overlay || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        backBufferLength: 30
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlay() {
    loadSource();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startPlay);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlay();
    }
  });
}
