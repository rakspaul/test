define(['angularAMD'],function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignClone', function( $scope , $routeParams, $location, $modalInstance, vistoconfig, campaignCloneAction, workflowService, localStorageService) {
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
            if(cloneLineItems) {
                params['cloneLineitems'] = cloneLineItems;
                params['cloneAdGroups'] = cloneAdGroups;
                params['cloneAds'] = true;
                workflowService.cloneCampaign(params);
            } else {
                localStorageService.mediaPlanClone.set(params);
                $location.url(vistoconfig.MEDIAPLAN_CREATE);
                $scope.close();
            }
        }
    });
});