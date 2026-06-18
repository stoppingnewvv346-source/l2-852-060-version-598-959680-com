(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll(".site-search-form")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });
  }

  function valueOf(element) {
    return element ? element.value.trim().toLowerCase() : "";
  }

  function setupFilters() {
    Array.prototype.slice.call(document.querySelectorAll(".movie-filter")).forEach(function (panel) {
      var input = panel.querySelector(".filter-input");
      var region = panel.querySelector(".filter-region");
      var year = panel.querySelector(".filter-year");
      var clear = panel.querySelector(".clear-filter");
      var target = panel.parentElement ? panel.parentElement.querySelector(".filter-target") : null;
      var cards = target ? Array.prototype.slice.call(target.querySelectorAll(".movie-card, .rank-item")) : [];
      if (!cards.length) {
        return;
      }
      if (panel.getAttribute("data-query-source") === "url" && input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
      }
      function apply() {
        var queryText = valueOf(input);
        var regionText = valueOf(region);
        var yearText = valueOf(year);
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" ").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var show = true;
          if (queryText && haystack.indexOf(queryText) === -1) {
            show = false;
          }
          if (regionText && cardRegion !== regionText) {
            show = false;
          }
          if (yearText && cardYear !== yearText) {
            show = false;
          }
          card.classList.toggle("hidden-card", !show);
        });
      }
      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (region) {
            region.value = "";
          }
          if (year) {
            year.value = "";
          }
          apply();
        });
      }
      apply();
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
  });
})();
