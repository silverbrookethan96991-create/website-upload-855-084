(function () {
  var video = document.getElementById('moviePlayer');
  var button = document.querySelector('[data-play-button]');
  if (!video) {
    return;
  }
  var stream = video.getAttribute('data-stream');
  var hls = null;
  var ready = false;
  var setReady = function () {
    ready = true;
  };
  var attach = function () {
    if (!stream || ready) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, setReady);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      setReady();
    } else {
      video.src = stream;
    }
  };
  var play = function () {
    attach();
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
    if (button) {
      button.classList.add('hide');
    }
  };
  if (button) {
    button.addEventListener('click', play);
  }
  video.addEventListener('click', play);
  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('hide');
    }
  });
  video.addEventListener('pause', function () {
    if (button && !video.ended) {
      button.classList.remove('hide');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
