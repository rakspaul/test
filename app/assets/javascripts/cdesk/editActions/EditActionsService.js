(function () {
  "use strict";
  editActionsModule.factory("editActionsService", ["dataService", "utils", "common", "line", '$q', 'modelTransformer', 'campaignModel', 'dataStore', 'apiPaths', 'requestCanceller', 'constants', function (dataService,  utils, common, line, $q, modelTransformer, campaignModel, dataStore, apiPaths, requestCanceller, constants) {

  	
  	var testEdit = function(test) {
      console.log('testing new module');
    };

    return {
    	testEdit: testEdit
    }

  }]);
}());