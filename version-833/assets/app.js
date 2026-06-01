(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initFilters() {
        var input = document.querySelector(".js-filter-input");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-year]"));
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var selectedYear = "all";
        if (query) {
            input.value = query;
        }
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-meta") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
                var year = card.getAttribute("data-year") || "";
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = selectedYear === "all" || year === selectedYear;
                card.classList.toggle("is-hidden", !(matchKeyword && matchYear));
            });
        }
        input.addEventListener("input", apply);
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                selectedYear = button.getAttribute("data-year") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".play-cover");
            if (!video || !cover) {
                return;
            }
            var source = video.getAttribute("data-video");
            var started = false;
            function bindVideo() {
                if (!source || started) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
            function play() {
                bindVideo();
                cover.classList.add("hidden");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        cover.classList.remove("hidden");
                    });
                }
            }
            cover.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (!started) {
                    play();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
