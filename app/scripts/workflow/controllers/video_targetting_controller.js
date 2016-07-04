define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service', // jshint ignore:line
    'workflow/services/video_service'], function (angularAMD) {
    angularAMD.controller('VideoTargettingController', function ($scope, $timeout, audienceService, workflowService,
                                                                 constants, videoService) {
        var _videoTargeting = {
                init: function () {
                    $scope.isVideoTargetingCancelled = false;
                    $scope.isVideoTargetingSaved = false;
                    $scope.isVideoTargetingDeleted = false;
                    $scope.isVideoTargetingCollapsed = false;
                    $scope.adData.isVideoSelected = null;

                    $scope.selectedDimension = [];
                    $scope.additionalDimension = [];
                    $scope.videoTypes = [];
                    $scope.videoPreviewData = [];
                    $scope.adData.videoPreviewData = {};

                    $scope.tagsSize = [];
                    $scope.tagsPosition = [];
                    $scope.tagsPlayback = [];
                    $scope.sizesLabels  = [];

                    $scope.adData.videoTargets = {
                        sizes: [],
                        positions: [],
                        playbackMethods: []
                    };

                    $scope.dimensionArr = [
                        {key: 'sizes',            value: 'Player Size',     active: true},
                        {key: 'positions',        value: 'Position',        active: true},
                        {key: 'playback_methods', value: 'Playback Method', active: true}
                    ];
                    dimensionArrTemp = $.extend(true, [], $scope.dimensionArr);
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
                        _.each($scope.dimensionArr, function (obj, index) { // jshint ignore:line
                            if (_.indexOf($scope.selectedDimension, obj.key) !== -1) { // jshint ignore:line
                                $scope.dimensionArr[index].active = false;
                            }
                        });
                    }
                },

                isVideoPreviewDataAvailable: function () {
                    var videoPreviewData = $scope.adData.videoPreviewData;

                    if (videoPreviewData &&
                        (videoPreviewData.sizes ||
                            videoPreviewData.positions ||
                            videoData.playbackMethods // jshint ignore:line
                        )) {
                        return true;
                    }

                    return false;
                },

                setVideoData: function (data, type, index) {
                    $scope[type + 'Data'] = data;

                    switch (type) {
                        case 'sizes':
                            $scope.sizesLabels[index] = _.keys(data); // jshint ignore:line
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

                    if ($scope.isVideoTargetingSaved) {
                        $scope.selectedDimension = [];
                        selectedDimensionTemp.push(type);
                    }

                    if (_.indexOf($scope.selectedDimension, type) === -1) { // jshint ignore:line
                        $scope.selectedDimension.push(type);

                        workflowService
                            .getVideoTargetsType(type)
                            .then(function (results) {
                                var data;

                                if (results.status === 'success' && results.data.statusCode === 200) {
                                    data = results.data.data;
                                    _videoTargeting.setVideoData(data, type, index);
                                }
                            });
                    }

                    if ($scope.isVideoTargetingSaved) {
                        $scope.selectedDimension = $.extend(true, [], selectedDimensionTemp);
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
                                        sizeNameList = _.pluck(videoTargets.sizes, 'name'); // jshint ignore:line

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

                    _videoTargeting.showBox();

                    if (_.isEmpty($scope.adData.videoPreviewData)) { // jshint ignore:line
                        $scope.adData.additionalDimension = [];
                        $scope.adData.videoTargets = {};
                        $scope.additionalDimension = [];
                        videoTargets = null;
                    }

                    if (!$scope.isVideoTargetingCancelled) {
                        if ($scope.adData.videoPreviewData.sizes ||
                            $scope.adData.videoPreviewData.positions ||
                            $scope.adData.videoPreviewData.playbackMethods) {
                            if ($scope.isVideoTargetingSaved) {
                                videoTargets = $scope.adData.videoTargets;
                            } else {
                                adData = workflowService.getAdsDetails();
                                videoTargets = adData.targets.videoTargets;
                            }
                        }

                        $scope.videoTypes = [];

                        for (i in videoTargets) {
                            if (videoTargets[i].length > 0) {
                                $scope.videoTypes.push(i);
                            }
                        }

                        if (videoTargets) {
                            _.each($scope.videoTypes, function (type, index) { // jshint ignore:line
                                _videoTargeting.addAdditionalDimension(type, videoTargets, 'edit');
                                _videoTargeting.getVideoTargetsType(type, index);
                                _videoTargeting.setVideoData(videoTargets[type], type, index);
                                $scope.additionalDimension[index].hide = true;
                            });

                            // Discard the top half of the  $scope.additionalDimension array if Video targeting
                            // has been saved or collapsed. This is required because a duplicate set of data
                            // is created by the above 'each' loop.
                            if ($scope.isVideoTargetingCollapsed || $scope.isVideoTargetingSaved) {
                                n = parseInt($scope.additionalDimension.length / 2, 10);
                                $scope.additionalDimension.splice(n, n * 2);
                                $scope.isVideoTargetingCollapsed = false;
                            }

                            if ($scope.videoTypes.length < 3) {
                                if (!$scope.isVideoTargetingSaved) {
                                    _videoTargeting.removeSelectedDimension();
                                }
                                _videoTargeting.addAdditionalDimension();
                            }

                            if ($scope.isVideoTargetingSaved) {
                                $scope.isVideoTargetingSaved = false;
                            }
                        } else {
                            _videoTargeting.init();
                            _videoTargeting.addAdditionalDimension();
                        }

                        // Clone the relevant data objects
                        videoTargetsTemp = $.extend(true, {}, videoTargets);
                        videoTypesTemp = $.extend(true, [], $scope.videoTypes);
                        videoPreviewDataTemp = $.extend(true, [], $scope.videoPreviewData);
                        additionalDimensionTemp = $.extend(true, [], $scope.additionalDimension);
                        dimensionArrTemp = $.extend(true, [], $scope.dimensionArr);
                    } else {
                        // Video targeting had been loaded previously and cancelled, using Cancel button
                        if (!videoTargets) {
                            _videoTargeting.init();
                            _videoTargeting.addAdditionalDimension();
                        }

                        selectedDimensionTemp = $.extend(true, [], $scope.selectedDimension);
                    }

                    // This is to ensure there's no duplicate entries under any circumstances
                    $scope.selectedDimension = _.unique($scope.selectedDimension); // jshint ignore:line
                }
            },

            adData,
            videoTargets,
            videoTargetsTemp,
            selectedDimensionTemp = [],
            additionalDimensionTemp = [],
            videoTypesTemp = [],
            videoPreviewDataTemp = [],
            dimensionArrTemp = [];

        // resetting the video data
        videoService.saveVideoData(null);

        // save data in video services
        $scope.saveVideoTarget = function () {
            var i,
                dimensionName = [],
                n,
                tempArr = [];

            videoService.saveVideoData($scope.adData.videoTargets);
            $scope.$parent.showVideoPreviewData($scope.adData);

            _videoTargeting.hideBox();

            // As the current Video targeting data has been saved,
            // reset the $scope.isVideoTargetingCancelled flag back to false.
            $scope.isVideoTargetingCancelled = false;
            $scope.isVideoTargetingSaved = true;

            // Extract only the video targeting options with data
            if ($scope.adData.videoTargets.sizes.length > 0) {
                dimensionName.push('Player Size');
            }

            if ($scope.adData.videoTargets.positions.length > 0) {
                dimensionName.push('Position');
            }

            if ($scope.adData.videoTargets.playbackMethods.length > 0) {
                dimensionName.push('Playback Method');
            }

            tempArr = $.extend(true, [], $scope.additionalDimension);
            n = $scope.additionalDimension.length;

            for (i = 0; i < n; i++) {
                if ($scope.additionalDimension[i].tags.data === undefined ||
                    ($scope.additionalDimension[i].tags.data && $scope.additionalDimension[i].tags.data.length === 0)) {
                    if ($scope.additionalDimension[i].name) {
                        $scope.additionalDimension.splice(i--, 1);
                        n--;
                    }
                }
            }

            for (i = 0; i < $scope.dimensionArr.length; i++) {
                if (dimensionName.indexOf($scope.dimensionArr[i].value) > -1) {
                    $scope.dimensionArr[i].active = false;
                } else {
                    $scope.dimensionArr[i].active = true;
                }
            }
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

            _videoTargeting.getVideoTargetsType(type, index);

            if ($scope.selectedDimension.length < 3) {
                _videoTargeting.addAdditionalDimension(type);
            }

            $scope.additionalDimension[index].hide = true;
            $scope.additionalDimension[index].tags.type = type;
            $scope.additionalDimension[index].name = value;

            // call this function we have selected options manually.
            if (event && $scope.selectedDimension.length <= 3) {
                _videoTargeting.removeSelectedDimension();
            }

            // Close the dropdown manually as default action has been prevented
            $('.dropdown.dimension-type .dropdown-toggle').dropdown('toggle');
        };

        $scope.selectSize = function (event, type) {
            var playerSizeList;

            $scope.adData.videoTargets.sizes = [];

            if (type === 'Specific Size') {
                _.each($scope.additionalDimension, function (obj) { // jshint ignore:line
                    if (obj.tags.type === 'sizes') {
                        obj.tags.value = 'Specific Size';
                        obj.tags.data = null;
                    }
                });
            } else {
                _.each($scope.additionalDimension, function (obj) { // jshint ignore:line
                    if (obj.tags.type === 'sizes') {
                        obj.tags.value = 'Any';
                        obj.tags.data = null;
                    }
                });

                playerSizeList = videoService.getPlayerSize(null, type);
                _.each(playerSizeList, function (obj) { // jshint ignore:line
                    obj.targetId = obj.id;
                });

                $scope.adData.videoTargets.sizes.push(playerSizeList[0]);
            }

            // Close the dropdown manually as default action has been prevented
            $('#selectSizeDropdown').find('.dropdown-toggle').dropdown('toggle');
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
                pos = _.findIndex($scope.adData.videoTargets[type], function (obj) { // jshint ignore:line
                    return obj.id === tag.id;
                });

            if (action === 'add') {
                tag.targetId = tag.id;
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

        $scope.hideVideoTargeting = function () {
            _videoTargeting.hideBox();

            // Clone back the relevant data objects to their original state when first loaded.
            $scope.isVideoTargetingCancelled = true;
            videoTargets = $.extend(true, {}, videoTargetsTemp);
            $scope.videoTypes = $.extend(true, [], videoTypesTemp);
            $scope.videoPreviewData = $.extend(true, [], videoPreviewDataTemp);
            $scope.additionalDimension = $.extend(true, [], additionalDimensionTemp);
            $scope.dimensionArr = $.extend(true, [], dimensionArrTemp);
            $scope.selectedDimension = $.extend(true, [], selectedDimensionTemp);
        };

        $scope.$on('triggerVideo', function () {
            _videoTargeting.prefillVideoData();
        });

        $scope.$on('videoTargetingDeleted', function () {
            $scope.isVideoTargetingDeleted = true;
        });

        _videoTargeting.init();
    });
});
