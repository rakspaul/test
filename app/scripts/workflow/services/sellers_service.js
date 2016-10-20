define(['angularAMD'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('sellersService', ['vistoconfig', 'dataService', function (vistoconfig, dataService) {
                var fetchAllSellers =  function(params) {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + params.clientId + '/vendors/'+ params.platformId +'/seats/'+
                        params.platformSeatId +'/sellers?pageNo=' + params.pageNo + '&pageSize=10';

                    if(params.search) {
                        url += '&search='+ params.search;
                    }

                    return dataService.fetch(url);
                };

                return {
                    fetchAllSellers: fetchAllSellers
                };
            }]);
    }
);
