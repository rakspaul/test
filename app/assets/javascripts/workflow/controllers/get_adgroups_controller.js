angObj.controller('GetAdgroupsController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location, momentService) {
    $scope.numOfDays = function (startTime, endTime) {
        var startTime=momentService.utcToLocalTime(startTime);
        var endTime=momentService.utcToLocalTime(endTime);
        $scope.numofdays = moment(endTime).diff(moment(startTime), 'days');
        return $scope.numofdays;
    }

    $scope.createAdforAdGroup=function(campid,stTime,edTime){
        if(typeof(Storage) !== "undefined") {
            localStorage.setItem("stTime", stTime);//convert this to EST in ads page
            localStorage.setItem("edTime", edTime);//convert this to EST in ads create page
        }
        var navigateUrl = "/mediaplan/"+$routeParams.campaignId+"/adGroup/"+campid+"/ads/create";
        $location.url(navigateUrl)
    }

    $scope.utcToLocalTime=function(date,format){
        return momentService.utcToLocalTime(date,format);
    }
});