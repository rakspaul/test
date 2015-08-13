/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';
    collectiveReportModule.controller('CollectiveReportListingController', function(collectiveReportModel, $scope, $modal, domainReports, dataService, urlService,campaignSelectModel,constants) {
        $scope.reportToEdit = {};
        $scope.showEditReport = false;
        $scope.campaign =  "Campaign Name";
        domainReports.highlightHeaderMenu();
        $scope.reportDownloadBusy = false;
        $scope.customFilters = domainReports.getCustomReportsTabs();
        $scope.brandId = -1;
        $scope.reportList = [];

        $scope.getReports = function() {
            collectiveReportModel.reportList(function (response) {
                if (response.data !== undefined && response.data.length > 0) {
                    $scope.reportList = response.data;
/*                    console.log("Report List: ",$scope.reportList);
                    $scope.reportList[0].createdBy = "Sapna";
                    $scope.reportList[3].createdBy = "Mini";
                    $scope.reportList[1].createdBy = "Zoo";
                    console.log($scope.reportList);*/
                    $scope.nodata = false;
                } else {
                    $scope.reportList = [];
                    $scope.nodata = true;
                }
                $scope.setReportToEdit = function(index) {
                 $scope.reportToEdit = $scope.reportList[index];
                 $scope.showEditReport = true;
                 }

            })
        }

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();  //update the selected Campaign
            $scope.getReports();
        });


        //Edit report Pop up
        $scope.editReportModal = function(index) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_edit_collective_report,
                controller:"CollectiveEditReportController",
                resolve: {
                    report: function () {
                        return  $scope.reportList[index];
                    },
                    brand: function() {
                        return $scope.brandId;
                    }
                }
            });
        }

        $scope.downloadCollectiveReport = function(reportId) {
            if(reportId) {
            $scope.reportDownloadBusy = true;
            dataService.downloadFile(urlService.APIDownloadReport(reportId)).then(function (response) {
                console.log("Response Status: ", response.status);
                if (response.status === "success") {
                    $scope.reportDownloadBusy = false;
                    saveAs(response.file, response.fileName);
                } else {
                    $scope.reportDownloadBusy = false;
                    //todo: Show error message
                }
            }, function () {
                $scope.reportDownloadBusy = false;
            }, function () {
                $scope.reportDownloadBusy = false;
            });
          } else {
                //todo: show error message
            }
        }


       $scope.deleteReport = function($index,reportId) {
           if (confirm('Are you sure you want to delete this?')) {
               //delete file -- server request
               collectiveReportModel.deleteReport(reportId, function(response){
                   if(response.status_code == 200) {
                       $scope.reportList.splice($index, 1);
                   } else {
                       console.log('delete error');
                   }
               });

           }
       }

        $scope.sort = {column:'reportType',descending:false};
            $scope.sortReport = function(column) {
                $scope.sort.column = column;
                $scope.sort.descending = !$scope.sort.descending;
           }


    });
    }());
