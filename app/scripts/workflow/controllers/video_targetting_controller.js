define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service',
    'workflow/services/video_service'], function (angularAMD) {
    angularAMD.controller('VideoTargettingController', function ($scope, $timeout, audienceService, workflowService,
                                                                 constants, videoService) {

        var _videoTargetting = {
            init: function () {
                $scope.adData.isVideoSelected = null;
                $scope.additionalDimension = [];
                $scope.selectedDimesnion = [];

                $scope.adData.videoTargets.sizes = [];
                $scope.adData.videoTargets.positions = [];
                $scope.adData.videoTargets.playbackMethods = [];

                $scope.dimensionArr = [
                    {key: 'sizes',            value: 'Player Size',     active: true},
                    {key: 'positions',        value: 'Position',        active: true},
                    {key: 'playback_methods', value: 'Playback Method', active: true}
                ];
            },

            showBox: function () {
                $('#videoTargeting').show().animate({marginLeft: '0', left: '0', opacity: '1'}, 800);
            },

            hideBox: function () {
                $('#videoTargeting').animate({marginLeft: '0', left: '1000px', opacity: '0'}, function () {
                    $(this).hide();
                });
            },

            removeSelectedDimension: function () {
                if ($scope.selectedDimesnion && $scope.selectedDimesnion.length > 0) {
                    _.each($scope.dimensionArr, function (obj, index) {
                        if (_.indexOf($scope.selectedDimesnion, obj.key) !== -1) {
                            $scope.dimensionArr[index].active = false;
                        }
                    });
                }
            },

            isVideoPreviewDataAvailable: function () {
                var videoPreviewData = $scope.adData.videoPreviewData;

                if (videoPreviewData &&
                    (videoPreviewData.sizes || videoPreviewData.positions || videoData.playbackMethods)) {
                    return true;
                }

                return false;
            },

            setVideoData: function (data, type, index) {
                $scope[type+'Data'] = data;
                switch (type) {
                    case 'sizes':
                        $scope.sizesLabels[index] = _.keys(data);
                        videoService.setPlayerSize(data);
                        break;

                    case 'positions':
                        videoService.setPosition(data);
                        break;

                    case 'playback_methods':
                        videoService.setPlaybackMethods(data);
                        break;
                }
            },

            getVideoTargetsType: function (type, index) {
                if (type === 'playbackMethods') {
                    type = 'playback_methods';
                }

                if (_.indexOf($scope.selectedDimesnion, type) === -1) {
                    $scope.selectedDimesnion.push(type);

                    workflowService
                        .getVideoTargetsType(type)
                        .then(function (results) {
                            var data;

                            if (results.status === 'success' && results.data.statusCode === 200) {
                                data = results.data.data;
                                _videoTargetting.setVideoData(data, type, index);
                            }
                        });
                }
            },

            addAdditionalDimension: function (type, videoTargets, mode) {
                var name,
                    sizeValue = '',
                    sizeNameList;

                if (videoTargets && videoTargets[type]) {
                    $scope.adData.videoTargets[type] = videoTargets[type];
                }

                if (mode === 'edit') {
                    switch (type) {
                        case 'sizes':
                            name = 'Player Size';

                            if (videoTargets && videoTargets.sizes.length > 0) {
                                if (videoTargets.sizes.length > 1) {
                                    sizeValue = 'Specific Size';
                                } else {
                                    sizeNameList = _.pluck(videoTargets.sizes, 'name');

                                    if (sizeNameList.length > 0 && sizeNameList[0] === 'Any') {
                                        sizeValue = 'Any';
                                    } else {
                                        sizeValue = 'Specific Size';
                                    }
                                }
                            }

                            break;

                        case 'positions':
                            name = 'Position';
                            break;

                        case 'playbackMethods':
                            name = 'Playback Method';
                            break;
                    }
                }

                $scope.additionalDimension.push({
                    name: name || '',
                    tags:  {
                        type: mode === 'edit' ? type : '',
                        data: videoTargets && videoTargets[type],
                        value: sizeValue || ''
                    },
                    hide: false
                });
            },

            prefillVideoData: function () {
                _videoTargetting.showBox();

                // $scope.tmpVideoTargetsData = _.extend([], $scope.adData.videoPreviewData);

                if ($scope.mode === 'edit') {
                    var adData,
                        videoTargets,
                        videoTargetsData = videoService.getVideoData().videoTargets,
                        i;

                    if (videoTargetsData && (videoTargetsData.sizes.length > 0  ||
                        videoTargetsData.positions.length > 0 ||
                        videoTargetsData.playbackMethods.length > 0)) {
                        // TODO: (Lalding) Please write inverse condition to avoid having blank if block
                    } else {
                        if ($scope.adData.videoPreviewData.sizes ||
                            $scope.adData.videoPreviewData.positions ||
                            $scope.adData.videoPreviewData.playbackMethods) {
                            adData = workflowService.getAdsDetails();
                            videoTargets = adData.targets.videoTargets;
                        }

                        $scope.videoTypes = [];

                        if (videoTargets) {
                            for (i in videoTargets) {
                                if (videoTargets[i].length > 0) {
                                    $scope.videoTypes.push(i);
                                }
                            }

                            _.each($scope.videoTypes, function (type, index) {
                                _videoTargetting.addAdditionalDimension(type, videoTargets, 'edit');
                                _videoTargetting.getVideoTargetsType(type, index);
                                _videoTargetting.setVideoData(videoTargets[type], type, index);
                                $scope.additionalDimension[index].hide = true;
                            });

                            if ($scope.videoTypes.length < 3) {
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
        };

        $scope.additionalDimension = [];
        $scope.selectedDimesnion = [];
        $scope.tagsSize = [];
        $scope.tagsPosition = [];
        $scope.tagsPlayback = [];
        $scope.sizesLabels  = [];
        $scope.adData.videoTargets = {};

        // reseting the video data
        videoService.saveVideoData(null);

        $scope.adData.videoPreviewData = {};

        // save data in video services
        $scope.saveVideoTarget = function () {
            videoService.saveVideoData($scope.adData.videoTargets);
            $scope.$parent.showVideoPreviewData($scope.adData);
            _videoTargetting.hideBox();
        };

        $scope.selectOption = function (event, dimension) {
            var type = dimension.key,
                value  = dimension.value,
                status = dimension.active,
                dimensionElem = $(event.target).closest('.each-video-dimension'),
                index = dimensionElem.attr('data-index');

            if (event && !status) {
                event.stopImmediatePropagation();
                return false;
            }

            $scope.selectDimension = value;

            _videoTargetting.getVideoTargetsType(type, index);

            if ($scope.selectedDimesnion.length < 3) {
                _videoTargetting.addAdditionalDimension(type);
            }

            $scope.additionalDimension[index].hide = true;
            $scope.additionalDimension[index].tags.type = type;
            $scope.additionalDimension[index].name = value;

            // call this function we have selected options manually.
            if (event && $scope.selectedDimesnion.length <= 3) {
                _videoTargetting.removeSelectedDimension();
            }
        };

        $scope.selectSize = function (event, type) {
            var playerSizeList;

            $scope.adData.videoTargets.sizes = [];

            if (type === 'Specific Size') {
                _.each($scope.additionalDimension, function (obj) {
                    if (obj.tags.type === 'sizes') {
                        obj.tags.value = 'Specific Size';
                        obj.tags.data = null;
                    }
                });
            } else {
                _.each($scope.additionalDimension, function (obj) {
                    if (obj.tags.type === 'sizes') {
                        obj.tags.data = null;
                        obj.tags.value = 'Any';
                    }
                });
                playerSizeList = videoService.getPlayerSize(null, type);

                _.each(playerSizeList, function (obj) {
                    obj.targetId = obj.id;

                    // removing id and adding targetid as a key for creating data for save response.
                    delete obj.id;
                });

                $scope.adData.videoTargets.sizes.push(playerSizeList[0]);
            }
        };

        $scope.loadSizes = function (query) {
            return videoService.getPlayerSize(query);
        };

        $scope.loadPositions = function (query) {
            return videoService.getPositions(query);
        };

        $scope.loadPlaybacks = function (query) {
            return videoService.getPlaybackMethods(query);
        };

        $scope.videoDimensionTagAdded = function (tag, type) {
            var pos = _.findIndex($scope.adData.videoTargets[type], function (obj) {
                return obj.id === tag.id;
            });

            //tag.targetId = tag.id;

            // removing id and adding targetid as a key for creating data for save response.
            //delete tag.id;

            if (pos !==  -1) {
                $scope.adData.videoTargets[type].splice(pos, 1);
            }

            $timeout(function() {
                $('#' + type + 'InputBox').find('.input').trigger('blur').trigger('keydown');
            }, 0);

            $scope.adData.videoTargets[type].push(tag);
        };

        $scope.videoDimensionTagRemoved = function (tag, type) {
            var pos = _.findIndex($scope.adData.videoTargets[type], function (Item) {
                return Item.id === tag.id;
            });

            if (pos !== -1 ) {
                $scope.adData.videoTargets[type].splice(pos, 1);
            }
console.log('Tag deleted, ', $('#' + type + 'InputBox').find('.input'))
            $timeout(function() {
                $('#' + type + 'InputBox').find('.input').trigger('blur').trigger('keydown');
            }, 0);
        };

        $scope.hideVideoTargeting = function () {
            var videoTargetsData = videoService.getVideoData().videoTargets;

            _videoTargetting.hideBox();

            if (videoTargetsData && (videoTargetsData.sizes.length > 0 ||
                videoTargetsData.positions.length > 0 ||
                videoTargetsData.playbackMethods.length > 0)) {
                // TODO: (Lalding) Please write inverse condition to avoid having blank if block
            } else {
                _videoTargetting.init();
                _videoTargetting.addAdditionalDimension();
            }
        };

        $scope.$on('triggerVideo', function () {
            _videoTargetting.prefillVideoData();
        });

        _videoTargetting.init();

        $(function () {
            if ($scope.mode === 'create') {
                _videoTargetting.addAdditionalDimension();
            }
        });
    });
});
