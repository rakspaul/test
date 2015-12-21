var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('daypartController', function ($scope, audienceService, workflowService, $rootScope,$window, $routeParams, constants, $timeout, $location,utils) {

    $scope.Schedule = {
        dayPart: [],
        daytimeArr: []
    };
    $scope.customFlag = false;
    $scope.timeSelected = 'All days and times';

    $scope.$on('UpdateDayPart',function(){
        var fetchedObj =  workflowService.getAdsDetails();
        if(fetchedObj.targets && fetchedObj.targets.adDaypartTargets && _.size(fetchedObj.targets.adDaypartTargets)>0) {
           // console.log(fetchedObj.targets.adDaypartTargets.schedule);
            $scope.setTargeting('Daypart');

            if(angular.lowercase(fetchedObj.targets.adDaypartTargets.dayTime) == angular.lowercase("Custom Schedule")){

                var scheduleObj=fetchedObj.targets.adDaypartTargets.schedule;
                console.log('custom daypart = ',scheduleObj);

                //console.log(scheduleObj);
                _.each(scheduleObj, function(obj) {
                    for(var i in obj) {
                        if(obj[i].length > 0){
                            console.log('i = ',i,'obj[i] = ',obj[i]);
                            $scope.recreateCustomObj(i,obj[i]); //console.log(i, obj[i])
                        }
                    }
                });
                    /*for number of objects in $scope.Schedule.daytimeArr, increment the Schedule.customLength,*/
                    //$scope.Schedule.customLength = $scope.Schedule.customLength + 1;
                    //$scope.Schedule.daytimeArr.push({day: 'Sunday', startTime: 'All Day'});
            }else{
                $scope.dayTimeSelected=fetchedObj.targets.adDaypartTargets.dayTime;
                $scope.Schedule.dayTimeSelected(value);

            }
        }
        //$scope.saveDayPart();
    });
        $scope.recreateCustomObj=function(day,dayArr){
            switch(day){
                case "Monday":
                    var obj=$scope.convertToScheduleObj('Monday',dayArr);

                    for(var i in obj){
                        $scope.Schedule.daytimeArr.push(obj[i]);
                    }

                case "Tuesday":
                    var obj=$scope.convertToScheduleObj('Tuesday',dayArr);
                    for(var i in obj){
                        $scope.Schedule.daytimeArr.push(obj[i]);
                    }
                case "Wednesday":
                    $scope.convertToScheduleObj('Wednesday',dayArr);
                case "Thrusday":
                    $scope.convertToScheduleObj('Thursday',dayArr);
                case "Friday":
                    $scope.convertToScheduleObj('Friday',dayArr);
                case "Saturday":
                    $scope.convertToScheduleObj('Saturday',dayArr);
                case "Sunday":
                    $scope.convertToScheduleObj('Sunday',dayArr);


            }

        }
        $scope.convertToScheduleObj=function(day,dayArr){
            var a = dayArr;
            var b = dayArr;
            var c = [];
            var keys1 = {};
            a.map(function(value, key) {
                return a[key] - a[key-1]
            }).forEach(function(value, key) {
                if(value > 1)
                    c.push(key - 1)
            })
            for(var i = 0; i <= c.length; i++) {
                keys1[i] = {}
                keys1[i]['stTime'] = b[0]
                keys1[i]['endTime'] = a[c[i]]+1;//endTime+1
                b.splice(0, c[i] + 1)
            }
            /*handle for the last object*/
            var lastKey = Object.keys(keys1).slice(Object.keys(keys1).length - 1)[0];
            keys1[lastKey]['stTime'] = a[a.length-1];
            keys1[lastKey]['endTime'] = a[a.length-1] + 1;
            return keys1;


        }

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
            if($scope.dayTimeSelected!='Custom schedule') {

                audienceService.setDayPartDispObj($scope.Schedule.daytimeArr,$scope.dayTimeSelected);
                adDaypartTargets.schedule = {
//                    "Tuesday": [2, 4, 7],
//                    "Monday": [1, 2, 3, 4],
//                    "Friday": [5, 6, 7]
                };
            }
            else{
                var sunday=_.filter($scope.Schedule.dayPart, function(obj) { return obj.day == "Sunday" });
                $scope.Sunday=$scope.generateDayArr(sunday);
                var monday=_.filter($scope.Schedule.dayPart, function(obj) { return obj.day == "Monday" });
                $scope.Monday=$scope.generateDayArr(monday);
                var tuesday=_.filter($scope.Schedule.dayPart, function(obj) { return obj.day == "Tuesday" });
                $scope.Tuesday=$scope.generateDayArr(tuesday);
                var wednesday=_.filter($scope.Schedule.dayPart, function(obj) { return obj.day == "Wednesday" });
                $scope.Wednesday=$scope.generateDayArr(wednesday);
                var Thursday=_.filter($scope.Schedule.dayPart, function(obj) { return obj.day == "Thursday" });
                $scope.Thursday=$scope.generateDayArr(Thursday);
                var friday=_.filter($scope.Schedule.dayPart, function(obj) { return obj.day == "Friday" });
                $scope.Friday=$scope.generateDayArr(friday);
                var saturday=_.filter($scope.Schedule.dayPart, function(obj) { return obj.day == "Saturday" });
                $scope.Saturday=$scope.generateDayArr(saturday);
                /* Add custom day array to dayPart Object*/
                adDaypartTargets.schedule={
                    "Sunday":$scope.Sunday,
                    "Monday":$scope.Monday,
                    "Tuesday":$scope.Tuesday,
                    "Wednesday":$scope.Wednesday,
                    "Thursday":$scope.Thursday,
                    "Friday":$scope.Friday,
                    "Saturday":$scope.Saturday
                };

                for(var i = 0; i < $scope.Schedule.dayPart.length; i++){
                    if($scope.Schedule.dayPart[i].stTime){
                        $scope.Schedule.dayPart[i].startTime =  $scope.returnTime($scope.Schedule.dayPart[i].stTime);
                    }

                    if($scope.Schedule.dayPart[i].edTime){
                        $scope.Schedule.dayPart[i].endTime =  $scope.returnTime($scope.Schedule.dayPart[i].edTime);
                    }
                }
                audienceService.setDayPartDispObj($scope.Schedule.dayPart,$scope.dayTimeSelected);

            }

            audienceService.setDayPartData(adDaypartTargets);
            $scope.getSelectedDays();
            $scope.resetDayTargetingVariables();

        }
        $scope.generateDayArr=function(day){
            $scope.arrName=[];
            for(var i in day){
                if(day[i].stTime=="24") {
                    for (var index = 0; index < 24; index++)
                        $scope.arrName.push(index);
                }
                else if(parseInt(day[i].edTime) > parseInt(day[i].stTime)){
                    for(var diff=parseInt(day[i].stTime);diff<parseInt(day[i].edTime);diff++){
                        $scope.arrName.push(diff);
                    }
                }
            }
            //console.log("original",$scope.arrName);
            $scope.arrName=$scope.arrName.filter( function( item, index, inputArray ) {
                return inputArray.indexOf(item) == index;
            });
            //console.log("Filtered",$scope.arrName)
            return $scope.arrName;

        }

        $scope.addMoreCustom = function(){
            $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
            $scope.Schedule.daytimeArr.push({day: 'Sunday', startTime: 'All Day'});

        }

        $scope.Schedule.dayTimeSelected=function(value) {
            $(" .dropdown-toggle").parents('.dropdown').removeClass('open');
            $scope.customFlag = false;
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
                        {day: 'Thursday', startTime: 'All Day'},
                        {day: 'Friday', startTime: 'All Day'},
                        {day: 'Saturday', startTime: 'All Day'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    break;

                case 1:
                    $scope.Schedule.daytimeArr.length = 0;
                    $scope.dayTimeSelected = "Weekday (M-F)";
                    var daytimeObj = [
                        {day: 'Monday', startTime: 'All Day'},
                        {day: 'Tuesday', startTime: 'All Day'},
                        {day: 'Wednesday', startTime: 'All Day'},
                        {day: 'Thursday', startTime: 'All Day'},
                        {day: 'Friday', startTime: 'All Day'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    break;

                case 2:
                    $scope.dayTimeSelected = "Weekend (S,S)";
                    var daytimeObj = [
                        {day: 'Saturday', startTime: 'All Day'},
                        {day: 'Sunday', startTime: 'All Day'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    break;

                case 3:
                    $scope.dayTimeSelected = "Business hours (M-F, 9:00AM-5:00PM)";
                    var daytimeObj = [
                        {day: 'Monday', startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Tuesday', startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Wednesday', startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Thursday', startTime: '9:00AM',  endTime: '5:00PM'},
                        {day: 'Friday', startTime: '9:00AM', endTime: '5:00PM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    break;

                case 4:
                    $scope.dayTimeSelected = "TV Primetime (8:00PM-11:00PM)";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Monday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Tuesday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Wednesday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Thursday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Friday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Saturday', startTime: '8:00PM', endTime: '11:00PM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    break;

                case 5:
                    $scope.dayTimeSelected = "Early Morning (5:00AM-7:00AM)";
                    var daytimeObj = [
                        {day: 'Sunday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Monday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Tuesday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Wednesday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Thursday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Friday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Saturday', startTime: '5:00AM', endTime: '7:00AM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
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
                        {day: 'Thursday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Thursday', startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Friday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Friday', startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Saturday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Saturday', startTime: '11:00PM',  endTime: '12:00AM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    break;

                case 7:
                    $scope.dayTimeSelected = "Custom schedule";
                    $scope.customFlag = true;
//                    var daytimeObj = [
//                        {day: 'Sunday', startTime: 'All Day'}
//                    ];
                    $scope.Schedule.daytimeArr = [];
//                    console.log($scope.Schedule.daytimeArr);

                    break;

            }
        }

        $scope.selectTime = function(time) {
            var daytimeArr = $scope.Schedule.daytimeArr;
            var dayTimeSelected = $scope.dayTimeSelected;
            $scope.tmpDayTimeSelected = dayTimeSelected;

            var timeMatched = _.filter($scope.Schedule.daytimeArr, function(obj) { return obj.startTime === time});
            if(timeMatched.length == 0) {
                $scope.dayTimeSelected = '';
                $scope.timeSelected = "Custom schedule";
            } else {
                console.log("tmpDayTimeSelected", $scope.tmpDayTimeSelected);
                $scope.dayTimeSelected = $scope.tmpDayTimeSelected;
            }
        }

        $scope.returnTime = function(time){
            var index = _.findIndex($scope.getTimes, function(item) {
                return item.time == time});
            if($scope.twelve)
                return $scope.getTimes[index].twelveHrFormat;
            else
                return $scope.getTimes[index].twentyfourHrFormat;
        }


    });
})();