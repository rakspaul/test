(function () {
    "use strict";
    angObj.factory("accountsService", function (apiPaths,dataService) {
        var advertiser = null;
        var brand = null;
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
                return dataService.fetch(url, {cache:false});
            },
            updateAdvertiser : function(data,id) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/advertisers/'+id, data, {'Content-Type': 'application/json'})
            },
            updateBrand : function(data,id) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/brands/'+id, data, {'Content-Type': 'application/json'})
            },

            setToBeEditedAdvertiser: function(advertiserObj){
                advertiser = advertiserObj;
            },
            getToBeEditedAdvertiser: function(){
                return advertiser ;
            },
            setAdvertiserMode: function(mode){
                advertiserMode = mode;
             },
            getToBeEditedBrand: function(){
                return brand ;
            },
            setToBeEditedBrand: function(b){
                brand = b;
            }


        }
    });
}());