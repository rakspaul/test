(function () {
    "use strict";
    angObj.factory("accountsService", function (apiPaths,dataService) {
        var advertiser = null;
        var advertiserMode;

        return {
            getClients: function (advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url);
            },
            getClientsAdvertisers: function(clientId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId+'/advertisers';
                return dataService.fetch(url, {cache:false});
            },
            getAdvertisersBrand: function(clientId,advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/advertisers/'+advertiserId+'/brands';
                return dataService.fetch(url);
            },
            updateAdvertiser : function(data,id) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/advertisers/'+id, data, {'Content-Type': 'application/json'})
            },
            setToBeEditedAdvertiser: function(advertiserObj){
                advertiser = advertiserObj;
            },
            getToBeEditedAdvertiser: function(){
                return advertiser ;
            },
            setAdvertiserMode: function(mode){
                advertiserMode = mode;
             }


        }
    });
}());