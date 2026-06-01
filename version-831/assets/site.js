(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function initMenu() {
    var button = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) return;
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    restart();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-category'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function initFilters() {
    var areas = $all('[data-filter-area]');
    areas.forEach(function (area) {
      var input = $('[data-filter-input]', area);
      var select = $('[data-filter-select]', area);
      var chips = $all('[data-filter-tag]', area);
      var root = area.nextElementSibling && area.nextElementSibling.hasAttribute('data-filter-area') ? area.nextElementSibling : area;
      var cards = $all('[data-filter-card]', root);
      var empty = $('[data-empty-state]', root);
      if (!cards.length) {
        cards = $all('[data-filter-card]', document);
      }
      if (!input && !select && !chips.length) return;

      if (input && input.hasAttribute('data-url-query')) {
        var q = new URLSearchParams(window.location.search).get('q') || '';
        input.value = q;
      }

      function activeChipValue() {
        var active = chips.filter(function (chip) { return chip.classList.contains('is-active'); })[0];
        return active ? active.getAttribute('data-filter-tag') : 'all';
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var selected = select ? select.value : 'all';
        var tag = activeChipValue();
        var shown = 0;
        cards.forEach(function (card) {
          var text = cardText(card);
          var category = card.getAttribute('data-category') || '';
          var passQuery = !query || text.indexOf(query) !== -1;
          var passSelect = selected === 'all' || category === selected;
          var passTag = tag === 'all' || text.indexOf(normalize(tag)) !== -1;
          var pass = passQuery && passSelect && passTag;
          card.style.display = pass ? '' : 'none';
          if (pass) shown += 1;
        });
        if (empty) empty.classList.toggle('is-visible', shown === 0);
      }

      if (input) input.addEventListener('input', apply);
      if (select) select.addEventListener('change', apply);
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) { item.classList.remove('is-active'); });
          chip.classList.add('is-active');
          apply();
        });
      });
      apply();
    });
  }

  function initPlayer() {
    var shell = $('[data-player]');
    if (!shell) return;
    var video = $('video', shell);
    var overlay = $('.player-overlay', shell);
    var json = $('#player-data');
    if (!video) return;
    var source = $('source', video);
    var url = source ? source.getAttribute('src') : '';
    if (json) {
      try {
        var data = JSON.parse(json.textContent || '{}');
        if (data.url) url = data.url;
      } catch (error) {}
    }
    var hls = null;
    var ready = false;

    function loadAndPlay() {
      if (!url) return;
      if (overlay) overlay.classList.add('is-hidden');
      if (ready) {
        video.play().catch(function () {});
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          }
        });
        return;
      }
      video.src = url;
      video.play().catch(function () {});
    }

    if (overlay) overlay.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
      if (!ready) {
        loadAndPlay();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) overlay.classList.add('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
