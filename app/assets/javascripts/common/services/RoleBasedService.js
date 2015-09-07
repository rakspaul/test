/**
 * Created by collective on 27/08/2015.
 */
(function() {
    commonModule.factory("RoleBasedService", [function () {
        var getUserRole = function() {
            var userType = JSON.parse(localStorage.getItem('userRoleObj'));
            return userType;
        };

        var setUserRole = function(response) {
            var userRoleObj = {
                'workFlowUser' : true//response.data.data.is_workflow_user === 'true' ? true : false
            };
            localStorage.setItem('userRoleObj', JSON.stringify(userRoleObj));
        };

        return {
          getUserRole:getUserRole,
          setUserRole:setUserRole

        }
    }]);
 })();
