define(['angularAMD' , 'workflow/services/workflow_service' ],
    function(angularAMD) {
        angularAMD.controller('ArchiveController', function($scope , workflowService,$rootScope ,$location,vistoconfig) {
            $scope.campaignArchive = false;

            // archive campaign
            $scope.$parent.cancelArchiveCampaign = function () {
                $scope.campaignArchive = !$scope.campaignArchive;
            };

            //Archive save func more
            $scope.archiveCampaign = function (event,campaign_id) {
                var campaignId = campaign_id,
                    campaignArchiveErrorHandler = function () {
                        $scope.campaignArchive = false;
                        $scope.campaignArchiveLoader = false;
                        $rootScope.setErrAlertMessage();
                    };

                $scope.campaignArchiveLoader = true;
                event.preventDefault();

                workflowService
                    .deleteCampaign(campaignId)
                    .then(function (result) {
                        var campaignName;

                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.campaignArchive = false;
                            $scope.campaignArchiveLoader = false;
                            //campaignName = $scope.workflowData.campaignData.name;
                            localStorage.setItem('topAlertMessage','Campaign has been archived');
                            $location.url(vistoconfig.MEDIA_PLANS_LINK);
                        } else {
                            campaignArchiveErrorHandler();
                        }
                    }, campaignArchiveErrorHandler);
            };

            // end of archive controller
        });
    });
