define(['angularAMD', '../../common/services/constants_service', // jshint ignore:line
    'workflow/services/workflow_service'], function(angularAMD) {
    'use strict';

    angularAMD.service('brandsService', function($rootScope, $http, constants, workflowService) {
        //default values
        var service = {};

        service.fetchBrands = function(searchCriteria) {
            var clientId = searchCriteria.clientId,
                advertiserId = searchCriteria.advertiserId;

            return workflowService.getBrands(clientId, advertiserId, 'read');
        };

        service.preForBrandBroadcast = function(brand, advertiser, event_type) {
            var obj = {
                brand: brand,
                advertiser: advertiser,
                event_type: event_type
            };

            $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED, obj);
        };

        return service;
    });
});
