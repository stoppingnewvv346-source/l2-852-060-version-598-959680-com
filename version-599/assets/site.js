(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var navPanel = document.querySelector("[data-nav-panel]");
        if (menuToggle && navPanel) {
            menuToggle.addEventListener("click", function () {
                navPanel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
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
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5800);
            }
        }

        if (slides.length) {
            showSlide(0);
            startHero();
        }
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
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });

        var filterPanel = document.querySelector("[data-filter-panel]");
        if (filterPanel) {
            var input = filterPanel.querySelector("[data-filter-input]");
            var type = filterPanel.querySelector("[data-filter-type]");
            var region = filterPanel.querySelector("[data-filter-region]");
            var year = filterPanel.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (input && query) {
                input.value = query;
            }
            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }
            function applyFilter() {
                var text = normalize(input && input.value);
                var typeValue = normalize(type && type.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                cards.forEach(function (card) {
                    var textPool = normalize(card.getAttribute("data-text"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = true;
                    if (text && textPool.indexOf(text) === -1) {
                        matched = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden-by-filter", !matched);
                });
            }
            [input, type, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
            applyFilter();
        }
    });

    window.VideoRuntime = {
        boot: function (sourceUrl) {
            var video = document.getElementById("movieVideo");
            var overlay = document.querySelector(".play-overlay");
            if (!video || !sourceUrl) {
                return;
            }
            var started = false;
            var hlsInstance = null;

            function loadSource() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            }

            function play() {
                loadSource();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (!started) {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    };
})();
