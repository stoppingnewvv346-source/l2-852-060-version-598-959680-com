(function () {
  function attachSource(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return hls;
    }
    video.src = source;
    return null;
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    if (!video || !overlay || !source) {
      return;
    }
    var loaded = false;
    var hls = null;
    function start() {
      if (!loaded) {
        hls = attachSource(video, source);
        loaded = true;
      }
      overlay.classList.add("is-hidden");
      video.controls = true;
      var playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }
    overlay.addEventListener("click", start);
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
