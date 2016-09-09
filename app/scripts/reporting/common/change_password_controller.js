define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('changePasswordController', ['$rootScope', '$scope', '$modalInstance', 'userObj', 'accountService', 'constants',
        function( $rootScope , $scope  , $modalInstance, userObj  , accountService , constants ) {

        $scope.userId = '' ;
    	$scope.passwordValidation = true ;
        $scope.passwordValidationErrorTxt = 'Passwords are not matching' ;

        $scope.userId = userObj.id ;
        $scope.close = function(){
            $modalInstance.dismiss();
        };
        $scope.checkPassword = function() {
            if( ($scope.password !== $scope.confirm_password ) || ( ($scope.password.length || $scope.confirm_password.length ) < 7 ) ) {
                $scope.passwordValidation = false ;
                if(( ($scope.password.length || $scope.confirm_password.length ) < 7 )) {
                   $scope.passwordValidationErrorTxt = constants.PASSWORD_LENGTH_ERROR ;
                } else {
                   $scope.passwordValidationErrorTxt = constants.PASSWORD_MATCH_ERROR ;
                }
            } else {
                $scope.passwordValidation = true ;
            }

        };
        $scope.update_password = function() {
        	$scope.checkPassword() ;
            if ($scope.userId && $scope.passwordValidation ) {
                accountService
                    .updatePassword($scope.userId,  $scope.confirm_password )
                    .then(function (res) {
                        if ((res.status === 'OK' || res.status === 'success') ) {
                            $rootScope.setErrAlertMessage(constants.PASSWORD_SUCCESS_MSG , 0);
                        } else {
                            console.log('Error');
                        }
                        $scope.close() ;

                    }, function (err) {
                        $scope.close() ;
                        console.log('Error: ', err);
                    });
            }
        };
    }]);
});
