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
                'workFlowUser' : true, //response.data.data.is_workflow_user,
                'networkUser' : false, //response.data.data.is_network_user,
                'authorizationKey' : response.data.data.auth_token,
                'i18n' : response.data.data.i18n
            };

            var uiExclusion =  function(uiElements) {
                if(uiElements && userRoleObj.locale === 'en-gb') {
                    var obj= {};
                    var modules = uiElements.split(",");
                    _.each(modules, function(module) {
                        obj['show'+module] = false;
                    })
                    obj['ui_modules'] = modules;
                    return obj;
                }

            };

            if(response.data.data.i18n) {
                userRoleObj['locale'] = response.data.data.i18n.locale;
                userRoleObj['ui_exclusions'] = uiExclusion(response.data.data.i18n.ui_exclusions);
                userRoleObj['currency'] = response.data.data.i18n.currency;
            }

            localStorage.setItem('userRoleObj', JSON.stringify(userRoleObj));
        };

        return {
          getUserRole:getUserRole,
          setUserRole:setUserRole

        }
    }]);
 })();
