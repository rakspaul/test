(function (window, vjs, vast) {
    'use strict';

    var extend = function (obj) {
            var arg,
                i,
                k;

            for (i = 1; i < arguments.length; i++) {
                arg = arguments[i];

                for (k in arg) {
                    if (arg.hasOwnProperty(k)) {
                        obj[k] = arg[k];
                    }
                }
            }

            return obj;
        },

        defaults = {
            // seconds before skip button shows, negative values to disable skip button altogether
            skip: 5
        },

        Vast = function (player, settings) {
            // return vast plugin
            return {
                createSourceObjects: function (mediaFiles) {
                    var sourcesByFormat = {},
                        i,
                        j,
                        a,
                        b,
                        mediaFile,
                        source,
                        sources,
                        tech,
                        techName,
                        techOrder = player.options().techOrder;

                    for (i = 0, j = techOrder.length; i < j; i++) {
                        techName = techOrder[i].charAt(0).toUpperCase() + techOrder[i].slice(1);
                        tech = window.videojs[techName];

                        // Check if the current tech is defined before continuing
                        if (!tech) {
                            continue;
                        }

                        // Check if the browser supports this technology
                        if (tech.isSupported()) {
                            // Loop through each source object
                            for (a = 0, b = mediaFiles.length; a < b; a++) {
                                mediaFile = mediaFiles[a];

                                source = {
                                    type: mediaFile.mimeType,
                                    src: mediaFile.fileURL
                                };

                                // Check if source can be played with this technology
                                if (tech.canPlaySource(source)) {
                                    if (sourcesByFormat[techOrder[i]] === undefined) {
                                        sourcesByFormat[techOrder[i]] = [];
                                    }

                                    sourcesByFormat[techOrder[i]].push({
                                        type: mediaFile.mimeType,
                                        src: mediaFile.fileURL,
                                        width: mediaFile.width,
                                        height: mediaFile.height
                                    });
                                }
                            }
                        }
                    }

                    // Create sources in preferred format order
                    sources = [];

                    for (j = 0; j < techOrder.length; j++) {
                        tech = techOrder[j];

                        if (sourcesByFormat[tech] !== undefined) {
                            for (i = 0; i < sourcesByFormat[tech].length; i++) {
                                sources.push(sourcesByFormat[tech][i]);
                            }
                        }
                    }

                    return sources;
                },

                getContent: function () {
                    // query vast url given in settings
                    vast.client.get(settings.url, function (response) {
                        var adIdx,
                            ad,
                            creaIdx,
                            creative,
                            foundCreative,
                            foundCompanion;

                        if (response) {
                            // we got a response, deal with it
                            for (adIdx = 0; adIdx < response.ads.length; adIdx++) {
                                ad = response.ads[adIdx];
                                player.vast.companion = undefined;

                                for (creaIdx = 0; creaIdx < ad.creatives.length; creaIdx++) {
                                    creative = ad.creatives[creaIdx];
                                    foundCreative = false;
                                    foundCompanion = false;

                                    if (creative.type === 'linear' && !foundCreative) {
                                        if (creative.mediaFiles.length) {
                                            player.vast.sources = player.vast.createSourceObjects(creative.mediaFiles);

                                            if (!player.vast.sources.length) {
                                                player.trigger('adscanceled');
                                                return;
                                            }

                                            player.vastTracker = new vast.tracker(ad, creative);
                                            foundCreative = true;
                                        }
                                    } else if (creative.type === 'companion' && !foundCompanion) {
                                        player.vast.companion = creative;
                                        foundCompanion = true;
                                    }
                                }

                                if (player.vastTracker) {
                                    // vast tracker and content is ready to go, trigger event
                                    player.trigger('vast-ready');
                                } else {
                                    // Inform ad server we can't find suitable media file for this ad
                                    vast.util.track(ad.errorURLTemplates, {ERRORCODE: 403});
                                }
                            }
                        }

                        if (!player.vastTracker) {
                            // No pre-roll, start video
                            player.trigger('adscanceled');
                        }
                    });
                },

                setupEvents: function () {
                    var errorOccurred = false,
                        canplayFn = function () {
                            player.vastTracker.load();
                        },

                        timeupdateFn = function () {
                            if (isNaN(player.vastTracker.assetDuration)) {
                                player.vastTracker.assetDuration = player.duration();
                            }

                            player.vastTracker.setProgress(player.currentTime());
                        },

                        pauseFn = function () {
                            player.vastTracker.setPaused(true);

                            player.one('play', function () {
                                player.vastTracker.setPaused(false);
                            });
                        },

                        errorFn = function () {
                            // Inform ad server we couldn't play the media file for this ad
                            vast.util.track(player.vastTracker.ad.errorURLTemplates, {ERRORCODE: 405});
                            errorOccurred = true;
                            player.trigger('ended');
                        };

                    player.on('canplay', canplayFn);
                    player.on('timeupdate', timeupdateFn);
                    player.on('pause', pauseFn);
                    player.on('error', errorFn);

                    player.one('vast-preroll-removed', function () {
                        player.off('canplay', canplayFn);
                        player.off('timeupdate', timeupdateFn);
                        player.off('pause', pauseFn);
                        player.off('error', errorFn);

                        if (!errorOccurred) {
                            player.vastTracker.complete();
                        }
                    });
                },

                preroll: function () {
                    var clickThrough,
                        blocker,
                        skipButton;

                    player.ads.startLinearAdMode();
                    player.vast.showControls = player.controls();

                    if (player.vast.showControls) {
                        player.controls(false);
                    }

                    // load linear ad sources and start playing them
                    player.src(player.vast.sources);

                    if (player.vastTracker.clickThroughURLTemplate) {
                        clickThrough = vast.util.resolveURLTemplates(
                            [player.vastTracker.clickThroughURLTemplate],
                            {
                                CACHEBUSTER: Math.round(Math.random() * 1.0e+10),
                                CONTENTPLAYHEAD: player.vastTracker.progressFormated()
                            }
                        )[0];
                    }

                    blocker = window.document.createElement('a');
                    blocker.className = 'vast-blocker';
                    blocker.href = clickThrough || '#';
                    blocker.target = '_blank';

                    blocker.onclick = function () {
                        var clickTrackers;

                        if (player.paused()) {
                            player.play();
                            return false;
                        }

                        clickTrackers = player.vastTracker.clickTrackingURLTemplate;

                        if (clickTrackers) {
                            player.vastTracker.trackURLs([clickTrackers]);
                        }

                        player.trigger('adclick');
                    };

                    player.vast.blocker = blocker;
                    player.el().insertBefore(blocker, player.controlBar.el());

                    skipButton = window.document.createElement('div');
                    skipButton.className = 'vast-skip-button';

                    if (settings.skip < 0) {
                        skipButton.style.display = 'none';
                    }

                    player.vast.skipButton = skipButton;
                    player.el().appendChild(skipButton);

                    player.on('timeupdate', player.vast.timeupdate);

                    skipButton.onclick = function (e) {
                        if ((' ' + player.vast.skipButton.className + ' ').indexOf(' enabled ') >= 0) {
                            player.vastTracker.skip();
                            player.vast.tearDown();
                        }

                        if (window.Event.prototype.stopPropagation !== undefined) {
                            e.stopPropagation();
                        } else {
                            return false;
                        }
                    };

                    player.vast.setupEvents();
                    player.one('ended', player.vast.tearDown);
                    player.trigger('vast-preroll-ready');
                },

                tearDown: function () {
                    // remove preroll buttons
                    player.vast.skipButton.parentNode.removeChild(player.vast.skipButton);
                    player.vast.blocker.parentNode.removeChild(player.vast.blocker);

                    // remove vast-specific events
                    player.off('timeupdate', player.vast.timeupdate);
                    player.off('ended', player.vast.tearDown);

                    // end ad mode
                    player.ads.endLinearAdMode();

                    // show player controls for video
                    if (player.vast.showControls) {
                        player.controls(true);
                    }

                    player.trigger('vast-preroll-removed');
                },

                timeupdate: function () {
                    var timeLeft;

                    player.loadingSpinner.el().style.display = 'none';
                    timeLeft = Math.ceil(settings.skip - player.currentTime());

                    if (timeLeft > 0) {
                        player.vast.skipButton.innerHTML = 'Skip in ' + timeLeft + '...';
                    } else {
                        if ((' ' + player.vast.skipButton.className + ' ').indexOf(' enabled ') === -1) {
                            player.vast.skipButton.className += ' enabled';
                            player.vast.skipButton.innerHTML = 'Skip';
                        }
                    }
                }
            };
        },

        vastPlugin = function (options) {
            var player = this,
                settings = extend({}, defaults, options || {});

            // check that we have the ads plugin
            if (player.ads === undefined) {
                window.console.error('vast video plugin requires videojs-contrib-ads, vast plugin not initialized');
                return null;
            }

            // set up vast plugin, then set up events here
            player.vast = new Vast(player, settings);

            player.on('vast-ready', function () {
                // vast is prepared with content, set up ads and trigger ready function
                player.trigger('adsready');
            });

            player.on('vast-preroll-ready', function () {
                // start playing pre-roll, note: this should happen this way no matter what, even if autoplay
                // has been disabled since the pre-roll function shouldn't run until the user/auto-play has
                // caused the main video to trigger this preroll function
                player.play();
            });

            player.on('vast-preroll-removed', function () {
                // pre-roll done or removed, start playing the actual video
                player.play();
            });

            player.on('contentupdate', function () {
                // videojs-ads triggers this when src changes
                player.vast.getContent(settings.url);
            });

            player.on('readyforpreroll', function () {
                // if we don't have a vast url, just bail out
                if (!settings.url) {
                    player.trigger('adscanceled');
                    return null;
                }

                // set up and start playing preroll
                player.vast.preroll();
            });

            // make an ads request immediately so we're ready when the viewer hits 'play'
            if (player.currentSrc()) {
                player.vast.getContent(settings.url);
            }

            // return player to allow this plugin to be chained
            return player;
        };

    vjs.plugin('vast', vastPlugin);
}(window, videojs, DMVAST)); // jshint ignore:line
