define(['angularAMD'], function (angularAMD) {
    'use strict';
    angularAMD.factory('accountsService', function (vistoconfig, dataService, constants, requestCanceller) {

        var advertiser = null;
        var brand = null;
        var client = null;
        var advertiserMode;
        var counter = 0;
        var permission = '';
        var role_template_id = {
            "Super_Admin": constants.super_admin,
            "Account_Admin": constants.account_admin,
            "Advertiser_Admin": constants.advertiser_admin,
            "Generic_User": constants.generic_user

        }

        return {
            getAllCurrency: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/currencies';
                return dataService.fetch(url);
            },
            createBillableAccount: function (data) {
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL + '/billable_accounts', data, {'Content-Type': 'application/json'})

            },
            createAgencies: function (data) {
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL + '/agencies', data, {'Content-Type': 'application/json'})

            },
            getCountries: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/countries';
                return dataService.fetch(url);
            },
            getAllAdvertisers: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers';
                return dataService.fetch(url, {cache: false});
            },
            getAgencies: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/agencies';
                return dataService.fetch(url, {cache: false});
            },
            getAllBrands: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands';
                return dataService.fetch(url, {cache: false});
            },
            getClients: function (success, failure, flag) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients?access_level=admin';
                if (flag == 'cancellable') {
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                } else {
                    return dataService.fetch(url, {cache: false});
                }
            },
            getSubClients: function(clientId){
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/'+clientId+'/descendants?level=immediate';
                return dataService.fetch(url, {cache: false});
            },
            getClientsAdvertisers: function (clientId) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers';
                return dataService.fetch(url, {cache: false});
            },
            getAdvertisersBrand: function (clientId, advertiserId) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers/' + advertiserId + '/brands';
                return dataService.fetch(url, {cache: false});
            },
            updateAdvertiser: function (data, id) {
                return dataService.put(vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers/' + id, data, {'Content-Type': 'application/json'})
            },
            createAdvertiser: function (data) {
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers', data, {'Content-Type': 'application/json'})
            },
            createAdvertiserUnderClient: function (clientId, advertiserId) {
                return dataService.put(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers/' + advertiserId, {}, {'Content-Type': 'application/json'})
            },
            createBrand: function (data) {
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands', data, {'Content-Type': 'application/json'})
            },
            createBrandUnderAdvertiser: function (clientId, advertiserId, brandId) {
                return dataService.put(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers/' + advertiserId + '/brands/' + brandId, {}, {'Content-Type': 'application/json'})
            }
            ,
            updateBrand: function (data, id) {
                return dataService.put(vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands/' + id, data, {'Content-Type': 'application/json'})
            },
            updateClient: function (data, id) {
                return dataService.put(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + id, data, {'Content-Type': 'application/json'})
            },
            createClient: function (data) {
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients', data, {'Content-Type': 'application/json'})
            },
            setToBeEditedAdvertiser: function (advertiserObj) {
                advertiser = advertiserObj;
            },
            getToBeEditedAdvertiser: function () {
                return advertiser;
            },
            setToBeEditedClient: function (clientObj) {
                client = clientObj;
            },
            getToBeEditedClient: function () {
                return client;
            },
            setAdvertiserMode: function (mode) {
                advertiserMode = mode;
            },
            getToBeEditedBrand: function () {
                return brand;
            },
            setToBeEditedBrand: function (b) {
                brand = b;
            },
            getUsers: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/users';
                return dataService.fetch(url, {cache: false});
            },
            getUsersDetails: function (id) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/users/' + id;
                return dataService.fetch(url, {cache: false});
            },
            getUserClients: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients';
                return dataService.fetch(url);
            },
            getUserAdvertiser: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers';
                return dataService.fetch(url);
            },
            getUserBrands: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients';
                return dataService.fetch(url);
            },
            getUserPages: function(){
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/features';
                return dataService.fetch(url);
            },
            initCounter: function () {
                counter = 0;
            },
            setCounter: function () {
                counter++;
            },
            getCounter: function () {
                return counter;
            },
            decrementCounter: function () {
                counter--;
            },
            getRoleId: function (role) {
                return role_template_id[role];
            },
            getRoleName: function (roleId) {
                var index = (_.invert(role_template_id))[roleId];
                return index;
            },
            createUser: function (userObj) {
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL + '/users', userObj, {'Content-Type': 'application/json'})
            },
            updateUser: function (data, fetchedUserDetails) {
                data.id = fetchedUserDetails.id;
                data.updatedAt = fetchedUserDetails.updatedAt;
                return dataService.put(vistoconfig.apiPaths.WORKFLOW_API_URL + '/users/' + data.id, data, {'Content-Type': 'application/json'})
            },
            setPermissions: function (permissionObj) {
                permission = permissionObj;
            }


        };
    });
});
