(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (slides.length) {
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startHero();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startHero();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startHero();
        });
      }
      showSlide(0);
      startHero();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var yearFilter = document.querySelector("[data-filter-year]");
    var typeFilter = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
    var empty = document.querySelector("[data-empty-state]");

    function filterCards() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [filterInput, yearFilter, typeFilter].forEach(function (item) {
      if (item) {
        item.addEventListener("input", filterCards);
        item.addEventListener("change", filterCards);
      }
    });

    var searchForm = document.querySelector("[data-site-search]");
    var searchInput = document.querySelector("[data-search-input]");
    var searchResults = document.querySelector("[data-search-results]");
    var searchEmpty = document.querySelector("[data-search-empty]");

    function getQuery() {
      var params = new URLSearchParams(window.location.search);
      return params.get("q") || "";
    }

    function renderSearch(query) {
      if (!searchResults || !window.SEARCH_DATA) {
        return;
      }
      var keyword = query.trim().toLowerCase();
      var results = [];
      if (keyword) {
        results = window.SEARCH_DATA.filter(function (item) {
          return [item.title, item.genre, item.region, item.type, item.year, item.category, item.one_line].join(" ").toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 120);
      }
      searchResults.innerHTML = results.map(function (item) {
        return '<article class="movie-card" data-title="' + escapeAttr(item.title) + '" data-genre="' + escapeAttr(item.genre) + '" data-year="' + escapeAttr(item.year) + '" data-type="' + escapeAttr(item.type) + '" data-region="' + escapeAttr(item.region) + '">' +
          '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeAttr(item.title) + '">' +
          '<img src="' + item.cover + '" alt="' + escapeAttr(item.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span><span class="play-chip">播放</span></a>' +
          '<div class="movie-card-body"><div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3><p>' + escapeHtml(item.one_line) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div></article>';
      }).join("");
      if (searchEmpty) {
        searchEmpty.classList.toggle("is-visible", Boolean(keyword) && results.length === 0);
      }
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"]/g, function (char) {
        return {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"}[char];
      });
    }

    function escapeAttr(value) {
      return escapeHtml(value).replace(/'/g, "&#39;");
    }

    if (searchInput && searchResults) {
      var initial = getQuery();
      searchInput.value = initial;
      renderSearch(initial);
      if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
          event.preventDefault();
          var value = searchInput.value.trim();
          var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
          history.replaceState(null, "", url);
          renderSearch(value);
        });
      }
    }
  });
})();
