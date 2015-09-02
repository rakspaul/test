/**
 * Created by collective on 27/08/2015.
 */
(function() {
    commonModule.factory("RoleBasedService", [function () {
        //var userRole;
        var getUserRole = function() {

            var userType = localStorage.getItem('userType');// stored onto local storage on login api call response
            return userType;
        };

        var setUserRole = function(response) {
            localStorage.setItem('userType', false); //called on login
           // localStorage.setItem('userType', response.data.data.isWorkflowUser);  //take from API

        };

        return {
          getUserRole:getUserRole,
          setUserRole:setUserRole

        }
    }]);
 })();
