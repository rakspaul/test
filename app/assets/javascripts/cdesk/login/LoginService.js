(function () {
  "use strict";
  loginModule.factory("loginService", ["$cookies","$rootScope", "dataService", "$cookieStore", "utils", "common", "line", '$q', 'modelTransformer', 'campaignModel', 'dataStore', 'apiPaths', 'requestCanceller', 'constants', 'urlService', 'loginModel', function ($cookies, $rootScope, dataService, $cookieStore, utils, common, line, $q, modelTransformer, campaignModel, dataStore, apiPaths, requestCanceller, constants, urlService, loginModel) {
	
    $rootScope.user_id = constants.USER_ID;

    var loginAction = function (username, password, callback) {
      var data = {
        login : username,
        password : password
      };

      console.log(data);
      return dataService.post(urlService.APIloginAction(), data, {'Content-Type': 'application/json'}).then(function(response) {
        // if(response.status === "success") {
        //   console.log('loggedin successful ');
        // }
        callback(response);

      })
    };

    var setCredentials = function(data){
      loginModel.setUser(data);
      // $rootScope.auth_token = data.auth_token;
      // $rootScope.user_name = data.user_name;
      // $rootScope.is_network_user = data.is_network_user;
      // $rootScope.user_id = data.user_id;

      
      // $cookieStore.put('auth_token', data.auth_token);
      // $cookieStore.put('user_name', data.user_name);
      // $cookieStore.put('is_network_user', data.is_network_user);
      // $cookieStore.put('user_id', data.user_id);

    };

    return {
    	loginAction: loginAction,
      setCredentials: setCredentials
    }

  }]);
}());