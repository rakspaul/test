define(['angularAMD', 'vendors-list-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorsListController', ['$scope', '$modal', 'vendorsService', function ($scope, $modal, vendorsService) {

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

    }]);
});
