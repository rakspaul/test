define(['angularAMD'],function (angularAMD) {
    'use strict';

    angularAMD.factory('videoService', function () {
        var positionList,
            playbackList,
            sizeList,
            videoData,

            setPlayerSize = function (data) {
                sizeList = data;
            },

            getPlayerSize = function (searchText, type) {
                if (type === 'Any') {
                    return sizeList.Any;
                }

                return sizeList['Specific Size'].filter(function (size) {
                    return size.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
                });
            },

            setPosition = function (data) {
                positionList = data;
            },

            getPositions = function (searchText) {
                return positionList.filter(function (position) {
                    return position.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
                });
            },

            setPlaybackMethods = function (data) {
                playbackList = data;
            },

            getPlaybackMethods = function (searchText) {
                return playbackList.filter(function (playback) {
                    return playback.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
                });
            },

            saveVideoData = function (data) {
                videoData = data;
            },

            getVideoData = function () {
                return {videoTarget: videoData};
            };

    	return {
            setPlayerSize:      setPlayerSize,
            getPlayerSize:      getPlayerSize,
            setPosition:        setPosition,
            setPlaybackMethods: setPlaybackMethods,
            getPositions:       getPositions,
            getPlaybackMethods: getPlaybackMethods,
            saveVideoData:      saveVideoData,
            getVideoData:       getVideoData
    	};
    });
});
