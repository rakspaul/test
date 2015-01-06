(function() {
  var urlFactory = function (apiPaths, constants) {
    //Convention is to start all api urls with API.
    this.APIlastViewedAction = function (campaignId, user_id) {
      var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaignId + '/viewedActions?user_id=' + user_id;
      return url;
    };
    this.APIeditAction = function (actionId, user_id) {
      var url = apiPaths.apiSerivicesUrl + '/actions/' + actionId + '?user_id=' + user_id;
      return url;
    };
    this.APICampaignList = function (user_id, date_filter, page, sort_column, sort_direction, conditions) {
      var url = apiPaths.apiSerivicesUrl + '/campaigns/bystate?user_id=' + user_id + '&date_filter=' + date_filter + '&page=' + page +
        '&callback=JSON_CALLBACK&sort_column=' + sort_column + '&sort_direction=' + sort_direction + '&conditions=' + conditions;
      return url;
    }
    this.APIDefaultCampaignList = function (user_id) {
      return this.APICampaignList(user_id, constants.PERIOD_LIFE_TIME, 1, 'start_date', constants.SORT_DESC, constants.ACTIVE_UNDERPERFORMING);
    }

  }

  commonModule.service("urlService", ['apiPaths', 'constants', urlFactory]);

}());