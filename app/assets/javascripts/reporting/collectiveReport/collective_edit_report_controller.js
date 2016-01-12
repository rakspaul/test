/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveEditReportController', function($scope, $rootScope, $modalInstance, report,
                                                                                 reportIndex, campaignSelectModel, dataService,
                                                                                 urlService, collectiveReportModel, utils,
                                                                                 advertiserModel, brandsModel, constants, $modal,
                                                                                 dataStore, $timeout) {
        $scope.report = report;
        $scope.editScreenBusy = false;
        $scope.editedObj = angular.copy(report);

        $scope.close = function(){
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

        $scope.updateReport = function() {
            $scope.editScreenBusy = true;
            dataService.post(urlService.APIEditReport(report.id), $scope.editedData,{'Content-Type': 'application/json'}).then(function(response) {
                $scope.editedObj.reportType = $scope.editedData.reportType;
                $scope.editedObj.reportName = $scope.editedData.reportName;
                $scope.editedObj.campaignId = $scope.editedData.campaignId;
                $scope.editedObj.campaignName = $scope.editedData.campaignName;
                $scope.editedObj.notes = $scope.editedData.notes;
                $scope.reportList[reportIndex] = $scope.editedObj;
                $scope.editScreenBusy = false;
                $scope.close();
                $rootScope.setErrAlertMessage(constants.reportEditSuccess,0);
                var selectedCampagin = JSON.parse(localStorage.getItem('selectedCampaign')),
                    advertiserId = advertiserModel.getSelectedAdvertiser().id,
                    brandId = brandsModel.getSelectedBrand().id,
                    url = urlService.APIReportList(advertiserId, brandId, selectedCampagin ? selectedCampagin.id : -1);
                if(url) {
                    dataStore.deleteFromCache(url);
                }
                $scope.$parent.sort.descending = true;
                $scope.$parent.getReports();
            },function(error) {
                $scope.editScreenBusy = false;
                $rootScope.setErrAlertMessage(constants.reportEditFailed);
            });
        };

        $scope.updateReportName = function() {
            if($scope.editedData.reportType != 'Custom') {
                $scope.editedData.reportName = "";
            }
        };

        $scope.deleteReportModal = function() {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller:"CollectiveDeleteReportController",
                scope:$scope,
                windowClass: 'delete-dialog',
                resolve: {
                    headerMsg: function() {
                        return constants.deleteReportHeader;
                    },
                    mainMsg: function() {
                        return "Please note that this action affects '<span class='bold-font'>"+ $scope.reportList[reportIndex].fileName+"</span>'. The report will be deleted for both you and the marketer."
                    },
                    deleteAction: function() {
                        return function() {
                            collectiveReportModel.deleteReport(report.id, function (response) {
                                if (response.status_code == 200) {
                                    $scope.reportList.splice(reportIndex, 1);
                                    //to avoid listing report getting encached, remove that url from cache.
                                    var selectedCampagin = JSON.parse(localStorage.getItem('selectedCampaign')),
                                        advertiserId = advertiserModel.getSelectedAdvertiser().id,
                                        brandId = brandsModel.getSelectedBrand().id,
                                        url = urlService.APIReportList(advertiserId, brandId, selectedCampagin ? selectedCampagin.id : -1);
                                    if(url) {
                                        dataStore.deleteFromCache(url);
                                    }
                                    $rootScope.setErrAlertMessage(constants.reportDeleteSuccess,0);
                                } else {
                                    $rootScope.setErrAlertMessage(constants.reportDeleteFailed);
                                }
                            });
                            $scope.close();
                        }
                    }
                }
            });
        };

        $scope.show_report_type_txtbox = function(event) {

            var elem = $(event.target);

            elem.closest(".dropdown").find(".dropdown_txt").text(elem.text()) ;
            if( elem.text() == "Custom" ) {
                elem.closest(".data_row").addClass("custom_report_type") ;
                elem.closest(".data_row").find("#reportName").show() ;
            } else {
                elem.closest(".data_row").removeClass("custom_report_type") ;
                elem.closest(".data_row").find("#reportName").hide() ;
            }

          };

        campaignSelectModel.getCampaigns(brandsModel.getSelectedBrand().id).then(function(response){
            $scope.campaignList = response;
        });

        $scope.setSelectedCampIdAndName = function(campId,campName) {
            $scope.editedData.campaignId = parseInt(campId);
            $scope.editedData.campaignName = campName;
        };
    });
}());
