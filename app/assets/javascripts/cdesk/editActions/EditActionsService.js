(function () {
  "use strict";
  editActionsModule.factory("editActionsService", ["dataService", "utils", "common", "line", '$q', 'modelTransformer', 'campaignModel', 'dataStore', 'apiPaths', 'requestCanceller', 'constants', 'urlService',  function (dataService,  utils, common, line, $q, modelTransformer, campaignModel, dataStore, apiPaths, requestCanceller, constants, urlService) {
	
    var editAction = function (data) {
      return dataService.put(urlService.APIeditAction(data.ad_id, user_id), data).then(function(response) {
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