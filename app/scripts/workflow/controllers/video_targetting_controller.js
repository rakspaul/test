define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service','workflow/services/dimension_service'], function (angularAMD) {
    angularAMD.controller('VideoTargettingController', function ($scope, audienceService, workflowService, constants,videoService) {

        $scope.additionalDimension = [];

        $scope.selectedDimesnion = [];
        $scope.tagsSize = [];
        $scope.tagsPosition = [] ;
        $scope.tagsPlayback = [] ;




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
                    hide: true
                });


            }
        }

        _videoTargetting.init();

        $scope.hideVideoTargeting = function() {
            _videoTargetting.hideBox();
            _videoTargetting.init();
            if($scope.mode =='edit') {
            } else {
                _videoTargetting.addAdditionalDimension();
            }
        }

        $scope.$on('triggerVideo', function () {
            _videoTargetting.showBox();
        });




        $scope.sizesLabels  = [];
        $scope.selectOption = function(event, index, type, dimensionStatus) {

            if(event && !dimensionStatus) {
                return false;
            }

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
                    console.log("results", results);
                    console.log("index", index);
                    if(results.status === 'success' && results.data.statusCode === 200) {
                        var data = results.data.data;
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
                elem.closest(".each-video-dimension").find("#sizes_input_box").show() ;
            } else {
                elem.closest(".each-video-dimension").find(".multiselectTagOptions").hide() ;
            }
        }


        $scope.loadSize = function(query) {
            return videoService.getPlayerSize(query);
        }

        $scope.loadPositions = function(query) {
            return videoService.getPositions(query);
        }
        $scope.loadPlayback = function(query) {
            return videoService.getPlaybackMethods(query);
        }

        $(function() {
            _videoTargetting.addAdditionalDimension();
        })
    });
});

