define(['angularAMD',
        'reporting/collectiveReport/collective_report_model', 'common/utils', 'login/login_model',
        'common/services/constants_service', 'common/services/url_service', 'common/services/data_store_model',
        'common/services/data_service', 'common/moment_utils', 'common/controllers/confirmation_modal_controller',
        'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model', 'workflow/services/account_service',
        'reporting/collectiveReport/report_schedule_delete_controller', 'reporting/collectiveReport/reports_invoice_addNote_controller',
        'reporting/collectiveReport/reports_invoice_addAdjustment_controller'],
    function (angularAMD) {
        'use strict';
        angularAMD.controller('reportsInvoiceController', function ($scope,$filter, $location, $modal, $rootScope, $routeParams, $q, $timeout,
                                                                    collectiveReportModel, utils, loginModel,
                                                                    constants, urlService, dataStore,
                                                                    dataService, momentService, domainReports,
                                                                    advertiserModel, brandsModel, accountsService,
                                                                    localStorageService) {
            var _curCtrl = this,
                isSearch = false;

            console.log("Invoice Report..."+$routeParams.invoiceId);
            $scope.clientName = loginModel.getSelectedClient() ? loginModel.getSelectedClient().name : '';
            console.log("$scope.loginModel.....",$scope.loginModel);
            $scope.advertiserName = advertiserModel.getAdvertiser().selectedAdvertiser ? advertiserModel.getAdvertiser().selectedAdvertiser.name : "All Advertisers";
            $scope.noteData = {"notes":"","status":"Select Review"};

            console.log("$scope.advertiser....",$scope.advertiser);
            $scope.getInvoiceDetials = function(){
                dataService.fetch(urlService.getInvoiceDetials($routeParams.invoiceId)).then(function(result){
                   console.log("result......",result);
                    if(result.status == "success" || result.status == "OK"){
                        $scope.invoiceDetails = result.data.data;
                    }
                },function(err){

                });
            }
            $scope.getInvoiceDetials();
            $rootScope.$on("adjustmentAdded",function(){
                $scope.getInvoiceDetials();
            });
            _curCtrl.saveNoteData = function(){
                accountsService.invoiceSaveNote(loginModel.getSelectedClient().id,$routeParams.invoiceId, $scope.noteData).then(function(result){
                },function(err){
                })
            }
            $rootScope.$on("saveNoteData",function(e, invoiceNote){
                $scope.noteData.notes = invoiceNote;
                _curCtrl.saveNoteData();
            });
            $scope.showAddAdjustmentPopup = function (invoice) {
                $scope.addAdjustmentData = angular.copy($scope.invoiceDetails);
                $scope.addAdjustmentData.invoiceId = $routeParams.invoiceId;
                var $modalInstance = $modal.open({
                    templateUrl: assets.html_add_credit_popup,
                    controller: 'ReportsInvoiceAddAdjustmentController',
                    scope: $scope,
                    windowClass: 'edit-dialog',
                    resolve: {
                        getMediaPlansForClone: function () {
                        }
                    }
                });
            };
            $scope.showAddNotePopup = function (invoice) {
                $scope.addAdjustmentData = angular.copy(invoice);
                var $modalInstance = $modal.open({
                    templateUrl: assets.html_add_note_popup,
                    controller: 'ReportsInvoiceAddNoteController',
                    scope: $scope,
                    windowClass: 'edit-dialog',
                    resolve: {
                        getMediaPlansForClone: function () {
                        }
                    }
                });
            };
            $scope.selectStatus = function(status){
                $scope.selectedStatus = status;
                $scope.noteData.status = status;
                _curCtrl.saveNoteData();
            }

        });
    }
);
