define(['angularAMD', 'reporting/collectiveReport/collective_report_model', 'common/utils', 'login/login_model',
    'common/services/constants_service', 'common/services/url_service', 'common/services/data_store_model',
    'common/services/data_service', 'common/moment_utils', 'common/controllers/confirmation_modal_controller', 'reporting/collectiveReport/report_schedule_delete_controller'
],function (angularAMD) {
    'use strict';
    angularAMD.controller('ReportsInvoiceListController', function($scope,$filter, $location, $modal, $rootScope,
                                                                                collectiveReportModel, utils, loginModel,
                                                                                constants, urlService, dataStore, domainReports,
                                                                               dataService, momentService,$q) {


        $scope.welcome = "Invoice Reports";


    });
});
