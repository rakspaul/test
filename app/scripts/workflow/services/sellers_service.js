define(['angularAMD'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('sellersService', ['vistoconfig', 'dataService', 'constants', 'workflowService',
            'loginModel', function (vistoconfig, dataService, constants, workflowService,
                                    loginModel) {
                var fetchAllSellers =  function(pageNo,platformId,platformSeatsId,searchText) {
                    var clientId = vistoconfig.getSelectedAccountId(),
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/vendors/'+ platformId +'/seats/'+
                            platformSeatsId +'/sellers?pageNo='+pageNo;

                    if(searchText) {
                        url += '&search='+searchText;
                    }


                    return dataService.fetch(url);
                };

                return {
                    fetchAllSellers: fetchAllSellers
                };
            }]);
    }
);
