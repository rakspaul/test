define(['angularAMD', '../common/services/data_service', // jshint ignore:line
    'common/services/url_service', 'login/login_model'], function (angularAMD) {
    angularAMD.factory('loginService', ['dataService','urlService', 'loginModel',
        function (dataService,urlService, loginModel) {
        var loginAction = function (username, password, callback) {
                var data = {
                    login : username,
                    password : password
                };

                return dataService
                    .post(urlService.APIloginAction(), data, {'Content-Type': 'application/json'})
                    .then(function (response) {
                        callback(response);
                    });
            },

            logoutAction = function (callback) {
                return dataService.fetch(urlService.APIlogoutAction()).then(function(response) {
                    callback(response);
                });
            },

            getUserInfo = function () {
                return dataService
                    .fetch(urlService.APIuserInfo())
                    .then(function (response) {
                        if(response.status === 'success') {
                            loginModel.setUser(response.data.data);
                        }
                    });
            },

            setCredentials = function (data) {
                loginModel.setUser(data);
            };

        return {
            loginAction: loginAction,
            setCredentials: setCredentials,
            getUserInfo: getUserInfo,
            logoutAction: logoutAction
        };
    }]);
});
