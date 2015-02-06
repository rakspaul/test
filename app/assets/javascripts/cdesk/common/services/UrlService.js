(function() {
  var urlFactory = function (apiPaths, constants) {
    //Convention is to start all api urls with API.
    this.APIlastViewedAction = function (campaignId) {
      var url = apiPaths.workflow_apiServicesUrl + '/campaigns/' + campaignId + '/viewedActions';
      return url;
    };
    this.APIeditAction = function (actionId) {
      var url = apiPaths.workflow_apiServicesUrl + '/actions/' + actionId ;
      return url;
    };

    this.APIloginAction = function () {
      var url = apiPaths.workflow_apiServicesUrl + '/login';
      return url;
    };

    this.APIlogoutAction = function () {
      var url = apiPaths.workflow_apiServicesUrl + '/logout';
      return url;
    };

    this.APIuserInfo = function () {
      var url = apiPaths.workflow_apiServicesUrl + '/userinfo';
      return url;
    };

    
    //TODO: need to remove user_id - @Gaurav/ @Richa needs to verify where this is used
    this.APICampaignList = function (user_id, date_filter, page, sort_column, sort_direction, conditions) {
      var url = apiPaths.apiSerivicesUrl + '/campaigns/bystate?user_id=' + user_id + '&date_filter=' + date_filter + '&page=' + page +
        '&callback=JSON_CALLBACK&sort_column=' + sort_column + '&sort_direction=' + sort_direction + '&conditions=' + conditions;
      return url;
    };

    this.APIDefaultCampaignList = function (user_id) {
      return this.APICampaignList(user_id, constants.PERIOD_LIFE_TIME, 1, 'start_date', constants.SORT_DESC, constants.ACTIVE_UNDERPERFORMING);
    };

    this.APICampaignCountsSummary = function(timePeriod, brandId) {
      var url = apiPaths.apiSerivicesUrl + '/campaigns/summary/counts?date_filter=' + timePeriod + ((brandId > -1) ? '&advertiser_filter=' + brandId : '');
        return url;
    }

    this.APISpendWidgetForAllBrands = function(timePeriod, brandId ){
        var url =  apiPaths.apiSerivicesUrl + '/brands/budgetAndSpends?date_filter='+ timePeriod+ '&topCount=5&advertiser_filter=' + brandId ;


       // http://dev-desk.collective-media.net/dataapi/brands/budgetAndSpends?start_date=2014-01-01&end-date=2015-03-30&topCount=5
      // var url =  '/assets/cdesk/tmp/sample.json' ;
       return url ;
    }

    this.APIActionData = function(campaignId) {
      return apiPaths.workflow_apiServicesUrl + "/campaigns/" + campaignId + "/actions"
    }

  }

  commonModule.service("urlService", ['apiPaths', 'constants', urlFactory]);

}());