(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    bindNavigation();
    bindHeroSlider();
    bindFilters();
    bindPlayers();
    bindScrollPlay();
  });

  function bindNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindHeroSlider() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-target")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".filter-list"));
    if (!lists.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var input = document.querySelector(".filter-input");
    var year = document.querySelector(".filter-year");
    var region = document.querySelector(".filter-region");
    var empty = document.querySelector(".empty-state");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var visible = 0;

      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .list-card"));
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (yearValue && cardYear.indexOf(yearValue) === -1) {
            matched = false;
          }
          if (regionValue && cardRegion.indexOf(regionValue) === -1) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, region].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });

    apply();
  }

  function bindPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (player) {
      var overlay = player.querySelector(".player-overlay");
      var video = player.querySelector("video");
      if (!video) {
        return;
      }
      var start = function () {
        startPlayer(player);
      };
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  function startPlayer(player) {
    var video = player.querySelector("video");
    var src = player.getAttribute("data-stream");
    if (!video || !src) {
      return;
    }

    player.classList.add("is-playing");

    if (player.getAttribute("data-ready") !== "1") {
      player.setAttribute("data-ready", "1");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.load();
        video.play().catch(function () {
          player.classList.remove("is-playing");
        });
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            player.classList.remove("is-playing");
          });
        });
        player.hlsInstance = hls;
      } else {
        video.src = src;
        video.load();
        video.play().catch(function () {
          player.classList.remove("is-playing");
        });
      }
    } else {
      video.play().catch(function () {
        player.classList.remove("is-playing");
      });
    }
  }

  function bindScrollPlay() {
    var button = document.querySelector(".scroll-play");
    var player = document.querySelector(".movie-player");
    if (!button || !player) {
      return;
    }
    button.addEventListener("click", function () {
      window.setTimeout(function () {
        startPlayer(player);
      }, 280);
    });
  }
})();
