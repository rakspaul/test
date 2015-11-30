var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('UsersController', function ($scope, $window, $routeParams, constants, utils,  $modal ) {


        //Add or Edit Pop up for User
        $scope.AddOrEditUserModal = function(mode,clientObj) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_users_add_or_edit,
                scope:$scope,
                windowClass: 'edit-dialog',
                controller: "UsersAddOrEdit" 
            });
        }
    });

})();
