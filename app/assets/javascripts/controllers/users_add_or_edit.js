
(function() {
    'use strict';

    angObj.controller('UsersAddOrEdit', function($scope, $modalInstance,accountsService) {
        $scope.close=function(){
            $modalInstance.dismiss();
        };

    });
}());
