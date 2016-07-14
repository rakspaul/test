define(['angularAMD', 'reporting/collectiveReport/collective_report_model', 'common/utils', // jshint ignore:line
    'login/login_model', 'common/services/constants_service', 'reporting/advertiser/advertiser_model',
    'reporting/brands/brands_model', 'reporting/models/domain_reports','common/services/data_service',
    'common/moment_utils', 'common/services/role_based_service', 'common/services/url_service',
    'common/services/data_store_model', 'common/controllers/confirmation_modal_controller',
    'reporting/collectiveReport/report_schedule_delete_controller', 'workflow/controllers/ad_clone_controller',
    'reporting/collectiveReport/reports_invoice_addAdjustment_controller',
    'reporting/collectiveReport/invoice_upload_SOR_controller','workflow/directives/custom_date_picker'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('ReportsInvoiceListController', function ($scope, $filter, $location, $modal, $rootScope,
                                                                        $routeParams, collectiveReportModel, utils,
                                                                        loginModel, constants, advertiserModel,
                                                                        brandsModel, domainReports, dataService,
                                                                        momentService, RoleBasedService, urlService,
                                                                        dataStore, $sce) {

            $scope.invoiceReports = {
                clientId: loginModel.getSelectedClient().id,
                advertiserId: (advertiserModel.getAdvertiser().selectedAdvertiser ?
                    advertiserModel.getAdvertiser().selectedAdvertiser.id : -1),
                brandId: (brandsModel.getSelectedBrand().id),
                startDate: moment().subtract(365, 'day').format(constants.DATE_US_FORMAT), // jshint ignore:line
                endDate: moment().format(constants.DATE_US_FORMAT), // jshint ignore:line
                page_num: 1
            };
            
            var _currCtrl = this;

            _currCtrl.last_page = false;

            _currCtrl.resetDateToInit = function () {
                $scope.invoiceReports.startDate = moment().subtract(365, 'day').format(constants.DATE_UTC_SHORT_FORMAT);
                $scope.invoiceReports.endDate = moment().format(constants.DATE_UTC_SHORT_FORMAT);
                $('#startDateInput').val($scope.invoiceReports.startDate);
                $('#endDateInput').val($scope.invoiceReports.endDate);
            };

            _currCtrl.resetPagination = function () {
                _currCtrl.last_page = false;
                $scope.invoiceReports.page_num = 1;
                $scope.mediaPlanList = [];
            };

            _currCtrl.resetPagination();

            _currCtrl.postProcessMediaPlanData = function () {
                _.each($scope.mediaPlanList, function (mediaPlan, mp_i) { // jshint ignore:line
                    mediaPlan.invoiceDate = momentService.newMoment(mediaPlan.invoiceDate).format('DD MMM YYYY');
                    $scope['loadMoreInvoice_'+mp_i] = mediaPlan.invoices.length > 3 ? true : false;

                    mediaPlan.invoices = _.filter(mediaPlan.invoices,function (item, in_i) { // jshint ignore:line
                        return in_i < 3;
                    });
                });
            };

            _currCtrl.preProcessMediaPlanData = function (data) {
                _.each(data, function (item) { // jshint ignore:line
                    item.invoiceDate = momentService.newMoment(item.invoiceDate).format('DD MMM YYYY');

                    _.each(item.invoices, function (invoice) { // jshint ignore:line
                        invoice.invoiceDate = momentService.newMoment(invoice.invoiceDate).format('DD MMM YYYY');
                    });
                });
            };

            _currCtrl.getQueryStr = function () {
                var queryStr = '&page_num='+$scope.invoiceReports.page_num+'&page_size=50',
                    startDateInput = $('#startDateInput'),
                    endDateInput = $('#endDateInput');

                queryStr += ($scope.filters.selectedStatusCode && $scope.filters.selectedStatusCode !== 'All') ?
                    '&status=' + $scope.filters.selectedStatusCode : '';

                startDateInput.val() && (queryStr += '&start_date=' + startDateInput.val());
                endDateInput.val() && (queryStr += '&end_date=' + endDateInput.val());

                return queryStr;
            };

            function attachScrollToWindow() {
                $(window).scroll(function () {
                    if (!$scope.fetching &&
                        !_currCtrl.last_page &&
                        (($(window).scrollTop() + $(window).height()) >= $(document).height() - 100)) {
                        $scope.invoiceReports.page_num += 1;
                        $scope.getInvoiceData(1);
                    }
                });
            }



            $scope.addAdjustmentData = {};

            $scope.loadMoreInvoice = function (mp_i) {
                $scope.mediaPlanList[mp_i].invoices =
                    angular.copy(_currCtrl.resMediaPanList[mp_i].invoices); // jshint ignore:line

                $scope['loadMoreInvoice_'+mp_i] = false;
            };

            $scope.getInvoiceData = function (isLoadMore) {
                $scope.fetching = true;
                !isLoadMore && _currCtrl.resetPagination();
                $scope.noDataFound = false;

                dataService
                    .fetch(urlService.getInvoiceData($scope.invoiceReports, _currCtrl.getQueryStr()))
                    .then(function (result) {
                        var responseData;

                        $scope.fetching = false;
                        ($scope.invoiceReports.page_num === 1) && ($scope.noDataFound = true);

                        if (result.status === 'OK' || result.status === 'success') {
                            responseData = result.data.data;

                            if (responseData.length) {
                                $scope.noDataFound = false;
                                _currCtrl.preProcessMediaPlanData(responseData);
                                $scope.mediaPlanList = responseData;
                                _currCtrl.resMediaPanList = angular.copy(responseData); // jshint ignore:line
                                _currCtrl.postProcessMediaPlanData();
                                attachScrollToWindow();
                            } else {
                                _currCtrl.last_page = true;
                            }
                        } else {
                            _currCtrl.last_page = true;
                        }
                    }, function () {
                        _currCtrl.last_page = true;
                        $scope.fetching = false;
                    });
            };

            // Search Clear
            $scope.searchHideInput = function () {
                $('.searchInputForm input').val('');

                if ($scope.invoiceReports.isSearched) {
                    $scope.invoiceReports.isSearched = false;
                    $scope.invoiceReports.searchTerm = '';
                    $scope.getInvoiceData();
                }
            };

            $scope.$on(constants.EVENT_ADVERTISER_CHANGED, function () {
                $scope.invoiceReports.advertiserId = advertiserModel.getAdvertiser().selectedAdvertiser ?
                    advertiserModel.getAdvertiser().selectedAdvertiser.id : -1;

                $scope.getInvoiceData(0);
            });

            $scope.$on(constants.EVENT_BRAND_CHANGED, function () {
                $scope.invoiceReports.brandId = brandsModel.getSelectedBrand().id;
                $scope.getInvoiceData(0);
            });

            $scope.$on(constants.EVENT_CLIENT_CHANGED, function () {
                $scope.invoiceReports.clientId = loginModel.getSelectedClient().id;
                $scope.getInvoiceData(0);
            });

            $scope.$on(constants.CREDIT_SAVED_SUCCESS, function () {
                $scope.invoiceReports.clientId = loginModel.getSelectedClient().id;
                    $scope.getInvoiceData(0);
            });

            // Event Received from reports_invoice_addAdjustment_controller.js file
            $rootScope.$on('adjustmentAdded',function () {
                $scope.getInvoiceData(0);
            });

            // Event Received from invoice_upload_SOR_controller.js file
            $rootScope.$on('uploadSuccess',function () {
                $scope.getInvoiceData(0);
            });

            //Search Hide / Show
            $scope.searchShowInput = function () {
                var searchInputForm = $('.searchInputForm');

                $('.searchInputBtn').hide();
                $('.searchInputBtnInline').show();

                searchInputForm.show();
                searchInputForm.animate({width: '300px'}, 'fast');
            };

            // Filter button
            $scope.getInvoiceDataButton = function () {
                $scope.getInvoiceData(0);
            };

            // Search functionality
            $scope.invoiceReports.isSearched = false;
            $scope.invoiceReports.searchTerm = '';

            $scope.invoiceReportsSearchFunc = function (e) {
                // Perform search if enter key is pressed, or search button is clicked & user has entered something.
                // NOTE: The event object (e) is not passed if called from search button.
                if (!e || e.keyCode === 13) {
                    $scope.invoiceReports.isSearched = false;

                    if ($scope.invoiceReports.searchTerm && $scope.invoiceReports.searchTerm.trim()) {
                        // Search term is entered
                        $scope.invoiceReports.isSearched = true;
                        $scope.invoiceReports.page_num = 1;
                        $scope.getInvoiceData(0);
                    }
                }
            };

            $scope.toggleInvocieLists=function (mediaPlan, index) {
                var sel = $('div[data-row-index='+index+'] .icon-arrow-solid-down');

                if (sel.hasClass('icon-arrow-solid-down-open')) {
                    sel.removeClass('icon-arrow-solid-down-open');
                    $('div[data-row-index='+index+'] .secondDimensionList').hide() ;
                    sel.closest('.oneDimensionRow').removeClass('visible') ;
                } else {
                    sel.addClass('icon-arrow-solid-down-open') ;
                    $('div[data-row-index='+index+'] .secondDimensionList').show() ;
                }
            };

            $scope.showAddAdjustmentPopup = function (invoice) {
                var $modalInstance = $modal.open({ // jshint ignore:line
                    templateUrl: assets.html_add_credit_popup, // jshint ignore:line
                    controller: 'ReportsInvoiceAddAdjustmentController',
                    scope: $scope,
                    windowClass: 'edit-dialog',

                    resolve: {
                        getMediaPlansForClone: function () {}
                    }
                });

                $scope.addAdjustmentData = angular.copy(invoice);
            };

            $scope.showUploadSORPopUp = function (invoice, campaignId) {
                var $modalInstance = $modal.open({ // jshint ignore:line
                    templateUrl: assets.html_invocie_upload_SOR, // jshint ignore:line
                    controller: 'invoiceUploadSOR',
                    scope: $scope,
                    windowClass: 'edit-dialog uploadSORPopup',
                    resolve: {
                        getMediaPlansForClone: function () {
                        }
                    }
                });

                $scope.invoiceData = angular.copy(invoice);
                $scope.invoiceData.campaignId = campaignId;
            };

            $scope.highlightTitleText = function (text, phrase) {
                var keywordsArr,
                    keywords;

                keywordsArr = phrase ? phrase.split(' ') : [];

                if (keywordsArr.length > 1) {
                    keywordsArr.push(phrase);
                }

                keywords = keywordsArr.join('|');

                if (keywords) {
                    return text.replace(new RegExp('(' + keywords + ')', 'gi'),
                        $sce.trustAsHtml('<mark class="search-highlight">$1</mark>'));
                } else {
                    return text;
                }
            };

            $scope.highlightLabelPill = function (text, phrase) {
                var tempText = text ? text.toString() : '',
                    tempTextLower = tempText.toLowerCase(),
                    tempPhrase = phrase ? phrase.toLowerCase() : '';

                if (phrase && tempTextLower.indexOf('</mark>') === -1) {
                    if (tempTextLower.indexOf(tempPhrase) >= 0) {
                        tempText = '<mark class="search-highlight">' +
                            tempText + '</mark>';
                    }
                }

                return tempText;
            };

            $scope.addHighlightClass = function (text, phrase) {
                var tempText = text ? text.toString().toLowerCase() : '';

                return tempText.indexOf(phrase) >= 0;
            };
            // End Search functionality

            // Download section
            $scope.invoiceReports.download = function (e, data) {
                var url = '';

                e.preventDefault();

                url = data.downloadLink ? data.downloadLink :
                      data.campaignId ? urlService.downloadInvoiceCampaign(data.campaignId) : '';

                dataService
                    .downloadFile(url)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            saveAs(result.file, result.fileName); // jshint ignore:line
                            $rootScope.setErrAlertMessage(constants.INVOICE_REPORT_DONWLOAD_SUCCESS, 0);
                        } else {
                            $rootScope.setErrAlertMessage(constants.INVOICE_REPORT_DONWLOAD_ERR);
                        }
                    }, function () {
                        $rootScope.setErrAlertMessage(constants.INVOICE_REPORT_DONWLOAD_ERR);
                    });
            };

            $scope.downloadSORReport = function (data) {
                var url = urlService.downloadTemplateWithCampaignId(data.campaignId);

                dataService
                    .downloadFile(url)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            saveAs(result.file, result.fileName); // jshint ignore:line
                            $rootScope.setErrAlertMessage(constants.INVOICE_TEMPLATE_DOWNLOAD_SUCCESS, 0);
                        } else {
                            $rootScope.setErrAlertMessage(constants.INVOICE_TEMPLATE_DOWNLOAD_ERR);
                        }
                    }, function () {
                        $rootScope.setErrAlertMessage(constants.INVOICE_TEMPLATE_DOWNLOAD_ERR);
                    });
            };

            $scope.filters = {
                selectedStatus: 'Select Status',
                selectedStatusCode: '',

                selectStatus: function (status) {
                    this.selectedStatus = status;
                    this.selectedStatusCode = status;
                },

                selectedGeneratedOn: 'Select TimeFrame',

                selectGeneratedOn: function (timeFrame) {
                    var o = utils.getEndAndStartDate(timeFrame);

                    this.selectedGeneratedOn = o.displayTimeFrame;
                    $('#startDateInput').datepicker('update', o.startDate);
                    $('#endDateInput').datepicker('update', o.endDate);
                },

                selectedMetrics: 'Select Metrics',

                selectMetrics: function (metrics) {
                    this.selectedMetrics = metrics;
                },

                lowValue: '',
                highValue: '',

                apply: function () {
                    $scope.getInvoiceData(0);
                },

                clear: function () {
                    this.selectedStatus = 'Select Status';
                    this.selectedStatusCode = '';
                    this.selectedGeneratedOn = 'Select TimeFrame';
                    this.selectedMetrics = 'Select Metrics';
                    this.lowValue = '';
                    this.highValue = '';
                }
            };

            $('#startDateInput,#endDateInput').on('changeDate', function () {
                $scope.filters.selectedGeneratedOn = 'Custom Dates';
            });

            $scope.showInvoiceReport = function (invoiceId) {
                $location.url('/v1sto/invoices/' + invoiceId);
            };

            $(document).ready(function () {
                _currCtrl.resetDateToInit();
                $(window).unbind('scroll');
                $scope.getInvoiceData(0);

                $('.input-daterange').change(function () {
                    $('.datepicker').hide();
                });
            });

            $scope.$on('$locationChangeSuccess', function () {
                $(window).unbind('scroll');
            });
        });
    }
);
