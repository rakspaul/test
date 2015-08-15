/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';
    collectiveReportModule.controller('CollectiveReportListingController', function(collectiveReportModel, $scope, $modal, domainReports, dataService, urlService,campaignSelectModel,constants, $filter) {
        $scope.reportToEdit = {};
        $scope.showEditReport = false;
        $scope.campaign =  "Campaign Name";
        domainReports.highlightHeaderMenu();
        $scope.reportDownloadBusy = false;
        $scope.customFilters = domainReports.getCustomReportsTabs();
        $scope.brandId = -1;
        $scope.reportList = [];
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.nodata = "";
        $scope.sort = {column:'updatedAt',descending:true};


        // $scope.getReports = function() { $scope.nodata = "Loading....";
        //     collectiveReportModel.reportList(function (response) {
        //         if (response.data !== undefined && response.data.length > 0) {
        //             $scope.reportList = response.data;
        //             $scope.nodata = "";
        //             $scope.sortReport($scope.sort.column);
        //         } else {
        //             $scope.reportList = [];
        //             $scope.nodata = "Data not found";
        //         }
        //         $scope.setReportToEdit = function(index) {
        //          $scope.reportToEdit = $scope.reportList[index];
        //          $scope.showEditReport = true;
        //          }

        //     })
        // }
        $scope.getReports = function() {
$scope.ReportList = [
        {
            "id": 802,
            "campaignId": 415486,
            "reportType": "PCAR",
            "reportName": "",
            "fileName": "197 IT Statement.pdf",
            "createdBy": "insights-admin Dashboard",
            "notes": "",
            "fileSize": "139.154 KB",
            "createAt": "2015-08-13 05:22:41",
            "updatedAt": "2015-08-13 05:22:41"
        },
        {
            "id": 803,
            "campaignId": 415486,
            "reportType": "Custom",
            "reportName": "Custom Report Name",
            "fileName": "2014.pdf",
            "createdBy": "insights-admin Dashboard",
            "notes": "Report notes if any can be entered here",
            "fileSize": "325.068 KB",
            "createAt": "2015-08-13 07:20:02",
            "updatedAt": "2015-08-13 07:20:02"
        },
        {
            "id": 804,
            "campaignId": 415486,
            "reportType": "Monthly",
            "reportName": "",
            "fileName": "2014.pdf",
            "createdBy": "insights-admin Dashboard",
            "notes": "New report notes and description",
            "fileSize": "325.068 KB",
            "createAt": "2015-08-13 07:20:34",
            "updatedAt": "2015-08-13 07:20:34"
        },
        {
            "id": 805,
            "campaignId": 415486,
            "reportType": "PCAR",
            "reportName": "abcd",
            "fileName": "webstorm_shortcut_keys.pdf",
            "createdBy": "insights-admin Dashboard",
            "notes": "abcd",
            "fileSize": "164.056 KB",
            "createAt": "2015-08-13 10:58:59",
            "updatedAt": "2015-08-13 10:58:59"
        },
        {
            "id": 806,
            "campaignId": 415486,
            "reportType": "PCAR",
            "reportName": "insight",
            "fileName": "webstorm_shortcut_keys.pdf",
            "createdBy": "insights-admin Dashboard",
            "notes": "insight collective",
            "fileSize": "164.056 KB",
            "createAt": "2015-08-13 11:09:46",
            "updatedAt": "2015-08-13 11:09:46"
        }
    ];
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
                scope:$scope,
                resolve: {
                    report: function () {
                        return $scope.reportList[index];
                        for(var i=0;i<=$scope.reportList.length;i++) {
                            if($scope.reportList[i].id == reportId) {
                                return  $scope.reportList[i];
                            }
                        }

                    },
                    brand: function() {
                        return $scope.brandId;
                    },
                    reportList: function() {
                        console.log($scope.reportList)
                        return $scope.reportList;
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


            $scope.sortReport = function(column) {

                $scope.reportList = $filter('orderBy')($scope.reportList, column,$scope.sort.descending);
                $scope.sort.descending = !$scope.sort.descending;
           }


        //$scope.sortReport($scope.sort.column);


    });
    }());
