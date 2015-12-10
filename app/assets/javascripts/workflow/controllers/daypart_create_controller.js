var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('daypartController', function ($scope, workflowService, $rootScope,$window, $routeParams, constants, $timeout, $location,utils) {
    $scope.daytimeArr=[];
    $scope.Schedule = {};
    $scope.getTimes=[{time:24, twelveHrFormat:'All Day', twentyfourHrFormat:'All Day'},{time:0, twelveHrFormat:'12am', twentyfourHrFormat:'00:00'},{time:1, twelveHrFormat:'1am', twentyfourHrFormat:'01:00'},{time:2, twelveHrFormat:'2am', twentyfourHrFormat:'02:00'},{time:3, twelveHrFormat:'3am', twentyfourHrFormat:'03:00'},
        {time:4, twelveHrFormat:'4am', twentyfourHrFormat:'04:00'},{time:5, twelveHrFormat:'5am', twentyfourHrFormat:'05:00'},{time:6, twelveHrFormat:'6am', twentyfourHrFormat:'06:00'},{time:7, twelveHrFormat:'7am', twentyfourHrFormat:'07:00'},
        {time:8, twelveHrFormat:'8am', twentyfourHrFormat:'08:00'},{time:9, twelveHrFormat:'9am', twentyfourHrFormat:'09:00'},{time:10, twelveHrFormat:'10am', twentyfourHrFormat:'10:00'},{time:11, twelveHrFormat:'11am', twentyfourHrFormat:'11:00'},
        {time:12, twelveHrFormat:'12pm', twentyfourHrFormat:'12:00'},{time:13, twelveHrFormat:'2pm', twentyfourHrFormat:'13:00'},{time:14, twelveHrFormat:'2pm', twentyfourHrFormat:'14:00'},{time:15, twelveHrFormat:'3pm', twentyfourHrFormat:'15:00'},
        {time:16, twelveHrFormat:'4pm', twentyfourHrFormat:'16:00'},{time:17, twelveHrFormat:'5pm', twentyfourHrFormat:'17:00'},{time:18, twelveHrFormat:'6pm', twentyfourHrFormat:'18:00'},{time:19, twelveHrFormat:'7pm', twentyfourHrFormat:'19:00'},
        {time:20, twelveHrFormat:'8pm', twentyfourHrFormat:'20:00'},{time:21, twelveHrFormat:'9pm', twentyfourHrFormat:'21:00'},{time:22, twelveHrFormat:'10pm', twentyfourHrFormat:'22:00'},{time:23, twelveHrFormat:'11pm', twentyfourHrFormat:'23:00'}]
    console.log("ji")
        console.log($scope.getTimes);
        $scope.saveDayPart=function(){
        }
        $scope.Schedule.dayTimeSelected=function(value) {
            $(" .dropdown-toggle").parents('.dropdown').removeClass('open');
            event.preventDefault();
            event.stopImmediatePropagation();
            switch (value) {
                case 0:
                    $scope.daytimeArr.length = 0;
                    $scope.dayTimeSelected = "All days and times";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: 'All Day'},
                        {day: 'Monday', startTime: 'All Day'},
                        {day: 'Tuesday', startTime: 'All Day'},
                        {day: 'Wednesday', startTime: 'All Day'},
                        {day: 'Thrusday', startTime: 'All Day'},
                        {day: 'Friday', startTime: 'All Day'},
                        {day: 'Saturday', startTime: 'All Day'}
                    ];
                    $scope.daytimeArr = daytimeObj;
                    console.log($scope.daytimeArr);
                    break;

                case 1:
                    $scope.daytimeArr.length = 0;
                    $scope.dayTimeSelected = "Weekday (M-F)";
                    var daytimeObj = [
                        {day: 'Monday', startTime: 'All Day'},
                        {day: 'Tuesday', startTime: 'All Day'},
                        {day: 'Wednesday', startTime: 'All Day'},
                        {day: 'Thrusday', startTime: 'All Day'},
                        {day: 'Friday', startTime: 'All Day'}
                    ];
                    $scope.daytimeArr = daytimeObj;
                    console.log($scope.daytimeArr);
                    break;

                case 2:
                    $scope.dayTimeSelected = "Weekend (S/S)";
                    var daytimeObj = [
                        {day: 'Saturday', startTime: 'All Day'},
                        {day: 'Sunday', startTime: 'All Day'}
                    ];
                    $scope.daytimeArr = daytimeObj;
                    console.log($scope.daytimeArr);
                    break;

                case 3:
                    $scope.dayTimeSelected = "Business hour (M-F, 9am - 5pm)";
                    var daytimeObj = [
                        {day: 'Monday', startTime: '9am', endTime: '5pm'},
                        {day: 'Tuesday', startTime: '9am', endTime: '5pm'},
                        {day: 'Wednesday', startTime: '9am', endTime: '5pm'},
                        {day: 'Thrusday', startTime: '9am',  endTime: '5pm'},
                        {day: 'Friday', startTime: '9am', endTime: '5pm'}
                    ];
                    $scope.daytimeArr = daytimeObj;
                    console.log($scope.daytimeArr);
                    break;

                case 4:
                    $scope.dayTimeSelected = "TV Primetime (8pm-11pm)";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: '8pm', endTime: '11pm'},
                        {day: 'Monday', startTime: '8pm', endTime: '11pm'},
                        {day: 'Tuesday', startTime: '8pm', endTime: '11pm'},
                        {day: 'Wednesday', startTime: '8pm', endTime: '11pm'},
                        {day: 'Thrusday', startTime: '8pm', endTime: '11pm'},
                        {day: 'Friday', startTime: '8pm', endTime: '11pm'},
                        {day: 'Saturday', startTime: '8pm', endTime: '11pm'}
                    ];
                    $scope.daytimeArr = daytimeObj;
                    console.log($scope.daytimeArr);
                    break;

                case 5:
                    $scope.dayTimeSelected = "Early Morning (5am-7am)";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: '5am', endTime: '7am'},
                        {day: 'Monday', startTime: '5am', endTime: '7am'},
                        {day: 'Tuesday', startTime: '5am', endTime: '7am'},
                        {day: 'Wednesday', startTime: '5am', endTime: '7am'},
                        {day: 'Thrusday', startTime: '5am', endTime: '7am'},
                        {day: 'Friday', startTime: '5am', endTime: '7am'},
                        {day: 'Saturday', startTime: '5am', endTime: '7am'}
                    ];
                    $scope.daytimeArr = daytimeObj;
                    console.log($scope.daytimeArr);
                    break;

                case 6:
                    $scope.dayTimeSelected = "Late Night (11pm-1am)";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: '12am',  endTime: '1am'},
                        {day: 'Sunday', startTime: '11pm',  endTime: '12am'},
                        {day: 'Monday', startTime: '12am',  endTime: '1am'},
                        {day: 'Monday', startTime: '11pm',  endTime: '12am'},
                        {day: 'Tuesday', startTime: '12am',  endTime: '1am'},
                        {day: 'Tuesday', startTime: '11pm',  endTime: '12am'},
                        {day: 'Wednesday', startTime: '12am',  endTime: '1am'},
                        {day: 'Wednesday', startTime: '11pm',  endTime: '12am'},
                        {day: 'Thrusday', startTime: '12am',  endTime: '1am'},
                        {day: 'Thrusday', startTime: '11pm',  endTime: '12am'},
                        {day: 'Friday', startTime: '12am',  endTime: '1am'},
                        {day: 'Friday', startTime: '11pm',  endTime: '12am'},
                        {day: 'Saturday', startTime: '12am',  endTime: '1am'},
                        {day: 'Saturday', startTime: '11pm',  endTime: '12am'}
                    ];
                    $scope.daytimeArr = daytimeObj;
                    console.log($scope.daytimeArr);
                    break;

                case 7:
                    $scope.dayTimeSelected = "Custom schedule";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: 'All Day'}
                    ];
                    $scope.daytimeArr = daytimeObj;
                    console.log($scope.daytimeArr);
                    break;

            }
        }


    });
})();