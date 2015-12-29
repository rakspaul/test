var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('UsersController', function ($scope, $window, $routeParams, constants, utils,  $modal ,accountsService,$rootScope) {
        $scope.textConstants = constants;
        $scope.UsersData={};
        $scope.userConsoleFormDetails={};


        //Add or Edit Pop up for User

        $scope.AddOrEditUserModal = function(mode,clientObj) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_users_add_or_edit,
                scope:$scope,
                windowClass: 'edit-dialog',
                controller: "UsersAddOrEdit" 
            });
            console.log("mode",mode,"clientObj",clientObj);
            if(mode == 'edit'){
                $scope.userConsoleFormDetails.email = clientObj.email;
                $scope.userConsoleFormDetails.firstName = clientObj.firstName;
                $scope.userConsoleFormDetails.lastName = clientObj.lastName;
                $scope.userConsoleFormDetails.role_template_id = accountsService.getRoleName(clientObj.role_template_id);
                //$scope.userConsoleFormDetails.role_template_id = "Account_Admin";

                //$scope.userConsoleFormDetails.firstName = clientObj.firstName;
                $scope.userConsoleFormDetails.password = clientObj.password;
                //set permission set
                //if(clientObj.permissions.length > 0){
                //$scope.resetFields();
                //console.log("clientObj = ",clientObj);
                    $rootScope.$broadcast('setPermissions');
                //}

            }

        }

        var usersList = {
            getUsers:function(){
                //accountsService.getUsers().then(function(res) {
                    $scope.UsersData['users']=[ {"role_template_id":0,"lastName":"shetty","password":"shrujan","email":"sdf@f.f","firstName":"sdf","permissions":[]},
                        {"role_template_id":1,"lastName":"shetty","password":"sajan","email":"sdf@f.f","firstName":"sajan","permissions":[]},
                        {"role_template_id":2,"lastName":"shetty","password":"akshay","email":"sdf@f.f","firstName":"akahsy","permissions":[]},
                        {"role_template_id":1,"lastName":"shetty","password":"shrujan","firstName":"asdf","email":"ads@asdf.com","permissions":[{"clientId":3,"permission":"ADMIN","advertiserId":2,"brandId":5},{"clientId":2,"permission":"ADMIN","advertiserId":4,"brandId":12},{"clientId":3,"permission":"ADMIN","advertiserId":1,"brandId":1},{"permission":"ADMIN"}]}
                    ];

                //});
            }

        }
        usersList.getUsers();
    });

})();
