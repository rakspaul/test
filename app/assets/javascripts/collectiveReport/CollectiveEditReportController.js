/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveEditReportController', function($scope, $modalInstance, report,reportIndex,campaignSelectModel,dataService,urlService,collectiveReportModel,utils,brandsModel,constants) {
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
                $scope.ediScreenBusy = false;
                $scope.close();
                $scope.flashMessage.message = constants.reportEditSuccess;
            },function(error) {
                $scope.ediScreenBusy = false;
                $scope.flashMessage.message = constants.reportEditFailed;
                $scope.flashMessage.isErrorMsg = true;
            });
        }

        $scope.deleteReport = function() {
            if (confirm('Are you sure you want to delete this?')) {
                $scope.ediScreenBusy = true;
                //delete file -- server request
                collectiveReportModel.deleteReport(report.id, function(response){
                    if(response.status_code == 200) {
                        $scope.reportList.splice(reportIndex, 1);
                        $scope.ediScreenBusy = false;
                        $scope.flashMessage.message = constants.reportDeleteSuccess;
                        //$scope.message.success = "Report Deleted Successfully";
                    } else {
                        //$scope.editMessage.error = "Error Deleting the Report";
                        $scope.ediScreenBusy = false;
                        $scope.flashMessage.message = constants.reportDeleteFailed;
                        $scope.flashMessage.isErrorMsg = true;
                    }
                    $scope.close();
                });
            }
        }
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