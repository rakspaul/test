define(['angularAMD', 'collective-report-model', 'common-utils', 'url-service','report-schedule-delete-controller', 'reports-invoice-addAdjustment-controller',
    'invoice-upload-SOR-controller','custom-date-picker'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('ReportsInvoiceListController', ['$scope', '$filter', '$location', '$modal', '$rootScope', '$routeParams', 'collectiveReportModel', 'utils',
            'loginModel', 'constants', 'advertiserModel', 'brandsModel', 'domainReports', 'dataService', 'momentService', 'RoleBasedService', 'urlService', 'dataStore',
            'vistoconfig', 'urlBuilder', '$sce', 'pageLoad',
            function ($scope, $filter, $location, $modal, $rootScope, $routeParams, collectiveReportModel, utils, loginModel, constants, advertiserModel, brandsModel,
                      domainReports, dataService, momentService, RoleBasedService, urlService, dataStore, vistoconfig, urlBuilder, $sce, pageLoad) {
            var _currCtrl = this;

            console.log('INVOICE BILLING LIST controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            $scope.invoiceReports = {
                clientId: vistoconfig.getSelectedAccountId(),

                advertiserId: vistoconfig.getSelectAdvertiserId(),

                brandId: vistoconfig.getSelectedBrandId(),
                startDate: moment().subtract(365, 'day').format(constants.DATE_US_FORMAT),
                endDate: moment().format(constants.DATE_US_FORMAT),
                page_num: 1
            };

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
                _.each($scope.mediaPlanList, function (mediaPlan, mp_i) {
                    mediaPlan.invoiceDate = momentService.newMoment(mediaPlan.invoiceDate).format('DD MMM YYYY');
                    $scope['loadMoreInvoice_'+mp_i] = mediaPlan.invoices.length > 3 ? true : false;

                    mediaPlan.invoices = _.filter(mediaPlan.invoices,function (item, in_i) {
                        return in_i < 3;
                    });
                });
            };

            _currCtrl.preProcessMediaPlanData = function (data) {
                _.each(data, function (item) {
                    item.invoiceDate = momentService.newMoment(item.invoiceDate).format('DD MMM YYYY');

                    _.each(item.invoices, function (invoice) {
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
                    angular.copy(_currCtrl.resMediaPanList[mp_i].invoices);

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
                                if(isLoadMore){
                                    responseData = $scope.mediaPlanList.concat(responseData);
                                };
                                $scope.mediaPlanList = responseData;
                                _currCtrl.resMediaPanList = angular.copy(responseData);
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
                $scope.invoiceReports.advertiserId = vistoconfig.getSelectAdvertiserId();

                $scope.getInvoiceData(0);
            });

            $scope.$on(constants.EVENT_BRAND_CHANGED, function () {
                $scope.invoiceReports.brandId = vistoconfig.getSelectedBrandId();
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

            // Search Hide / Show
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

            $scope.toggleInvoiceLists = function (mediaPlan, index) {
                var sel = $('div[data-row-index=' + index + '] .arrowbtn');

                if (sel.hasClass('icon-toggleopen')) {
                    sel.removeClass('icon-toggleopen');
                    sel.addClass('icon-toggleclose') ;
                    $('div[data-row-index=' + index + '] .secondDimensionList').hide() ;
                    sel.closest('.oneDimensionRow').removeClass('visible') ;
                } else {
                    sel.addClass('icon-toggleopen') ;
                    sel.removeClass('icon-toggleclose') ;
                    $('div[data-row-index=' + index + '] .secondDimensionList').show() ;
                }
            };

            $scope.showAddAdjustmentPopup = function (invoice) {
                $modal.open({
                    templateUrl: assets.html_add_credit_popup,
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

                url = data.campaignId ? urlService.downloadInvoiceCampaign($scope.invoiceReports.clientId, data.campaignId) : '';

                dataService
                    .downloadFile(url)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            saveAs(result.file, result.fileName);
                            $rootScope.setErrAlertMessage(constants.INVOICE_REPORT_DONWLOAD_SUCCESS, 0);
                        } else {
                            $rootScope.setErrAlertMessage(constants.INVOICE_REPORT_DONWLOAD_ERR);
                        }
                    }, function () {
                        $rootScope.setErrAlertMessage(constants.INVOICE_REPORT_DONWLOAD_ERR);
                    });
            };

            $scope.downloadSORReport = function (data) {
                var url = urlService.downloadTemplateWithCampaignId($scope.invoiceReports.clientId, data.campaignId);

                dataService
                    .downloadFile(url)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            saveAs(result.file, result.fileName);
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
                urlBuilder.gotoInvoiceReport(invoiceId);
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
        }]);
    }
);
