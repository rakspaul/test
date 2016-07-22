define(['angularAMD','common/services/constants_service', 'workflow/services/workflow_service' , 'login/login_model'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('vendorsService', function (vistoconfig, dataService, constants, workflowService,
                                                        loginModel) {

                
            var clientId,
                url,
                fetchVendors = function () {
                clientId =  loginModel.getSelectedClient().id,
                url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/clientVendorConfigs';

                return dataService.fetch(url, {cache: false});
            };

               

            return {

                fetchVendors : fetchVendors

            };
        });
    }
);
