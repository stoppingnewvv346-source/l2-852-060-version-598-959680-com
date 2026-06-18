document.addEventListener('DOMContentLoaded', function () {
  setupMobileNavigation();
  setupBackToTop();
  setupSearchPanels();
  setupHeroCarousel();
  setupPlayers();
});

function setupMobileNavigation() {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', function () {
    menu.classList.toggle('is-open');
  });
}

function setupBackToTop() {
  var button = document.querySelector('[data-back-to-top]');

  if (!button) {
    return;
  }

  window.addEventListener('scroll', function () {
    if (window.scrollY > 420) {
      button.classList.add('is-visible');
    } else {
      button.classList.remove('is-visible');
    }
  });

  button.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupSearchPanels() {
  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var count = scope.querySelector('[data-result-count]');
    var filters = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var activeFilter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function update() {
      var query = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.keywords
        ].join(' '));
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var filterMatch = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
        var shouldShow = queryMatch && filterMatch;

        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部';
      }
    }

    if (input) {
      input.addEventListener('input', update);
    }

    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.dataset.filter || 'all';
        filters.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        update();
      });
    });

    update();
  });
}

function setupHeroCarousel() {
  var root = document.querySelector('[data-hero-carousel]');

  if (!root) {
    return;
  }

  var backgrounds = Array.prototype.slice.call(root.querySelectorAll('[data-hero-bg]'));
  var copies = Array.prototype.slice.call(root.querySelectorAll('[data-hero-copy]'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
  var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-hero-thumb]'));
  var index = 0;
  var timer = null;

  function activate(nextIndex) {
    index = (nextIndex + backgrounds.length) % backgrounds.length;

    [backgrounds, copies, dots, thumbs].forEach(function (group) {
      group.forEach(function (item, itemIndex) {
        item.classList.toggle('is-active', itemIndex === index);
      });
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      activate(dotIndex);
      restart();
    });
  });

  thumbs.forEach(function (thumb, thumbIndex) {
    thumb.addEventListener('mouseenter', function () {
      activate(thumbIndex);
      restart();
    });
  });

  activate(0);
  restart();
}

function setupPlayers() {
  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    var hlsSource = video.dataset.hls;
    var mp4Source = video.dataset.mp4;
    var initialized = false;
    var hlsInstance = null;

    function useMp4Fallback(autoplay) {
      if (!mp4Source) {
        return;
      }
      video.src = mp4Source;
      video.load();
      if (autoplay) {
        video.play().catch(function () {});
      }
    }

    function initializePlayer(autoplay) {
      if (initialized) {
        if (autoplay) {
          video.play().catch(function () {});
        }
        return;
      }

      initialized = true;

      if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSource;
        video.load();
        if (autoplay) {
          video.play().catch(function () {});
        }
        return;
      }

      if (hlsSource && window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(hlsSource);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hlsInstance.destroy();
            hlsInstance = null;
            useMp4Fallback(autoplay);
          }
        });
        if (autoplay) {
          video.play().catch(function () {});
        }
        return;
      }

      useMp4Fallback(autoplay);
    }

    button.addEventListener('click', function () {
      box.classList.add('is-playing');
      initializePlayer(true);
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        box.classList.add('is-playing');
        initializePlayer(true);
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
  });
}
