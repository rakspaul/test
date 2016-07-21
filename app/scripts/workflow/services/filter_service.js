define(['angularAMD','workflow/services/workflow_service'], function (angularAMD) {
    'use strict';

    angularAMD.factory('filterService', function (workflowService) {
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
                    .getAdvertisers('read', clientId)
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
    });
});

