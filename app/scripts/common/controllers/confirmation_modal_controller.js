define(['angularAMD'], function (angularAMD) {
    angularAMD.controller('ConfirmationModalController', ['$scope', '$modalInstance', 'headerMsg', 'mainMsg', 'execute',
        'buttonName', 'constants', function ($scope , $modalInstance,headerMsg,mainMsg,execute,
                                                                  buttonName, constants) {
        $scope.headerMsg = headerMsg;
        $scope.mainMsg =  mainMsg;
        $scope.textConstants =  constants;
        $scope.execute = execute;
        $scope.buttonName = buttonName;

        $scope.close= function () {
            $modalInstance.dismiss();
        };
    }]);
});
