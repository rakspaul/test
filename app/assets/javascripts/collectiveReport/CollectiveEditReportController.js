/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveEditReportController', function($scope, $modalInstance, report,brand,campaignSelectModel,dataService,urlService) {
        $scope.report = report;
        $scope.brandId = brand;

       // $scope.selectedName = editedData.;
        $scope.close=function(){
            $modalInstance.dismiss();
        };

        //Need to move reportTypes
        $scope.reportTypes =[
            {id:'Custom',name:'Custom'},
            {id:'PCAR',name:'PCAR'}
        ];

        //campaignId = 415486
        $scope.editedData = {
            reportType:report.reportType,
            reportName: report.reportName,
            campaignId:report.campaignId,
            notes:report.notes
        }

        //$scope.setCampaignId = function(campaignId) { console.log('campaign Id: ',campaignId);
        //    $scope.editedData.campaignId = campaignId;
        //    console.log("Campaing id set: ",$scope.editedData);
        //}
        $scope.updateReport = function() {
            dataService.post(urlService.APIEditReport(report.id), $scope.editedData,{'Content-Type': 'application/json'}).then(function(response) {
                console.log("Edit Response: ",response);
                console.log($scope.report[report.id]);
                for(var i=0;i<$scope.reportList.length;i++) {
                    if($scope.reportList[i].id == report.id) {
                        console.log($scope.reportList[i])
                        $scope.reportList[i] = $scope.editedData;
                    }
                }
                $scope.close();

            });

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

        campaignSelectModel.getCampaigns($scope.brandId).then(function(response){
            $scope.campaignList = response;
/*            for(var i=0;i<$scope.campaignList;i++) {
                if($scope.campaignList[i] == report.campaignId) {
                    $scope.selectedCampaignObj = $scope.campaignList[i];
                }
            }*/
        })
    });
}());