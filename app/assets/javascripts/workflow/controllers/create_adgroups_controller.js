angObj.controller('CreateAdGroupsController', function ($scope, $window, $routeParams, constants, workflowService, $timeout,
                                                        utils, $location, momentService) {
    $scope.handleFlightDate = function (data) {
        var startTime = data,
            endDateElem = $('#adGrpEndDateInput'),
            campaignEndTime = momentService.utcToLocalTime($scope.$parent.workflowData['campaignData'].endTime),
            changeDate;

        endDateElem.attr('disabled', 'disabled').css({'background': '#eee'});
        if (startTime) {
            endDateElem.removeAttr('disabled').css({'background': 'transparent'});
            changeDate = moment(startTime).format(constants.DATE_US_FORMAT);
            endDateElem.datepicker('setStartDate', changeDate);
            endDateElem.datepicker('setEndDate', campaignEndTime);
            endDateElem.datepicker('update', changeDate);
        }
    };

    $scope.createAdGroup = function (createNewAdGrp) {
        var formElem,
            formData,
            postCreateAdObj;

        $scope.$broadcast('show-errors-check-validity');
        if (createNewAdGrp.$valid) {
            formElem = $('#createNewAdGrp');
            formData = formElem.serializeArray();
            formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
            postCreateAdObj = {};
            postCreateAdObj.name = formData.adGroupName;
            postCreateAdObj.startTime = momentService.localTimeToUTC(formData.startTime, 'startTime');
            postCreateAdObj.endTime = momentService.localTimeToUTC(formData.endTime, 'endTime');
            postCreateAdObj.createdAt = '';
            postCreateAdObj.updatedAt = '';

            workflowService
                .createAdGroups($routeParams.campaignId, postCreateAdObj)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $('#createNewAdGrp')[0].reset();
                        $scope.$parent.showCreateAdGrp = !$scope.$parent.showCreateAdGrp;
                        $scope.createGroupMessage = !$scope.createGroupMessage;
                        $scope.createAdGroupMessage = 'Ad Group Created Successfully';
                        localStorage.setItem( 'topAlertMessage', $scope.textConstants.AD_GROUP_CREATED_SUCCESS );
                        location.reload();
                    } else {
                        $scope.createGroupMessage = !$scope.createGroupMessage;
                        $scope.createAdGroupMessage = 'Ad Group not Created';
                    }
                });
        }
    };
});
