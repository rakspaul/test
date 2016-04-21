define(['angularAMD'],function (angularAMD) {
    'use strict';
    angularAMD.factory('dimensionService', function() {

		var sizeArrayList =          
		[
		    { "name": "Large"              },
		    { "name": "Medium"             },
		    { "name": "Small"              },
		    { "name": "No width indicated" }

		] ;
		var positionArrayList =          
		[
		    { "name": "Pre-roll"                 },
		    { "name": "Mid-roll"                 },
		    { "name": "Post-roll"                },
		    { "name": "No roll position defined" },
		    { "name": "Outstream"                }
		]
		var playbackArrayList =          
		[
		    { "name": "Auto-play, sound on"         },
		    { "name": "Auto-play, sound off"        },
		    { "name": "Auto-play, sound unknown"    },
		    { "name": "Click-to-play"               },
		    { "name": "Mouse-over"                  },
		    { "name": "No playback method provided" }
		]


		var sizes = function(searchText) {
			var sizeArr = sizeArrayList;
		      return sizeArr.filter(function(size) {
		        return size.name.toLowerCase().indexOf(searchText.toLowerCase()) != -1;
		      });
		}
		var positions = function(searchText) {
			var posArr = positionArrayList;
		      return posArr.filter(function(position) {
		        return position.name.toLowerCase().indexOf(searchText.toLowerCase()) != -1;
		      });
		}
		var playbackList = function(searchText) {
			var playbackArr = playbackArrayList ;
		      return playbackArr.filter(function(playback) {
		        return playback.name.toLowerCase().indexOf(searchText.toLowerCase()) != -1;
		      });
		}
    	return {
			specificSizeOption  : sizes        ,
			positionOption      : positions    ,
			playbackOption      : playbackList
    	}
    })
})
