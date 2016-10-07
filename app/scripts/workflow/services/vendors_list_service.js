define(['angularAMD'], function (angularAMD) {
        'use strict';

        angularAMD.factory('vendorsService', ['dataService', 'vistoconfig', function (dataService, vistoconfig) {
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
        }]);
    }
);
