var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('daypartController', function ($scope, audienceService, workflowService, $rootScope,$window, 
        $routeParams, constants, $timeout, $location,utils) {
        $scope.recreateCustomObj = function (day, dayArr) {
            var obj,
                i;

            switch(day) {
                case 'Monday':
                    obj = $scope.convertToScheduleObj('Monday', dayArr);
                    for (i in obj) {
                        $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
                        if (obj[i].edTime === '24') {
                            obj[i].stTime = 24;
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        } else {
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        }
                    }
                    break;
                case 'Tuesday':
                    obj = $scope.convertToScheduleObj('Tuesday', dayArr);
                    for (i in obj) {
                        $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
                        if (obj[i].edTime === '24') {
                            obj[i].stTime = 24;
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        }else{
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        }
                    }
                    break;
                case 'Wednesday':
                    obj = $scope.convertToScheduleObj('Wednesday', dayArr);
                    for (i in obj) {
                        $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
                        if (obj[i].edTime === '24') {
                            obj[i].stTime = 24;
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        } else {
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                       }
                    }
                    break;
                case 'Thursday':
                    obj = $scope.convertToScheduleObj('Thursday', dayArr);
                    for (i in obj) {
                        $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
                        if (obj[i].edTime === '24') {
                            obj[i].stTime = 24;
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        } else {
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        }
                    }
                    break;
                case 'Friday':
                    obj = $scope.convertToScheduleObj('Friday', dayArr);
                    for (i in obj) {
                        $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
                        if (obj[i].edTime === '24') {
                            obj[i].stTime = 24;
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        } else {
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        }
                    }
                    break;
                case 'Saturday':
                    obj = $scope.convertToScheduleObj('Saturday', dayArr);
                    for (i in obj) {
                        $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
                        if (obj[i].edTime === '24') {
                            obj[i].stTime = 24;
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        } else {
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        }
                    }
                    break;
                case 'Sunday':
                    obj = $scope.convertToScheduleObj('Sunday', dayArr);
                    for (i in obj) {
                        $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
                        if (obj[i].edTime === '24') {
                            obj[i].stTime = 24;
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        } else {
                            $scope.Schedule.daytimeArr.push(obj[i]);
                            $scope.Schedule.dayPart.push(obj[i]);
                        }
                    }
                    break;
            }
        };

        $scope.convertToScheduleObj = function (day, dayArr) {
            var a = dayArr,
                b = dayArr,
                c = [],
                keys1 = {},
                lastKey,
                i;

            a.map(function (value, key) {
                return a[key] - a[key-1];
            })
            .forEach(function (value, key) {
                if (value > 1) {
                    c.push(key - 1);
                }
            });

            if (c.length === 0) {
                keys1[0] = {};
                keys1[0].stTime = a[0];
                keys1[0].edTime = a[a.length - 1] + 1;
                keys1[0].day = day;
                if (keys1[0].edTime === 24 && keys1[0].stTime === 23) {
                    keys1[0].edTime = 0;
                }
            } else {
                for (i = 0; i <= c.length; i++) {
                    keys1[i] = {};
                    keys1[i].stTime = b[0];
                    keys1[i].edTime = a[c[i]] + 1;
                    keys1[i].day = day;
                    b.splice(0, c[i] + 1);
                    if (keys1[i].edTime === 24 && keys1[i].stTime === 23) {
                        keys1[i].edTime = 0;
                    }
                }
                lastKey = Object.keys(keys1).slice(Object.keys(keys1).length - 1)[0];
                keys1[lastKey].stTime = a[a.length - 1];
                keys1[lastKey].edTime = a[a.length - 1] + 1;
                keys1[lastKey].day = day;
                if (keys1[lastKey].edTime === 24 && keys1[lastKey].stTime === 23) {
                    keys1[lastKey].edTime = 0;
                }
            }
            return keys1;
        };

        $scope.timeFormat = function (event,time) {
            var target = $(event.target),
                parentElem =  target.parents('.miniToggle');

            parentElem
                .find('label')
                .removeClass('active');
            target
                .parent()
                .addClass('active');
            target.attr('checked', 'checked');
            if (time === 12) {
                $scope.twelve = true;
                $scope.clock = '12 hr';
            } else {
                $scope.twelve = false;
                $scope.clock = '24 hr';
            }
        };

        $scope.timeZoneType = function (event,type) {
            var target = $(event.target),
                parentElem =  target.parents('.miniToggle');

            parentElem
                .find('label')
                .removeClass('active');
            target
                .parent()
                .addClass('active');
            target.attr('checked', 'checked');
            $scope.timezoneFormat=type;
        };

        $scope.saveDayPart = function () {
            var adDaypartTargets = {}
                sunday,
                monday,
                tuesday,
                wednesday,
                thursday,
                friday,
                saturday,
                i;

            adDaypartTargets.dayTime=$scope.dayTimeSelected;
            adDaypartTargets.isIncluded=true;
            adDaypartTargets.timeZone=$scope.timezoneFormat;
            adDaypartTargets.clock=$scope.clock;

            sunday = _.filter($scope.Schedule.dayPart, function (obj) { 
                return obj.day === 'Sunday';
            });
            $scope.Sunday = $scope.generateDayArr(sunday);

            monday = _.filter($scope.Schedule.dayPart, function (obj) { 
                return obj.day === 'Monday';
            });
            $scope.Monday = $scope.generateDayArr(monday);

            tuesday = _.filter($scope.Schedule.dayPart, function (obj) { 
                return obj.day === 'Tuesday';
            });
            $scope.Tuesday = $scope.generateDayArr(tuesday);

            wednesday = _.filter($scope.Schedule.dayPart, function (obj) { 
                return obj.day === 'Wednesday';
            });
            $scope.Wednesday = $scope.generateDayArr(wednesday);

            Thursday = _.filter($scope.Schedule.dayPart, function (obj) { 
                return obj.day === 'Thursday';
            });
            $scope.Thursday = $scope.generateDayArr(Thursday);

            friday = _.filter($scope.Schedule.dayPart, function (obj) { 
                return obj.day === 'Friday';
            });
            $scope.Friday = $scope.generateDayArr(friday);

            saturday = _.filter($scope.Schedule.dayPart, function (obj) { 
                return obj.day === 'Saturday';
            });
            $scope.Saturday = $scope.generateDayArr(saturday);

            // Add custom day array to dayPart Object
            adDaypartTargets.schedule = {
                'Sunday':    $scope.Sunday,
                'Monday':    $scope.Monday,
                'Tuesday':   $scope.Tuesday,
                'Wednesday': $scope.Wednesday,
                'Thursday':  $scope.Thursday,
                'Friday':    $scope.Friday,
                'Saturday':  $scope.Saturday
            };

            for (i = 0; i < $scope.Schedule.dayPart.length; i++) {
                if ($scope.Schedule.dayPart[i].stTime >= 0) {
                    $scope.Schedule.dayPart[i].startTime =  $scope.returnTime($scope.Schedule.dayPart[i].stTime);
                }
                if ($scope.Schedule.dayPart[i].edTime >= 0) {
                    $scope.Schedule.dayPart[i].endTime =  $scope.returnTime($scope.Schedule.dayPart[i].edTime);
                }
            }

            audienceService.setDayPartDispObj($scope.Schedule.dayPart, $scope.dayTimeSelected);
            audienceService.setDayPartData(adDaypartTargets);
            $scope.getSelectedDays();
            $scope.resetDayTargetingVariables();
        };

        $scope.selectday = function (index,day) {
            $scope.Schedule.dayPart[index].day = day;
            $scope.dayTimeSelected = 'Custom schedule';
            $scope.customFlag = true;
        };

        $scope.selectStartTime = function (parentIndex, stTime) {
            $scope.Schedule.dayPart[parentIndex].stTime = stTime;
            $scope.dayTimeSelected = 'Custom schedule';
            $scope.customFlag = true;
        };

        $scope.selectEndTime = function (parentparentIndex, edTime) {
            $scope.Schedule.dayPart[parentparentIndex].edTime = edTime;
            $scope.dayTimeSelected = 'Custom schedule';
            $scope.customFlag = true;
        };

        $scope.changeDayTime = function () {
            $scope.dayTimeSelected = 'Custom schedule';
            $scope.customFlag = true;
        };

        $scope.generateDayArr = function (day) {
            var index,
                diff,
                i;

            $scope.arrName = [];
            for (i in day) {
                if (day[i].stTime === '24') {
                    for (index = 0; index < 24; index++) {
                        $scope.arrName.push(index);
                    }
                } else if (day[i].stTime === '23') {
                    $scope.arrName.push(23);
                } else if (parseInt(day[i].edTime) > parseInt(day[i].stTime)) {
                    for (diff = parseInt(day[i].stTime); diff < parseInt(day[i].edTime); diff++) {
                        $scope.arrName.push(diff);
                    }
                }
            }

            $scope.arrName = $scope.arrName.filter(function (item, index, inputArray) {
                return inputArray.indexOf(item) === index;
            });

            return $scope.arrName;
        };

        $scope.addMoreCustom = function () {
            $scope.Schedule.customLength = $scope.Schedule.customLength + 1;
            $scope.Schedule.daytimeArr.push({
                day: 'Sunday', 
                startTime: 'All Day'
            });
        };

        $scope.Schedule.dayTimeSelected = function (value) {
            var daytimeObj;

            $scope.customFlag = false;
            switch (value) {
                case 0:
                    $scope.Schedule.customLength=0;
                    $scope.Schedule.daytimeArr = [];
                    $scope.dayTimeSelected = 'All days and times';
                    daytimeObj = [
                        {day: 'Sunday',    startTime: 'All Day'},
                        {day: 'Monday',    startTime: 'All Day'},
                        {day: 'Tuesday',   startTime: 'All Day'},
                        {day: 'Wednesday', startTime: 'All Day'},
                        {day: 'Thursday',  startTime: 'All Day'},
                        {day: 'Friday',    startTime: 'All Day'},
                        {day: 'Saturday',  startTime: 'All Day'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    $scope.Schedule.dayPart = [];
                    $scope.Schedule.dayPart = [
                        {day: 'Sunday',    stTime: '24'},
                        {day: 'Monday',    stTime: '24'},
                        {day: 'Tuesday',   stTime: '24'},
                        {day: 'Wednesday', stTime: '24'},
                        {day: 'Thursday',  stTime: '24'},
                        {day: 'Friday',    stTime: '24'},
                        {day: 'Saturday',  stTime: '24'}];
                    $scope.Schedule.customLength = 7;
                    break;
                case 1:
                    $scope.Schedule.customLength = 0;
                    $scope.Schedule.daytimeArr = [];
                    $scope.dayTimeSelected = 'Weekday (M-F)';
                    daytimeObj = [
                        {day: 'Monday',    startTime: 'All Day'},
                        {day: 'Tuesday',   startTime: 'All Day'},
                        {day: 'Wednesday', startTime: 'All Day'},
                        {day: 'Thursday',  startTime: 'All Day'},
                        {day: 'Friday',    startTime: 'All Day'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    $scope.Schedule.dayPart = [];
                    $scope.Schedule.dayPart = [
                        {day: 'Monday',    stTime: '24'},
                        {day: 'Tuesday',   stTime: '24'},
                        {day: 'Wednesday', stTime: '24'},
                        {day: 'Thursday',  stTime: '24'},
                        {day: 'Friday',    stTime: '24'}
                    ];
                    $scope.Schedule.customLength = 5;
                    break;
                case 2:
                    $scope.Schedule.customLength = 0;
                    $scope.Schedule.daytimeArr = [];
                    $scope.dayTimeSelected = 'Weekend (S,S)';
                    daytimeObj = [
                        {day: 'Saturday', startTime: 'All Day'},
                        {day: 'Sunday',   startTime: 'All Day'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    $scope.Schedule.dayPart = [];
                    $scope.Schedule.dayPart = [
                        {day: 'Saturday', stTime: '24'},
                        {day: 'Sunday',   stTime: '24'}
                    ];
                    break;
                case 3:
                    $scope.Schedule.customLength = 0;
                    $scope.Schedule.daytimeArr = [];
                    $scope.dayTimeSelected = 'Business hours (M-F, 9:00AM-5:00PM)';
                    daytimeObj = [
                        {day: 'Monday',    startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Tuesday',   startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Wednesday', startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Thursday',  startTime: '9:00AM', endTime: '5:00PM'},
                        {day: 'Friday',    startTime: '9:00AM', endTime: '5:00PM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    $scope.Schedule.dayPart = [];
                    $scope.Schedule.dayPart = [
                        {day: 'Monday',    stTime: '9', edTime: '17'},
                        {day: 'Tuesday',   stTime: '9', edTime: '17'},
                        {day: 'Wednesday', stTime: '9', edTime: '17'},
                        {day: 'Thursday',  stTime: '9', edTime: '17'},
                        {day: 'Friday',    stTime: '9', edTime: '17'}
                    ];
                    $scope.Schedule.customLength = 5;
                    break;
                case 4:
                    $scope.Schedule.customLength = 0;
                    $scope.Schedule.daytimeArr = [];
                    $scope.dayTimeSelected = 'TV Primetime (8:00PM-11:00PM)';
                    daytimeObj = [
                        {day: 'Sunday',    startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Monday',    startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Tuesday',   startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Wednesday', startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Thursday',  startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Friday',    startTime: '8:00PM', endTime: '11:00PM'},
                        {day: 'Saturday',  startTime: '8:00PM', endTime: '11:00PM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    $scope.Schedule.dayPart = [];
                    $scope.Schedule.dayPart = [
                        {day: 'Sunday',    stTime: '20', edTime: '23'},
                        {day: 'Monday',    stTime: '20', edTime: '23'},
                        {day: 'Tuesday',   stTime: '20', edTime: '23'},
                        {day: 'Wednesday', stTime: '20', edTime: '23'},
                        {day: 'Thursday',  stTime: '20', edTime: '23'},
                        {day: 'Friday',    stTime: '20', edTime: '23'},
                        {day: 'Saturday',  stTime: '20', edTime: '23'}
                    ];
                    $scope.Schedule.customLength = 7;
                    break;
                case 5:
                    $scope.Schedule.daytimeArr = [];
                    $scope.dayTimeSelected = 'Early Morning (5:00AM-7:00AM)';
                    var daytimeObj = [
                        {day: 'Sunday',    startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Monday',    startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Tuesday',   startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Wednesday', startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Thursday',  startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Friday',    startTime: '5:00AM', endTime: '7:00AM'},
                        {day: 'Saturday',  startTime: '5:00AM', endTime: '7:00AM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    $scope.Schedule.dayPart = [];
                    $scope.Schedule.dayPart = [
                        {day: 'Sunday',    stTime: '5', edTime: '7'},
                        {day: 'Monday',    stTime: '5', edTime: '7'},
                        {day: 'Tuesday',   stTime: '5', edTime: '7'},
                        {day: 'Wednesday', stTime: '5', edTime: '7'},
                        {day: 'Thursday',  stTime: '5', edTime: '7'},
                        {day: 'Friday',    stTime: '5', edTime: '7'},
                        {day: 'Saturday',  stTime: '5', edTime: '7'}
                    ];
                    $scope.Schedule.customLength = 7;
                    break;
                case 6:
                    $scope.Schedule.customLength = 0;
                    $scope.Schedule.daytimeArr = [];
                    $scope.dayTimeSelected = 'Late Night (11:00PM-1:00AM)';
                    daytimeObj = [
                        {day: 'Sunday',    startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Sunday',    startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Monday',    startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Monday',    startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Tuesday',   startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Tuesday',   startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Wednesday', startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Wednesday', startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Thursday',  startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Thursday',  startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Friday',    startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Friday',    startTime: '11:00PM',  endTime: '12:00AM'},
                        {day: 'Saturday',  startTime: '12:00AM',  endTime: '1:00AM'},
                        {day: 'Saturday',  startTime: '11:00PM',  endTime: '12:00AM'}
                    ];
                    $scope.Schedule.daytimeArr = daytimeObj;
                    $scope.Schedule.dayPart = [];
                    $scope.Schedule.dayPart = [
                        {day: 'Sunday',    stTime: '0',  edTime: '1'},
                        {day: 'Sunday',    stTime: '23', edTime: '0'},
                        {day: 'Monday',    stTime: '0',  edTime: '1'},
                        {day: 'Monday',    stTime: '23', edTime: '0'},
                        {day: 'Tuesday',   stTime: '0',  edTime: '1'},
                        {day: 'Tuesday',   stTime: '23', edTime: '0'},
                        {day: 'Wednesday', stTime: '0',  edTime: '1'},
                        {day: 'Wednesday', stTime: '23', edTime: '0'},
                        {day: 'Thursday',  stTime: '0',  edTime: '1'},
                        {day: 'Thursday',  stTime: '23', edTime: '0'},
                        {day: 'Friday',    stTime: '0',  edTime: '1'},
                        {day: 'Friday',    stTime: '23', edTime: '0'},
                        {day: 'Saturday',  stTime: '0',  edTime: '1'},
                        {day: 'Saturday',  stTime: '23', edTime: '0'}
                    ];
                    $scope.Schedule.customLength = 14;
                    break;
                case 7:
                    $scope.dayTimeSelected = 'Custom schedule';
                    if ($scope.modeSet !== 'edit') {
                        $scope.Schedule.dayPart = [];
                        $scope.customFlag = true;
                        $scope.intermediateChange = true;
                        $scope.Schedule.daytimeArr = [];
                    }
                    break;
            }
        };

        $scope.selectTime = function (time) {
            var daytimeArr = $scope.Schedule.daytimeArr,
                dayTimeSelected = $scope.dayTimeSelected,
                timeMatched;

            $scope.tmpDayTimeSelected = dayTimeSelected;
            timeMatched = _.filter($scope.Schedule.daytimeArr, function (obj) { 
                return obj.startTime === time;
            });
            if (timeMatched.length === 0) {
                $scope.dayTimeSelected = '';
                $scope.timeSelected = 'Custom schedule';
            } else {
                $scope.dayTimeSelected = $scope.tmpDayTimeSelected;
            }
        };

        $scope.returnTime = function (time) {
            if (time >= 0) {
                var index = _.findIndex($scope.getStartTimes, function (item) {
                    return item.time === time;
                });

                if ($scope.twelve) {
                    return $scope.getStartTimes[index].twelveHrFormat;
                } else {
                    return $scope.getStartTimes[index].twentyfourHrFormat;
                }
            }
        };

        $scope.Schedule = {
            dayPart: [],
            daytimeArr: []
        };

        audienceService.resetDayPartdata();
        $scope.customFlag = false;
        $scope.timeSelected = 'All days and times';
        $scope.modeSet = workflowService.getMode();
        $scope.intermediateChange = false;

        $scope.$on('UpdateDayPart',function () {
            var fetchedObj =  workflowService.getAdsDetails(),
                scheduleObj;

            if (fetchedObj.targets && fetchedObj.targets.adDaypartTargets && _.size(fetchedObj.targets.adDaypartTargets) > 0) {
                $scope.setTargeting('Daypart');
                if (angular.lowercase(fetchedObj.targets.adDaypartTargets.timeZone) === 'end user') {
                    $('.advertiserClass')
                        .parent()
                        .removeClass('active');
                    $('.endUserClass')
                        .parent()
                        .addClass('active');
                    $('.endUserClass').attr('checked', 'checked');
                    $scope.timezoneFormat=angular.lowercase(fetchedObj.targets.adDaypartTargets.timeZone);
                } else {
                    $('.endUserClass')
                        .parent()
                        .removeClass('active');
                    $('.advertiserClass')
                        .parent()
                        .addClass('active');
                    $('.advertiserClass').attr('checked', 'checked');
                    $scope.timezoneFormat=angular.lowercase(fetchedObj.targets.adDaypartTargets.timeZone);
                }
                if (angular.lowercase(fetchedObj.targets.adDaypartTargets.dayTime) === angular.lowercase('Custom Schedule')) {
                    scheduleObj = fetchedObj.targets.adDaypartTargets.schedule;
                    $scope.Schedule.daytimeArr.length = 0;
                    $scope.Schedule.dayPart.length = 0;
                    _.each(scheduleObj, function (obj) {
                        var i;

                        for (i in obj) {
                            if (obj[i].length > 0) {
                                $scope.recreateCustomObj(i,obj[i]);
                            }
                        }
                    });
                    $scope.Schedule.dayTimeSelected(7);
                } else {
                    $scope.dayTimeSelected=fetchedObj.targets.adDaypartTargets.dayTime;
                    switch($scope.dayTimeSelected) {
                        case 'All days and times':
                            $scope.Schedule.dayTimeSelected(0);
                            break;
                        case 'Weekday (M-F)':
                            $scope.Schedule.dayTimeSelected(1);
                            break;
                        case 'Weekend (S,S)':
                            $scope.Schedule.dayTimeSelected(2);
                            break;
                        case 'Business hours (M-F, 9:00AM-5:00PM)':
                            $scope.Schedule.dayTimeSelected(3);
                            break;
                        case 'TV Primetime (8:00PM-11:00PM)':
                            $scope.Schedule.dayTimeSelected(4);
                            break;
                        case 'Early Morning (5:00AM-7:00AM)':
                            $scope.Schedule.dayTimeSelected(5);
                            break;
                        case 'Late Night (11:00PM-1:00AM)':
                            $scope.Schedule.dayTimeSelected(6);
                            break;
                    }
                }

                // trigger 24/12 hrs
                if (fetchedObj.targets.adDaypartTargets.clock === '24 HR') {
                    angular
                        .element('#24hr')
                        .trigger('click');
                } else {
                    angular
                        .element('#12hr')
                        .trigger('click');
                }
            }
            $scope.saveDayPart();
            $scope.getSelectedDays();
        });

        $scope.selectedDays = [];
        $scope.getStartTimes = [
            {time: 0,  twelveHrFormat: '12:00AM', twentyfourHrFormat: '00:00'},
            {time: 1,  twelveHrFormat: '1:00AM',  twentyfourHrFormat: '01:00'},
            {time: 2,  twelveHrFormat: '2:00AM',  twentyfourHrFormat: '02:00'},
            {time: 3,  twelveHrFormat: '3:00AM',  twentyfourHrFormat: '03:00'},
            {time: 4,  twelveHrFormat: '4:00AM',  twentyfourHrFormat: '04:00'},
            {time: 5,  twelveHrFormat: '5:00AM',  twentyfourHrFormat: '05:00'},
            {time: 6,  twelveHrFormat: '6:00AM',  twentyfourHrFormat: '06:00'},
            {time: 7,  twelveHrFormat: '7:00AM',  twentyfourHrFormat: '07:00'},
            {time: 8,  twelveHrFormat: '8:00AM',  twentyfourHrFormat: '08:00'},
            {time: 9,  twelveHrFormat: '9:00AM',  twentyfourHrFormat: '09:00'},
            {time: 10, twelveHrFormat: '10:00AM', twentyfourHrFormat: '10:00'},
            {time: 11, twelveHrFormat: '11:00AM', twentyfourHrFormat: '11:00'},
            {time: 12, twelveHrFormat: '12:00PM', twentyfourHrFormat: '12:00'},
            {time: 13, twelveHrFormat: '1:00PM',  twentyfourHrFormat: '13:00'},
            {time: 14, twelveHrFormat: '2:00PM',  twentyfourHrFormat: '14:00'},
            {time: 15, twelveHrFormat: '3:00PM',  twentyfourHrFormat: '15:00'},
            {time: 16, twelveHrFormat: '4:00PM',  twentyfourHrFormat: '16:00'},
            {time: 17, twelveHrFormat: '5:00PM',  twentyfourHrFormat: '17:00'},
            {time: 18, twelveHrFormat: '6:00PM',  twentyfourHrFormat: '18:00'},
            {time: 19, twelveHrFormat: '7:00PM',  twentyfourHrFormat: '19:00'},
            {time: 20, twelveHrFormat: '8:00PM',  twentyfourHrFormat: '20:00'},
            {time: 21, twelveHrFormat: '9:00PM',  twentyfourHrFormat: '21:00'},
            {time: 22, twelveHrFormat: '10:00PM', twentyfourHrFormat: '22:00'},
            {time: 23, twelveHrFormat: '11:00PM', twentyfourHrFormat: '23:00'},
            {time: 24, twelveHrFormat: 'All Day', twentyfourHrFormat: 'All Day'}
        ];

        $scope.getEndTimes = [
            {time: 0,  twelveHrFormat: '12:00AM', twentyfourHrFormat: '00:00'},
            {time: 1,  twelveHrFormat: '1:00AM',  twentyfourHrFormat: '01:00'},
            {time: 2,  twelveHrFormat: '2:00AM',  twentyfourHrFormat: '02:00'},
            {time: 3,  twelveHrFormat: '3:00AM',  twentyfourHrFormat: '03:00'},
            {time: 4,  twelveHrFormat: '4:00AM',  twentyfourHrFormat: '04:00'},
            {time: 5,  twelveHrFormat: '5:00AM',  twentyfourHrFormat: '05:00'},
            {time: 6,  twelveHrFormat: '6:00AM',  twentyfourHrFormat: '06:00'},
            {time: 7,  twelveHrFormat: '7:00AM',  twentyfourHrFormat: '07:00'},
            {time: 8,  twelveHrFormat: '8:00AM',  twentyfourHrFormat: '08:00'},
            {time: 9,  twelveHrFormat: '9:00AM',  twentyfourHrFormat: '09:00'},
            {time: 10, twelveHrFormat: '10:00AM', twentyfourHrFormat: '10:00'},
            {time: 11, twelveHrFormat: '11:00AM', twentyfourHrFormat: '11:00'},
            {time: 12, twelveHrFormat: '12:00PM', twentyfourHrFormat: '12:00'},
            {time: 13, twelveHrFormat: '1:00PM',  twentyfourHrFormat: '13:00'},
            {time: 14, twelveHrFormat: '2:00PM',  twentyfourHrFormat: '14:00'},
            {time: 15, twelveHrFormat: '3:00PM',  twentyfourHrFormat: '15:00'},
            {time: 16, twelveHrFormat: '4:00PM',  twentyfourHrFormat: '16:00'},
            {time: 17, twelveHrFormat: '5:00PM',  twentyfourHrFormat: '17:00'},
            {time: 18, twelveHrFormat: '6:00PM',  twentyfourHrFormat: '18:00'},
            {time: 19, twelveHrFormat: '7:00PM',  twentyfourHrFormat: '19:00'},
            {time: 20, twelveHrFormat: '8:00PM',  twentyfourHrFormat: '20:00'},
            {time: 21, twelveHrFormat: '9:00PM',  twentyfourHrFormat: '21:00'},
            {time: 22, twelveHrFormat: '10:00PM', twentyfourHrFormat: '22:00'},
            {time: 23, twelveHrFormat: '11:00PM', twentyfourHrFormat: '23:00'}
        ];

        $scope.twelve = true;
        $scope.clock = '12 hr';
        $scope.timezoneFormat = 'Advertiser';

        // working code
        /*$scope.convertToScheduleObj=function (day,dayArr) {
        //    var a = dayArr;
        //    var b = dayArr;
        //    var c = [];
        //    var keys1 = {};
        //    a.map(function (value, key) {
        //        return a[key] - a[key-1]
        //    }).forEach(function (value, key) {
        //        if (value > 1)
        //            c.push(key - 1)
        //    })
        //    if (c.length === 0) {
        //        keys1[0] = {}
        //        keys1[0].stTime = a[0];
        //        keys1[0].edTime = a[a.length - 1] + 1;
        //        keys1[0].day=day;
        //    } else {
        //        for (var i = 0; i <= c.length; i++) {
        //            keys1[i] = {}
        //            keys1[i].stTime = b[0]
        //            keys1[i].edTime = a[c[i]]+1
        //            keys1[i].day=day;
        //            b.splice(0, c[i] + 1)
        //        }
        //
        //        var lastKey = Object.keys(keys1).slice(Object.keys(keys1).length - 1)[0];
        //        keys1[lastKey].stTime = a[a.length - 1];
        //        keys1[lastKey].edTime = a[a.length - 1] + 1;
        //        keys1[lastKey].day=day;
        //    }
        //    //  console.log(keys1);
        //    return keys1;
        //}*/
    });
})();