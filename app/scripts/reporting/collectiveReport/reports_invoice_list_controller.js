define(['angularAMD', 'reporting/collectiveReport/collective_report_model', 'common/utils', 'login/login_model',
    'common/services/constants_service', 'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model',
    'reporting/models/domain_reports','common/services/data_service', 'common/moment_utils',
    'common/services/role_based_service', 'common/services/url_service', 'common/services/data_store_model',
    'common/controllers/confirmation_modal_controller','reporting/collectiveReport/report_schedule_delete_controller', 'workflow/controllers/ad_clone_controller',
    'reporting/collectiveReport/reports_invoice_addCredit_controller', 'workflow/directives/custom_date_picker' ],
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
                    $scope.invoiceReports.startDate = moment().subtract(365, 'day').format(constants.DATE_US_FORMAT);
                    $scope.invoiceReports.endDate = moment().format(constants.DATE_US_FORMAT);
                    $("#startDateInput").val($scope.invoiceReports.startDate);
                    $("#endDateInput").val($scope.invoiceReports.endDate);
                    $('#startDateInput').datepicker('setDate', $scope.invoiceReports.startDate);
                    $('#endDateInput').datepicker('setDate',$scope.invoiceReports.endDate);
                }
                _currCtrl.resetPagination = function(){
                    _currCtrl.last_page = false;
                    $scope.invoiceReports.page_num = 1;
                    $scope.mediaPlanList = [];
                }
                _currCtrl.resetPagination();
                $scope.addCreditData = {}
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
                $scope.getInvoiceData = function(isLoadMore){
                    $scope.fetching = true;
                    !isLoadMore && _currCtrl.resetPagination();
                    $scope.noDataFound = false;
                        dataService
                            .fetch(urlService.getInvoiceData($scope.invoiceReports))
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



                $scope.searchHideInput = function () {
                    $('.searchInputForm input').val('');
                    $('.searchInputBtn').show();
                    $('.searchClearInputBtn, .searchInputBtnInline').hide();
                    $('.searchInputForm').animate({width: '34px'}, 'fast');

                    setTimeout(function () {
                        $('.searchInputForm').hide();
                    }, 100);

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
                    $("#startDateInput").val() && ($scope.invoiceReports.startDate = $("#startDateInput").val());
                    $("#endDateInput").val() && ($scope.invoiceReports.endDate = $("#endDateInput").val());
                    $scope.getInvoiceData(0);
                }
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

                $scope.showAddCreditPopup = function (invoice) {
                    $scope.addCreditData.invoice = angular.copy(invoice);
                    var $modalInstance = $modal.open({
                        templateUrl: assets.html_add_credit_popup,
                        controller: 'ReportsInvoiceAddCreditController',
                        scope: $scope,
                        windowClass: 'edit-dialog',
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
                    var href = e.target.href;

                    e.preventDefault();

                    dataService
                        .downloadFile(data.downloadLink)
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