define(['angularAMD', 'request-cancel-service'], function (angularAMD) {
    'use strict';

    angularAMD.factory('adminAccountsService', ['vistoconfig', 'dataService', 'constants', 'requestCanceller', function (vistoconfig, dataService, constants, requestCanceller) {
        var advertiser = null,
            brand = null,
            client = null,
            advertiserMode,
            counter = 0,
            permission = '',

            roleTemplateId = {
                Super_Admin: constants.super_admin,
                Account_Admin: constants.account_admin,
                Advertiser_Admin: constants.advertiser_admin,
                Generic_User: constants.generic_user
            },

            getAllCurrency =  function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/currencies');
            },

            createBillableAccount =  function (data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/billable_accounts',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            createAgencies =  function (data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/agencies',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getCountries = function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/countries');
            },

            getAllAdvertisers =  function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers', {cache: false});
            },

            getAgencies =  function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/agencies', {cache: false});
            },

            getAllBrands = function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands', {cache: false});
            },

            getClients = function (success, failure, flag) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients?access_level=admin',
                    canceller;

                if (flag === 'cancellable') {
                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                } else {
                    return dataService.fetch(url, {cache: false});
                }
            },

            getSubClients =  function (clientId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/descendants?level=immediate',
                    {cache: false}
                );
            },

            getClientsAdvertisers =  function (clientId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers',
                    {cache: false}
                );
            },

            getAdvertisersBrand = function (clientId, advertiserId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/brands',
                    {cache: false}
                );
            },

            getAdvertiserBrandDetials = function (clientId, advertiserId, brandId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/brands/' + brandId,
                    {cache: false}
                );
            },

             getClientBillingTypes =  function () {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/client_billing_types',
                    {cache: false}
                );
            },

            getAdvertiserBillingTypes =  function () {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertiser_billing_types',
                    {cache: false}
                );
            },


            getClientBillingSettings =  function (clientId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/billing_settings',
                    {cache: false}
                );
            },

            getAdvertiserBillingSettings =  function (clientId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertiser_billing_settings',
                    {cache: false}
                );
            },

             getClientBillingData = function(clientid){
                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/billing';

                    return dataService.fetch(url);
            },

            updateClientBillingData = function(data){
                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/billing';

                    return dataService.post(url, data);
            },

            insertClientBillingData = function(data){
                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/billing';

                    return dataService.put(url, data);
            },


            updateAdvertiser =  function (data) {
                return dataService.put(
                        vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers/' + data.id,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            createAdvertiser = function (data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getAdvertiserDetails = function (clientId, id) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers/' + id,
                    {'Content-Type': 'application/json'}
                );
            },

            createAdvertiserUnderClient = function (clientId, advertiserId, data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            updateAdvertiserUnderClient = function (clientId, advertiserId, data) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId,
                    data,
                    {'Content-Type': 'application/json'});
            },

            getAdvertiserUnderClient = function (clientId, advertiserId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId,
                    {cache: false}
                );
            },

            createPixelsUnderAdvertiser = function (clientId, advertiserId, data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/pixels',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getPixelsUnderAdvertiser = function (clientId, advertiserId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/pixels',
                    {cache: false}
                );
            },

            createBrand = function (data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getBrandDetails = function (clientId, advertiserId, brandId) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/brands/' + brandId,
                    {'Content-Type': 'application/json'}
                );
            },

            createBrandUnderAdvertiser = function (clientId, advertiserId, brandId) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/brands/' + brandId,
                    {},
                    {'Content-Type': 'application/json'}
                );
            },

            updateBrand = function (data) {
                return dataService.put(
                        vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands/' + data.id,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            updateClient = function (data, id) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + id,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            createClient = function (data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getClient = function (clientId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId,
                    {cache: false}
                );
            },

            setToBeEditedAdvertiser = function (advertiserObj) {
                advertiser = advertiserObj;
            },

            getToBeEditedAdvertiser = function () {
                return advertiser;
            },

            setToBeEditedClient = function (clientObj) {
                client = clientObj;
            },

            getToBeEditedClient = function () {
                return client;
            },

            setAdvertiserMode = function (mode) {
                advertiserMode = mode;
            },

            getToBeEditedBrand = function () {
                return brand;
            },

            setToBeEditedBrand = function (b) {
                brand = b;
            },

            getUsers = function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/users', {cache: false});
            },

            getUsersDetails = function (id) {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/users/' + id, {cache: false});
            },

            getUserClients = function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients');
            },

            getUserClientCode = function (clientName) {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/codes/generate?name=' + clientName);
            },

            checkClientCodeExist = function (code) {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/codes/' + code + '/exists');
            },

            getUserAdvertiserCode = function (advertiserName) {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/advertisers/codes/generate?name=' + advertiserName);
            },

            checkAdvertiserCodeExist = function (code) {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/advertisers/codes/' + code + '/exists');
            },

            getUserAdvertiser = function (clientId, query, pageSize, pageNo) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers';

                query = query || '';
                pageSize = pageSize || 200;
                pageNo = pageNo || 1;

                if (clientId) {
                    url += '?clientId=' + clientId + '&query=' + query + '&pageSize=' + pageSize + '&pageNo=' + pageNo;
                } else {
                    url += '?query=' + query + '&pageSize=' + pageSize + '&pageNo=' + pageNo;
                }

                return dataService.fetch(url);
            },

            getUserBrands = function (clientId, query, pageSize, pageNo) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands';

                query = query || '';
                pageSize = pageSize || 200;
                pageNo = pageNo || 1;

                if (clientId) {
                    url += '?clientId=' + clientId + '&query=' + query + '&pageSize=' + pageSize + '&pageNo=' + pageNo;
                } else {
                    url += '?query=' + query + '&pageSize=' + pageSize + '&pageNo=' + pageNo;
                }

                return dataService.fetch(url);
            },

            getUserPages = function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/features');
            },

            initCounter =  function () {
                counter = 0;
            },

            setCounter =  function () {
                counter++;
            },

            getCounter =  function () {
                return counter;
            },

            decrementCounter = function () {
                counter--;
            },

            getRoleId = function (role) {
                return roleTemplateId[role];
            },

            getRoleName = function (roleId) {
                return (_.invert(roleTemplateId))[roleId];
            },

            createUser = function (userObj) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/users',
                    userObj,
                    {'Content-Type': 'application/json'}
                );
            },

            updateUser =  function (data) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/users/' + data.id,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            setPermissions =  function (permissionObj) {
                permission = permissionObj;
            },

            getAdChoiceDataFromClient =  function (clientId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/ad_choices',
                    {cache: false}
                );
            },

            getBillingTypes =  function () {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/billing_types',
                    {cache: false}
                );
            },

            saveAdChoiceDataForClient =  function (clientId, data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/ad_choices',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getIABCategoryList = function () {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/iab_category_groups',
                    {cache: false}
                );
            },

            getIABSubCategoryList =  function (groupId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/iab_categories?group_id=' + groupId,
                    {cache: false}
                );
            },

            downloadAdminAdvPixel =  function (clientId, advId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advId +
                    '/pixels_download',
                    {cache: false}
                );
            },

            invoiceSaveNote =  function (clientId, invoiceId, data) {
                return dataService.post(
                    vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                    '/clients/' + clientId + '/invoices/' + invoiceId + '/notesStatus',
                    data,
                    {'Content-Type': 'application/json'}
                );
            };

        return {
            getAllCurrency : getAllCurrency,
            createBillableAccount : createBillableAccount,
            createAgencies : createAgencies,
            getCountries : getCountries,
            getAllAdvertisers : getAllAdvertisers,
            getAgencies : getAgencies,
            getAllBrands : getAllBrands,
            getClients : getClients,
            getSubClients :  getSubClients,
            getClientsAdvertisers :  getClientsAdvertisers,
            getAdvertisersBrand : getAdvertisersBrand,
            getAdvertiserBrandDetials : getAdvertiserBrandDetials,
            updateAdvertiser : updateAdvertiser,
            createAdvertiser : createAdvertiser,
            getAdvertiserDetails : getAdvertiserDetails,
            createAdvertiserUnderClient : createAdvertiserUnderClient,
            updateAdvertiserUnderClient : updateAdvertiserUnderClient,
            getAdvertiserUnderClient : getAdvertiserUnderClient,
            createPixelsUnderAdvertiser : createPixelsUnderAdvertiser,
            getPixelsUnderAdvertiser : getPixelsUnderAdvertiser,
            createBrand : createBrand,
            getBrandDetails : getBrandDetails,
            createBrandUnderAdvertiser : createBrandUnderAdvertiser,
            updateBrand : updateBrand,
            updateClient : updateClient,
            createClient : createClient,
            getClient : getClient,
            setToBeEditedAdvertiser :  setToBeEditedAdvertiser,
            getToBeEditedAdvertiser : getToBeEditedAdvertiser,
            setToBeEditedClient : setToBeEditedClient,
            getToBeEditedClient : getToBeEditedClient,
            setAdvertiserMode : setAdvertiserMode,
            getToBeEditedBrand : getToBeEditedBrand,
            setToBeEditedBrand : setToBeEditedBrand,
            getUsers : getUsers,
            getUsersDetails : getUsersDetails,
            getUserClients : getUserClients,
            getUserClientCode : getUserClientCode,
            checkClientCodeExist : checkClientCodeExist,
            getUserAdvertiserCode : getUserAdvertiserCode,
            checkAdvertiserCodeExist : checkAdvertiserCodeExist,
            getUserAdvertiser : getUserAdvertiser,
            getUserBrands : getUserBrands,
            getUserPages : getUserPages,
            getClientBillingTypes : getClientBillingTypes,
            getAdvertiserBillingTypes : getAdvertiserBillingTypes,
            getClientBillingSettings : getClientBillingSettings,
            getAdvertiserBillingSettings : getAdvertiserBillingSettings,
            getBillingTypes : getBillingTypes,
            initCounter : initCounter,
            setCounter : setCounter,
            getCounter : getCounter,
            decrementCounter : decrementCounter,
            getRoleId : getRoleId,
            getRoleName : getRoleName,
            createUser : createUser,
            updateUser : updateUser,
            setPermissions: setPermissions,
            getAdChoiceDataFromClient : getAdChoiceDataFromClient,
            getBillingTypes : getBillingTypes,
            saveAdChoiceDataForClient : saveAdChoiceDataForClient,
            getIABCategoryList : getIABCategoryList,
            getIABSubCategoryList : getIABSubCategoryList,
            downloadAdminAdvPixel : downloadAdminAdvPixel,
            invoiceSaveNote : invoiceSaveNote
        };
    }]);
});
