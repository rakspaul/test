(function() {
  var urlFactory = function (apiPaths) {
    //Convention is to start all api urls with API.
    this.APIlastViewedAction = function(campaignId, user_id) {
      return apiPaths.apiSerivicesUrl + '/campaigns/' + campaignId + '/viewedActions?user_id=' + user_id;
    }
  }

  commonModule.service("urlService", ['apiPaths', urlFactory]);

}());