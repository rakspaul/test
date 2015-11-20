
(function() {
    'use strict';
    collectiveReportModule.controller('ReportsScheduleListController', function($scope,$timeout,$filter,collectiveReportModel) {

        $scope.noOfSchldInstToShow = 5;
        $scope.scheduleInstCount = [];
        $scope.sort = {descending:true};

        //close messages in 3 seconds
        $scope.timeoutReset = function(){

            $timeout(function(){
                //resetting the flag and message
               $scope.flashMessage = {'message':'','isErrorMsg':''};
            }, 3000);

        }

        var scheduleReportListSucc = function(schdReportList) {
            $scope.schdReportList = schdReportList;
            $scope.sortSchdlReport();
            for(var i = 0 ; i < $scope.schdReportList.length;i++){
                $scope.scheduleInstCount[i] = $scope.noOfSchldInstToShow;
            }
        }

        var scheduleReportListError = function() {
            console.log('error occured');
        }

        collectiveReportModel.getScheduleReportList(scheduleReportListSucc,scheduleReportListError);


        $scope.close_msg_box = function(event) {
            var elem = $(event.target);
            elem.closest(".top_message_box").hide() ;
            $scope.flashMessage = {'message':'','isErrorMsg':''};
        };
         $scope.open_second_dimension = function(event,index) {
            var elem = $(event.target);
             if(!elem.closest(".row").hasClass("open")) {
                 $scope.scheduleInstCount[index] = $scope.noOfSchldInstToShow;
             }
            elem.closest(".row").toggleClass("open") ;
            elem.closest(".row").find(".inner-row").toggle() ;
            
        };

        $scope.setScheduleInstCount = function(index,count) {
            $scope.scheduleInstCount[index] = count;
        }

        $scope.sortSchdlReport = function() {
            $scope.schdReportList = $filter('orderBy')($scope.schdReportList, 'frequency',$scope.sort.descending);
            $scope.sort.descending = !$scope.sort.descending;
        }

        $scope.downloadSchdReport = function(reportId) {
            console.log(reportId);
            dataService.downloadFile(urlService.APIDownloadReport(reportId)).then(function (response) {
                if (response.status === "success") {

                } else {

                }
            })


        }

        $scope.editSchdReport = function(reportId) {

        }


    });
    }());
