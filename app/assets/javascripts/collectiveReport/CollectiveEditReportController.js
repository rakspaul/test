/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveEditReportController', function($scope, $modalInstance, report,reportIndex,campaignSelectModel,dataService,urlService,collectiveReportModel,utils,brandsModel,constants,$modal,dataStore) {
        $scope.report = report;
        $scope.ediScreenBusy = false;
        $scope.editedObj = angular.copy(report);

       // $scope.selectedName = editedData.;
        $scope.close=function(){
            $modalInstance.dismiss();
        };

        $scope.reportTypes = utils.reportTypeOptions();

        //campaignId = 415486
        $scope.editedData = {
            reportType:report.reportType,
            reportName: report.reportName,
            campaignId:report.campaignId,
            notes:report.notes
        }

        $scope.updateReport = function() {
            $scope.ediScreenBusy = true;
            dataService.post(urlService.APIEditReport(report.id), $scope.editedData,{'Content-Type': 'application/json'}).then(function(response) {
                $scope.editedObj.reportType = $scope.editedData.reportType;
                $scope.editedObj.reportName = $scope.editedData.reportName
                $scope.editedObj.campaignId = $scope.editedData.campaignId
                $scope.editedObj.notes = $scope.editedData.notes;
                $scope.reportList[reportIndex] = $scope.editedObj;
                console.log($scope.reportList);
                $scope.ediScreenBusy = false;
                $scope.close();
                $scope.flashMessage.message = constants.reportEditSuccess;
            },function(error) {
                $scope.ediScreenBusy = false;
                $scope.flashMessage.message = constants.reportEditFailed;
                $scope.flashMessage.isErrorMsg = true;
            });
        }

        $scope.updateReportName = function() {
            if($scope.editedData.reportType != 'Custom') {
                $scope.editedData.reportName = "";
            }
        }

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
                                    var selectedCampaginObj = JSON.parse(localStorage.getItem('selectedCampaign'));
                                    var url = urlService.APIReportList(selectedCampaginObj.id);
                                    if(url) {
                                        dataStore.deleteFromCache(url);
                                    }
                                    $scope.flashMessage.message = constants.reportDeleteSuccess;
                                } else {
                                    $scope.flashMessage.message = constants.reportDeleteFailed;
                                    $scope.flashMessage.isErrorMsg = true;
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

        $scope.selectedCampaignObj = campaignSelectModel.getSelectedCampaign();

        campaignSelectModel.getCampaigns(brandsModel.getSelectedBrand().id).then(function(response){
            $scope.campaignList = response;
        })
    });
}());
