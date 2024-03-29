define(['angularAMD', 'collective-report-model', 'common-utils', 'url-service', 'report-schedule-delete-controller', 'reports-invoice-addNote-controller',
    'reports-invoice-addAdjustment-controller', 'invoice-upload-SOR-controller', 'admin-account-service'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('reportsInvoiceController', ['$scope', '$filter', '$location', '$modal', '$rootScope', '$routeParams', '$q', '$timeout', 'collectiveReportModel',
            'utils', 'loginModel', 'constants', 'urlService', 'dataStore', 'dataService', 'momentService', 'domainReports', 'advertiserModel', 'brandsModel',
            'adminAccountsService', 'vistoconfig', 'subAccountService', 'pageLoad',
            function ($scope,$filter, $location, $modal, $rootScope, $routeParams, $q, $timeout, collectiveReportModel, utils, loginModel, constants, urlService, dataStore,
                      dataService, momentService, domainReports, advertiserModel, brandsModel, adminAccountsService, vistoconfig, subAccountService, pageLoad) {
                var _curCtrl = this;

                console.log('REPORTS INVOICE controller is loaded!');
                // Hide page loader when the page is loaded
                pageLoad.hidePageLoader();
                $scope.textConstants = constants;
                _curCtrl.invoiceId = $routeParams.invoiceId;
                _curCtrl.clientId = vistoconfig.getSelectedAccountId();

                // Get the details of the invoice
                _curCtrl.getInvoiceDetials = function () {
                    var res;
                    dataService.fetch(urlService.getInvoiceDetials(_curCtrl.clientId, _curCtrl.invoiceId)).then(function (result) {
                        if (result.status === 'success' || result.status === 'OK') {
                            res = result.data.data;
                            $scope.invoiceDetails = res;
                            $scope.noteData.notes = $scope.invoiceDetails.description;
                            $scope.noteData.status = $scope.invoiceDetails.status;
                            $scope.isDataLoaded = true;
                            $scope.isUploadStatus = (res.status === 'Upload') ? true : false;
                            $scope.breadcrumbsDisplay.advertiserName = res.advertiserName;
                            $scope.breadcrumbsDisplay.mediaPlanName = res.mediaPlanName;
                        }
                    }, function () {});
                };

                _curCtrl.getInvoiceDetials();

                // Save the note and status information
                _curCtrl.saveNoteAndStatus = function () {
                    adminAccountsService
                        .invoiceSaveNote(vistoconfig.getMasterClientId(), $routeParams.invoiceId, $scope.noteData)
                        .then(function (result) {
                            if (result.status === 'success' || result.status === 'OK') {
                                _curCtrl.getInvoiceDetials();
                            }
                        }, function () {
                        });
                };

                $scope.breadcrumbsDisplay = {
                    clientName : subAccountService.getSelectedSubAccount().displayName,
                    invoiceId : $routeParams.invoiceId
                };

                $scope.noteData = {
                    notes: '',
                    status: 'Ready'
                };

                $scope.isDataLoaded = false;

                // Event Received from  reports_invoice_addAdjustment_controller.js file
                // Purpose : adjustment data is saved, get the fresh invoice details data
                $rootScope.$on('adjustmentAdded',function () {
                    _curCtrl.getInvoiceDetials();
                });

                // Event Received from  reports_invoice_addNote_controller.js file
                // Purpose : adjustment data is saved, get the fresh invoice details data
                $rootScope.$on('saveNoteData',function () {
                    _curCtrl.saveNoteAndStatus();
                });

                $rootScope.$on('uploadSuccess',function () {
                    _curCtrl.getInvoiceDetials();
                });

                // PopUp window to add credit or debit to the adjustment
                $scope.showAddAdjustmentPopup = function () {
                    $modal.open({
                        templateUrl: assets.html_add_credit_popup,
                        controller: 'ReportsInvoiceAddAdjustmentController',
                        scope: $scope,
                        windowClass: 'edit-dialog',

                        resolve: {
                            getMediaPlansForClone: function () {}
                        }
                    });

                    $scope.addAdjustmentData = angular.copy($scope.invoiceDetails);
                    $scope.addAdjustmentData.invoiceId = $routeParams.invoiceId;
                };

                // PopUp window to add note to the invoice
                $scope.showAddNotePopup = function (invoice) {
                    $modal.open({
                        templateUrl: assets.html_add_note_popup,
                        controller: 'ReportsInvoiceAddNoteController',
                        scope: $scope,
                        windowClass: 'edit-dialog invoice_note_popUp',

                        resolve: {
                            getMediaPlansForClone: function () {}
                        }
                    });

                    $scope.addAdjustmentData = angular.copy(invoice);
                };

                // Change the status
                $scope.selectStatus = function (status) {
                    $scope.selectedStatus = status;
                    $scope.noteData.status = status;

                    if ($scope.noteData.status === 'Ready' || $scope.noteData.status === 'Review') {
                        _curCtrl.saveNoteAndStatus();
                    } else {
                        $scope.confirmationPopUp = true;
                        $scope.update_status_msg = ($scope.noteData.status === 'Closed') ? constants.INVOICE_CONFIRM_CLOSE : constants.INVOICE_CONFIRM_UPLOAD;
                    }
                };

                $scope.updateStatus = function () {
                    _curCtrl.saveNoteAndStatus();
                };

                // Download CSV or template
                $scope.download = function (isInvoiceReport) {
                    var url='',

                        successMsg =  isInvoiceReport ?
                            constants.INVOICE_REPORT_DONWLOAD_SUCCESS :
                            constants.INVOICE_TEMPLATE_DOWNLOAD_SUCCESS,

                        errMsg = isInvoiceReport ?
                            constants.INVOICE_REPORT_DONWLOAD_ERR :
                            constants.INVOICE_TEMPLATE_DOWNLOAD_ERR;

                    url = isInvoiceReport ?
                        urlService.downloadInvoiceWithId(_curCtrl.clientId, _curCtrl.invoiceId) :
                        urlService.downloadTemplateWithCampaignId(_curCtrl.clientId, $scope.invoiceDetails.campaignId);

                    dataService
                        .downloadFile(url)
                        .then(function (res) {
                            if (res.status === 'OK' || res.status === 'success') {
                                saveAs(res.file, res.fileName);
                                $rootScope.setErrAlertMessage(successMsg, 0);
                            } else {
                                $rootScope.setErrAlertMessage(errMsg);
                            }
                        }, function () {
                            $rootScope.setErrAlertMessage(errMsg);
                        });
                };

                $scope.showUploadSORPopUp = function (invoice) {
                    $modal.open({
                        templateUrl: assets.html_invocie_upload_SOR,
                        controller: 'invoiceUploadSOR',
                        scope: $scope,
                        windowClass: 'edit-dialog uploadSORPopup',

                        resolve: {
                            getMediaPlansForClone: function () {}
                        }
                    });

                    $scope.invoiceData = angular.copy(invoice);
                };
            }
        ]);
    }
);
