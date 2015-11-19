
(function() {
    'use strict';
    collectiveReportModule.controller('ReportsScheduleListController', function($scope,$timeout,$filter,collectiveReportModel) {
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

        var scheduleReportListSucc = function(schdReportList) {
           console.log('succesfully got data');
            $scope.schdReportList = schdReportList;
            $scope.sortSchdlReport();
            for(var i = 0 ; i < $scope.schdReportList.length;i++){
                $scope.scheduleInstCount[i] = $scope.noOfSchldInstToShow;
            }
            console.log('-----');
            console.log($scope.schdReportList);
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
            console.log('index:',index);
            console.log('count:',count);
        }

        $scope.sortSchdlReport = function() {
            $scope.schdReportList = $filter('orderBy')($scope.schdReportList, 'frequency',$scope.sort.descending);
            $scope.sort.descending = !$scope.sort.descending;
        }

        //$scope.sortReport($scope.sort.column);
    });
    }());
