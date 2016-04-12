define(['angularAMD','workflow/services/workflow_service'], function (angularAMD) {
    'use strict';
    angularAMD.factory('filterService', function (workflowService) {
        var subAccountData = {};
        subAccountData.list = [];
        subAccountData.selectedAccount = "";

        var getSubAccount = function(callBackfunction) {
            workflowService.getSubAccounts().then(function (result) {
                if (result.status === 'OK' || result.status === 'success') {
                    subAccountData.list = result.data.data;
                    callBackfunction(subAccountData.list);

                }

            });
        }

        var fetchAdvertisers = function(clientId,callBackFunction) {
            workflowService.getAdvertisers('read',clientId).then(function (result) {
                if (result.status === 'OK' || result.status === 'success') {
                    callBackFunction(result.data.data);
                }
            })
        }
        return {
            'getSubAccount':getSubAccount,
            'fetchAdvertisers':fetchAdvertisers
        }
    });//factory
});//define

