var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('daypartController', function ($scope, audienceService, workflowService, $rootScope,$window, $routeParams, constants, $timeout, $location,utils) {

    $scope.Schedule = {
        dayPart: [],
        daytimeArr: []
    };
    $scope.selectedDays = [];
    $scope.getTimes=[{time:24, twelveHrFormat:'All Day', twentyfourHrFormat:'All Day'},{time:0, twelveHrFormat:'12:00AM', twentyfourHrFormat:'00:00'},{time:1, twelveHrFormat:'1:00AM', twentyfourHrFormat:'01:00'},{time:2, twelveHrFormat:'2:00AM', twentyfourHrFormat:'02:00'},{time:3, twelveHrFormat:'3:00AM', twentyfourHrFormat:'03:00'},
        {time:4, twelveHrFormat:'4:00AM', twentyfourHrFormat:'04:00'},{time:5, twelveHrFormat:'5:00AM', twentyfourHrFormat:'05:00'},{time:6, twelveHrFormat:'6:00AM', twentyfourHrFormat:'06:00'},{time:7, twelveHrFormat:'7:00AM', twentyfourHrFormat:'07:00'},
        {time:8, twelveHrFormat:'8:00AM', twentyfourHrFormat:'08:00'},{time:9, twelveHrFormat:'9:00AM', twentyfourHrFormat:'09:00'},{time:10, twelveHrFormat:'10:00AM', twentyfourHrFormat:'10:00'},{time:11, twelveHrFormat:'11:00AM', twentyfourHrFormat:'11:00'},
        {time:12, twelveHrFormat:'12:00PM', twentyfourHrFormat:'12:00'},{time:13, twelveHrFormat:'2:00PM', twentyfourHrFormat:'13:00'},{time:14, twelveHrFormat:'2:00PM', twentyfourHrFormat:'14:00'},{time:15, twelveHrFormat:'3:00PM', twentyfourHrFormat:'15:00'},
        {time:16, twelveHrFormat:'4:00PM', twentyfourHrFormat:'16:00'},{time:17, twelveHrFormat:'5:00PM', twentyfourHrFormat:'17:00'},{time:18, twelveHrFormat:'6:00PM', twentyfourHrFormat:'18:00'},{time:19, twelveHrFormat:'7:00PM', twentyfourHrFormat:'19:00'},
        {time:20, twelveHrFormat:'8:00PM', twentyfourHrFormat:'20:00'},{time:21, twelveHrFormat:'9:00PM', twentyfourHrFormat:'21:00'},{time:22, twelveHrFormat:'10:00PM', twentyfourHrFormat:'22:00'},{time:23, twelveHrFormat:'11:00PM', twentyfourHrFormat:'23:00'}]
        //console.log("ji")
        //console.log($scope.getTimes);
        $scope.twelve=true;
        $scope.clock="12 hr";
        $scope.timezoneFormat="Advertiser";

        $scope.timeFormat=function(event,time){
            var target = $(event.target);
            var parentElem =  target.parents('.miniToggle')
            parentElem.find("label").removeClass('active');
            target.parent().addClass('active');
            target.attr("checked", "checked");
            if(time==12){
                $scope.twelve=true;
                $scope.clock="12 hr";
            }
            else{
                $scope.twelve=false;
                $scope.clock="24 hr";
            }
        }
        $scope.timeZoneType=function(event,type){
            var target = $(event.target);
            var parentElem =  target.parents('.miniToggle')
            parentElem.find("label").removeClass('active');
            target.parent().addClass('active');
            target.attr("checked", "checked");
            $scope.timezoneFormat=type;

        }
        $scope.saveDayPart=function(){
            var adDaypartTargets={};
            adDaypartTargets.dayTime=$scope.dayTimeSelected;
            adDaypartTargets.isIncluded=true;
            adDaypartTargets.timeZone=$scope.timezoneFormat;
            adDaypartTargets.clock=$scope.clock;
            adDaypartTargets.schedule={"Tuesday":[2,4,7],
                                        "Monday":[1,2,3,4],
                                        "Friday":[5,6,7]};
            console.log(adDaypartTargets);
            audienceService.setDayPartData(adDaypartTargets);


        }

        $scope.addMoreCustom = function(){
            $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
            $scope.Schedule.daytimeArr.push({day: 'Sunday', startTime: 'All Day'});

        }

        $scope.Schedule.dayTimeSelected=function(value) {
            $(" .dropdown-toggle").parents('.dropdown').removeClass('open');
            event.preventDefault();
            event.stopImmediatePropagation();
            switch (value) {
                case 0:
                    $scope.Schedule.daytimeArr.length = 0;
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
                    $scope.Schedule.daytimeArr = daytimeObj;
                    console.log($scope.Schedule.daytimeArr);
                    break;

                case 1:
                    $scope.Schedule.daytimeArr.length = 0;
                    $scope.dayTimeSelected = "Weekday (M-F)";
                    var daytimeObj = [
                        {day: 'Monday', startTime: 'All Day'},
                        {day: 'Tuesday', startTime: 'All Day'},
                        {day: 'Wednesday', startTime: 'All Day'},
                        {day: 'Thrusday', startTime: 'All Day'},
                        {day: 'Friday', startTime: 'All Day'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    console.log($scope.Schedule.daytimeArr);
                    break;

                case 2:
                    $scope.dayTimeSelected = "Weekend (S/S)";
                    var daytimeObj = [
                        {day: 'Saturday', startTime: 'All Day'},
                        {day: 'Sunday', startTime: 'All Day'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    console.log($scope.Schedule.daytimeArr);
                    break;

                case 3:
                    $scope.dayTimeSelected = "Business hour (M-F, 9:00AM - 5:00PM)";
                    var daytimeObj = [
                        {day: 'Monday', startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Tuesday', startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Wednesday', startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Thrusday', startTime: '9:00AM',  endTime: '5:00PM'},
                        {day: 'Friday', startTime: '9:00AM', endTime: '5:00PM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    console.log($scope.Schedule.daytimeArr);
                    break;

                case 4:
                    $scope.dayTimeSelected = "TV Primetime (8:00PM-11:00PM)";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Monday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Tuesday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Wednesday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Thrusday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Friday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Saturday', startTime: '8:00PM', endTime: '11:00PM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    console.log($scope.Schedule.daytimeArr);
                    break;

                case 5:
                    $scope.dayTimeSelected = "Early Morning (5:00AM-7:00AM)";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Monday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Tuesday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Wednesday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Thrusday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Friday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Saturday', startTime: '5:00AM', endTime: '7:00AM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    console.log($scope.Schedule.daytimeArr);
                    break;

                case 6:
                    $scope.dayTimeSelected = "Late Night (11:00PM-1:00AM)";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Sunday', startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Monday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Monday', startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Tuesday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Tuesday', startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Wednesday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Wednesday', startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Thrusday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Thrusday', startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Friday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Friday', startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Saturday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Saturday', startTime: '11:00PM',  endTime: '12:00AM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    console.log($scope.Schedule.daytimeArr);
                    break;

                case 7:
                    $scope.dayTimeSelected = "Custom schedule";
//                    var daytimeObj = [
//                        {day: 'Sunday', startTime: 'All Day'}
//                    ];
                    $scope.Schedule.daytimeArr = [];
//                    console.log($scope.Schedule.daytimeArr);

                    break;

            }
        }


    });
})();