(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var root = panel.parentElement || document;
            var input = panel.querySelector("[data-search-input]");
            var yearSelect = panel.querySelector("[data-year-filter]");
            var categorySelect = panel.querySelector("[data-category-filter]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-genre]"));
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
            var genre = "";

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var category = categorySelect ? categorySelect.value : "";
                cards.forEach(function (card) {
                    var haystack = card.getAttribute("data-search") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardGenre = (card.getAttribute("data-genre") || "").toLowerCase();
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (year && cardYear !== year) {
                        ok = false;
                    }
                    if (category && cardCategory !== category) {
                        ok = false;
                    }
                    if (genre && cardGenre.indexOf(genre) === -1) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            if (categorySelect) {
                categorySelect.addEventListener("change", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    button.classList.add("active");
                    genre = (button.getAttribute("data-filter-genre") || "").toLowerCase();
                    apply();
                });
            });
            var params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
                apply();
            }
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        var states = new WeakMap();
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var overlay = box.querySelector("[data-play]");
            var stream = box.getAttribute("data-stream");
            if (!video || !stream) {
                return;
            }

            function attach() {
                if (states.has(video)) {
                    return;
                }
                states.set(video, true);
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    return;
                }
                video.src = stream;
            }

            function start() {
                attach();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.controls = true;
                var playResult = video.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!states.has(video)) {
                    start();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
