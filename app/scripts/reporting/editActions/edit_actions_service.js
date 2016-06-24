define(['angularAMD', '../../common/services/data_service', 'common/services/url_service'],
    function (angularAMD) {
    "use strict";
    angularAMD.factory("editActionsService", ["dataService",'urlService', '$routeParams', function (dataService, urlService, $routeParams) {

    var editAction = function (data) {
      var clientId = $routeParams.subAccountId || $routeParams.accountId;
      return dataService.put(urlService.APIeditAction(clientId, data.ad_id), data).then(function(response) {
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
});
