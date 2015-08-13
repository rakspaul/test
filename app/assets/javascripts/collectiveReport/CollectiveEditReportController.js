/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveEditReportController', function($scope, $modalInstance, report,brand,campaignSelectModel,dataService,urlService) {
        $scope.report = report;
        $scope.brandId = brand;
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
            dataService.put(urlService.APIEditReport(report.id), $scope.editedData,{'Content-Type': 'text/plain; charset=utf-8'}).then(function(response) {
                console.log("Edit Response: ",response);
            });
        }

        campaignSelectModel.getCampaigns($scope.brandId).then(function(response){
            $scope.campaignList = response;
        })
    });
}());