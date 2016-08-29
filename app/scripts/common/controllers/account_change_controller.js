define(['angularAMD'],function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountChangeController', ['$scope', '$modalInstance', 'headerMsg', 'mainMsg',
        'accountChangeAction', function ($scope, $modalInstance, headerMsg, mainMsg,
                                                               accountChangeAction) {
        $scope.headerMsg = headerMsg;
        $scope.mainMsg =  mainMsg;
        $scope.accountChangeAction = accountChangeAction;

        $scope.close=function(){
            $modalInstance.dismiss();
        };
    }]);
});
