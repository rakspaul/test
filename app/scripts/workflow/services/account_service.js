define(['angularAMD', 'common/services/vistoconfig_service', 'common/services/data_service',
    'common/services/constants_service', 'common/services/request_cancel_service'], function (angularAMD) {
    'use strict';

    angularAMD.factory('accountsService', function (vistoconfig, dataService, constants, requestCanceller) {
        var advertiser = null,
            brand = null,
            client = null,
            advertiserMode,
            counter = 0,
            permission = '',
            role_template_id = {
                Super_Admin: constants.super_admin,
                Account_Admin: constants.account_admin,
                Advertiser_Admin: constants.advertiser_admin,
                Generic_User: constants.generic_user
            };

        return {
            getAllCurrency: function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/currencies');
            },

            createBillableAccount: function (data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/billable_accounts',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            createAgencies: function (data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/agencies',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getCountries: function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/countries');
            },

            getAllAdvertisers: function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers', {cache: false});
            },

            getAgencies: function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/agencies', {cache: false});
            },

            getAllBrands: function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands', {cache: false});
            },

            getClients: function (success, failure, flag) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients?access_level=admin&pageSize=200&pageNo=1',
                    canceller;
                console.log('getClients(), url = ', url)

                if (flag === 'cancellable') {
                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                } else {
                    return dataService.fetch(url, {cache: false});
                }
            },

            getSubClients: function (clientId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/descendants?level=immediate',
                    {cache: false}
                );
            },

            getClientsAdvertisers: function (clientId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers',
                    {cache: false}
                );
            },

            getAdvertisersBrand: function (clientId, advertiserId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/brands',
                    {cache: false}
                );
            },

            getAdvertiserBrandDetials: function (clientId, advertiserId, brandId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/brands/' + brandId,
                    {cache: false}
                );
            },

            updateAdvertiser: function (id, data) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers/' + id,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            createAdvertiser: function (data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getAdvertiserDetails: function (clientId, id) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers/' + id,
                    {'Content-Type': 'application/json'}
                );
            },

            createAdvertiserUnderClient: function (clientId, advertiserId, data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            updateAdvertiserUnderClient: function (clientId, advertiserId, data) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId,
                    data,
                    {'Content-Type': 'application/json'});
            },

            getAdvertiserUnderClient: function (clientId, advertiserId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId,
                    {cache: false}
                );
            },

            createPixelsUnderAdvertiser: function (clientId, advertiserId, data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/pixels',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getPixelsUnderAdvertiser: function (clientId, advertiserId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/pixels',
                    {cache: false}
                );
            },

            createBrand: function (data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getBrandDetails: function (clientId, advertiserId, brandId) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/brands/' + brandId,
                    {'Content-Type': 'application/json'}
                );
            },

            createBrandUnderAdvertiser: function (clientId, advertiserId, brandId) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/brands/' + brandId,
                    {},
                    {'Content-Type': 'application/json'}
                );
            },

            updateBrand: function (brandId, data) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands/' + brandId,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            updateClient: function (data, id) {
                console.log('updateClient(), url = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + id, ', data = ', data)
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + id,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            createClient: function (data) {
                console.log('updateClient(), url = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/', ', data = ', data)
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getClient: function (clientId) {
                return dataService.fetch
                (vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId,
                    {cache: false}
                );
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
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/users', {cache: false});
            },

            getUsersDetails: function (id) {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/users/' + id, {cache: false});
            },

            getUserClients: function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients');
            },

            getUserAdvertiser: function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/advertisers');
            },

            getUserBrands: function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/brands');
            },

            getUserPages: function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/features');
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
                return (_.invert(role_template_id))[roleId];
            },

            createUser: function (userObj) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/users',
                    userObj,
                    {'Content-Type': 'application/json'}
                );
            },

            updateUser: function (data) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/users/' + data.id,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            setPermissions: function (permissionObj) {
                permission = permissionObj;
            },

            getAdChoiceDataFromClient: function (clientId) {
console.log('getAdChoiceDataFromClient(), URL = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/ad_choices');
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/ad_choices',
                    {cache: false}
                );
            },

            saveAdChoiceDataForClient: function (clientId, data) {
console.log('saveAdChoiceDataForClient(), URL = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/ad_choices')
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/ad_choices',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getIABCategoryList: function () {
console.log('getIABCategoryList(), URL = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/iab_category_groups')
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/iab_category_groups',
                    {cache: false}
                );
            },

            getIABSubCategoryList: function (groupId) {
console.log('getIABSubCategoryList(), URL = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/iab_categories?group_id=' + groupId)
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/iab_categories?group_id=' + groupId,
                    {cache: false}
                );
            },

            getIABCategoryForClient: function (clientId) {
console.log('getIABCategoryForClient(), URL = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/iab_categories')
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/iab_categories',
                    {cache: false}
                );
            },

            saveIABCategoryForClient: function (clientId, data) {
console.log('saveIABCategoryForClient(), URL = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/iab_categories')
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/iab_categories',
                    data, {'Content-Type': 'application/json'}
                );
            },

            getIABCategoryForAdv: function (clientId, advId) {
console.log('getIABCategoryForAdv(), URL = ',  vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers/' + advId + '/iab_categories')
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advId +
                        '/iab_categories',
                    {cache: false}
                );
            },

            saveIABCategoryForAdv: function (clientId, advId, data) {
console.log('saveIABCategoryForAdv(), URL = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers/' + advId + '/iab_categories')
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advId +
                        '/iab_categories',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getAdChoiceDataFromAdv: function (clientId, advId) {
console.log('getAdChoiceDataFromAdv(), URL = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/ad_choices?advertiser_id=' + advId)
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/ad_choices?advertiser_id=' + advId,
                    {cache: false}
                );
            },

            saveAdChoiceDataForAdv: function (clientId, advId, data) {
console.log('saveAdChoiceDataForAdv(), URL = ', vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/ad_choices?advertiser_id=' + advId)
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/ad_choices?advertiser_id=' + advId,
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            downloadAdminAdvPixel: function (clientId, advId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advId +
                        '/pixels_download',
                    {cache: false}
                );
            }
        };
    });
});
