window.piwikMediaAnalyticsAsyncInit = function () {
  var MA = Piwik.MediaAnalytics;

  function MyPlayer(node, mediaType) {
    console.log("1");

    if (node.hasPlayerInstance) {
      console.log("2");
      // prevent creating multiple trackers for the same media
      // when scanning for media multiple times
      return;
    }
    console.log("3");

    node.hasPlayerInstance = true;

    // find the actual resource / URL of the video
    var actualResource = MA.element.getAttribute(node, "src");
    // a user can overwrite the actual resource by defining a "data-matomo-resource" attribute.
    // the method `getMediaResource` will detect whether such an attribute was set
    var resource = MA.element.getMediaResource(node, actualResource);

    // create an instance of the media tracker.
    // Make sure to replace myPlayerName with your player name.
    var tracker = new MA.MediaTracker("myPlayerName", mediaType, resource);

    // for video you should detect the width, height, and fullscreen usage, if possible
    tracker.setWidth(node.clientWidth);
    tracker.setHeight(node.clientHeight);
    tracker.setFullscreen(MA.element.isFullscreen(node));

    // the method `getMediaTitle` will try to get a media title from a
    // "data-matomo-title", "title" or "alt" HTML attribute. Sometimes it might be possible
    // to retrieve the media title directly from the video or audio player
    var title = MA.element.getMediaTitle(node);
    tracker.setMediaTitle(title);

    // some media players let you already detect the total length of the video
    tracker.setMediaTotalLengthInSeconds(node.duration);

    var useCapture = true;

    node.addEventListener(
      "play",
      function () {
        // if the player supports something like playlists you might want to check
        // whether the source has changed and if so, call the following 3 methods:
        // tracker.reset();
        // tracker.setResource(newResource);
        // tracker.setMediaTitle(newMediaTitleOrEmptyString);
        // this allows you to automatically track a new media as soon
        // as the currently played video or audio changes

        // notify the tracker the media is now playing
        tracker.play();
      },
      useCapture
    );

    node.addEventListener(
      "pause",
      function () {
        // notify the tracker the media is now paused
        tracker.pause();
      },
      useCapture
    );

    node.addEventListener(
      "ended",
      function () {
        // notify the tracker the media is now finished
        tracker.finish();
      },
      useCapture
    );

    node.addEventListener(
      "timeupdate",
      function () {
        // notify the tracker the media is still playing

        // we update the current made progress (time position) and duration of
        // the media. Not all players might give you that information
        tracker.setMediaProgressInSeconds(node.currentTime);
        tracker.setMediaTotalLengthInSeconds(node.duration);

        // it is important to call the tracker.update() method regularly while the
        // media is playing. If this method is not called eg every X seconds no
        // updated data will be tracked.
        // The method itself will not actually send a tracking request whenever it
        // is called. Instead it will make sure to respect the set ping interval and
        // eg only send a tracking request every 5 seconds.
        tracker.update();
      },
      useCapture
    );

    node.addEventListener(
      "seeking",
      function () {
        // "seekStart" is needed when the player is seeking or buffering.
        // It will stop the timer that tracks for how long the media has been played.
        tracker.seekStart();
      },
      true
    );

    node.addEventListener(
      "seeked",
      function () {
        // we update the current made progress (time position) and duration of
        // the media. Not all players might give you that information
        tracker.setMediaProgressInSeconds(node.currentTime);
        tracker.setMediaTotalLengthInSeconds(node.duration);

        // "seekFinish" is needed when the player has finished seeking or buffering.
        // It will start the timer again that tracks for how long the media has been played.
        tracker.seekFinish();
      },
      useCapture
    );

    // for videos it might be useful to listen to the resize event to detect a
    // changed video width or when the video has gone fullscreen
    window.addEventListener(
      "resize",
      function () {
        tracker.setWidth(node.clientWidth);
        tracker.setHeight(node.clientHeight);
        tracker.setFullscreen(MA.element.isFullscreen(node));
      },
      useCapture
    );

    // here we make sure to send an initial tracking request for this media.
    // This basically tracks an impression for this media.
    tracker.trackUpdate();
  }
  MyPlayer.scanForMedia = function (documentOrHTMLElement) {
    // find all medias for your player
    var html5Videos = documentOrHTMLElement.getElementsByTagName("video");

    for (var i = 0; i < html5Videos.length; i++) {
      // for each of the medias found, create an instance of your player as long as the media is
      // not supposed to be ignored via a "data-matomo-ignore" attribute
      if (!MA.element.isMediaIgnored(html5Videos[i])) {
        new MyPlayer(html5Videos[i], MA.mediaType.VIDEO);
        // there is also a MA.mediaType.AUDIO constant if you want to track audio
      }
    }
  };

  // adding the newly created player to the Media Analytics tracker
  MA.addPlayer("myPlayerName", MyPlayer);
};

var _paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(["trackPageView"]);
_paq.push(["enableLinkTracking"]);
(function () {
  var u = "https://vsl.matomo.cloud/";
  _paq.push(["setTrackerUrl", u + "matomo.php"]);
  _paq.push(["setSiteId", "1"]);
  var d = document,
    g = d.createElement("script"),
    s = d.getElementsByTagName("script")[0];
  g.type = "text/javascript";
  g.async = true;
  g.defer = true;
  g.src = "//cdn.matomo.cloud/vsl.matomo.cloud/matomo.js";
  s.parentNode.insertBefore(g, s);
})();
