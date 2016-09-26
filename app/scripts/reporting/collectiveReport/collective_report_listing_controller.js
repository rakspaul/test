define(['angularAMD', 'collective-report-model', 'url-service', 'campaign-select-model', 'data-store-model', 'common-utils', 'collective-delete-report-controller',
    'collective-edit-report-controller'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('CollectiveReportListingController', ['$filter', '$scope', '$rootScope', '$modal', '$location', 'collectiveReportModel', 'brandsModel', 'dataService',
        'urlService', 'campaignSelectModel', 'constants', 'dataStore', 'utils', 'advertiserModel', 'domainReports', 'vistoconfig', 'reportsList', 'urlBuilder', 'pageLoad',
        function ($filter, $scope, $rootScope, $modal, $location, collectiveReportModel, brandsModel, dataService, urlService, campaignSelectModel, constants, dataStore, utils,
                  advertiserModel, domainReports, vistoconfig, reportsList, urlBuilder, pageLoad) {
        var browserInfo = utils.detectBrowserInfo();

        console.log('COLLECTIVE INSIGHTS controller is loaded!');
        // Hide page loader when the page is loaded
        pageLoad.hidePageLoader();

        $scope.reportToEdit = {};
        $scope.showEditReport = false;
        $scope.campaign = 'Media Plan Name';
        domainReports.highlightHeaderMenu();
        $scope.customFilters = domainReports.getCustomReportsTabs();
        $scope.reportList = collectiveReportModel.getReportListData();
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.nodata = $scope.reportList.length ? '' : 'No Data Available';

        $scope.sort = {
            column: 'updatedAt',
            descending: true
        };

        $scope.screenBusy = false;


        // Edit report Pop up
        $scope.editReportModal = function (index) {
            $modal.open({
                templateUrl: assets.html_edit_collective_report,
                controller: 'CollectiveEditReportController',
                scope: $scope,
                windowClass: 'edit-dialog',

                resolve: {
                    report: function () {
                        return $scope.reportList[index];
                    },

                    reportIndex: function () {
                        return index;
                    },

                    reportList: function () {
                        return $scope.reportList;
                    }
                }
            });
        };

        // Delete report Pop up
        $scope.deleteReportModal = function (index, reportId) {
            $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller: 'CollectiveDeleteReportController',
                scope: $scope,
                windowClass: 'delete-dialog',

                resolve: {
                    headerMsg: function () {
                        return constants.deleteReportHeader;
                    },

                    mainMsg: function () {
                        if ($scope.reportList[index].reportName) {
                            return 'Are you sure you want to delete \'<span class="bold-font">' +
                                $scope.reportList[index].reportType +
                                '</span>\' type report' +
                                '\'<span class="bold-font">' +
                                $scope.reportList[index].reportName +
                                '\'</span>.';
                        } else {
                            return 'Are you sure you want to delete \'<span class="bold-font">' +
                                $scope.reportList[index].reportType +
                                '</span>\' type report.';
                        }
                    },

                    deleteAction: function () {
                        return function () {
                            collectiveReportModel.deleteReport(reportId, function (response) {

                                if (response.status_code === 200) {
                                    $scope.reportList.splice(index, 1);
                                    $rootScope.setErrAlertMessage(constants.reportDeleteSuccess, 0);
                                } else {
                                    $rootScope.setErrAlertMessage(constants.reportDeleteFailed);
                                }
                            });
                        };
                    }
                }
            });
        };

        $scope.downloadCollectiveReport = function (reportId) {
            if (reportId) {
                $scope.screenBusy = true;
                var clientId = vistoconfig.getSelectedAccountId();

                dataService
                    .downloadFile(urlService.APIDownloadReport(clientId, reportId))
                    .then(function (response) {
                        if (response.status === 'success') {
                            $scope.screenBusy = false;
                            saveAs(response.file, response.fileName);

                            if (browserInfo.browserName !== 'Firefox') {
                                $rootScope.setErrAlertMessage(constants.reportDownloadSuccess, 0);
                            }
                        } else {
                            $scope.screenBusy = false;
                            $rootScope.setErrAlertMessage(constants.reportDownloadFailed);
                        }
                    }, function () {
                        $scope.screenBusy = false;
                        $rootScope.setErrAlertMessage(constants.reportDownloadFailed);
                    }, function () {
                        $scope.screenBusy = false;
                        $rootScope.setErrAlertMessage(constants.reportDownloadFailed);
                    });
            } else {
                $scope.screenBusy = false;
                $rootScope.setErrAlertMessage(constants.reportDownloadFailed);
            }
        };

        $scope.sortReport = function (column) {
            $scope.sort.column = column;
            $scope.reportList = $filter('orderBy')($scope.reportList, column, $scope.sort.descending);
            $scope.sort.descending = !$scope.sort.descending;
        };

        $scope.sortReport($scope.sort.column);

        $scope.goToUploadReports = function() {
            $location.url(urlBuilder.uploadReportsUrl());
        };

    }]);
});
