define(['angularAMD'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('sellersService', ['vistoconfig', 'dataService', 'constants', 'workflowService',
            'loginModel', function (vistoconfig, dataService, constants, workflowService,
                                    loginModel) {
                var fetchAllSellers =  function(pageNo) {
                    // var clientId = vistoconfig.getSelectedAccountId(),
                    //     url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/vendors/'+ +'/';
                    // /api/workflow/v3/clients/:clientId/vendors/:vendorId/seats/:seatId/sellers

                    return dataService.fetch(url);
                };

                return {
                    fetchAllSellers: fetchAllSellers
                };
            }]);
    }
);
