define(['angularAMD'],function (angularAMD) {
    'use strict';

    angularAMD.controller('GetAdgroupsController', ['$scope', '$rootScope', '$routeParams', '$location',
        'momentService', 'workflowService', 'urlBuilder', function($scope,$rootScope, $routeParams, $location,
                                                            momentService, workflowService, urlBuilder) {
        $scope.numOfDays = function (startTime, endTime) {
            startTime = momentService.utcToLocalTime(startTime);
            endTime = momentService.utcToLocalTime(endTime);
            $scope.numofdays = moment(endTime).diff(moment(startTime), 'days');

            return $scope.numofdays;
        };

        $scope.createAdforAdGroup = function (adGroupsData, unallocatedAmount) {
            var params = {
                adGroupId : adGroupsData.adGroup.id,
                stTime : adGroupsData.adGroup.startTime,
                edTime : adGroupsData.adGroup.endTime,
                adGroupBudget : adGroupsData.adGroup.deliveryBudget,
                lineItemId : Number(adGroupsData.adGroup.lineitemId),
                advertiserId : $scope.workflowData.campaignData.advertiserId
            },
                url;

            if (typeof(Storage) !== 'undefined') {
                // convert this to EST in ads page
                localStorage.setItem('stTime', params.stTime);

                // convert this to EST in ads create page
                localStorage.setItem('edTime', params.edTime);
            }

            workflowService.setUnallocatedAmount(params);

            localStorage.setItem('unallocatedAmount',unallocatedAmount);
            localStorage.setItem('groupBudget',Number(params.adGroupBudget));

            url = urlBuilder.adUrl(params);

            if(momentService.isGreater(params.edTime, momentService.todayDate())){
                $location.url(url);
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
    }]);
});
