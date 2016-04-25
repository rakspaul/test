define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service','workflow/services/video_service'], function (angularAMD) {
    angularAMD.controller('VideoTargettingController', function ($scope, audienceService, workflowService, constants,videoService) {

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

            addAdditionalDimension : function(event) {
                $scope.additionalDimension.push({
                    key: "",
                    name: "",
                    value: "",
                    hide: false
                });


            }
        }


        $scope.showVideoPreviewData = function() {
            var videoData =  videoService.getVideoData();

            if(videoData && (videoData.videoTargets.sizes.length >0 || videoData.videoTargets.positions.length >0 || videoData.videoTargets.playbackMethods.length > 0)) {
                $scope.adData.videoPreviewData['sizes'] = _.pluck(videoData.videoTargets.sizes, 'name').join(', ');
                $scope.adData.videoPreviewData['positions'] = _.pluck(videoData.videoTargets.positions, 'name').join(', ');
                $scope.adData.videoPreviewData['playbackMethods'] = _.pluck(videoData.videoTargets.playbackMethods, 'name').join(', ');
            }
        }

        //save data in video services
        $scope.saveVideoTarget = function() {
            videoService.saveVideoData($scope.adData.videoTargets);
            $scope.showVideoPreviewData();
            _videoTargetting.hideBox();
        }


        $scope.selectOption = function(event, index, type, dimensionStatus) {

            if(event && !dimensionStatus) {
                return false;
            }

            $scope.additionalDimension[index].hide = true;


            var elem = $(event.target);
            elem.closest(".each-video-dimension").find(".multiselectTagOptions").hide() ;
            elem.closest(".each-video-dimension").find("#selectSizeDropdown").hide() ;
            if( type == "sizes" ) {
                elem.closest(".each-video-dimension").find("#selectSizeDropdown").show();
            } else {
                elem.closest(".each-video-dimension").find("#" + type + "_input_box").show() ;
            }

            if(_.indexOf($scope.selectedDimesnion, type) === -1) {
                $scope.selectedDimesnion.push(type);
                workflowService.getVideoTargetsType(type).then(function(results) {
                    if(results.status === 'success' && results.data.statusCode === 200) {
                        var data = results.data.data;
                        console.log(type+'Data')
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
                    }
                })
            }

            if($scope.selectedDimesnion.length < 3) {
                _videoTargetting.addAdditionalDimension(event);
            }

            if(event && $scope.selectedDimesnion.length <= 3) { //call this function we have selected options manually.
                _videoTargetting.removeSelectedDimension();
            }
        }

        $scope.selectSize = function(event,type) {
            var elem = $(event.target);
            if(type == "Specific Size") {
                $scope.adData.videoTargets['sizes'] =[];
                elem.closest(".each-video-dimension").find("#sizes_input_box").show() ;
            } else {
                var playerSizeList = videoService.getPlayerSize(null, type);
                _.each(playerSizeList, function(obj) {
                    obj.targetId = obj.id;
                    delete obj.id;//removing id and adding targetid as a key for creating data for save response.
                })
                $scope.adData.videoTargets['sizes'].push(playerSizeList)
                elem.closest(".each-video-dimension").find(".multiselectTagOptions").hide() ;
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

        var isVideoPreviewDataAvailable = function() {
            var videoPreviewData = $scope.adData.videoPreviewData;
            if(videoPreviewData && (videoPreviewData.sizes || videoPreviewData.positions|| videoData.playbackMethods)) {
                return true;
            }
            return false;
        }
        $scope.hideVideoTargeting = function() {
            _videoTargetting.hideBox();

            //if($scope.mode =='edit') {
            //} else {
            //    _videoTargetting.addAdditionalDimension();
            //}
            //_videoTargetting.init();

            if(!isVideoPreviewDataAvailable) {
                _videoTargetting.init();
            }
        }

        $scope.$on('triggerVideo', function () {
            _videoTargetting.showBox();
        });

        _videoTargetting.init();

        $(function() {
            _videoTargetting.addAdditionalDimension();
        })
    });
});

