(function () {
    "use strict";
    angObj.factory("accountsService", function (apiPaths,dataService) {
        var advertiser = null;
        var brand = null;
        var client = null;
        var advertiserMode;

        return {
            getAllCurrency: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/currencies';
                return dataService.fetch(url);
            },
            createBillableAccount: function (data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/billable_accounts', data,{'Content-Type': 'application/json'})

            },
            createAgencies: function (data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/agencies', data,{'Content-Type': 'application/json'})

            },
            getCountries:function(){
                var url = apiPaths.WORKFLOW_APIUrl + '/countries';
                return dataService.fetch(url);
            },
            getAllAdvertisers: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/advertisers';
                return dataService.fetch(url, {cache:false});
            },
            getAgencies: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/agencies';
                return dataService.fetch(url, {cache:false});
            },
            getAllBrands: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/brands';
                return dataService.fetch(url, {cache:false});
            },
            getClients: function (advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url, {cache:false});
            },
            getClientsAdvertisers: function(clientId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId+'/advertisers';
                return dataService.fetch(url, {cache:false});
            },
            getAdvertisersBrand: function(clientId,advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId+'/advertisers/'+advertiserId+'/brands';
                return dataService.fetch(url, {cache:false});
            },
            updateAdvertiser : function(data,id) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/advertisers/'+id, data, {'Content-Type': 'application/json'})
            },
            createAdvertiser : function(data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/advertisers',data, {'Content-Type': 'application/json'})
            },
            createAdvertiserUnderClient : function(clientId,advertiserId) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+advertiserId,{}, {'Content-Type': 'application/json'})
            },
            createBrand : function(data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/brands',data, {'Content-Type': 'application/json'})
            },
            createBrandUnderAdvertiser : function(clientId,advertiserId,brandId) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+advertiserId+'/brands/'+brandId,{}, {'Content-Type': 'application/json'})
            }
            ,
            updateBrand : function(data,id) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/brands/'+id, data, {'Content-Type': 'application/json'})
            },
            updateClient : function(data,id) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/clients/'+id, data, {'Content-Type': 'application/json'})
            },
            createClient : function(data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/clients',data, {'Content-Type': 'application/json'})
            },
            setToBeEditedAdvertiser: function(advertiserObj){
                advertiser = advertiserObj;
            },
            getToBeEditedAdvertiser: function(){
                return advertiser ;
            },
            setToBeEditedClient: function(clientObj){
                client = clientObj;
            },
            getToBeEditedClient: function(){
                return client ;
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
