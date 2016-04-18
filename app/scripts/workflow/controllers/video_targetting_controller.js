define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service'], function (angularAMD) {
  angularAMD.controller('VideoTargettingController', function ($scope, audienceService, workflowService, constants) {

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

    $scope.hideVideoTargeting = function() {
        _videoTargetting.hideBox();
    }

    $scope.$on('triggerVideo', function () {
        _videoTargetting.showBox();
    });

  });
});

