/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';
    collectiveReportModule.controller('CollectiveReportListingController', function(loginModel,collectiveReportModel, $scope, $modal, domainReports, dataService, urlService,campaignSelectModel,constants, $filter) {
        $scope.reportToEdit = {};
        $scope.showEditReport = false;
        $scope.campaign =  "Campaign Name";
        domainReports.highlightHeaderMenu();
        $scope.customFilters = domainReports.getCustomReportsTabs();
        $scope.reportList = [];
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.nodata = "";
        $scope.sort = {column:'updatedAt',descending:true};
        $scope.screenBusy = false;
        $scope.flashMessage = {'message':'','isErrorMsg':''};
        $scope.isNetworkUser = loginModel.getIsNetworkUser();


        $scope.getReports = function() {
            //$scope.nodata = "Loading....";
            $scope.screenBusy = true;
            collectiveReportModel.reportList(function (response) {
                if (response.data !== undefined && response.data.length > 0) {
                    $scope.reportList = response.data;
                    $scope.sortReport($scope.sort.column);
                    $scope.screenBusy = false;
                } else {
                    $scope.reportList = [];
                    $scope.nodata = "Data not found";
                    $scope.screenBusy = false;
                }
 /*               $scope.setReportToEdit = function(index) {
                 $scope.reportToEdit = $scope.reportList[index];
                 $scope.showEditReport = true;
                 }*/

            },function(error) {$scope.screenBusy = false;})
        }

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();  //update the selected Campaign
            $scope.nodata = "";
            $scope.reportList = [];
                $scope.getReports();
        });


        //Edit report Pop up
        $scope.editReportModal = function(index) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_edit_collective_report,
                controller:"CollectiveEditReportController",
                scope:$scope,
                windowClass: 'edit-dialog',
                resolve: {
                    report: function () {
                        console.log('reportlistingController:',$scope.reportList[index]);
                        return $scope.reportList[index];
                    },
                    reportIndex: function() {
                        return index;
                    },
                    reportList: function() {
                        console.log($scope.reportList)
                        return $scope.reportList;
                    },
                    updateFlashMsg: function() {

                    }
                }
            });


        }

        //Delete report Pop up
        $scope.deleteReportModal = function(index) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller:"CollectiveDeleteReportController",
                scope:$scope,
                windowClass: 'delete-dialog'
            });
        }

        $scope.downloadCollectiveReport = function(reportId) {
            if(reportId) {
            //$scope.reportDownloadBusy = true;
                $scope.screenBusy = true;
            dataService.downloadFile(urlService.APIDownloadReport(reportId)).then(function (response) {
                console.log("Response Status: ", response.status);
                if (response.status === "success") {
                    //$scope.reportDownloadBusy = false;
                    $scope.screenBusy = false;
                    saveAs(response.file, response.fileName);
                    $scope.flashMessage.message = constants.reportDownloadSuccess;
                } else {
                   // $scope.reportDownloadBusy = false;
                    $scope.screenBusy = false;
                    $scope.flashMessage.message = constants.reportDownloadFailed;
                    $scope.flashMessage.isErrorMsg = true;
                }
            }, function () {
               // $scope.reportDownloadBusy = false;
                $scope.screenBusy = false;
                $scope.flashMessage.message = constants.reportDownloadFailed;
                $scope.flashMessage.isErrorMsg = true;
            }, function () {
              //  $scope.reportDownloadBusy = false;
                $scope.screenBusy = false;
                $scope.flashMessage.message = constants.reportDownloadFailed;
                $scope.flashMessage.isErrorMsg = true;
            });
          } else {
                $scope.screenBusy = false;
                $scope.flashMessage.message = constants.reportDownloadFailed;
                $scope.flashMessage.isErrorMsg = true;
            }
        }


       $scope.deleteReport = function($index,reportId) {
           if (confirm('Are you sure you want to delete this?')) {
               //delete file -- server request
               collectiveReportModel.deleteReport(reportId, function(response){
                   if(response.status_code == 200) {
                       $scope.reportList.splice($index, 1);
                       $scope.flashMessage.message = constants.reportDeleteSuccess;
                   } else {
                       $scope.flashMessage.message = constants.reportDeleteFailed;
                       $scope.flashMessage.isErrorMsg = true;
                   }
               });

           }
       }

       $scope.sortReport = function(column) {
           $scope.sort.column = column;
           $scope.reportList = $filter('orderBy')($scope.reportList, column,$scope.sort.descending);
           $scope.sort.descending = !$scope.sort.descending;

       }

        $scope.close_msg_box = function(event) {
            var elem = $(event.target);
            elem.closest(".top_message_box").hide() ;
            $scope.flashMessage = {'message':'','isErrorMsg':''};
        };


        //$scope.sortReport($scope.sort.column);


    });
    }());
