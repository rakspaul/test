define(['angularAMD', 'common/services/account_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('changePasswordController', function( $scope  , $modalInstance, userObj  , accountService) {
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
                   $scope.passwordValidationErrorTxt = 'Password should have more than 7 characters' ;
                } else {
                    $scope.passwordValidationErrorTxt = 'Passwords are not matching' ;
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
                        if (res.status === 'OK' || res.status === 'success') {
                            $scope.close() ;
                        } else {
                            $scope.close() ;
                        }
                    }, function (err) {
                        $scope.close() ;
                        console.log('Error: ', err);
                    });
            } 
        };
    });
});
