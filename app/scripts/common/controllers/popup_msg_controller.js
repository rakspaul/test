define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('popUpMsgCtr', ['$scope', '$rootScope', '$timeout',
        'constants', 'vistoconfig', function ($scope, $rootScope, $timeout, constants, vistoconfig) {
        $scope.addClass = '';

        $scope.init = function (msg) {
            if (!angular.element('.top_message_box').length) {
                var defaultMsg = vistoconfig.defaultMessage.get();
                $rootScope.errMsgKey = msg;
                $rootScope.errMsg = constants.ERROR;

                $rootScope[$rootScope.errMsgKey] = {
                    'message': '',
                    'isErrorMsg': 0
                };

                $rootScope[$rootScope.errMsgKey].message = defaultMsg.message;
                $rootScope.isErrorMsg = defaultMsg.isErrorMsg;
                $rootScope.isMsg = 0;
            }
        };

        $scope.resetAlertMessage = function () {

            vistoconfig.defaultMessage.reset();

            if ($rootScope[$rootScope.errMsgKey] !== undefined) {
                $rootScope[$rootScope.errMsgKey].message = '';
            }

            $('.top_message_box').removeClass($scope.addClass);
        };

        $scope.msgtimeoutReset = function () {
            $timeout(function () {
                $scope.resetAlertMessage();
            }, 3000);
        };

        $scope.msgtimeoutReset();

        $scope.close_msg_box = function () {
            $scope.resetAlertMessage();
        };

        $rootScope.setErrAlertMessage = function (errMsg, isErrorMsg, isMsg, addClass) {
            $scope.errMsg = (typeof errMsg !== 'undefined') ? errMsg : $rootScope.errMsg;
            $scope.isErrorMsg = (typeof isErrorMsg !== 'undefined') ? isErrorMsg : 1;
            $scope.isMsg = (typeof isMsg !== 'undefined') ? isMsg : 0;
            $rootScope[$rootScope.errMsgKey].message = $scope.errMsg;
            $rootScope[$rootScope.errMsgKey].isErrorMsg = $scope.isErrorMsg;
            $rootScope[$rootScope.errMsgKey].isMsg = $scope.isMsg;
            $scope.msgtimeoutReset();

            if (addClass !== undefined) {
                $scope.addClass = addClass;
                $('.top_message_box').addClass(addClass);
            } else {
                $('.top_message_box').removeClass($scope.addClass);
            }
        };
    }]);
});
