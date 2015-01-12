(function () {
  "use strict";
  loginModule.factory("loginService", ["$rootScope", "dataService", "$cookieStore", "utils", "common", "line", '$q', 'modelTransformer', 'campaignModel', 'dataStore', 'apiPaths', 'requestCanceller', 'constants', 'urlService',  function ($rootScope, dataService, $cookieStore, utils, common, line, $q, modelTransformer, campaignModel, dataStore, apiPaths, requestCanceller, constants, urlService) {
	
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

    var setCredentials = function(authToken){
      $rootScope.globals = {
        token: authToken
      };
      console.log( $rootScope.globals);
       $cookieStore.put('token', authToken);
    };

    return {
    	loginAction: loginAction,
      setCredentials: setCredentials
    }

  }]);
}());