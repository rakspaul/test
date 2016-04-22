define(['angularAMD'],function (angularAMD) {
    'use strict';
    angularAMD.factory('videoService', function() {

        var positionList,
            playbackList,
            sizeList;

        var setPlayerSize = function(data) {
            sizeList = data;
        }

        var getPlayerSize = function(searchText) {
            var sizeArr = sizeList['Specific Size'];
            console.log("sizeArr", sizeArr);
            return sizeArr.filter(function(size) {
                return size.name.toLowerCase().indexOf(searchText.toLowerCase()) != -1;
            });
        }

        var setPosition = function(data) {
            positionList = data;
        }

        var getPositions = function(searchText) {
            var posArr = positionList;
            return posArr.filter(function(position) {
                return position.name.toLowerCase().indexOf(searchText.toLowerCase()) != -1;
            });
        }

        var setPlaybackMethods = function(data) {
            playbackList = data;
        }

        var getPlaybackMethods = function(searchText) {
            var playbackArr = playbackList ;
            return playbackArr.filter(function(playback) {
                return playback.name.toLowerCase().indexOf(searchText.toLowerCase()) != -1;
            });
        }

    	return {
            setPlayerSize : setPlayerSize,
            getPlayerSize  : getPlayerSize,
            setPosition : setPosition,
            setPlaybackMethods : setPlaybackMethods,
            getPositions      : getPositions    ,
            getPlaybackMethods      : getPlaybackMethods
    	}
    })
})
