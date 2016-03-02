define(['angularAMD','../../common/services/constants_service', 'workflow/services/workflow_service'],function (angularAMD) {
  'use strict';
  angularAMD.service("advertiserService", function ($rootScope, $http, constants, workflowService) {
    //default values
    var service = {};
    service.fetchAdvertisers = function (searchCriteria) {
      var clientId = searchCriteria.clientId;
      return workflowService.getAdvertisers('read');
    };

    service.preForAdvertiserBroadcast = function (advertiser, event_type) {
      var obj = {'advertiser': advertiser, 'event_type': event_type};
      $rootScope.$broadcast(constants.EVENT_ADVERTISER_CHANGED, obj);
    };

    return service;
  });
});

