(function () {
  "use strict";
  loginModule.factory("loginService", ["dataService", "utils", "common", "line", '$q', 'modelTransformer', 'campaignModel', 'dataStore', 'apiPaths', 'requestCanceller', 'constants', 'urlService',  function (dataService,  utils, common, line, $q, modelTransformer, campaignModel, dataStore, apiPaths, requestCanceller, constants, urlService) {
	
    var loginAction = function (data) {
      return dataService.post(urlService.APIloginAction(data.ad_id, user_id), data).then(function(response) {
        if(response.status === "success") {
          console.log('Edit successful ' + data.ad_id);
          return 1;
        } else {
          console.log('Edit Action Failed!');
          return 0;
        }
      })
    };

    return {
    	editAction: editAction
    }

  }]);
}());