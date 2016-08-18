define(['angularAMD','common/services/constants_service', 'workflow/services/workflow_service' , 'login/login_model',
        'common/services/vistoconfig_service'], function (angularAMD) {
        'use strict';

        angularAMD.factory('vendorsService', function (dataService, constants, workflowService,
                                                       loginModel, vistoconfig) {
            var clientId,
                url,

                fetchVendors = function () {
                    clientId =  vistoconfig.getMasterClientId;
                    url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/clientVendorConfigs';

                    return dataService.fetch(url, {cache: false});
                };

            return {
                fetchVendors : fetchVendors
            };
        });
    }
);
