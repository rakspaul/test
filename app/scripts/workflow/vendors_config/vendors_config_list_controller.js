define(['angularAMD', 'vendors-config-list-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorsConfigListController', ['$scope', '$modal', 'vendorsConfigListService', 'pageLoad',
        function ($scope, $modal, vendorsConfigListService, pageLoad) {
            console.log('VENDORS CONFIG LIST controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            $scope.vendorList = [];

            $scope.vendorList = vendorsConfigListService.fetchVendors().then(function(result) {
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
