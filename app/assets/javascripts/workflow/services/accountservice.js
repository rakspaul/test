(function () {
    "use strict";
    angObj.factory("accountsService", function (apiPaths,dataService) {
        return {
            getClients: function (advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url);
            },
            getAdvertisers: function(clientId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/advertisers';
                return dataService.fetch(url);
            }

        }
    });
}());