(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        prev && prev.addEventListener('click', function () {
            show(index - 1);
            restart();
        });

        next && next.addEventListener('click', function () {
            show(index + 1);
            restart();
        });

        show(0);
        restart();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var results = document.querySelector('.filter-results');
        if (!panel || !results) {
            return;
        }
        var keyword = panel.querySelector('[data-filter-keyword]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var category = panel.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(results.children);
        var empty = document.createElement('div');
        empty.className = 'filter-empty';
        empty.textContent = '没有匹配的影片，请调整筛选条件。';

        function matchCard(card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre')
            ].join(' '));
            var keywordValue = normalize(keyword && keyword.value);
            var yearValue = normalize(year && year.value);
            var regionValue = normalize(region && region.value);
            var categoryValue = normalize(category && category.value);

            if (keywordValue && text.indexOf(keywordValue) === -1) {
                return false;
            }
            if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                return false;
            }
            if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
                return false;
            }
            if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
                return false;
            }
            return true;
        }

        function apply() {
            var shown = 0;
            cards.forEach(function (card) {
                var visible = matchCard(card);
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });
            if (!shown) {
                if (!empty.parentNode) {
                    results.insertAdjacentElement('afterend', empty);
                }
            } else if (empty.parentNode) {
                empty.remove();
            }
        }

        [keyword, year, region, category].forEach(function (control) {
            control && control.addEventListener('input', apply);
            control && control.addEventListener('change', apply);
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="poster-wrap" href="' + escapeAttribute(movie.page) + '" aria-label="观看' + escapeAttribute(movie.title) + '">' +
            '<img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="type-chip">' + escapeHtml(movie.type) + '</span>' +
            '<span class="region-chip">' + escapeHtml(movie.region) + '</span>' +
            '<span class="play-float">▶</span>' +
            '</a>' +
            '<div class="movie-info">' +
            '<h2><a href="' + escapeAttribute(movie.page) + '">' + escapeHtml(movie.title) + '</a></h2>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function initSearchPage() {
        var list = window.SITE_MOVIES || [];
        var box = document.querySelector('[data-search-results]');
        var status = document.querySelector('[data-search-status]');
        if (!box || !status) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = normalize(params.get('q'));
        var pageInput = document.querySelector('.search-page-form input[name="q"]');
        if (pageInput && query) {
            pageInput.value = params.get('q');
        }
        if (!query) {
            return;
        }
        var words = query.split(/\s+/).filter(Boolean);
        var matches = list.filter(function (movie) {
            var target = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' '));
            return words.every(function (word) {
                return target.indexOf(word) !== -1;
            });
        }).slice(0, 96);
        status.textContent = matches.length ? '搜索结果' : '没有匹配的影片，请更换关键词。';
        box.innerHTML = matches.map(movieCard).join('');
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movie-video');
        var overlay = document.querySelector('.player-overlay');
        if (!video || !streamUrl) {
            return;
        }
        var hlsInstance = null;
        var started = false;

        function load() {
            if (started) {
                return Promise.resolve();
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                video._hls = hlsInstance;
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    setTimeout(resolve, 1200);
                });
            }
            video.src = streamUrl;
            return Promise.resolve();
        }

        function play() {
            overlay && overlay.classList.add('is-hidden');
            load().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        overlay && overlay.addEventListener('click', play);
        video.addEventListener('play', function () {
            overlay && overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                overlay && overlay.classList.remove('is-hidden');
            }
        });
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
