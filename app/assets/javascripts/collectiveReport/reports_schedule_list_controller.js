
(function() {
    'use strict';
    collectiveReportModule.controller('ReportsScheduleListController', function(loginModel,collectiveReportModel, $scope, $modal, domainReports, dataService, urlService,campaignSelectModel,constants, $filter,dataStore , $timeout,utils ) {

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
         $scope.open_second_dimension = function(event) {
            var elem = $(event.target);
            elem.closest(".row").toggleClass("open") ;
            elem.closest(".row").find(".inner-row").toggle() ;
            
        };


        //$scope.sortReport($scope.sort.column);


    });
    }());
