define(['angularAMD', '../moment_utils', 'common/services/constants_service'], // jshint ignore:line
    function (angularAMD) {
    angularAMD.factory('RoleBasedService', ['$locale','momentService', 'constants', 'tmhDynamicLocale',
        function ($locale, momentService, constants , tmhDynamicLocale) {
        var getClientRole = function () {
                return JSON.parse(localStorage.getItem('clientRoleObj'));
            };

            var setClientRole = function (response) {
                var clientRoleObj = {
                        workFlowUser: response.data.data.isWorkflowUser,
                        i18n: response.data.data.i18n
                    },

                    uiExclusion =  function (uiElements) {
                        var obj = {},
                            modules;

                        if (uiElements && clientRoleObj.locale === 'en-gb') {
                            modules = uiElements.split(',');

                            _.each(modules, function (module) { // jshint ignore:line
                                obj['show'+module] = false;
                            });

                            obj.ui_modules = modules;

                            return obj;
                        }
                    };

                // Set timezone name based on timezone abbr for the given account
                momentService.setTimezoneName(response.data.data.timezone, clientRoleObj);

                if (response.data.data.i18n) {
                    clientRoleObj.locale = response.data.data.i18n.locale;
                    clientRoleObj.ui_exclusions = uiExclusion(response.data.data.i18n.ui_exclusions);
                    clientRoleObj.currency = response.data.data.i18n.currency;
                }

                localStorage.setItem('clientRoleObj', JSON.stringify(clientRoleObj));
            },

            setUserData = function (response) {
                var userObj = {
                    authorizationKey: response.data.data.auth_token,
                    preferred_client: response.data.data.preferred_client
                };

                localStorage.setItem('userObj', JSON.stringify(userObj));
            },

            getUserData = function () {
                return JSON.parse(localStorage.getItem('userObj'));
            },

            setCurrencySymbol = function () {
                var locale;

                if (getClientRole()) {
                    locale = getClientRole().locale || 'en-us';
                    tmhDynamicLocale.set(locale);
                    constants.currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
                }
            };

        return {
            getClientRole    : getClientRole,
            setClientRole    : setClientRole,
            setUserData      : setUserData,
            getUserData      : getUserData,
            setCurrencySymbol: setCurrencySymbol
        };
    }]);
});
