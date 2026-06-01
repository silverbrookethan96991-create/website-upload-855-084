(function () {
  function setupMoviePlayer(videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hls = null;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function setMessage(value) {
      var status = overlay.querySelector(".player-status");
      if (status) {
        status.textContent = value;
      }
    }

    function startVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          overlay.classList.remove("hidden");
        });
      }
    }

    function loadStream() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(streamUrl);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          startVideo();
        });
      } else {
        video.src = streamUrl;
      }
    }

    function playFromClick(event) {
      if (event) {
        event.preventDefault();
      }
      overlay.classList.add("hidden");
      loadStream();
      startVideo();
    }

    overlay.addEventListener("click", playFromClick);
    video.addEventListener("click", function () {
      if (video.paused) {
        playFromClick();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("hidden");
      }
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("hidden");
    });
    video.addEventListener("error", function () {
      setMessage("播放出错，请稍后再试");
      overlay.classList.remove("hidden");
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
