define(['angularAMD'],function (angularAMD) {
    angularAMD.controller('ConfirmationModalController', function( $scope , $modalInstance,headerMsg,mainMsg,execute,buttonName) {
        $scope.headerMsg = headerMsg;
        $scope.mainMsg =  mainMsg;
        $scope.execute = execute;
        $scope.buttonName = buttonName

        $scope.close=function(){
            $modalInstance.dismiss();
        };
    });
});
