(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatNumber(value) {
        var number = Number(value || 0);
        if (number >= 10000) {
            return (number / 10000).toFixed(1) + "万";
        }
        return String(number);
    }

    function getRootPrefix() {
        var path = window.location.pathname;
        if (path.indexOf("/movie/") !== -1) {
            return "../";
        }
        return "";
    }

    function initMobileNav() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            nav.hidden = expanded;
        });
    }

    function initHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
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
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        var hero = document.querySelector(".hero-carousel");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }

        show(0);
        start();
    }

    function initStaticFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        bars.forEach(function (bar) {
            var section = bar.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
            var textInput = bar.querySelector("[data-filter-text]");
            var yearSelect = bar.querySelector("[data-filter-year]");
            var typeSelect = bar.querySelector("[data-filter-type]");
            var reset = bar.querySelector("[data-filter-reset]");
            var count = section.querySelector("[data-filter-count]");
            var empty = section.querySelector("[data-empty-state]");

            function apply() {
                var text = textInput ? textInput.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var matchesText = !text || haystack.indexOf(text) !== -1;
                    var matchesYear = !year || card.getAttribute("data-year") === year;
                    var matchesType = !type || card.getAttribute("data-type") === type;
                    var shouldShow = matchesText && matchesYear && matchesType;
                    card.hidden = !shouldShow;
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "共 " + visible + " 部影片";
                }
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [textInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (textInput) {
                        textInput.value = "";
                    }
                    if (yearSelect) {
                        yearSelect.value = "";
                    }
                    if (typeSelect) {
                        typeSelect.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function renderSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "" +
            "<article class=\"movie-card compact\">" +
            "<a class=\"movie-card-link\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<span class=\"card-cover\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"cover-gradient\"></span>" +
            "<span class=\"duration-badge\">" + escapeHtml(movie.duration) + "</span>" +
            "<span class=\"play-badge\">▶</span>" +
            "</span>" +
            "<span class=\"card-content\">" +
            "<span class=\"card-meta\"><em>" + escapeHtml(movie.category) + "</em><small>" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + "</small></span>" +
            "<strong>" + escapeHtml(movie.title) + "</strong>" +
            "<span class=\"card-desc\">" + escapeHtml(movie.description) + "</span>" +
            "<span class=\"tag-row\">" + tags + "</span>" +
            "<span class=\"card-stats\"><small>👁 " + formatNumber(movie.views) + "</small><small>❤ " + formatNumber(movie.likes) + "</small></span>" +
            "</span>" +
            "</a>" +
            "</article>";
    }

    function initSearchPage() {
        var mount = document.getElementById("search-results");
        var input = document.getElementById("global-search-input");
        if (!mount || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var title = document.getElementById("search-result-title");
        var desc = document.getElementById("search-result-desc");
        if (input) {
            input.value = query;
        }

        if (!query) {
            return;
        }

        var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
        var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.description,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();

            return keywords.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 120);

        if (title) {
            title.textContent = "搜索结果：" + query;
        }
        if (desc) {
            desc.textContent = "找到 " + results.length + " 条匹配内容，最多展示前 120 条。";
        }

        if (!results.length) {
            mount.innerHTML = "<div class=\"empty-state\">没有找到匹配内容，请尝试更换关键词。</div>";
            return;
        }

        mount.innerHTML = results.map(renderSearchCard).join("");
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector(".player-start");
            var status = box.querySelector(".player-status");
            var hls = null;

            if (!video || !button) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message || "";
                }
            }

            function attachSource() {
                var source = video.getAttribute("data-src");
                if (!source || video.getAttribute("data-ready") === "true") {
                    return;
                }

                video.setAttribute("data-ready", "true");
                setStatus("正在初始化播放源...");

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源已就绪");
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus("网络错误，正在重试...");
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus("媒体错误，正在恢复...");
                            hls.recoverMediaError();
                        } else {
                            setStatus("无法播放当前视频源");
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    setStatus("浏览器原生 HLS 已启用");
                } else {
                    setStatus("当前浏览器不支持 HLS 播放");
                }
            }

            button.addEventListener("click", function () {
                attachSource();
                box.classList.add("is-playing");
                video.play().catch(function () {
                    box.classList.remove("is-playing");
                    setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
                });
            });

            video.addEventListener("play", function () {
                box.classList.add("is-playing");
                setStatus("");
            });

            video.addEventListener("pause", function () {
                if (!video.ended) {
                    box.classList.remove("is-playing");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileNav();
        initHeroCarousel();
        initStaticFilters();
        initSearchPage();
        initPlayers();
    });
}());
