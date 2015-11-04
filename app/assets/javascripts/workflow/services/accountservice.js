(function () {
    "use strict";
    angObj.factory("accountsService", function (apiPaths,dataService) {
        return {
            getClients: function (advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url);
            },
            getClientsAdvertisers: function(clientId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId+'/advertisers';
                return dataService.fetch(url);
            },
            getAdvertisersBrand: function(clientId,advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/advertisers/'+advertiserId+'/brands';
                return dataService.fetch(url);
            }


        }
    });
}());