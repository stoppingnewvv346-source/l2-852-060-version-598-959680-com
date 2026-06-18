(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }

        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function move(step) {
        show(index + step);
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          move(1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          move(-1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          move(1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-search]").forEach(function (input) {
      var scope = input.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var hay = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-category") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-keywords") || ""
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden", keyword && hay.indexOf(keyword) === -1);
        });
      }

      input.addEventListener("input", apply);
    });

    document.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        var scope = button.closest("main") || document;
        var row = button.closest(".filter-row");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var type = button.getAttribute("data-filter");
        var value = button.getAttribute("data-filter-value") || "";

        if (row) {
          row.querySelectorAll("[data-filter]").forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
        }

        cards.forEach(function (card) {
          var match = true;
          if (type === "category") {
            match = card.getAttribute("data-category") === value;
          }
          if (type === "year") {
            match = card.getAttribute("data-year") === value;
          }
          if (type === "all") {
            match = true;
          }
          card.classList.toggle("is-hidden", !match);
        });
      });
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var stream = video ? video.getAttribute("data-stream") : "";
      var attached = false;

      function attach() {
        if (!video || !stream || attached) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          attached = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hlsPlayer = hls;
          attached = true;
          return;
        }

        video.src = stream;
        attached = true;
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (overlay && video) {
        overlay.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
      }
    });
  });
})();
