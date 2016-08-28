define(['angularAMD', 'url-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('ReportsInvoiceAddNoteController', ['$scope', '$rootScope', '$modalInstance', function ($scope, $rootScope, $modalInstance) {
        // Close method for note modal popUp
        $scope.close = function () {
            $modalInstance.dismiss();
        };

        // Purpose: To save the note data entered
        // Notes: It is broadcast an event which is being received in
        // reporting/collectiveReporting/reports_invoice_controller.js file
        $scope.save = function () {
            $rootScope.$broadcast('saveNoteData');
            $scope.close();
        };
    }]);
});
