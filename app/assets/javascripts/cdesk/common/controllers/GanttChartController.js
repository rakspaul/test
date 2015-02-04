(function () {
    'use strict';
    commonModule.controller('ganttChartController', function ($scope, $location, ganttChart) {

    	
    	$scope.init = function(){
            $scope.calendarBusy = true;
           	ganttChart.newCalendar();

        };
        $scope.add = function(){
        	console.log('adding');
        	  	ganttChart.addTask();
        }
         $scope.prev = function(){
        	console.log('adding');
        	  	ganttChart.prev();
        }

        $scope.next = function(){
        	console.log('adding');
        	  	ganttChart.next();
        }
        $scope.init();

    });
}());