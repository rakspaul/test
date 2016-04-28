define(['angularAMD', 'reporting/collectiveReport/collective_report_model', 'common/utils', 'login/login_model',
    'common/services/constants_service', 'common/services/url_service', 'common/services/data_store_model',
    'common/services/data_service', 'common/moment_utils', 'common/controllers/confirmation_modal_controller',
    'reporting/collectiveReport/report_schedule_delete_controller'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('ReportsInvoiceListController',
            function ($scope, $filter, $location, $modal, $rootScope, $routeParams, collectiveReportModel, utils,
                     loginModel, constants, urlService, dataStore, domainReports, dataService, $sce, $window/*, momentService, $q*/) {
                var invoiceOverView = {
                    getInvoiceData: function () {
                        dataService
                            .fetch(urlService.getInvoiceData($scope.invoiceReports))
                            .then(function (result) {
                                var responseData/*, clientId, advertiserId*/;

                                if (result.status === 'OK' || result.status === 'success') {
                                    responseData = result.data.data;
                                    $scope.invoiceData = responseData;

                                    // Highlighting of Ad group name & label pills.
                                    // The highlighting will be done at the Search API call.
                                    _.each(responseData, function (obj) {
                                        var i,
                                            j,
                                            temp,
                                            labelsLen,
                                            searchTermsArr,
                                            searchTermsLen,
                                            searchTerm = $scope.invoiceReports.searchTerm.toLowerCase().trim();

                                        //obj.mediaPlanNameHtml = obj.mediaPlanName;

                                        if (searchTerm) {
                                            // Highlight Ad group title
                                            obj.mediaPlanName =
                                                $scope.highlightTitleText(obj.mediaPlanName, searchTerm);

                                            // Highlight Ad group label pills
                                            labelsLen = obj.labels.length;
                                            searchTermsArr = searchTerm.split(' ');
                                            searchTermsLen = searchTermsArr.length;

                                            if (searchTermsLen > 1) {
                                                searchTermsArr.push(searchTerm);
                                            }
                                            for (i = 0; i < labelsLen; i++) {
                                                for (j = 0; j < searchTermsLen; j++) {
                                                    temp = $scope.highlightLabelPill(obj.labels[i], searchTermsArr[j])
                                                        .toString();
                                                    if (temp.indexOf('</mark>') >= 0) {
                                                        obj.labels[i] = temp;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                    }
                };

                $scope.invoiceReports = {
                    advertiserId: '-1',
                    brandId: '-1',
                    startDate: moment().subtract(365, 'day').format(constants.DATE_US_FORMAT),
                    endDate: moment().format(constants.DATE_US_FORMAT)
                };

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
                        invoiceOverView.getInvoiceData();
                    }
                };

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
                    invoiceOverView.getInvoiceData();
                };

                // Search functionality
                $scope.invoiceReports.isSearched = false;
                $scope.invoiceReports.searchTerm = '';

                $scope.invoiceReportsSearchFunc = function (e) {
                    // Perform search if enter key is pressed, or search button is clicked & user has entered something.
                    // NOTE: The event object (e) is not passed if called from search button.
                    if (!e || e.keyCode === 13) {
                        if ($scope.invoiceReports.searchTerm && $scope.invoiceReports.searchTerm.trim()) {
                            // Search term is entered
                            $scope.invoiceReports.isSearched = true;
                        } else {
                            $scope.invoiceReports.isSearched = false;
                        }

                        invoiceOverView.getInvoiceData();
                    }
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
                $scope.invoiceReports.download = function (e) {
                    var href = e.target.href;

                    e.preventDefault();

                    dataService
                        .fetch(href)
                        .then(function (result) {
                            var responseData,
                                uri,
                                mediaPlanName,
                                invoiceDate,
                                fileName = 'patea',
                                link;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data;

                                mediaPlanName = $(e.target)
                                    .parents('.more-options')
                                    .siblings('.media-plan-name')[0]
                                    .innerHTML;

                                // Replace blank spaces with underscore in media plan name
                                mediaPlanName = mediaPlanName.replace(/ /g, '_');

                                invoiceDate = $(e.target)
                                    .parents('.media-plan-name-wrapper')
                                    .siblings('.invoice-date')[0]
                                    .innerHTML;

                                invoiceDate = moment(invoiceDate).format('MMDDYYYY');

                                // Default file name is "MediaPlanName-InvoiceDateInMMDDYYYformat
                                fileName = mediaPlanName + '-' + invoiceDate;

                                // Download the CSV file
                                uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(result.data);

                                //this trick will generate a temp <a /> tag
                                link = document.createElement('a');
                                link.href = uri;

                                //set the visibility hidden so it will not effect on your web-layout
                                link.style = 'visibility:hidden';
                                link.download = fileName + '.csv';

                                //this part will append the anchor tag and remove it after automatic click
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }
                        });
                };

                $(document).ready(function () {
                    invoiceOverView.getInvoiceData();

                    $('.input-daterange').datepicker({
                        format: 'mm/dd/yyyy',
                        orientation: 'auto',
                        autoclose: true,
                        todayHighlight: true
                    });
                });
            }
        );
    }
);
