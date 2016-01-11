(function() {
    'use strict';

    commonModule.controller('ConfirmationModalController', function( $scope , $modalInstance,headerMsg,mainMsg,execute,buttonName) {
console.log('ConfirmationModalController');
        $scope.headerMsg = headerMsg;
        $scope.mainMsg =  mainMsg;
        $scope.execute = execute;
        $scope.buttonName = buttonName

        $scope.close=function(){
            $modalInstance.dismiss();
        };
    });
}());