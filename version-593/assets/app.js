(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
        button.addEventListener('click', function () {
            var target = document.getElementById(button.getAttribute('data-scroll-target'));
            var dir = Number(button.getAttribute('data-scroll-dir')) || 1;

            if (target) {
                target.scrollBy({
                    left: dir * 420,
                    behavior: 'smooth'
                });
            }
        });
    });

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function runFilter(input) {
        var scope = input.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var query = normalize(input.value);

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
        });
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
        if (input.hasAttribute('data-query-input') && initialQuery) {
            input.value = initialQuery;
        }

        runFilter(input);

        input.addEventListener('input', function () {
            runFilter(input);
        });
    });

    var playerShell = document.querySelector('[data-player]');

    if (playerShell) {
        var video = playerShell.querySelector('video');
        var playButton = playerShell.querySelector('[data-play]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var attached = false;
        var hlsInstance = null;

        function beginPlayback() {
            playerShell.classList.add('is-playing');

            attachStream(function () {
                var result = video.play();

                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        playerShell.classList.remove('is-playing');
                    });
                }
            });
        }

        function attachStream(done) {
            if (!video || !stream) {
                return;
            }

            if (attached) {
                done();
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                attached = true;
                done();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    attached = true;
                    done();
                });
                return;
            }

            video.src = stream;
            attached = true;
            done();
        }

        if (playButton && video) {
            playButton.addEventListener('click', beginPlayback);
            video.addEventListener('click', function () {
                if (video.paused) {
                    beginPlayback();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
