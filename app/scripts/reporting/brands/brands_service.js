define(['angularAMD'],
    function(angularAMD) {
    'use strict';

    angularAMD.service('brandsService', ['$rootScope', '$http', 'constants', 'workflowService', function($rootScope, $http, constants, workflowService) {
        //default values
        var fetchBrands = function(searchCriteria) {
            var clientId = searchCriteria.clientId,
                advertiserId = searchCriteria.advertiserId;

            return workflowService.getBrands(clientId, advertiserId, 'read');
        },

        preForBrandBroadcast = function(brand, advertiser, event_type) {
            var obj = {
                brand: brand,
                advertiser: advertiser,
                event_type: event_type
            };

            $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED, obj);
        };

        return {
            fetchBrands: fetchBrands,
            preForBrandBroadcast: preForBrandBroadcast
        };
    }]);
});
