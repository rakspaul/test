(function () {
    "use strict";
    angObj.factory("accountsService", function (apiPaths,dataService,constants) {
        var advertiser = null;
        var brand = null;
        var client = null;
        var advertiserMode;
        var counter=0;
        var permission = '';
        var role_template_id = {
            "Super_Admin": constants.super_admin,
            "Account_Admin": constants.account_admin,
            "Advertiser_Admin": constants.advertiser_admin,
            "Generic_User": constants.generic_user

            }

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
                var url = apiPaths.WORKFLOW_APIUrl + '/clients?access_level=admin';
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
            },
            getUsers: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/users';
                return dataService.fetch(url,{cache: false});
            },
            getUsersDetails: function (id) {
                var url = apiPaths.WORKFLOW_APIUrl + '/users/'+id;
                return dataService.fetch(url,{cache: false});
            },
            getUserClients:function(){
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url);
            },
            getUserAdvertiser:function(){
                var url = apiPaths.WORKFLOW_APIUrl + '/advertisers';
                return dataService.fetch(url);
            },
            getUserBrands:function(){
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url);
            },
            setCounter:function(){
                 counter++;
            },
            getCounter:function(){
                return counter;
            },
            decrementCounter:function(){
                counter--;
            },
            getRoleId: function(role){
                return role_template_id[role];
            },
            getRoleName: function(roleId){
                var index = (_.invert(role_template_id))[roleId];
                return index;
            },
            createUser: function(userObj){
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/users', userObj,{'Content-Type': 'application/json'})
            },
            setPermissions: function(permissionObj){
                permission = permissionObj;
            }



        }
    });
}());
