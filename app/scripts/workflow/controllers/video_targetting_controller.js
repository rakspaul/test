define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service',
    'workflow/services/video_service'], function (angularAMD) {
    angularAMD.controller('VideoTargettingController', function ($scope, $timeout, audienceService, workflowService,
                                                                 constants, videoService) {

        var _videoTargetting = {
                init: function () {
                    $scope.adData.isVideoSelected = null;
                    $scope.additionalDimension = [];
                    $scope.selectedDimension = [];

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
                    if ($scope.selectedDimension && $scope.selectedDimension.length > 0) {
                        _.each($scope.dimensionArr, function (obj, index) {
                            if (_.indexOf($scope.selectedDimension, obj.key) !== -1) {
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
                    $scope[type + 'Data'] = data;
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

                    if (_.indexOf($scope.selectedDimension, type) === -1) {
                        $scope.selectedDimension.push(type);

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
                        tags: {
                            type: mode === 'edit' ? type : '',
                            data: videoTargets && videoTargets[type],
                            value: sizeValue || ''
                        },
                        hide: false
                    });
                },

                prefillVideoData: function () {
                    var i,
                        n;

                    _videoTargetting.showBox();

                    if ($scope.mode === 'edit') {
                        // Video Targeting is being loaded for the first time.
                        // 1) Prefill the saved data in the UI.
                        // 2) Clone the relevant data objects so that they can be restored if Cancel action is performed.
                        if (!$scope.isVideoTargetingCancelled) {
                            if ($scope.adData.videoPreviewData.sizes ||
                                $scope.adData.videoPreviewData.positions ||
                                $scope.adData.videoPreviewData.playbackMethods) {
                                adData = workflowService.getAdsDetails();
                                videoTargets = adData.targets.videoTargets;
                            }

                            $scope.videoTypes = [];

                            for (i in videoTargets) {
                                if (videoTargets[i].length > 0) {
                                    $scope.videoTypes.push(i);
                                }
                            }

                            if (videoTargets) {
                                _.each($scope.videoTypes, function (type, index) {
                                    _videoTargetting.addAdditionalDimension(type, videoTargets, 'edit');
                                    _videoTargetting.getVideoTargetsType(type, index);
                                    _videoTargetting.setVideoData(videoTargets[type], type, index);
                                    $scope.additionalDimension[index].hide = true;
                                });

                                // Discard the top half of the  $scope.additionalDimension array if Video targeting
                                // has been saved or collapsed. This is required because a duplicate set of data
                                // is created by the above 'each' loop.
                                if ($scope.isVideoTargetingCollapsed || $scope.isVideoTargetingSaved) {
                                    n = parseInt($scope.additionalDimension.length / 2, 10);
                                    $scope.additionalDimension.splice(n, n * 2);
                                    $scope.isVideoTargetingCollapsed = false;
                                    $scope.isVideoTargetingSaved = false;
                                }

                                if ($scope.videoTypes.length < 3) {
                                    _videoTargetting.removeSelectedDimension();
                                    _videoTargetting.addAdditionalDimension();
                                }
                            } else {
                                _videoTargetting.init();
                                _videoTargetting.addAdditionalDimension();
                            }

                            // Clone the relevant data objects
                            videoTargetsTemp = $.extend(true, [], videoTargets);
                            $scope.videoTypesTemp = $.extend(true, [], $scope.videoTypes);
                            $scope.videoPreviewDataTemp = $.extend(true, [], $scope.videoPreviewData);
                            $scope.additionalDimensionTemp = $.extend(true, [], $scope.additionalDimension);
                        } else {
                            // Video targeting had been loaded previously and cancelled, using Cancel button
                        }
                    }
                }
            },

            adData,
            videoTargets,
            videoTargetsTemp;

        $scope.additionalDimension = [];
        $scope.additionalDimensionTemp = [];
        $scope.videoTypesTemp = [];
        $scope.videoPreviewDataTemp = [];
        $scope.selectedDimension = [];
        $scope.tagsSize = [];
        $scope.tagsPosition = [];
        $scope.tagsPlayback = [];
        $scope.sizesLabels  = [];
        $scope.adData.videoTargets = {};
        $scope.isVideoTargetingCancelled = false;
        $scope.isVideoTargetingSaved = false;
        $scope.isVideoTargetingCollapsed = false;

        // reseting the video data
        videoService.saveVideoData(null);

        $scope.adData.videoPreviewData = {};

        // save data in video services
        $scope.saveVideoTarget = function () {
            videoService.saveVideoData($scope.adData.videoTargets);
            $scope.$parent.showVideoPreviewData($scope.adData);
            _videoTargetting.hideBox();

            // As the current Video targeting data has been saved,
            // reset the $scope.isVideoTargetingCancelled flag back to false.
            $scope.isVideoTargetingCancelled = false;
            $scope.isVideoTargetingSaved = true;
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

            if ($scope.selectedDimension.length < 3) {
                _videoTargetting.addAdditionalDimension(type);
            }

            $scope.additionalDimension[index].hide = true;
            $scope.additionalDimension[index].tags.type = type;
            $scope.additionalDimension[index].name = value;

            // call this function we have selected options manually.
            if (event && $scope.selectedDimension.length <= 3) {
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

                    /* TODO: (Lalding) commenting out the line below as it affects removing tags, but might have
                             side effects elsewhere, so I'm not deleting the line for now.
                     */
                    // removing id and adding targetid as a key for creating data for save response.
                    // delete obj.id;
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

        $scope.videoDimensionTagChanged = function (tag, type, action) {
            var index = 0,
                pos = _.findIndex($scope.adData.videoTargets[type], function (obj) {
                    return obj.id === tag.id;
                });

            if (action === 'add') {
                tag.targetId = tag.id;

                /* TODO: (Lalding) commenting out the line below as it affects removing tags, but might have
                         side effects elsewhere, so I'm not deleting the line for now.
                 */
                // removing id and adding targetid as a key for creating data for save response.
                // delete tag.id;
            }

            if (pos !==  -1) {
                $scope.adData.videoTargets[type].splice(pos, 1);
            }

            $timeout(function() {
                if (type === 'sizes') {
                    index = 0;
                } else if (type === 'positions') {
                    index = 2;
                } else if (type === 'playbackMethods') {
                    index = 4;
                }

                $($('#' + type + 'InputBox .input')[index]).trigger('blur').trigger('keydown').trigger('focus');
            }, 0);

            if (action === 'add') {
                $scope.adData.videoTargets[type].push(tag);
            }
        };

        $scope.hideVideoTargeting = function (action) {
            _videoTargetting.hideBox();

            if (action === 'hide') {
                $scope.isVideoTargetingCancelled = false;
                $scope.isVideoTargetingCollapsed = true;
                return;
            }

            // Video targeting is cancelled using Cancel button.
            // Clone back the relevant data objects to their original state when first loaded.
            $scope.isVideoTargetingCancelled = true;
            videoTargets = $.extend(true, [], videoTargetsTemp);
            $scope.videoTypes = $.extend(true, [], $scope.videoTypesTemp);
            $scope.videoPreviewData = $.extend(true, [], $scope.videoPreviewDataTemp);
            $scope.additionalDimension = $.extend(true, [], $scope.additionalDimensionTemp);
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
