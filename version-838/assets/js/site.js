(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-target]'));
    var current = 0;
    var timer = null;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-target')) || 0);
        start();
      });
    });
    if (slides.length > 1) {
      start();
    }
  }

  var searchRoot = document.querySelector('[data-search-page]');
  var list = document.querySelector('[data-card-list]');
  if (searchRoot && list) {
    var keywordInput = searchRoot.querySelector('[data-filter-keyword]');
    var regionSelect = searchRoot.querySelector('[data-filter-region]');
    var yearSelect = searchRoot.querySelector('[data-filter-year]');
    var genreSelect = searchRoot.querySelector('[data-filter-genre]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);
    if (params.get('q') && keywordInput) {
      keywordInput.value = params.get('q');
    }
    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };
    var apply = function () {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
          matched = false;
        }
        if (year && normalize(card.getAttribute('data-year')) !== year) {
          matched = false;
        }
        if (genre && normalize(card.getAttribute('data-genre')).indexOf(genre) === -1) {
          matched = false;
        }
        card.classList.toggle('hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    };
    [keywordInput, regionSelect, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }
})();
