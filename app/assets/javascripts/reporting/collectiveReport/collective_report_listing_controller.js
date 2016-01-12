/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';
    collectiveReportModule.controller('CollectiveReportListingController', function(loginModel,collectiveReportModel,
                                                                                    $scope,$rootScope, $modal, domainReports,
                                                                                    dataService, urlService, campaignSelectModel,
                                                                                    constants, $filter, dataStore, $timeout, utils,
                                                                                    advertiserModel, brandsModel) {
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
        var browserInfo = utils.detectBrowserInfo();
        $scope.getReports = function() {
            //$scope.nodata = "Loading....";
            $scope.screenBusy = true;
            collectiveReportModel.reportList(function (response) {
                if (response.data !== undefined && response.data.length > 0) {
                    $scope.reportList = response.data;
                   // console.log('Get Reports: ',$scope.reportList);
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
                        return $scope.reportList[index];
                    },
                    reportIndex: function() {
                        return index;
                    },
                    reportList: function() {
                        return $scope.reportList;
                    }
                }
            });
        }

        //Delete report Pop up
        $scope.deleteReportModal = function(index,reportId) {
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
                        return "Please note that this action affects '<span class='bold-font'>"+ $scope.reportList[index].fileName+"</span>'. The report will be deleted for both you and the marketer."
                    },
                    deleteAction: function() {
                        return function() {
                            collectiveReportModel.deleteReport(reportId, function (response) {
                                if (response.status_code == 200) {
                                    $scope.reportList.splice(index, 1);
                                    $rootScope.setErrAlertMessage(constants.reportDeleteSuccess,0)
                                    var selectedCampagin = JSON.parse(localStorage.getItem('selectedCampaign')),
                                        advertiserId = advertiserModel.getSelectedAdvertiser().id,
                                        brandId = brandsModel.getSelectedBrand().id,
                                        url = urlService.APIReportList(advertiserId, brandId, selectedCampagin ? selectedCampagin.id : -1);
                                    if(url) {
                                        dataStore.deleteFromCache(url);
                                    }
                                } else {
                                    $rootScope.setErrAlertMessage(constants.reportDeleteFailed);
                                }
                            });
                        }
                    }
                }
            });
        }

        $scope.downloadCollectiveReport = function(reportId) {
            if(reportId) {
            //$scope.reportDownloadBusy = true;
                $scope.screenBusy = true;
            dataService.downloadFile(urlService.APIDownloadReport(reportId)).then(function (response) {
                if (response.status === "success") {
                    //$scope.reportDownloadBusy = false;
                    $scope.screenBusy = false;
                    saveAs(response.file, response.fileName);
                    if(browserInfo.browserName != 'Firefox') {
                        $rootScope.setErrAlertMessage(constants.reportDownloadSuccess,0);
                    }
                } else {
                   // $scope.reportDownloadBusy = false;
                    $scope.screenBusy = false;
                    $rootScope.setErrAlertMessage(constants.reportDownloadFailed);
                }
            }, function () {
               // $scope.reportDownloadBusy = false;
                $scope.screenBusy = false;
                $rootScope.setErrAlertMessage(constants.reportDownloadFailed);
            }, function () {
              //  $scope.reportDownloadBusy = false;
                $scope.screenBusy = false;
                $rootScope.setErrAlertMessage(constants.reportDownloadFailed);
             });
          } else {
                $scope.screenBusy = false;
                $rootScope.setErrAlertMessage(constants.reportDownloadFailed);
            }
        }


       $scope.deleteReport = function($index,reportId) {
           if (confirm('Are you sure you want to delete this?')) {
               //delete file -- server request
               collectiveReportModel.deleteReport(reportId, function(response){
                   if(response.status_code == 200) {
                       $scope.reportList.splice($index, 1);
                       $rootScope.setErrAlertMessage(constants.reportDeleteSuccess,0);
                    } else {
                       $rootScope.setErrAlertMessage(constants.reportDeleteFailed);
                  }
               });

           }
       }

       $scope.sortReport = function(column) {
           $scope.sort.column = column;
           $scope.reportList = $filter('orderBy')($scope.reportList, column,$scope.sort.descending);
           $scope.sort.descending = !$scope.sort.descending;
       }

    });
}());
