(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }
  }

  const filterInput = document.querySelector('.card-filter');
  const filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    const cards = Array.from(filterList.querySelectorAll('[data-title]'));
    filterInput.addEventListener('input', function () {
      const value = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden-card', value && !haystack.includes(value));
      });
    });
  }

  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const regionFilter = document.getElementById('regionFilter');
  const searchResults = document.getElementById('searchResults');
  const searchTitle = document.getElementById('searchTitle');
  const searchCount = document.getElementById('searchCount');

  function movieCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">'
      + '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">'
      + '<img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
      + '<span class="poster-play">▶</span>'
      + '</a>'
      + '<div class="movie-body">'
      + '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>'
      + '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>'
      + '<p>' + escapeHtml(movie.oneLine) + '</p>'
      + '<div class="tag-row">' + tags + '</div>'
      + '</div>'
      + '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (item) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[item];
    });
  }

  function renderSearch() {
    if (!searchResults || !Array.isArray(window.SEARCH_MOVIES)) {
      return;
    }

    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const region = regionFilter ? regionFilter.value : '';
    let results = window.SEARCH_MOVIES.filter(function (movie) {
      const text = [movie.title, movie.region, movie.genre, movie.year, movie.type, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      const keywordPass = keyword ? text.includes(keyword) : true;
      const regionPass = region ? movie.region === region : true;
      return keywordPass && regionPass;
    });

    if (!keyword && !region) {
      results = results.slice(0, 48);
    }

    searchResults.innerHTML = results.map(movieCard).join('');
    if (searchTitle) {
      searchTitle.textContent = keyword || region ? '搜索结果' : '热门剧集';
    }
    if (searchCount) {
      searchCount.textContent = results.length ? '找到 ' + results.length + ' 部相关内容' : '没有找到相关内容';
    }
  }

  if (searchForm && searchResults) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch();
    });
    if (searchInput) {
      searchInput.addEventListener('input', renderSearch);
    }
    if (regionFilter) {
      regionFilter.addEventListener('change', renderSearch);
    }
    renderSearch();
  }
}());
