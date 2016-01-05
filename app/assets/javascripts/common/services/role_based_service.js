/**
 * Created by collective on 27/08/2015.
 */
(function() {
    commonModule.factory('RoleBasedService', ['momentService', function (momentService) {
        var getClientRole = function() {
            return JSON.parse(localStorage.getItem('clientRoleObj'));
        };

        var setClientRole = function (response) {
            var clientRoleObj = {
                'workFlowUser' : response.data.data.isWorkflowUser,
                'i18n' : response.data.data.i18n
            };

            var uiExclusion =  function(uiElements) {
                if(uiElements && clientRoleObj.locale === 'en-gb') {
                    var obj= {};
                    var modules = uiElements.split(",");
                    _.each(modules, function(module) {
                        obj['show'+module] = false;
                    });
                    obj['ui_modules'] = modules;
                    return obj;
                }
            };

            // Set timezone name based on timezone abbr for the given account
            momentService.setTimezoneName(response.data.data.timezone, clientRoleObj);

            if(response.data.data.i18n) {
                clientRoleObj['locale'] = response.data.data.i18n.locale;
                clientRoleObj['ui_exclusions'] = uiExclusion(response.data.data.i18n.ui_exclusions);
                clientRoleObj['currency'] = response.data.data.i18n.currency;
            }

            localStorage.setItem('clientRoleObj', JSON.stringify(clientRoleObj));
        };

        var setUserData = function(response) {
            var userObj = {
                'authorizationKey' : response.data.data.auth_token
            };
            localStorage.setItem('userObj', JSON.stringify(userObj));
        };

        var getUserData = function() {
            return JSON.parse(localStorage.getItem('userObj'));
        };

        return {
            getClientRole    : getClientRole,
            setClientRole    : setClientRole,
            setUserData      : setUserData,
            getUserData      : getUserData
        };
    }]);
 })();
