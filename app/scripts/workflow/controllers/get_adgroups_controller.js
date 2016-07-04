define(['angularAMD','common/moment_utils'],function (angularAMD) { // jshint ignore:line
    angularAMD.controller('GetAdgroupsController', function($scope,$rootScope, $routeParams, $location,
                                                            momentService,workflowService) {
        $scope.numOfDays = function (startTime, endTime) {
            startTime = momentService.utcToLocalTime(startTime);
            endTime = momentService.utcToLocalTime(endTime);
            $scope.numofdays = moment(endTime).diff(moment(startTime), 'days'); // jshint ignore:line
            return $scope.numofdays;
        };

        $scope.createAdforAdGroup = function (adGroupsData, unallocatedAmount) {
            var adGroupId = adGroupsData.adGroup.id,
                stTime = adGroupsData.adGroup.startTime,
                edTime = adGroupsData.adGroup.endTime,
                adGroupBudget = adGroupsData.adGroup.deliveryBudget,
                lineItemId = Number(adGroupsData.adGroup.lineitemId),
                navigateUrl = '/mediaplan/' + $routeParams.campaignId +
                    '/lineItem/' + lineItemId +
                    '/adGroup/' + adGroupId +
                    '/ads/create';

            if (typeof(Storage) !== 'undefined') {
                localStorage.setItem('stTime', stTime); // convert this to EST in ads page
                localStorage.setItem('edTime', edTime); // convert this to EST in ads create page
            }

            workflowService.setUnallocatedAmount(unallocatedAmount);
            localStorage.setItem('unallocatedAmount',unallocatedAmount);
            localStorage.setItem('groupBudget',Number(adGroupBudget));

            if(momentService.isGreater(edTime,momentService.todayDate())){
                $location.url(navigateUrl);
            } else {
                $rootScope.setErrAlertMessage($scope.textConstants.ADGROUP_FLIGHTPASSED_NO_NEW_ADS);
            }
        };

        $scope.utcToLocalTime = function (date, format) {
            return momentService.utcToLocalTime(date, format);
        };

        //This stops input type numbers not to change when arrow key is pressed
        $(document).bind('keydown', function(event) {
            var target = event.srcElement || event.target,
                tag = target.tagName.toUpperCase(),
                type = target.type && target.type.toUpperCase();

            if (tag === 'INPUT' &&
                type === 'NUMBER' &&
               (event.keyCode === 38 || event.keyCode === 40)
            ) {
              event.preventDefault();
            }
        });
    });
});
