var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('daypartController', function ($scope, workflowService, $rootScope) {

    $scope.daytimeArr=[];
    $scope.dayTimeSelected="";
    $scope.dayTypeParts=[{id:1,name:'All days and times'},{id:2,name:'All days and times'},{id:3,name:'All days and times'},{id:4,name:'All days and times'}]
    $scope.Schedule = {};
    console.log("ji")
        $scope.Schedule.dayTimeSelected=function(value){
            //$(" .dropdown-toggle").parents('.dropdown').removeClass('open');
               event.preventDefault();
               event.stopImmediatePropagation();
            if(value==0){
                $scope.daytimeArr.length=0;
                $scope.dayTimeSelected="All days and times";
                var daytimeObj=[{day:'Sunday', startTime:'All Day'},{day:'Monday', startTime:'All Day'},{day:'Tuesday', startTime:'All Day'},{day:'Wednesday', startTime:'All Day'},{day:'Thrusday', startTime:'All Day'},{day:'Friday', startTime:'All Day'},{day:'Saturday', startTime:'All Day'}];
                $scope.daytimeArr=daytimeObj;
                console.log($scope.daytimeArr);
            }
            if(value==1){
                $scope.daytimeArr.length=0;
                $scope.dayTimeSelected="Weekday (M-F)";
                var daytimeObj=[{day:'Monday', startTime:'All Day'},{day:'Tuesday', startTime:'All Day'},{day:'Wednesday', startTime:'All Day'},{day:'Thrusday', startTime:'All Day'},{day:'Friday', startTime:'All Day'}];
                $scope.daytimeArr=daytimeObj;
                console.log($scope.daytimeArr);
            }
            if(value==2){
                $scope.dayTimeSelected="Weekend (S/S)";
                var daytimeObj=[{day:'Saturday', startTime:'All Day'},{day:'Sunday', startTime:'All Day'}];
                $scope.daytimeArr=daytimeObj;
                console.log($scope.daytimeArr);
            }
            if(value==3){
                $scope.dayTimeSelected="Business hour (M-F, 9am - 5pm)";
                var daytimeObj=[{day:'Monday', startTime:'9', startAmPm:'am',endTime:'5',endAmPm:'pm'},{day:'Tuesday', startTime:'9', startAmPm:'am',endTime:'5',endAmPm:'pm'},{day:'Wednesday', startTime:'9', startAmPm:'am',endTime:'5',endAmPm:'pm'},{day:'Thrusday', startTime:'9', startAmPm:'am',endTime:'5',endAmPm:'pm'},{day:'Friday', startTime:'9', startAmPm:'am',endTime:'5',endAmPm:'pm'}];
                $scope.daytimeArr=daytimeObj;
                console.log($scope.daytimeArr);
            }
            if(value==4){
                $scope.dayTimeSelected="TV Primetime (8pm-11pm)";
                var daytimeObj=[{day:'Sunday', startTime:'8', startAmPm:'pm',endTime:'11',endAmPm:'pm'},{day:'Monday', startTime:'8', startAmPm:'pm',endTime:'11',endAmPm:'pm'},{day:'Tuesday', startTime:'8', startAmPm:'pm',endTime:'11',endAmPm:'pm'},{day:'Wednesday', startTime:'8', startAmPm:'pm',endTime:'11',endAmPm:'pm'},{day:'Thrusday', startTime:'8', startAmPm:'pm',endTime:'11',endAmPm:'pm'},{day:'Friday', startTime:'8', startAmPm:'pm',endTime:'11',endAmPm:'pm'},{day:'Saturday', startTime:'8', startAmPm:'pm',endTime:'11',endAmPm:'pm'}];
                $scope.daytimeArr=daytimeObj;
                console.log($scope.daytimeArr);
            }
            if(value==5){
                $scope.dayTimeSelected="Early Morning (5am-7am)";
                var daytimeObj=[{day:'Sunday', startTime:'5', startAmPm:'am',endTime:'7',endAmPm:'am'},{day:'Monday', startTime:'5', startAmPm:'am',endTime:'7',endAmPm:'am'},{day:'Tuesday', startTime:'5', startAmPm:'am',endTime:'7',endAmPm:'am'},{day:'Wednesday', startTime:'5', startAmPm:'am',endTime:'7',endAmPm:'am'},{day:'Thrusday', startTime:'5', startAmPm:'am',endTime:'7',endAmPm:'am'},{day:'Friday', startTime:'5', startAmPm:'am',endTime:'7',endAmPm:'am'},{day:'Saturday', startTime:'5', startAmPm:'am',endTime:'7',endAmPm:'am'}];
                $scope.daytimeArr=daytimeObj;
                console.log($scope.daytimeArr);
            }
            if(value==6){
                $scope.dayTimeSelected="Late Night (11pm-1am)";
                var daytimeObj=[{day:'Sunday', startTime:'1', startAmPm:'am',endTime:'1',endAmPm:'am'},{day:'Sunday', startTime:'11', startAmPm:'pm',endTime:'0',endAmPm:'am'},
                    {day:'Monday', startTime:'1', startAmPm:'am',endTime:'1',endAmPm:'am'},{day:'Monday', startTime:'11', startAmPm:'pm',endTime:'0',endAmPm:'am'},
                    {day:'Tuesday', startTime:'1', startAmPm:'am',endTime:'1',endAmPm:'am'},{day:'Tuesday', startTime:'11', startAmPm:'pm',endTime:'0',endAmPm:'am'},
                    {day:'Wednesday', startTime:'1', startAmPm:'am',endTime:'1',endAmPm:'am'},{day:'Wednesday', startTime:'11', startAmPm:'pm',endTime:'0',endAmPm:'am'},
                    {day:'Thrusday', startTime:'1', startAmPm:'am',endTime:'1',endAmPm:'am'},{day:'Thrusday', startTime:'11', startAmPm:'pm',endTime:'0',endAmPm:'am'},
                    {day:'Friday', startTime:'1', startAmPm:'am',endTime:'1',endAmPm:'am'},{day:'Friday', startTime:'11', startAmPm:'pm',endTime:'0',endAmPm:'am'},
                    {day:'Saturday', startTime:'1', startAmPm:'am',endTime:'1',endAmPm:'am'},{day:'Saturday', startTime:'11', startAmPm:'pm',endTime:'0',endAmPm:'am'}];
                $scope.daytimeArr=daytimeObj;
                console.log($scope.daytimeArr);
            }
            if(value==7){
                $scope.dayTimeSelected="Custom schedule";
                var daytimeObj=[{day:'Sunday', startTime:'All Day'}];
                $scope.daytimeArr=daytimeObj;
                console.log($scope.daytimeArr);
            }


        }


    });
})();