(function () {
  "use strict";
  loginModule.factory("loginService", ["$cookies","$rootScope", "dataService", "$cookieStore", "utils", "common", "line", '$q', 'modelTransformer', 'campaignModel', 'dataStore', 'apiPaths', 'requestCanceller', 'constants', 'urlService', 'loginModel', '$http', function ($cookies, $rootScope, dataService, $cookieStore, utils, common, line, $q, modelTransformer, campaignModel, dataStore, apiPaths, requestCanceller, constants, urlService, loginModel, $http) {
	
    $rootScope.user_id = constants.USER_ID;

    var loginAction = function (username, password, callback) {
      var data = {
        login : username,
        password : password
      };

      return dataService.post(urlService.APIloginAction(), data, {'Content-Type': 'application/json'}).then(function(response) {
        callback(response);
      })
    };

    var validateToken = function(auth_token){
      $http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); ;
      return dataService.fetch(urlService.APIuserInfo()).then(function(response){
        loginModel.setUser(response.data.data);
      });
    }

    var setCredentials = function(data){
      loginModel.setUser(data);
    };

    return {
    	loginAction: loginAction,
      setCredentials: setCredentials,
      validateToken: validateToken
    }

  }]);
}());