define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service','workflow/services/video_service'], function (angularAMD) {
    angularAMD.controller('VideoTargettingController', function ($scope, $timeout, audienceService, workflowService, constants,videoService) {

        $scope.additionalDimension = [];

        $scope.selectedDimesnion = [];
        $scope.tagsSize = [];
        $scope.tagsPosition = [] ;
        $scope.tagsPlayback = [] ;
        $scope.sizesLabels  = [];

        $scope.adData.videoTargets = {};

        //reseting the vedio data
        videoService.saveVideoData(null);

        $scope.adData.videoPreviewData = {};


        var _videoTargetting = {
            init : function() {

                $scope.adData.isVideoSelected = null;
                $scope.additionalDimension = [];
                $scope.selectedDimesnion = [];

                $scope.adData.videoTargets['sizes'] =[];
                $scope.adData.videoTargets['positions'] =[];
                $scope.adData.videoTargets['playbackMethods'] =[];

                $scope.dimensionArr = [
                    {key : 'sizes', 'value': 'Player Size', active : true},
                    {key : 'positions', 'value': 'Position', active : true},
                    {key : 'playback_methods', 'value': 'Playback Method', active : true}
                ];



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

            addAdditionalDimension : function(type, videoTargets, mode) {
                var name,
                    tags,
                    sizeValue ='';


                if(videoTargets && videoTargets[type]) {
                    $scope.adData.videoTargets[type] = videoTargets[type];
                }

                if(mode === 'edit') {
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
                        type : mode === 'edit' ? type : '',
                        data : videoTargets && videoTargets[type],
                        value : sizeValue || ''
                    },
                    hide: false
                });
            },


            prefillVideoData : function() {

                _videoTargetting.showBox();
                //$scope.tmpVideoTargetsData = _.extend([],$scope.adData.videoPreviewData);

                if($scope.mode =='edit') {
                    var adData, videoTargets, index;

                    var videoTargetsData = videoService.getVideoData().videoTargets;
                    if(videoTargetsData && (videoTargetsData.sizes.length >0  || videoTargetsData.positions.length >0 || videoTargetsData.playbackMethods.length >0)) {
                    } else {
                        adData = workflowService.getAdsDetails();
                        videoTargets = adData.targets.videoTargets;
                        $scope.videoTypes = [];

                        if(videoTargets) {
                            for(var i in videoTargets) {
                                if(videoTargets[i].length >0) {
                                    $scope.videoTypes.push(i);
                                }
                            };

                            _.each($scope.videoTypes, function (type, index) {
                                _videoTargetting.addAdditionalDimension(type, videoTargets, 'edit');
                                _videoTargetting.getVideoTargetsType(type, index);
                                _videoTargetting.setVideoData(videoTargets[type], type, index);
                                $scope.additionalDimension[index].hide = true;
                            })

                            if($scope.videoTypes.length < 3) {
                                _videoTargetting.removeSelectedDimension();
                                _videoTargetting.addAdditionalDimension();
                            }
                        } else {
                            _videoTargetting.init();
                            _videoTargetting.addAdditionalDimension();
                        }
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



        $scope.selectOption = function(event, dimension) {
            var type = dimension.key,
                value  = dimension.value,
                status = dimension.active;

            var dimensionElem = $(event.target).closest(".each-video-dimension")
            var index = dimensionElem.attr("data-index");

            if(event && !status) {
                return false;
            }

            $scope.selectDimension = value;

            _videoTargetting.getVideoTargetsType(type, index);

            if($scope.selectedDimesnion.length < 3) {
                _videoTargetting.addAdditionalDimension(type);
            }

            $scope.additionalDimension[index].hide = true;
            $scope.additionalDimension[index]['tags']['type'] = type;
            $scope.additionalDimension[index]['name'] = value;

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
                        obj.tags.data = null;
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
            var pos = _.findIndex($scope.adData.videoTargets[type], function(obj) {  return obj.name == tag.name});
            if(pos >0) {
                $scope.adData.videoTargets[type].splice(pos, 1);
            }

            $scope.adData.videoTargets[type].push(tag);
        };

        $scope.videoDimensionTagRemoved = function(tag, type) {
            var pos = _.findIndex($scope.adData.videoTargets[type], function(Item) { return Item.id == tag.id });
            $scope.adData.videoTargets[type].splice(pos, 1);
        };


        $scope.hideVideoTargeting = function() {
            _videoTargetting.hideBox();
            var videoTargetsData = videoService.getVideoData().videoTargets;
            if(videoTargetsData && (videoTargetsData.sizes.length >0  || videoTargetsData.positions.length >0 || videoTargetsData.playbackMethods.length >0)) {
            } else {
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

