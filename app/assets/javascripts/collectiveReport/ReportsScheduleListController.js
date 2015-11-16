
(function() {
    'use strict';
    collectiveReportModule.controller('ReportsScheduleListController', function(loginModel,collectiveReportModel, $scope, $modal, domainReports, dataService, urlService,campaignSelectModel,constants, $filter,dataStore , $timeout,utils ) {
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
        var browserInfo = utils.detectBrowserInfo();

        //close messages in 3 seconds
        $scope.timeoutReset = function(){

            $timeout(function(){
                //resetting the flag and message
               $scope.flashMessage = {'message':'','isErrorMsg':''};
            }, 3000);

        }



        $scope.close_msg_box = function(event) {
            var elem = $(event.target);
            elem.closest(".top_message_box").hide() ;
            $scope.flashMessage = {'message':'','isErrorMsg':''};
        };


        //$scope.sortReport($scope.sort.column);


    });
    }());
