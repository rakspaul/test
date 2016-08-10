define(['angularAMD', '../../common/services/constants_service', 'workflow/services/workflow_service',
         'workflow/services/vendors_list_service', 'workflow/services/audience_service', 
    'common/moment_utils'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorsListController', function ($scope, $modal, vendorsService) {

        $scope.vendorList = [];
        $scope.vendorList = vendorsService.fetchVendors().then(function(result) {
            $scope.vendorList = result.data.data ;
        });

    	$scope.viewSummary = function () {
            $modal.open({
                templateUrl: assets.html_view_summary_modal,
                //controller: 'ConfirmationModalController',
                windowClass: 'view-summary-dialog'
            });
        };

    });
});
