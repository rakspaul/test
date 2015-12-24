var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('UsersController', function ($scope, $window, $routeParams, constants, utils,  $modal ,accountsService) {
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
                $scope.userConsoleFormDetails.firstName = clientObj.firstName;
                $scope.userConsoleFormDetails.firstName = clientObj.firstName;
                $scope.userConsoleFormDetails.firstName = clientObj.firstName;

            }

        }

        var usersList = {
            getUsers:function(){
               // accountsService.getUsers().then(function(res) {
                    $scope.UsersData['users']=[ {"role_template_id":0,"lastName":"shetty","password":"shrujan","email":"sdf@f.f","firstName":"sdf","permissions":[]},
                        {"role_template_id":0,"lastName":"shetty","password":"sajan","email":"sdf@f.f","firstName":"sajan","permissions":[]},
                        {"role_template_id":0,"lastName":"shetty","password":"akshay","email":"sdf@f.f","firstName":"akahsy","permissions":[]}];

               // });
            }

        }
        usersList.getUsers();
    });

})();
