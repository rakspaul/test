define(['angularAMD'], function(angularAMD) {
    'use strict';

    angularAMD.service('advertiserService', ['$location', '$rootScope', '$http', 'constants', 'workflowService',
        function($location, $rootScope, $http, constants, workflowService) {
        //default values
        var fetchAdvertisers = function() {
                return workflowService.getAdvertisers('read');
            },

            preForAdvertiserBroadcast = function(advertiser, event_type) {
                var obj = {
                    advertiser: advertiser,
                    event_type: event_type
                };

                $rootScope.$broadcast(constants.EVENT_ADVERTISER_CHANGED, obj);
            },

            isDashboardAdvertiser = function() {
                var locationPath = $location.url();

                if ((locationPath === '/dashboard') || (locationPath === '/')) {
                    return true;
                }
                return false;
            };

        return {
            fetchAdvertisers: fetchAdvertisers,
            preForAdvertiserBroadcast: preForAdvertiserBroadcast,
            isDashboardAdvertiser: isDashboardAdvertiser
        };
    }]);
});
