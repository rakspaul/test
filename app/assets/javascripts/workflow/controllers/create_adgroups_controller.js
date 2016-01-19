angObj.controller('CreateAdGroupsController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location, momentService) {
    $scope.handleFlightDate = function (data) {
        var startTime = data;
        var endDateElem = $('#adGrpEndDateInput');
        var campaignEndTime = momentService.utcToLocalTime($scope.$parent.workflowData['campaignData'].endTime);
        //console.log(campaignEndTime);
        var changeDate;
        endDateElem.attr("disabled", "disabled").css({'background': '#eee'});
        if (startTime) {
            endDateElem.removeAttr("disabled").css({'background': 'transparent'});
            changeDate = moment(startTime).format(constants.DATE_US_FORMAT)
            endDateElem.datepicker("setStartDate", changeDate);
            endDateElem.datepicker("setEndDate", campaignEndTime);
            endDateElem.datepicker("update", changeDate);
        }
    }

    $scope.createAdGroup = function (createNewAdGrp) {
        $scope.$broadcast('show-errors-check-validity');
        if (createNewAdGrp.$valid){
            var formElem = $("#createNewAdGrp");
            var formData = formElem.serializeArray();
            formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
            var postCreateAdObj = {}; //console.log(formData);
            postCreateAdObj.name = formData.adGroupName;
            postCreateAdObj.startTime = momentService.localTimeToUTC(formData.startTime,'startTime');//console.log(postCreateAdObj.startTime);
            postCreateAdObj.endTime = momentService.localTimeToUTC(formData.endTime,'endTime');//console.log(postCreateAdObj.endTime);
            postCreateAdObj.createdAt = "";
            postCreateAdObj.updatedAt = "";
            console.log(postCreateAdObj);

            workflowService.createAdGroups($routeParams.campaignId, postCreateAdObj).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $('#createNewAdGrp')[0].reset();

                    $scope.$parent.showCreateAdGrp = !$scope.$parent.showCreateAdGrp;
                    $scope.createGroupMessage=!$scope.createGroupMessage;
                    $scope.createAdGroupMessage="Ad Group Created Successfully";
                    //$scope.workflowData['campaignGetAdGroupsData'] = [];
                    //$scope.getAdgroups($routeParams.campaignId);
                    localStorage.setItem( 'topAlertMessage', $scope.textConstants.AD_GROUP_CREATED_SUCCESS );
                    location.reload();
                } else {
                    $scope.createGroupMessage=!$scope.createGroupMessage;
                    $scope.createAdGroupMessage="Ad Group not Created ";
                }
            });

        }
    }
});