(function () {
  var menuButton = document.querySelector(".js-menu-toggle");
  var mobilePanel = document.querySelector(".js-mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function goSearch(value) {
    var query = normalize(value);
    if (query) {
      window.location.href = "./index.html?q=" + encodeURIComponent(query);
    } else {
      window.location.href = "./index.html";
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll(".js-nav-search"), function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      goSearch(input ? input.value : "");
    });
  });

  var urlQuery = "";

  try {
    urlQuery = new URLSearchParams(window.location.search).get("q") || "";
  } catch (error) {
    urlQuery = "";
  }

  Array.prototype.forEach.call(document.querySelectorAll(".js-filter-area"), function (area) {
    var input = area.querySelector(".js-search-input");
    var buttons = area.querySelectorAll(".js-filter-btn");
    var cards = area.querySelectorAll(".js-movie-card");
    var emptyState = area.querySelector(".js-empty-state");
    var activeFilter = "all";

    if (input && urlQuery) {
      input.value = urlQuery;
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : "");
      var visibleCount = 0;

      Array.prototype.forEach.call(cards, function (card) {
        var text = normalize(card.getAttribute("data-text"));
        var kind = normalize(card.getAttribute("data-kind"));
        var matchesText = !keyword || text.indexOf(keyword) !== -1;
        var matchesKind = activeFilter === "all" || kind === normalize(activeFilter);
        var visible = matchesText && matchesKind;

        card.style.display = visible ? "" : "none";

        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        Array.prototype.forEach.call(buttons, function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        applyFilters();
      });
    });

    applyFilters();
  });
})();
