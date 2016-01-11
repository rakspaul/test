(function() {
    'use strict'
    commonModule.directive("popupMsg", function($compile) {
        return {
            restrict : "E",
            replace : true,
            link: function($scope,element,attr) {
                element.html($compile(angular.element('<div class="top_message_box" attr="test" ng-class="{\'red_msg\':'+attr.ngShow+'.isErrorMsg}" ng-show="'+attr.ngShow+'.message"><span class="msg_box"><span class="msg_icon">x</span><span class="msg_txt ng-binding" ng-bind-html="'+attr.ngShow+'.message"></span><span class="close_msg_box_holder"><span class="close_msg_box" ng-click="close_msg_box($event);">x</span></span></span></div>'))($scope));
            }
        };
    }).controller("popUpMsgCtr",function($scope,$rootScope,$timeout,constants){
        $scope.init = function(msg, errMsg){
            if(!angular.element('.top_message_box').length) {
                $rootScope.errMsgKey = msg;
                $rootScope.errMsg = constants[errMsg];
                $rootScope[$rootScope.errMsgKey] = {'message': '', 'isErrorMsg': 0};
                $rootScope[$rootScope.errMsgKey]['message'] = localStorage.getItem('topAlertMessage');
                $rootScope.isErrorMsg = 1;
                $rootScope.isMsg = 0;
            }
        }
        $scope.resetAlertMessage = function(){
            localStorage.removeItem('topAlertMessage');
            if($rootScope[$rootScope.errMsgKey] != undefined) {
                $rootScope[$rootScope.errMsgKey].message = "";
            }
        }
        $scope.msgtimeoutReset = function(){
            $timeout(function(){
                $scope.resetAlertMessage() ;
            }, 3000);
        }
        $scope.msgtimeoutReset();
        $scope.close_msg_box = function(event) {
        //    var elem = $(event.target);
        //    elem.closest(".top_message_box").hide() ;
            $scope.resetAlertMessage() ;
        };
        $rootScope.setErrAlertMessage = function(errMsg,isErrorMsg,isMsg){
            $scope.errMsg = (typeof errMsg != "undefined") ? errMsg : $rootScope.errMsg;
            $scope.isErrorMsg = (typeof isErrorMsg != "undefined") ? isErrorMsg : 1;
            $scope.isMsg = (typeof isMsg != "undefined") ? isMsg : 0;
            $rootScope[$rootScope.errMsgKey].message = $scope.errMsg;
            $rootScope[$rootScope.errMsgKey].isErrorMsg = $scope.isErrorMsg ;
            $rootScope[$rootScope.errMsgKey].isMsg = $scope.isMsg;
            $scope.msgtimeoutReset();
        }
    });
}());