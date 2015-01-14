(function() {
  var urlFactory = function (apiPaths, constants) {
    //Convention is to start all api urls with API.
    this.APIlastViewedAction = function (campaignId) {
      var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaignId + '/viewedActions';
      return url;
    };
    this.APIeditAction = function (actionId) {
      var url = apiPaths.apiSerivicesUrl + '/actions/' + actionId ;
      return url;
    };

    this.APIloginAction = function () {
      var url = apiPaths.apiSerivicesUrl + '/login';
      return url;
    };

    this.APIuserInfo = function () {
      var url = apiPaths.apiSerivicesUrl + '/userinfo';
      return url;
    };

    
    //TODO: need to remove user_id - @Gaurav/ @Richa needs to verify where this is used
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