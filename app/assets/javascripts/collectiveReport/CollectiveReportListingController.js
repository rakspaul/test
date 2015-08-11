/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';
    collectiveReportModule.controller('CollectiveReportListingController', function(collectiveReportModel, $scope, $modal, domainReports, dataService, urlService) {
        $scope.reportToEdit = {};
        $scope.showEditReport = false;
        $scope.campaign =  "Campaign Name";
        domainReports.highlightHeaderMenu();
        $scope.reportDownloadBusy = false;
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


        //Edit report Pop up
        $scope.editReportModal = function(index) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_edit_collective_report,
                controller:"CollectiveEditReportController",
                resolve: {
                    report: function () {
                        return  $scope.reportList[index];
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




        $scope.doSomething=function(){
            //any actions to take place
            console.log("Do Something");
        }

    });
    }());
