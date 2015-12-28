var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('UsersController', function ($scope, $window, $routeParams, constants, utils,  $modal ,accountsService) {
        $scope.textConstants = constants;
        $scope.UsersData={};


        //Add or Edit Pop up for User
        $scope.AddOrEditUserModal = function(mode,clientObj) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_users_add_or_edit,
                scope:$scope,
                windowClass: 'edit-dialog',
                controller: "UsersAddOrEdit" 
            });
        }

        var usersList = {
            getUsers:function(){
               // accountsService.getUsers().then(function(res) {
                    $scope.UsersData['users']=[{id:1,name:"user1"},{id:2,name:"user2"}];

               // });
            }

        }
        usersList.getUsers();
    });

})();
