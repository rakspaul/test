(function () {
    "use strict";
    angObj.factory("workflowService", function ($http,$location, api, apiPaths, dataService, $cookieStore) {
        return {

            getClients: function () {
                var url = apiPaths.workflowCreate_apiServicesUrl + '/clients';
                return dataService.fetch(url);
            },

            getAdvertisers: function (clientId) {
                var url = apiPaths.workflowCreate_apiServicesUrl + '/clients/' + clientId + '/advertisers';
                return dataService.fetch(url);
            },

            getBrands: function (advertiserId) {
                var url = apiPaths.workflowCreate_apiServicesUrl + '/advertisers/' + advertiserId + '/brands';
                return dataService.fetch(url);
            },

            saveCampaign: function (data) {
                return dataService.post(apiPaths.workflowCreate_apiServicesUrl +'/campaigns', data, {'Content-Type': 'application/json'})
            }

        };
    });
}());