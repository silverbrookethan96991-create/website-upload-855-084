(function () {
    'use strict';

    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function formatViews(value) {
        var number = Number(value || 0);
        if (number >= 10000) {
            return (number / 10000).toFixed(1) + '万';
        }
        return String(number);
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var toggle = $('[data-mobile-toggle]');
        var panel = $('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
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
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initCategoryFilter() {
        var panel = $('[data-filter-panel]');
        var list = $('[data-filter-list]');
        if (!panel || !list) {
            return;
        }
        var keywordInput = $('[data-filter-keyword]', panel);
        var yearSelect = $('[data-filter-year]', panel);
        var typeSelect = $('[data-filter-type]', panel);
        var reset = $('[data-filter-reset]', panel);
        var count = $('[data-filter-count]', panel);
        var cards = $all('.movie-card', list);

        function filter() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || card.getAttribute('data-year') === year;
                var matchesType = !type || card.getAttribute('data-type') === type;
                var isVisible = matchesKeyword && matchesYear && matchesType;
                card.hidden = !isVisible;
                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '显示 ' + visible + ' 部';
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                filter();
            });
        }
        filter();
    }

    function movieCard(movie) {
        return '' +
            '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">' +
            '    <a class="movie-cover" href="' + escapeHtml(movie.detailUrl) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
            '        <img src="./' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '        <span class="movie-duration">' + escapeHtml(movie.duration) + '</span>' +
            '        <span class="movie-play">▶</span>' +
            '    </a>' +
            '    <div class="movie-info">' +
            '        <a class="movie-category" href="' + escapeHtml(movie.categoryFile) + '">' + escapeHtml(movie.category) + '</a>' +
            '        <h3><a href="' + escapeHtml(movie.detailUrl) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '        <p>' + escapeHtml(movie.description) + '</p>' +
            '        <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '        <div class="movie-stats"><span>👁 ' + formatViews(movie.views) + '</span><span>❤ ' + escapeHtml(movie.likes) + '</span><span>⭐ ' + escapeHtml(movie.score) + '</span></div>' +
            '    </div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = $('[data-search-results]');
        var summary = $('[data-search-summary]');
        var input = $('[data-search-input]');
        if (!results || !summary || !window.MOVIES_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }
        var normalizedQuery = normalize(query);
        if (!normalizedQuery) {
            summary.textContent = '请输入关键词开始搜索。';
            return;
        }
        var matched = window.MOVIES_DATA.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.description,
                movie.summary,
                movie.category,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' ')
            ].join(' '));
            return haystack.indexOf(normalizedQuery) !== -1;
        });
        summary.textContent = '搜索“' + query + '”找到 ' + matched.length + ' 部影片。';
        results.innerHTML = matched.slice(0, 300).map(movieCard).join('');
        if (matched.length > 300) {
            summary.textContent += ' 已显示前 300 部，请使用更精确关键词继续筛选。';
        }
    }

    function initPlayers() {
        $all('[data-player]').forEach(function (player) {
            var video = $('video', player);
            var overlay = $('[data-player-toggle]', player);
            var message = $('[data-player-message]', player);
            var src = player.getAttribute('data-src');
            var hlsInstance;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                    message.hidden = !text;
                }
            }

            function attachSource() {
                if (!video || !src) {
                    setMessage('播放源不可用');
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('');
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setMessage('网络异常，正在重新连接播放源...');
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setMessage('媒体解析异常，正在恢复播放...');
                            hlsInstance.recoverMediaError();
                        } else {
                            setMessage('当前浏览器暂时无法播放该视频。');
                            hlsInstance.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    setMessage('');
                } else {
                    setMessage('请使用支持 HLS 的浏览器，或等待 hls.js 加载完成后重试。');
                }
            }

            function playVideo() {
                attachSource();
                if (!video) {
                    return;
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setMessage('点击播放器中的播放按钮即可开始观看。');
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', playVideo);
            }
            $all('[data-player-shortcut]').forEach(function (button) {
                button.addEventListener('click', function () {
                    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    playVideo();
                });
            });
            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    player.classList.remove('is-playing');
                });
                video.addEventListener('ended', function () {
                    player.classList.remove('is-playing');
                });
            }
            attachSource();

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initCategoryFilter();
        initSearchPage();
        initPlayers();
    });
}());
