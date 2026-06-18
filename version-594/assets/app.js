(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var type = scope.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;

        card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var source = player.getAttribute('data-m3u8');
    var loaded = false;
    var requestedPlay = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function tryPlay() {
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requestedPlay) {
            tryPlay();
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      requestedPlay = true;
      loadSource();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      tryPlay();
    }

    player.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('a')) {
        return;
      }

      if (!loaded || event.target === cover || event.target.closest('.player-cover')) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var resultBox = document.querySelector('[data-search-results]');

  if (resultBox && window.MOVIE_SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = document.querySelector('[data-search-title]');
    var note = document.querySelector('[data-search-note]');
    var prefix = resultBox.getAttribute('data-prefix') || './';
    var normalized = query.toLowerCase();
    var list = window.MOVIE_SEARCH_INDEX.filter(function (item) {
      if (!normalized) {
        return true;
      }

      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(normalized) !== -1;
    }).slice(0, 96);

    if (title) {
      title.textContent = query ? '搜索：' + query : '推荐内容';
    }

    if (note) {
      note.textContent = list.length ? '点击卡片进入详情页观看。' : '未找到匹配内容，可尝试更换关键词。';
    }

    function safeText(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    resultBox.innerHTML = list.map(function (item) {
      var link = prefix + 'video/' + item.id + '.html';
      var image = prefix + item.cover + '.jpg';
      var tagHtml = item.tags.split(' ').slice(0, 3).map(function (tag) {
        return '<span>' + safeText(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="card-poster" href="' + link + '" aria-label="' + safeText(item.title) + '" style="background-image: linear-gradient(180deg, rgba(3, 20, 32, 0.05), rgba(3, 20, 32, 0.72)), url(\'' + image + '\');">',
        '    <span class="card-badge">' + safeText(item.type) + '</span>',
        '    <span class="card-score">' + safeText(item.score) + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta"><span>' + safeText(item.year) + '</span><span>' + safeText(item.region) + '</span></div>',
        '    <h3><a href="' + link + '">' + safeText(item.title) + '</a></h3>',
        '    <p>' + safeText(item.oneLine) + '</p>',
        '    <div class="card-tags">' + tagHtml + '</div>',
        '    <a class="card-category" href="' + prefix + 'category-' + safeText(item.categorySlug) + '.html">' + safeText(item.categoryName) + '</a>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }
})();
