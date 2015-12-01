
(function() {
    'use strict';

    angObj.controller('UsersAddOrEdit', function($scope, $modalInstance) {
        $scope.delete_filter = function(event) {
            var elem = $(event.target);
            elem.closest(".add-filters").remove();
        };
        $scope.close=function(){
            $modalInstance.dismiss();
        };
        $scope.saveUserForm=function(){

        var formElem = $("#userCreateEditForm");
        var formData = formElem.serializeArray();
        formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
        console.log(formData);
        }

    });

}());
