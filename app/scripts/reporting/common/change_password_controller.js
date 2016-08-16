define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('changePasswordController', function( $scope , $modalInstance) {
       
    	$scope.passwordMatching = false ;

        $scope.close = function(){
            $modalInstance.dismiss();
        };
        $scope.update_password = function() {
        	if( $scope.password != $scope.confirm_password ) {
        		$scope.passwordMatching = false ;
        	} else {
        		$scope.passwordMatching = true ;
        	}
        }
    });
});
