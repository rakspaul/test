/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveReportListingController', function(collectiveReportModel, $scope,$modal, domainReports) {
        $scope.reportToEdit = {};
        $scope.showEditReport = false;
        $scope.campaign =  "Campaign Name";
        domainReports.highlightHeaderMenu();
        $scope.customFilters = domainReports.getCustomReportsTabs();

        collectiveReportModel.reportList(function(response){
           if(response.data !== undefined && response.data.length > 0) {
             $scope.reportList = response.data;
           } else {
             $scope.nodata = true;
           }
            $scope.setReportToEdit = function(index) { console.log('index',index);
                   $scope.reportToEdit = $scope.reportList[index];
                   $scope.showEditReport = true;
            }

         })
        //console.log("Collective report: ",$scope.reportList );

        $scope.editReportModal = function(index) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_edit_collective_report,
                controller:function ($scope, $modalInstance, report,campaignSelectModel,dataService,urlService) {
                    $scope.report = report;
                    $scope.close=function(){
                        $modalInstance.dismiss();//$scope.modalInstance.close() also works I think
                    };
                    $scope.reportTypes =[
                    {id:'CUSTOM',name:'Custom'},
                    {id:'PCAR',name:'PCAR'}
                    ];
                   // console.log('campaigns',campaignSelectModel.getCampaigns(189776123));


                    $scope.campaign="test";
                    $scope.editedData = {
                        reportType:report.reportType,
                        reportName: report.reportName,
                        campaignId:415486,
                        notes:report.notes
                    }
                    $scope.updateReport = function() {
                        var url = urlService.APIEditReport(report.id);
                        //dataService.updateReportData(url,editedData);
                        dataService.updateReportData(url,$scope.editedData).then(function(response) {
                            console.log("Edit Response: ",response);
                        });
                    }
                },
                resolve: {
                    report: function () {
                        return  $scope.reportList[index];
                    }}
            });
        }



        $scope.doSomething=function(){
            //any actions to take place
            console.log("Do Something");
        }

    });
    }());
