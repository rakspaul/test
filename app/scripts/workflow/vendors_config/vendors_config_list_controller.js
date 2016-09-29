define(['angularAMD', 'vendors-list-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorsConfigListController', ['$scope', '$modal', 'vendorsService', 'pageLoad', function ($scope, $modal, vendorsService, pageLoad) {
        console.log('VENDORS CONFIG LIST controller is loaded!');
        // Hide page loader when the page is loaded
        pageLoad.hidePageLoader();

        $scope.vendorList = [];

        $scope.vendorList = vendorsService
            .fetchVendors()
            .then(function(result) {
console.log('vendorList = ', result.data.data);
                $scope.vendorList = result.data.data ;
            });

    	$scope.viewSummary = function () {
            $modal.open({
                templateUrl: assets.html_view_summary_modal,
                windowClass: 'view-summary-dialog'
            });
        };

    }]);
});
