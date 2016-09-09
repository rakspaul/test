define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.factory('filterService', ['workflowService', function (workflowService) {
        var subAccountData = {},

            getSubAccount = function (callbackFunction) {
                workflowService
                    .getSubAccounts()
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            subAccountData.list = result.data.data;
                            callbackFunction(subAccountData.list);
                        }
                    });
            },

            fetchAdvertisers = function (clientId, callbackFunction) {
                workflowService
                    .getAdvertisers(clientId, 'read')
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            callbackFunction(result.data.data);
                        }
                    });
            };

        subAccountData.list = [];
        subAccountData.selectedAccount = '';

        return {
            getSubAccount: getSubAccount,
            fetchAdvertisers: fetchAdvertisers
        };
    }]);
});

