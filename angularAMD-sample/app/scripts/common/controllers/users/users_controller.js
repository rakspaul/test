var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('UsersController', function ($scope,constants,$modal ,accountsService,$rootScope,$timeout) {
        $scope.textConstants = constants;
        $scope.UsersData={};
        $scope.userConsoleFormDetails={};

        //Add or Edit Pop up for User

        $scope.AddOrEditUserModal = function(mode,userObj) {
            //$timeout(function () {
            //    $rootScope.$broadcast('resetUserModal');
            //}, 500)

            var $modalInstance = $modal.open({
                templateUrl: assets.html_users_add_or_edit,
                scope:$scope,
                windowClass: 'edit-dialog',
                controller: "UsersAddOrEdit" 
            });
            $scope.isEdit = false;
            if(mode == 'edit'){
                $scope.isEdit = true;
                //$scope.userConsoleFormDetails.email = userObj.email;
                //$scope.userConsoleFormDetails.firstName = userObj.firstName;
                //$scope.userConsoleFormDetails.lastName = userObj.lastName;
                ////$scope.userConsoleFormDetails.role_template_id = accountsService.getRoleName(userObj.role_template_id);
                ////$scope.userConsoleFormDetails.role_template_id = "Account_Admin";
                //$scope.userConsoleFormDetails.roleTemplateId = userObj.roleTemplateId;
                ////$scope.userConsoleFormDetails.firstName = userObj.firstName;
                //$scope.userConsoleFormDetails.password = userObj.password;
                //set permission set
                $timeout(function () {
                    $rootScope.$broadcast('permissionsForUsers',[userObj]);
                }, 2000)


                //}
            }

        };

        var usersList = {
            getUsers:function(){
                accountsService.getUsers().then(function(res) {
                    $scope.UsersData['users']= res.data.data;
                });
            }
        };
        usersList.getUsers();
        $rootScope.$on('refreshUserList',function(){
            console.log('user list refresh');
            usersList.getUsers();
        })
    });

})();
