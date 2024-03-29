define(['angularAMD'], function(angularAMD) {
    angularAMD.controller('ArchiveController', ['$scope' , '$routeParams', '$rootScope', '$location', 'workflowService',
        'urlBuilder', 'vistoconfig', function($scope , $routeParams, $rootScope ,$location, workflowService, urlBuilder, vistoconfig) {
        $scope.campaignArchive = false;

        // archive campaign
        $scope.$parent.cancelArchiveCampaign = function () {
            $scope.campaignArchive = !$scope.campaignArchive;
        };

        // Archive save func more
        $scope.archiveCampaign = function (event, clientId, campaign_id) {
            var campaignId = campaign_id,
                campaignArchiveErrorHandler = function () {
                    $scope.campaignArchive = false;
                    $scope.campaignArchiveLoader = false;
                    $rootScope.setErrAlertMessage();
                };

            $scope.campaignArchiveLoader = true;
            event.preventDefault();

            workflowService
                .deleteCampaign(clientId, campaignId)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.campaignArchive = false;
                        $scope.campaignArchiveLoader = false;
                        vistoconfig.defaultMessage.set({message : 'Campaign has been archived'});
                        $location.url(urlBuilder.mediaPlansListUrl());

                    } else {
                        campaignArchiveErrorHandler();
                    }
                }, campaignArchiveErrorHandler);
        };
    }]);
});
