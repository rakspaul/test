define(['angularAMD', 'reporting/collectiveReport/collective_report_model', 'common/utils', 'login/login_model',
    'common/services/constants_service', 'common/services/url_service', 'common/services/data_store_model',
    'common/services/data_service', 'common/moment_utils', 'common/controllers/confirmation_modal_controller', 'reporting/collectiveReport/report_schedule_delete_controller'
],function (angularAMD) {
    'use strict';
    angularAMD.controller('ReportsInvoiceListController', function($scope,$filter, $location, $modal, $rootScope, $routeParams,
                                                                                collectiveReportModel, utils, loginModel,
                                                                                constants, urlService, dataStore, domainReports,
                                                                               dataService, momentService,$q) {




        $scope.reports = {};
        $scope.reports.reportDefinition = {};
        $scope.reports.reportDefinition.timeframe = {};
        $scope.reports.reportDefinition.timeframe.start_date = moment().subtract(0, 'day').format(constants.DATE_UTC_SHORT_FORMAT);
        $scope.reports.reportDefinition.timeframe.end_date = moment().subtract(0, 'day').format(constants.DATE_UTC_SHORT_FORMAT);
        $scope.scheduleReportActive = false;

        var invoiceOverView = {
            getInvoiceData: function (advertiserId) {
                dataService
                    .fetch(urlService.getInvoiceData(advertiserId))
                    .then(function (result) {
                        var responseData, clientId, advertiserId;
                        if (result.status === 'OK' || result.status === 'success') {
                            responseData = result.data.data;
                            $scope.invoiceData = responseData;
                        }

                    })
            }
        };

        $(document).ready(function() {
            invoiceOverView.getInvoiceData($routeParams.advertiserId);
        })


        $(document).ready(function() {
            $('.input-daterange').datepicker({
                format: "mm/dd/yyyy",
                orientation: "auto",
                autoclose: true,
                todayHighlight: true
            });
        })



        //Search Hide / Show
        $scope.searchShowInput = function () {
            var searchInputForm = $('.searchInputForm');

            $('.searchInputBtn').hide();
            $('.searchInputBtnInline').show();
            searchInputForm.show();
            searchInputForm.animate({width: '300px'}, 'fast');
            setTimeout(function () {
                $('.searchClearInputBtn').fadeIn();
            }, 300);
        };

        $scope.searchHideInput = function () {
            $('.searchInputForm input').val('');
            $('.searchInputBtn').show();
            $('.searchClearInputBtn, .searchInputBtnInline').hide();
            $('.searchInputForm').animate({width: '34px'}, 'fast');
            setTimeout(function () {
                $('.searchInputForm').hide();
            }, 100);
        };


    });
});
