define(['angularAMD','common/moment_utils'],function (angularAMD) {
  angularAMD.controller('GetAdgroupsController', function($scope, $routeParams, $location, momentService) {

        $scope.numOfDays = function (startTime, endTime) {
            var startTime = momentService.utcToLocalTime(startTime),
                endTime = momentService.utcToLocalTime(endTime);

            $scope.numofdays = moment(endTime).diff(moment(startTime), 'days');
            return $scope.numofdays;
        };

        $scope.createAdforAdGroup = function (campId, stTime, edTime) {
            var navigateUrl = '/mediaplan/' + $routeParams.campaignId + '/adGroup/' + campId + '/ads/create';
            if (typeof(Storage) !== 'undefined') {
                localStorage.setItem('stTime', stTime); // convert this to EST in ads page
                localStorage.setItem('edTime', edTime); // convert this to EST in ads create page
            }
            $location.url(navigateUrl);
        };

        $scope.utcToLocalTime = function (date, format) {
            return momentService.utcToLocalTime(date, format);
        };
    });
});
