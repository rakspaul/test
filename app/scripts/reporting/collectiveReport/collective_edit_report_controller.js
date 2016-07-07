/**
 * Created by Sapna kotresh on 06/08/15.
 */
define(['angularAMD', 'reporting/campaignSelect/campaign_select_model', // jshint ignore:line
    'common/services/data_service', 'common/services/url_service',
    'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model', 'common/services/constants_service',
    'reporting/collectiveReport/collective_report_model', 'common/utils', 'common/services/data_store_model'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('CollectiveEditReportController', function ($modal, $scope, $rootScope, $modalInstance,
                                                                         campaignSelectModel, dataService, urlService,
                                                                         advertiserModel, brandsModel, constants,
                                                                         collectiveReportModel, utils, dataStore,
                                                                         report, reportIndex) {
            $scope.report = report;
            $scope.editScreenBusy = false;
            $scope.editedObj = angular.copy(report); // jshint ignore:line

            $scope.close = function () {
                $modalInstance.dismiss();
            };

            $scope.reportTypes = utils.reportTypeOptions();

            $scope.editedData = {
                reportType: report.reportType,
                reportName: report.reportName,
                campaignId: parseInt(report.campaignId),
                campaignName: report.campaignName,
                notes: report.notes
            };

            $scope.updateReport = function () {
                $scope.editScreenBusy = true;

                dataService.post(
                    urlService.APIEditReport(report.id),
                    $scope.editedData, {
                        'Content-Type': 'application/json'
                    }
                ).then(function () {
                    var selectedCampaign,
                        advertiserId,
                        brandId,
                        url;

                    $scope.editedObj.reportType = $scope.editedData.reportType;
                    $scope.editedObj.reportName = $scope.editedData.reportName;
                    $scope.editedObj.campaignId = $scope.editedData.campaignId;
                    $scope.editedObj.campaignName = $scope.editedData.campaignName;
                    $scope.editedObj.notes = $scope.editedData.notes;
                    $scope.reportList[reportIndex] = $scope.editedObj;
                    $scope.editScreenBusy = false;
                    $scope.close();
                    $rootScope.setErrAlertMessage(constants.reportEditSuccess, 0);

                    selectedCampaign = JSON.parse(localStorage.getItem('selectedCampaign'));
                    advertiserId = advertiserModel.getSelectedAdvertiser().id;
                    brandId = brandsModel.getSelectedBrand().id;
                    url = urlService.APIReportList(advertiserId, brandId, selectedCampaign ? selectedCampaign.id : -1);

                    if (url) {
                        dataStore.deleteFromCache(url);
                    }

                    $scope.$parent.sort.descending = true;
                    $scope.$parent.getReports();
                }, function () {
                    $scope.editScreenBusy = false;
                    $rootScope.setErrAlertMessage(constants.reportEditFailed);
                });
            };

            $scope.updateReportName = function () {
                if ($scope.editedData.reportType !== 'Custom') {
                    $scope.editedData.reportName = '';
                }
            };

            $scope.deleteReportModal = function () {
                var $modalInstance = $modal.open({ // jshint ignore:line
                    templateUrl: assets.html_delete_collective_report, // jshint ignore:line
                    controller: 'CollectiveDeleteReportController', // jshint ignore:line
                    scope: $scope,
                    windowClass: 'delete-dialog',

                    resolve: {
                        headerMsg: function () {
                            return constants.deleteReportHeader;
                        },

                        mainMsg: function () {
                            if ($scope.reportList[reportIndex].reportName) {
                                return 'Are you sure you want to delete \'<span class="bold-font">' +
                                    $scope.reportList[reportIndex].reportType +
                                    '</span>\' type report' +
                                    '\'<span class="bold-font">' +
                                    $scope.reportList[reportIndex].reportName +
                                    '\'</span>.';
                            } else {
                                return 'Are you sure you want to delete \'<span class="bold-font">' +
                                    $scope.reportList[reportIndex].reportType +
                                    '</span>\' type report.';
                            }
                        },

                        deleteAction: function () {
                            return function () {
                                collectiveReportModel.deleteReport(report.id, function (response) {
                                    var selectedCampaign,
                                        advertiserId,
                                        brandId,
                                        url;

                                    if (response.status_code === 200) {
                                        $scope.reportList.splice(reportIndex, 1);

                                        //to avoid listing report getting encached, remove that url from cache.
                                        selectedCampaign = JSON.parse(localStorage.getItem('selectedCampaign'));
                                        advertiserId = advertiserModel.getSelectedAdvertiser().id;
                                        brandId = brandsModel.getSelectedBrand().id;

                                        url = urlService.APIReportList(advertiserId, brandId, selectedCampaign ?
                                            selectedCampaign.id : -1);

                                        if (url) {
                                            dataStore.deleteFromCache(url);
                                        }

                                        $rootScope.setErrAlertMessage(constants.reportDeleteSuccess, 0);
                                    } else {
                                        $rootScope.setErrAlertMessage(constants.reportDeleteFailed);
                                    }
                                });
                                $scope.close();
                            };
                        }
                    }
                });
            };

            $scope.show_report_type_txtbox = function (event) {
                var elem = $(event.target);

                elem.closest('.dropdown').find('.dropdown_txt').text(elem.text());

                if (elem.text() === 'Custom') {
                    elem.closest('.data_row').addClass('custom_report_type');
                    elem.closest('.data_row').find('#reportName').show();
                } else {
                    elem.closest('.data_row').removeClass('custom_report_type');
                    elem.closest('.data_row').find('#reportName').hide();
                }
            };

            campaignSelectModel
                .getCampaigns(brandsModel.getSelectedBrand().id)
                .then(function (response) {
                    $scope.campaignList = response;
                });

            $scope.setSelectedCampIdAndName = function (campId, campName) {
                $scope.editedData.campaignId = parseInt(campId);
                $scope.editedData.campaignName = campName;
            };
        });
    }
);