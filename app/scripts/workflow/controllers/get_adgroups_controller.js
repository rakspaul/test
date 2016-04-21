define(['angularAMD','common/moment_utils'],function (angularAMD) {
  angularAMD.controller('GetAdgroupsController', function($scope, $routeParams, $location, momentService,workflowService) {
        $scope.numOfDays = function (startTime, endTime) {
            startTime = momentService.utcToLocalTime(startTime);
            endTime = momentService.utcToLocalTime(endTime);
            $scope.numofdays = moment(endTime).diff(moment(startTime), 'days');
            return $scope.numofdays;
        };

        $scope.createAdforAdGroup = function (adGroupsData, unallocatedAmount) {

            var campId = adGroupsData.adGroup.id,
                stTime = adGroupsData.adGroup.startTime,
                edTime = adGroupsData.adGroup.endTime,
                adGroupBudget = adGroupsData.adGroup.deliveryBudget,
                navigateUrl = '/mediaplan/' + $routeParams.campaignId + '/adGroup/' + campId + '/ads/create';

            if (typeof(Storage) !== 'undefined') {
                localStorage.setItem('stTime', stTime); // convert this to EST in ads page
                localStorage.setItem('edTime', edTime); // convert this to EST in ads create page
            }
            workflowService.setUnallocatedAmount(unallocatedAmount);
            localStorage.setItem('unallocatedAmount',unallocatedAmount);
            localStorage.setItem('groupBudget',Number(adGroupBudget));
            localStorage.setItem("lineitemId", Number(adGroupsData.adGroup.lineitemId));
            $location.url(navigateUrl);
        };

        $scope.utcToLocalTime = function (date, format) {
            return momentService.utcToLocalTime(date, format);
        };

        //This stops input type numbers not to change when arrow key is pressed
        $(document).bind('keydown', function(event) {
            var target = event.srcElement || event.target;
            var tag = target.tagName.toUpperCase();
            var type = target.type && target.type.toUpperCase();
            if (tag === 'INPUT' && type === 'NUMBER' &&
               (event.keyCode === 38 || event.keyCode === 40)) {
              event.preventDefault();
            }
        });
    });
});
