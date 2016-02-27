(function() {
    'use strict';

    commonModule.controller('AccountChangeController', function( $scope , $modalInstance, headerMsg, mainMsg, accountChangeAction) {

        $scope.headerMsg = headerMsg;
        $scope.mainMsg =  mainMsg;
        $scope.accountChangeAction = accountChangeAction;

        $scope.close=function(){
            $modalInstance.dismiss();
        };
    });
}());