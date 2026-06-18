(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === index);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length) {
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                stopHero();
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });
        if (previous) {
            previous.addEventListener('click', function () {
                stopHero();
                showSlide(index - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                stopHero();
                showSlide(index + 1);
                startHero();
            });
        }
        startHero();
    }

    var searchInput = document.querySelector('.js-search');
    var filters = Array.prototype.slice.call(document.querySelectorAll('.js-filter'));
    var filterList = document.querySelector('[data-filter-list]') || document;
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card, .rank-item'));
    var empty = document.querySelector('[data-empty-state]');

    function matchesFilter(card, key, value) {
        if (!value) {
            return true;
        }
        var dataValue = card.getAttribute('data-' + key) || '';
        return dataValue.indexOf(value) !== -1;
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var ok = !query || text.indexOf(query) !== -1;
            filters.forEach(function (select) {
                var key = select.getAttribute('data-filter');
                var value = select.value;
                if (key && !matchesFilter(card, key, value)) {
                    ok = false;
                }
            });
            card.classList.toggle('hidden-by-filter', !ok);
            if (ok) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    filters.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });
})();
