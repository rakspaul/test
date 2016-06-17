define(['angularAMD',
    'common/services/data_service', 'common/services/url_service', 'common/services/constants_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('ReportsInvoiceAddNoteController', function ($scope, $rootScope, $modalInstance,
    dataService, urlService, constants
        ) {

        // Close method for note modal popUp
        $scope.close = function(){
            $modalInstance.dismiss();
        }

        /* Purpose: To save the note data entered
           Notes: It is broadcast an event which is being received in
           reporting/collectiveReporting/reports_invoice_controller.js file
         */
        $scope.save = function(){
            $rootScope.$broadcast("saveNoteData");
            $scope.close();
        }

    });
});