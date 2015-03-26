(function () {
  "use strict";
  editActionsModule.factory("editActionsService", ["dataService", "utils", "common", "line", '$q', 'modelTransformer', 'campaignModel', 'dataStore', 'apiPaths', 'requestCanceller', 'constants', 'urlService',  function (dataService,  utils, common, line, $q, modelTransformer, campaignModel, dataStore, apiPaths, requestCanceller, constants, urlService) {
	
    var editAction = function (data) {
      return dataService.put(urlService.APIeditAction(data.ad_id), data).then(function(response) {
        if(response.status === "success") {
          return 1;
        } else {
          return 0;
        }
      })
    };

    return {
    	editAction: editAction
    }

  }]);
}());