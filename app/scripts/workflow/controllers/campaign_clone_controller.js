define(['angularAMD'],function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignClone', function( $scope , $routeParams, $location, $modalInstance, constants, vistoconfig, campaignCloneAction, workflowService, localStorageService) {
        $scope.showCloneLoader = false;
        $scope.cloneMediaPlanExists = false;
        $scope.checkUniqueNameNotFound = false;
        $scope.textConstants = constants;
        $scope.close=function(){
            $modalInstance.dismiss();
        };

        $scope.campaignCloneAction = function() {
            var cloneMediaPlanName = $scope.cloneMediaPlanName;
            var cloneLineItems = $scope.cloneLineItems;
            var cloneAdGroups = $scope.cloneAdGroups;
            var params = {
                'id': Number($routeParams.campaignId),
                'name': cloneMediaPlanName
            }

            $scope.showCloneLoader = true;
            if(cloneLineItems && cloneAdGroups) {
                params['cloneLineitems'] = cloneLineItems;
                params['cloneAdGroups'] = cloneAdGroups;
                params['cloneAds'] = true;

                var errorMediaPlanHandler = function () {
                    $scope.showCloneLoader = false;
                };
                workflowService.cloneCampaign(params).then(function (results) {
                    var url;
                    if (results.status === 'OK' || results.status === 'success') {
                        var responseData = results.data.data;
                        url = '/mediaplan/' + responseData.id + '/overview';
                        $location.url(url);
                        $scope.close();
                    } else {
                        errorMediaPlanHandler();
                    }
                }, errorMediaPlanHandler);
            } else {
                localStorageService.mediaPlanClone.set(params);
                $location.url(vistoconfig.MEDIAPLAN_CREATE);
                $scope.close();
            }
        };

        $scope.isMediaPlanNameExist = function(event){
            $scope.checkUniqueNameNotFound = true;
            var target =  event.target;
            var cloneMediaPlanName = target.value;
            var advertiserId = $scope.workflowData.campaignData.advertiserId;
            workflowService.checkforUniqueMediaPlan(advertiserId, cloneMediaPlanName).then(function (results) {
                var url;
                $scope.checkUniqueNameNotFound = false;
                if (results.status === 'OK' || results.status === 'success') {
                    var responseData = results.data.data;
                    $scope.cloneMediaPlanExists = responseData.isExists;
                }

            });
        };

    });
});