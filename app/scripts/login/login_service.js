define(['angularAMD'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('loginService', ['dataService','urlService', 'loginModel', function (dataService,urlService, loginModel) {
            var loginAction = function (username, password, callback) {
                    var data = {login: username, password: password};

                    return dataService
                        .post(urlService.APIloginAction(), data, {'Content-Type': 'application/json'})
                        .then(function (response) {
                            callback(response);
                        });
                },

                logoutAction = function (callback) {
                    return dataService
                        .fetch(urlService.APIlogoutAction())
                        .then(function(response) {
                            callback(response);
                        });
                },

                setCredentials = function (data) {
                    loginModel.setUser(data);
                };

            return {
                loginAction: loginAction,
                setCredentials: setCredentials,
                logoutAction: logoutAction
            };
        }]);
    }
);
