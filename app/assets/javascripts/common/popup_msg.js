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
        $scope.msg = null;
        $scope.init = function(msg,errMsg){
            $scope.msg = msg;
            $scope.errMsg = constants[errMsg];
            $scope[$scope.msg] = {'message': '', 'isErrorMsg': 0};
            $scope[$scope.msg]['message'] = localStorage.getItem('topAlertMessage');
            $scope.isErrorMsg = 1;
            $scope.isMsg = 0;
        }

        $scope.resetAlertMessage = function(){
            localStorage.removeItem('topAlertMessage');
            $scope[$scope.msg].message = "" ;
        }
        $scope.msgtimeoutReset = function(){
            $timeout(function(){
                $scope.resetAlertMessage() ;
            }, 3000);
        }
        $scope.msgtimeoutReset();
        $scope.close_msg_box = function(event) {
            var elem = $(event.target);
            elem.closest(".top_message_box").hide() ;
            $scope.resetAlertMessage() ;
        };
        $rootScope.setErrAlertMessage = function(errMsg,isErrorMsg,isMsg){
            $scope.errMsg = (typeof errMsg != "undefined") ? errMsg : $scope.errMsg;
            $scope.isErrorMsg = (typeof isErrorMsg != "undefined") ? isErrorMsg : 1;
            $scope.isMsg = (typeof isMsg != "undefined") ? isMsg : 0;
            $scope[$scope.msg].message = $scope.errMsg;
            $scope[$scope.msg].isErrorMsg = 1 ;
            $scope[$scope.msg].isMsg = 0;
            $scope.msgtimeoutReset();
        }
    });
}());