define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service','workflow/services/video_service'], function (angularAMD) {
    angularAMD.controller('VideoTargettingController', function ($scope, $timeout, audienceService, workflowService, constants,videoService) {

        $scope.additionalDimension = [];

        $scope.selectedDimesnion = [];
        $scope.tagsSize = [];
        $scope.tagsPosition = [] ;
        $scope.tagsPlayback = [] ;
        $scope.sizesLabels  = [];


        $scope.adData.videoTargets = {};
        $scope.adData.videoTargets['sizes'] =[];
        $scope.adData.videoTargets['positions'] =[];
        $scope.adData.videoTargets['playbackMethods'] =[];

        videoService.saveVideoData(null);

        $scope.adData.videoPreviewData = {};

        var _videoTargetting = {
            init : function() {
                $scope.adData.isVideoSelected = null;
                $scope.additionalDimension = [];
                $scope.selectedDimesnion = [];
                $scope.dimensionArr = [];
                $scope.dimensionArr.push({key : 'sizes', 'value': 'Player Size', active : true});
                $scope.dimensionArr.push({key : 'positions', 'value': 'Position', active : true});
                $scope.dimensionArr.push({key : 'playback_methods', 'value': 'Playback Method', active : true});
            },

            showBox : function() {
                $("#videoTargeting").show().animate({ marginLeft: "0px", left: "0px", opacity: "1"}, 800 );
            },

            hideBox : function() {
                $("#videoTargeting").animate({ marginLeft: "0px", left: "1000px", opacity: "0"},function () {
                    $(this).hide();
                } );
            },

            removeSelectedDimension : function() {
                if ($scope.selectedDimesnion && $scope.selectedDimesnion.length > 0) {
                    _.each($scope.dimensionArr, function (obj, index) {
                        if (_.indexOf($scope.selectedDimesnion, obj.key) !== -1) {
                            $scope.dimensionArr[index].active = false;
                        }
                    })
                }
            },

            isVideoPreviewDataAvailable : function() {
                var videoPreviewData = $scope.adData.videoPreviewData;
                if(videoPreviewData && (videoPreviewData.sizes || videoPreviewData.positions|| videoData.playbackMethods)) {
                    return true;
                }
                return false;
            },

            setVideoData : function(data, type, index) {
                $scope[type+'Data'] = data;
                switch (type) {
                    case "sizes" :
                        $scope.sizesLabels[index] = _.keys(data);
                        videoService.setPlayerSize(data);
                        break;

                    case "positions" :
                        videoService.setPosition(data);
                        break;

                    case "playback_methods" :
                        videoService.setPlaybackMethods(data);
                        break;
                }
            },

            getVideoTargetsType : function(type, index) {
                if(type === 'playbackMethods') {
                    type ='playback_methods'
                }
                if(_.indexOf($scope.selectedDimesnion, type) === -1) {
                    $scope.selectedDimesnion.push(type);
                    workflowService.getVideoTargetsType(type).then(function(results) {
                        if(results.status === 'success' && results.data.statusCode === 200) {
                            var data = results.data.data;
                            _videoTargetting.setVideoData(data, type, index);
                        }
                    })
                }
            },

            addAdditionalDimension : function(type, videoTargets) {
                var name,
                    tags,
                    sizeValue ='';


                if(videoTargets && videoTargets[type]) {
                    $scope.adData.videoTargets[type] = videoTargets[type];
                }

                if($scope.mode === 'edit') {
                    switch (type) {
                        case 'sizes' :
                            name = 'Player Size';
                            if (videoTargets && videoTargets.sizes.length > 0) {
                                sizeValue = videoTargets.sizes.length > 1 ? 'Specific Size' : 'Any';
                            }

                            break;

                        case 'positions' :
                            name = 'Position';
                            break;


                        case 'playbackMethods' :
                            name = 'Playback Method';
                            break;

                    }
                }

                $scope.additionalDimension.push({
                    name: name || "",
                    tags :  {
                        type : $scope.mode === 'edit' ? type : '',
                        data : videoTargets && videoTargets[type],
                        value : sizeValue || ''
                    },
                    hide: false
                });
            },

            prefillVideoData : function() {
                _videoTargetting.showBox();
                if($scope.mode =='edit') {
                    var adData = workflowService.getAdsDetails();
                    var videoTargets = adData.targets.videoTargets;
                    var index;
                    if(videoTargets) {
                        //for(var i in videoTargets) {
                        //    if(videoTargets[i].length >0) {
                        //        $scope.videoTypes.push(i);
                        //    }
                        //};
                        $scope.videoTypes = _.keys(videoTargets);
                        _.each($scope.videoTypes, function (type, index) {
                            _videoTargetting.addAdditionalDimension(type, videoTargets);
                            _videoTargetting.getVideoTargetsType(type, index);
                            _videoTargetting.setVideoData(videoTargets[type], type, index);
                            $scope.additionalDimension[index].hide = true;
                        })
                    }
                }
            }
        }

        //save data in video services
        $scope.saveVideoTarget = function() {
            videoService.saveVideoData($scope.adData.videoTargets);
            $scope.$parent.showVideoPreviewData($scope.adData);
            _videoTargetting.hideBox();
        }



        $scope.selectOption = function(event, index, dimension) {
            var type = dimension.key,
                value  = dimension.value,
                status = dimension.active;


            if(event && !status) {
                return false;
            }

            $scope.selectDimension = value;
            $scope.additionalDimension[index].hide = true;
            $scope.additionalDimension[index]['tags']['type'] = type;

            _videoTargetting.getVideoTargetsType(type, index);

            if($scope.selectedDimesnion.length < 3) {
                _videoTargetting.addAdditionalDimension(type);
            }

            if(event && $scope.selectedDimesnion.length <= 3) { //call this function we have selected options manually.
                _videoTargetting.removeSelectedDimension();
            }
        }

        $scope.selectSize = function(event, type) {
            if(type == "Specific Size") {
                $scope.adData.videoTargets['sizes'] =[];
                _.each($scope.additionalDimension, function(obj, index) {
                    if(obj.tags.type === 'sizes') {
                        obj.tags.value = 'Specific Size';
                    }
                })
            } else {
                _.each($scope.additionalDimension, function(obj, index) {
                    if(obj.tags.type === 'sizes') {
                        obj.tags.data = null;
                        obj.tags.value = 'Any';
                    }
                })
                var playerSizeList = videoService.getPlayerSize(null, type);
                _.each(playerSizeList, function(obj) {
                    obj.targetId = obj.id;
                    delete obj.id;//removing id and adding targetid as a key for creating data for save response.
                })
                $scope.adData.videoTargets['sizes'].push(playerSizeList[0])
            }
        }


        $scope.loadSizes = function(query) {
            return videoService.getPlayerSize(query);
        }

        $scope.loadPositions = function(query) {
            return videoService.getPositions(query);
        }
        $scope.loadPlaybacks = function(query) {
            return videoService.getPlaybackMethods(query);
        }


        $scope.videoDimensionTagAdded = function(tag, type) {
            tag.targetId = tag.id;
            delete tag.id; //removing id and adding targetid as a key for creating data for save response.
            $scope.adData.videoTargets[type].push(tag);
        };

        $scope.videoDimensionTagRemoved = function(tag, type) {
            var pos = _.findIndex($scope.adData.videoTargets[type], function(Item) { return Item.id == tag.id });
            $scope.adData.videoTargets[type].splice(pos, 1);
        };


        $scope.hideVideoTargeting = function() {
            _videoTargetting.hideBox();
            if(!_videoTargetting.isVideoPreviewDataAvailable()) {
                _videoTargetting.init();
            }
        }

        $scope.$on('triggerVideo', function () {
            _videoTargetting.prefillVideoData();
        });

        _videoTargetting.init();

        $(function() {
            if($scope.mode === 'create') {
                _videoTargetting.addAdditionalDimension();
            }
        })
    });
});

