define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('changePasswordController', function( $scope , $modalInstance) {
       

        $scope.close = function(){
            $modalInstance.dismiss();
        };
    });
});
