(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function submitSearch(form) {
    var input = form.querySelector('input[name="q"], input[type="search"]');
    var value = input ? input.value.trim() : "";
    if (value) {
      window.location.href = "./search.html?q=" + encodeURIComponent(value);
    }
  }

  function initNavigation() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-nav]");
    if (button && panel) {
      button.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitSearch(form);
      });
    });
  }

  function initListFilters() {
    var lists = document.querySelectorAll("[data-card-list]");
    lists.forEach(function (list) {
      var scope = list.closest("section") || document;
      var buttons = scope.querySelectorAll("[data-filter-buttons] .filter-button");
      var search = scope.querySelector("[data-list-search]");
      var empty = scope.querySelector("[data-empty-state]");
      var currentFilter = "all";

      function matchesFilter(card) {
        if (currentFilter === "all") {
          return true;
        }
        var type = card.getAttribute("data-type") || "";
        var year = card.getAttribute("data-year") || "";
        var region = card.getAttribute("data-region") || "";
        var text = card.getAttribute("data-search") || "";
        return type.indexOf(currentFilter) !== -1 || year === currentFilter || region.indexOf(currentFilter) !== -1 || text.indexOf(normalize(currentFilter)) !== -1;
      }

      function applyFilters() {
        var query = normalize(search ? search.value : "");
        var visible = 0;
        list.querySelectorAll("[data-card]").forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var show = matchesFilter(card) && (!query || text.indexOf(query) !== -1);
          card.classList.toggle("hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          currentFilter = button.getAttribute("data-filter") || "all";
          applyFilters();
        });
      });

      if (search) {
        search.addEventListener("input", applyFilters);
      }
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + tag + "</span>";
    }).join("");
    return [
      '<article class="movie-card compact-card">',
      '  <a class="poster-wrap" href="' + movie.url + '" aria-label="' + movie.title + '">',
      '    <img src="' + movie.poster + '" alt="' + movie.title + '" loading="lazy">',
      '    <span class="poster-badge">' + movie.year + '</span>',
      '  </a>',
      '  <div class="movie-body">',
      '    <div class="movie-meta-row"><a href="' + movie.categoryUrl + '">' + movie.category + '</a><span>' + movie.type + '</span></div>',
      '    <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
      '    <p>' + movie.description + '</p>',
      '    <div class="chip-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !Array.isArray(window.MOVIES)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q") || "");
    var input = document.querySelector("[data-search-input]");
    var summary = document.querySelector("[data-search-summary]");
    if (input) {
      input.value = params.get("q") || "";
    }
    if (!query) {
      results.innerHTML = window.MOVIES.slice(0, 24).map(movieCard).join("");
      if (summary) {
        summary.textContent = "热门推荐";
      }
      return;
    }
    var matched = window.MOVIES.filter(function (movie) {
      return normalize([movie.title, movie.description, movie.genre, movie.region, movie.year, movie.type, movie.category, (movie.tags || []).join(" ")].join(" ")).indexOf(query) !== -1;
    }).slice(0, 80);
    results.innerHTML = matched.map(movieCard).join("");
    if (summary) {
      summary.textContent = matched.length ? "搜索结果" : "未找到相关内容";
    }
  }

  ready(function () {
    initNavigation();
    initListFilters();
    initSearchPage();
  });
})();
