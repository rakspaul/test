define(['angularAMD','common/services/constants_service','workflow/services/workflow_service', 'common/moment_utils', 'workflow/directives/custom_date_picker'],function (angularAMD) {
  angularAMD.controller('CreateAdGroupsController', function($scope, $rootScope, $routeParams, $route, constants, workflowService, momentService) {
        $scope.loadingBtn = false ;
        $scope.handleFlightDate = function (data) {
            var startTime = data,
                endDateElem = $('#adGrpEndDateInput'),
                campaignEndTime = momentService.utcToLocalTime($scope.$parent.workflowData.campaignData.endTime),
                changeDate;

            endDateElem
                .attr('disabled', 'disabled')
                .css({'background': '#eee'});
            if (startTime) {
                endDateElem
                    .removeAttr('disabled')
                    .css({'background': 'transparent'});
                changeDate = moment(startTime).format(constants.DATE_US_FORMAT);
                endDateElem.datepicker('setStartDate', changeDate);
                endDateElem.datepicker('setEndDate', campaignEndTime);
                endDateElem.datepicker('update', changeDate);
            }
        };

      function adGroupSaveErrorHandler (data) {
          data = data || '' ;
          $scope.downloadingTracker = false;
          if(data && data.data && data.data.data.data[0]) {
              var errMsg = _.values(data.data.data.data[0])[0];
          }
          $rootScope.setErrAlertMessage(errMsg);
      }


      $scope.createAdGroup = function (createNewAdGrp) {
            var formElem,
                formData,
                postCreateAdObj;

            $scope.$broadcast('show-errors-check-validity');
            $scope.loadingBtn = true ;
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
                postCreateAdObj.deliveryBudget = formData.adIGroupBudget;
                postCreateAdObj.labels = _.pluck($scope.tags, "label");


                workflowService
                    .createAdGroups($routeParams.campaignId, postCreateAdObj)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $('#createNewAdGrp')[0].reset();
                            $scope.$parent.showCreateAdGrp = !$scope.$parent.showCreateAdGrp;
                            $scope.createGroupMessage = !$scope.createGroupMessage;
                            $scope.createAdGroupMessage = 'Ad Group Created Successfully';
                            localStorage.setItem( 'topAlertMessage', $scope.textConstants.AD_GROUP_CREATED_SUCCESS );
                            $route.reload();
                        } else {
                            $scope.loadingBtn = false ;
                            if(result.status ==='error' && result.data.status === 400) {
                                adGroupSaveErrorHandler(result);
                            } else {
                                $scope.createGroupMessage = !$scope.createGroupMessage;
                                $scope.createAdGroupMessage = 'Ad Group not Created';
                            }
                        }
                    });
            }
        };
    });
});
