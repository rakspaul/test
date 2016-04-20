define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service','workflow/services/dimension_service'], function (angularAMD) {
    angularAMD.controller('VideoTargettingController', function ($scope, audienceService, workflowService, constants,dimensionService) {

        $scope.additionalDimension = [];


        var _videoTargetting = {
            showBox : function() {
                $("#videoTargeting").show().animate({ marginLeft: "0px", left: "0px", opacity: "1"}, 800 );
            },

            hideBox : function() {
                $("#videoTargeting").animate({ marginLeft: "0px", left: "1000px", opacity: "0"},function () {
                    $(this).hide();
                } );
            }
        }

        $scope.selectedDimesnion = [];

        $scope.dimensionArr = [];
        $scope.dimensionArr.push({key : 'player', 'value': 'Player Size', active : true});
        $scope.dimensionArr.push({key : 'position', 'value': 'Position', active : true});
        $scope.dimensionArr.push({key : 'playback', 'value': 'Playback Method', active : true});

        var removeSelectedDimension = function() {
            if($scope.selectedDimesnion && $scope.selectedDimesnion.length >0) {
                _.each($scope.dimensionArr, function(obj, index) {
                    if(_.indexOf($scope.selectedDimesnion, obj.key) !== -1) {
                        $scope.dimensionArr[index].active = false;
                    }
                })
            }
        }

        $scope.addAdditionalDimension = function(event) {
            $scope.additionalDimension.push({
                key: "",
                name: "",
                value: "",
                hide: true
            });

            if(event) {
                removeSelectedDimension();
            }
            if( $scope.additionalDimension.length == 3 ) {
                $(".video-dimension").find(".clickable-txt").hide();
            }
        }


        $scope.hideVideoTargeting = function() {
            _videoTargetting.hideBox();
        }

        $scope.$on('triggerVideo', function () {
            _videoTargetting.showBox();
        });

        $scope.selectOption = function(event,type, dimensionStatus) {

            if(!dimensionStatus) {
                event.stopImmediatePropagation();
            }

            var elem = $(event.target);
            elem.closest(".each-video-dimension").find(".multiselectTagOptions").hide() ;
            elem.closest(".each-video-dimension").find("#selectSizeDropdown").hide() ;
            if( type == "player" ) {
                elem.closest(".each-video-dimension").find("#selectSizeDropdown").show();
            } else {
                elem.closest(".each-video-dimension").find("#" + type + "InputBox").show() ;
            }
            if(_.indexOf($scope.selectedDimesnion, type) === -1) {
                $scope.selectedDimesnion.push(type);
            }

            if( $scope.additionalDimension.length == 3 ) {
                removeSelectedDimension();
            }
        }

        $scope.selectSize = function(event,type) {
            var elem = $(event.target);
            if(type == "specific") {
                elem.closest(".each-video-dimension").find("#playerInputBox").show() ;
            } else {
                elem.closest(".each-video-dimension").find(".multiselectTagOptions").hide() ;
            }
        }

        $scope.tagsSize = [];
        $scope.tagsPosition = [] ;
        $scope.tagsPlayback = [] ;

        $scope.loadSize = function(query) {
            return dimensionService.specificSizeOption(query);
        }

        $scope.loadPositions = function(query) {
            return dimensionService.positionOption(query);
        }
        $scope.loadPlayback = function(query) {
            return dimensionService.playbackOption(query);
        }
    });
});
