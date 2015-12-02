
(function() {
    'use strict';
    collectiveReportModule.controller('ReportsScheduleListController', function($scope,$timeout,$filter,collectiveReportModel,momentService,$location,$modal,constants,urlService,dataStore) {

        $scope.noOfSchldInstToShow = 3;
        $scope.scheduleInstCount = [];
        $scope.sort = {descending:true};

        //close messages in 3 seconds
        $scope.timeoutReset = function(){

            $timeout(function(){
                //resetting the flag and message
               $scope.flashMessage = {'message':'','isErrorMsg':''};
            }, 3000);
        }

        $scope.getScheduledReports = function() {
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
        }

        $scope.getScheduledReports();


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

        $scope.downloadSchdReport = function(reportId,schRptListIndx,instancesIndx) {
            console.log(reportId,schRptListIndx,instancesIndx);
            $scope.flashMessage = {'message':'Downloaded Successfully','isErrorMsg':''};
            $scope.timeoutReset();
            $scope.schdReportList[schRptListIndx].instances[instancesIndx].viewedOn = momentService.reportDateFormat();
            /*dataService.downloadFile(urlService.APIDownloadReport(reportId)).then(function (response) {
                if (response.status === "success") {

                } else {

                }
            })*/


        }

        //Delete scheduled report Pop up
        $scope.deleteSchdRpt = function(reportId) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller:"ReportScheduleDeleteController",
                scope:$scope,
                windowClass: 'delete-dialog',
                resolve: {
                    headerMsg: function() {
                        return constants.deleteReportHeader;
                    },
                    mainMsg: function() {
                        return "Are you sure you want to delete Scheduled Report"
                    },
                    deleteAction: function() {
                        return function() {
                            var successFun = function(data) {
                                if(data.status_code == 200) {
                                    var url = urlService.scheduleReportsList();
                                     if(url) {
                                     dataStore.deleteFromCache(url);
                                     }
                                    $scope.getScheduledReports();
                                    $scope.flashMessage = {'message':'Scheduler deleted Successfully','isErrorMsg':''};
                                    $scope.timeoutReset();
                                } else {
                                    $scope.flashMessage = {'message':data.message,'isErrorMsg':data.message};
                                    $scope.timeoutReset();
                                }
                            }
                            var errorFun = function(data) {
                                $scope.flashMessage = {'message':data.message,'isErrorMsg':data.message};
                                $scope.timeoutReset();
                            }
                            collectiveReportModel.deleteScheduledReport(successFun,errorFun,reportId);
                        }
                    }
                }
            });
        }

        //Delete scheduled report Pop up
        $scope.deleteSchdRptInstance = function(reportId,instanceId) {
            console.log('Delete Instance: ',reportId,instanceId);
            var $modalInstance = $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller:"ReportScheduleDeleteController",
                scope:$scope,
                windowClass: 'delete-dialog',
                resolve: {
                    headerMsg: function() {
                        return constants.deleteReportHeader;
                    },
                    mainMsg: function() {
                        return "Are you sure you want to delete instance of Scheduled Report"
                    },
                    deleteAction: function() {
                        return function() {
                            var successFun = function(data) {
                                if(data.status_code == 200) {
                                    var url = urlService.scheduleReportsList();
                                    if(url) {
                                        dataStore.deleteFromCache(url);
                                    }
                                    $scope.getScheduledReports();
                                    $scope.flashMessage = {'message':'Scheduler deleted Successfully','isErrorMsg':''};
                                    $scope.timeoutReset();
                                } else {
                                    $scope.flashMessage = {'message':data.message,'isErrorMsg':data.message};
                                    $scope.timeoutReset();
                                }
                            }
                            var errorFun = function(data) {
                                $scope.flashMessage = {'message':data.message,'isErrorMsg':data.message};
                                $scope.timeoutReset();
                            }
                           collectiveReportModel.deleteScheduledReportInstance(successFun,errorFun,reportId,instanceId);
                        }
                    }
                }
            });
        }

        $scope.editSchdReport = function(reportId) {
            $location.path('/customreport/edit/'+reportId);
        }


        $scope.copyScheduleRpt = function(reportId) {
            console.log('Report Id:',reportId);
        }


    });
    }());
