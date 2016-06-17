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

            $scope.clientName = loginModel.getSelectedClient() ? loginModel.getSelectedClient().name : '';
            $scope.advertiserName = advertiserModel.getAdvertiser().selectedAdvertiser ? advertiserModel.getAdvertiser().selectedAdvertiser.name : "All Advertisers";
            $scope.noteData = {"notes":"","status":"Ready"};

            //Get the details of the invoice
            _curCtrl.getInvoiceDetials = function(){
                dataService.fetch(urlService.getInvoiceDetials($routeParams.invoiceId)).then(function(result){
                    if(result.status == "success" || result.status == "OK"){
                        $scope.invoiceDetails = result.data.data;
                        $scope.noteData.notes = $scope.invoiceDetails.description;
                        $scope.noteData.status = $scope.invoiceDetails.status;
                    }
                },function(err){

                });
            }
            _curCtrl.getInvoiceDetials();

            /* Event Received from  reports_invoice_addAdjustment_controller.js file
               Purpose : adjustment data is saved, get the fresh invoice details data*/
            $rootScope.$on("adjustmentAdded",function(){
                _curCtrl.getInvoiceDetials();
            });

            // Save the note and status information
            _curCtrl.saveNoteAndStatus = function(){
                accountsService.invoiceSaveNote(loginModel.getSelectedClient().id,$routeParams.invoiceId, $scope.noteData).then(function(result){
                    if(result.status == "success" || result.status == "OK"){
                        _curCtrl.getInvoiceDetials();
                    }
                },function(err){
                })
            }

            /* Event Received from  reports_invoice_addNote_controller.js file
             Purpose : adjustment data is saved, get the fresh invoice details data*/
            $rootScope.$on("saveNoteData",function(e, invoiceNote){
                _curCtrl.saveNoteAndStatus();
            });

            //PopUp window to add credit or debit to the adjustment
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

            //PopUp window to add note to the invoice
            $scope.showAddNotePopup = function (invoice) {
                $scope.addAdjustmentData = angular.copy(invoice);
                var $modalInstance = $modal.open({
                    templateUrl: assets.html_add_note_popup,
                    controller: 'ReportsInvoiceAddNoteController',
                    scope: $scope,
                    windowClass: 'edit-dialog invoice_note_popUp',
                    resolve: {
                        getMediaPlansForClone: function () {
                        }
                    }
                });
            };

            //Change the status
            $scope.selectStatus = function(status){
                $scope.selectedStatus = status;
                $scope.noteData.status = status;
                _curCtrl.saveNoteAndStatus();
            }

        });
    }
);