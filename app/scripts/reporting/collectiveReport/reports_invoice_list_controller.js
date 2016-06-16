define(['angularAMD', 'reporting/collectiveReport/collective_report_model', 'common/utils', 'login/login_model',
    'common/services/constants_service', 'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model',
    'reporting/models/domain_reports','common/services/data_service', 'common/moment_utils',
    'common/services/role_based_service', 'common/services/url_service', 'common/services/data_store_model',
    'common/controllers/confirmation_modal_controller','reporting/collectiveReport/report_schedule_delete_controller', 'workflow/controllers/ad_clone_controller',
    'reporting/collectiveReport/reports_invoice_addAdjustment_controller', 'reporting/collectiveReport/invoice_upload_SOR_controller','workflow/directives/custom_date_picker' ],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('ReportsInvoiceListController',
            function ($scope, $filter, $location, $modal, $rootScope, $routeParams,
                     collectiveReportModel, utils, loginModel,
                     constants, advertiserModel, brandsModel,
                     domainReports, dataService, momentService,
                     RoleBasedService, urlService, dataStore,
                     $sce, $window/*, momentService, $q*/) {
                var _currCtrl = this;
                _currCtrl.last_page = false;
                $scope.invoiceReports = {
                    clientId: loginModel.getSelectedClient().id,
                    advertiserId: (advertiserModel.getAdvertiser().selectedAdvertiser ? advertiserModel.getAdvertiser().selectedAdvertiser.id : -1),
                    brandId: (brandsModel.getSelectedBrand().id),
                    startDate: moment().subtract(365, 'day').format(constants.DATE_US_FORMAT),
                    endDate: moment().format(constants.DATE_US_FORMAT),
                    page_num: 1
                };
                _currCtrl.resetDateToInit = function(){
                    console.log("constants.DATE_US_FORMAT...",constants.DATE_US_FORMAT);
                    $scope.invoiceReports.startDate = moment().subtract(365, 'day').format(constants.DATE_UTC_SHORT_FORMAT);
                    $scope.invoiceReports.endDate = moment().format(constants.DATE_UTC_SHORT_FORMAT);
                    $("#startDateInput").val($scope.invoiceReports.startDate);
                    $("#endDateInput").val($scope.invoiceReports.endDate);
                    //$('#startDateInput').datepicker('setDate', $scope.invoiceReports.startDate);
                    //$('#endDateInput').datepicker('setDate',$scope.invoiceReports.endDate);
                  //  $('#startDateInput').datepicker('setDate', momentService.todayDate('YYYY-MM-DD'));
                }
                _currCtrl.resetPagination = function(){
                    _currCtrl.last_page = false;
                    $scope.invoiceReports.page_num = 1;
                    $scope.mediaPlanList = [];
                }
                _currCtrl.resetPagination();
                $scope.addAdjustmentData = {}
                _currCtrl.postProcessMediaPlanData = function(){
                    _.each($scope.mediaPlanList, function(mediaPlan, mp_i){
                        mediaPlan.invoiceDate = momentService.newMoment(mediaPlan.invoiceDate).format('DD MMM YYYY')
                        $scope["loadMoreInvoice_"+mp_i] = mediaPlan.invoices.length > 3 ? true : false;
                        mediaPlan.invoices = _.filter(mediaPlan.invoices,function(item, in_i){
                            return in_i < 3;
                        });
                    });
                }
                _currCtrl.preProcessMediaPlanData = function(data){
                    _.each(data, function(item){
                        item.invoiceDate = momentService.newMoment(item.invoiceDate).format('DD MMM YYYY');
                        _.each(item.invoices, function(invoice){
                            invoice.invoiceDate = momentService.newMoment(invoice.invoiceDate).format('DD MMM YYYY');
                        });
                    })
                }
                $scope.loadMoreInvoice = function(mp_i){
                    $scope.mediaPlanList[mp_i].invoices = angular.copy(_currCtrl.resMediaPanList[mp_i].invoices);
                    $scope["loadMoreInvoice_"+mp_i] = false;
                }
                _currCtrl.getQueryStr = function(){
                    var queryStr = '&page_num='+$scope.invoiceReports.page_num+'&page_size=50';
                    queryStr += $scope.filters.selectedStatusCode && '&status='+$scope.filters.selectedStatusCode;
                    $("#startDateInput").val() && (queryStr += '&start_date='+$("#startDateInput").val());
                    $("#endDateInput").val() && (queryStr += '&end_date='+$("#endDateInput").val());
                    return queryStr;
                }
                $scope.getInvoiceData = function(isLoadMore){
                    $scope.fetching = true;
                    !isLoadMore && _currCtrl.resetPagination();
                    $scope.noDataFound = false;
                        dataService
                            .fetch(urlService.getInvoiceData($scope.invoiceReports, _currCtrl.getQueryStr()))
                            .then(function (result) {
                                $scope.fetching = false;
                                ($scope.invoiceReports.page_num == 1) && ($scope.noDataFound = true);
                                var responseData/*, clientId, advertiserId*/;
                                if (result.status === 'OK' || result.status === 'success') {
                                    responseData = result.data.data;
                                    if(responseData.length) {
                                        $scope.noDataFound = false;
                                        _currCtrl.preProcessMediaPlanData(responseData);
                                        $scope.mediaPlanList = responseData;
                                        _currCtrl.resMediaPanList = angular.copy(responseData);
                                        _currCtrl.postProcessMediaPlanData();
                                        attachScrollToWindow();
                                    }else{
                                        _currCtrl.last_page = true;
                                    }
                                }else{
                                    _currCtrl.last_page = true;
                                }
                            },function(err){
                                _currCtrl.last_page = true;
                                $scope.fetching = false;
                            });
                    }

                // Search Clear
                $scope.searchHideInput = function (evt) {
                    $(evt.target).hide();
                    $('.searchInputForm input').val('');
                    if ($scope.invoiceReports.isSearched) {
                        $scope.invoiceReports.isSearched = false;
                        $scope.invoiceReports.searchTerm = '';
                        $scope.getInvoiceData();
                    }
                };

                $scope.$on(constants.EVENT_ADVERTISER_CHANGED, function(event, args) {
                    $scope.invoiceReports.advertiserId = advertiserModel.getAdvertiser().selectedAdvertiser ? advertiserModel.getAdvertiser().selectedAdvertiser.id : -1,
                    $scope.getInvoiceData(0);
                });
                $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
                    $scope.invoiceReports.brandId = brandsModel.getSelectedBrand().id;
                    $scope.getInvoiceData(0);
                });
                $scope.$on(constants.EVENT_CLIENT_CHANGED, function(event, args) {
                    $scope.invoiceReports.clientId = loginModel.getSelectedClient().id,
                    $scope.getInvoiceData(0);
                });
                $scope.$on(constants.CREDIT_SAVED_SUCCESS, function(event, args) {
                    $scope.invoiceReports.clientId = loginModel.getSelectedClient().id,
                        $scope.getInvoiceData(0);
                });
                $scope.goClick = function(){
//                    $("#startDateInput").val() && ($scope.invoiceReports.startDate = $("#startDateInput").val());
//                    $("#endDateInput").val() && ($scope.invoiceReports.endDate = $("#endDateInput").val());
//                    $scope.getInvoiceData(0);
                }
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

                $scope.toggleInvocieLists=function(mediaPlan,index,event){
                    var elem = $(event.target),
                        sel = $("div[data-row-index="+index+"] .icon-arrow-down-thick");
                    if (sel.hasClass("icon-arrow-down-open")) {
                        sel.removeClass("icon-arrow-down-open");
                        $("div[data-row-index="+index+"] .secondDimensionList").hide() ;
                        sel.closest(".oneDimensionRow").removeClass('visible') ;
                    } else {
                        sel.addClass("icon-arrow-down-open") ;
                        $("div[data-row-index="+index+"] .secondDimensionList").show() ;
                    }
                };

                $scope.showAddAdjustmentPopup = function (invoice) {
                    $scope.addAdjustmentData = angular.copy(invoice);
                    var $modalInstance = $modal.open({
                        templateUrl: assets.html_add_credit_popup,
                        controller: 'invoiceUploadSOR',
                        scope: $scope,
                        windowClass: 'edit-dialog',
                        resolve: {
                            getMediaPlansForClone: function () {
                            }
                        }
                    });
                };
                $scope.showUploadSORPopUp = function(invoice){
                    $scope.invoiceData = angular.copy(invoice);
                    var $modalInstance = $modal.open({
                        templateUrl: assets.html_invocie_upload_SOR,
                        controller: 'ReportsInvoiceAddAdjustmentController',
                        scope: $scope,
                        windowClass: 'edit-dialog uploadSORPopup',
                        resolve: {
                            getMediaPlansForClone: function () {
                            }
                        }
                    });
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
                    var href = e.target.href,
                        url = "";
                    e.preventDefault();
                    url = data.downloadLink ? data.downloadLink :
                          data.campaignId ? urlService.downloadInvoiceCampaign(data.campaignId) : "";
                    dataService
                        .downloadFile(url)
                        .then(function (result) {
                            var responseData,
                                uri,
                                mediaPlanName,
                                invoiceDate,
                                fileName = 'patea',
                                link;

                            if (result.status === 'OK' || result.status === 'success') {
                                saveAs(result.file, result.fileName);
                            }
                        });
                };
                $scope.filters = {
                    "selectedStatus" : "Select Status",
                    "selectedStatusCode" : "",
                    "selectStatus": function(status){
                        this.selectedStatus = status;
                        this.selectedStatusCode = status.toLowerCase();
                    },
                    "selectedGeneratedOn" : "Select TimeFrame",
                    "selectGeneratedOn": function(timeFrame){
                        var o = utils.getEndAndStartDate(timeFrame);
                        this.selectedGeneratedOn = o.displayTimeFrame;
                        $('#startDateInput').datepicker('update', o.startDate);
                        $('#endDateInput').datepicker('update', o.endDate);
                    },
                    "selectedMetrics": "Select Metrics",
                    "selectMetrics": function(metrics){
                        this.selectedMetrics = metrics;
                    },
                    "lowValue": "",
                    "highValue": "",
                    apply: function(){
                        $scope.getInvoiceData(0);
                    },
                    clear: function(){
                        this.selectedStatus = "Select Status";
                        this.selectedStatusCode = "";
                        this.selectedGeneratedOn = "Select TimeFrame";
                        this.selectedMetrics = "Select Metrics";
                        this.lowValue = "";
                        this.highValue = "";
                    }
                }
                $('#startDateInput,#endDateInput').on('changeDate', function() {
                    $scope.filters["selectedGeneratedOn"] = "Custom Dates";
                });
                $scope.showInvoiceReport = function(invoiceId){
                    console.log("showInvoiceReport..."+invoiceId);
                    $location.url('/v1sto/invoices/'+invoiceId);
                }
                $(document).ready(function () {
                    _currCtrl.resetDateToInit();
                    $(window).unbind('scroll');
                    $scope.getInvoiceData(0);
                    $('.input-daterange').change(function(){
                        $('.datepicker').hide();
                    });
                });
                function attachScrollToWindow() {
                    $(window).scroll(function () {
                        if (!$scope.fetching && !_currCtrl.last_page && (($(window).scrollTop() + $(window).height()) >= $(document).height() - 100)) {
                            $scope.invoiceReports.page_num += 1;
                            $scope.getInvoiceData(1);
                        }
                    });
                }
                $scope.$on("$locationChangeSuccess", function(){
                    $(window).unbind('scroll');
                });
            }
        );
    }
);
