define(['angularAMD',
    'common/services/data_service', 'common/services/url_service', 'common/services/constants_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('ReportsInvoiceAddNoteController', function ($scope, $rootScope, $modalInstance,
    dataService, urlService, constants
        ) {
        $scope.close = function(){
            $modalInstance.dismiss();
        }
        $scope.save = function(){
            $rootScope.$broadcast("saveNoteData",$scope.invoiceNote);
        }

    });
});