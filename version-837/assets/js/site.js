(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function() {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function run() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                setSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                run();
            });
        });

        run();
    }

    var searchInputs = document.querySelectorAll("[data-card-search]");
    searchInputs.forEach(function(input) {
        var container = document.querySelector("[data-card-list]");
        if (!container) {
            return;
        }
        var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));

        input.addEventListener("input", function() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-keywords") || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();
                card.classList.toggle("is-filter-hidden", value && haystack.indexOf(value) === -1);
            });
        });
    });
}());
