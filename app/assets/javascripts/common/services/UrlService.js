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

    this.APICampaignCountsSummary = function(timePeriod, brandId, status) {
      var url = apiPaths.apiSerivicesUrl + '/campaigns/summary/counts?date_filter=' + timePeriod  + '&campaignState='+ (status == undefined ? undefined : status.toLowerCase()) + ((brandId > -1) ? '&advertiser_filter=' + brandId : '');
        return url;
    };

    this.APISpendWidgetForAllBrands = function(timePeriod, agencyId, status ){
       var url = apiPaths.apiSerivicesUrl  + '/agencies/' + agencyId + '/brands/spend/perf?date_filter=' + timePeriod + '&campaignState='+ status.toLowerCase() ;
       return url ;
    };

      this.APISpendWidgetForCampaigns = function(timePeriod, agencyId , brandId , status ){
          var url = apiPaths.apiSerivicesUrl + '/agencies/'+ agencyId + '/brands/' + brandId +'/campaigns/spend/perf?date_filter=' + timePeriod + '&campaignState='+ status.toLowerCase() ;
          return url ;
      };

    this.APICalendarWidgetForBrand = function(timePeriod, agencyId, sortColumn, status ){
        var url =  apiPaths.apiSerivicesUrl + '/agencies/'+ agencyId +'/brands/campaigns/meta?topCount=5&sort_column='+ sortColumn +'&campaignState='+ status.toLowerCase() ;
       return url ;
    };

    this.APICalendarWidgetForAllBrands = function(timePeriod, agencyId, sortColumn, status, brandId){
        var url =  apiPaths.apiSerivicesUrl + '/agencies/' + agencyId + '/brands/' + brandId + '/campaigns/meta?topCount=5&sort_column=' + sortColumn + '&campaignState=' + status.toLowerCase() ;
       return url ;
    };

     this.APIScreenWidgetForBrand = function(timePeriod, agencyId , brandId, _screenWidgetFormatType, status){
         var param = (brandId !== -1) ? 'brands/' + brandId + '/' : '';
         param +=  (_screenWidgetFormatType === 'byplatforms' ? _screenWidgetFormatType : _screenWidgetFormatType +'/perf');
         return apiPaths.apiSerivicesUrl + '/agencies/'+ agencyId+ '/'+ param +'?campaignState='+ status.toLowerCase();
      };

    this.APIActionData = function(campaignId) {
      return apiPaths.workflow_apiServicesUrl + "/campaigns/" + campaignId + "/actions"
    };

      this.APICampaignDropDownList = function(brandId){
          var url =  apiPaths.apiSerivicesUrl + '/campaigns/meta?brand_id='+brandId ;
          return url ;
      };

      this.APIStrategiesForCampaign = function (campaingId) {
          var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaingId + '/strategies/meta';
          return url ;
      };



      this.APIStrategiesForCampaign = function (campaingId) {
          var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaingId + '/strategies/meta';
          return url ;
      };

      this.APIReportList = function(brandId,campaignId) {
          var url = apiPaths.apiSerivicesUrl +'/uploadedreports/listreports/'+campaignId+'/'+brandId;
          //console.log('UrlService url: ',url);
          return url;
      }

      this.APIUploadReport = function() {
          //http://dev-desk.collective-media.net/api/reporting/v2/uploadedreports/upload
          var url = apiPaths.apiSerivicesUrl +'/uploadedreports/upload';
          return url;
      }

      this.APIDeleteReport = function(reportId) {
          var url = apiPaths.apiSerivicesUrl +'/uploadedreports/' + reportId;
          return url;
      }

      this.APIEditReport = function(reportId) {
          var url = apiPaths.apiSerivicesUrl +'/uploadedreports/'+reportId;
          return url;
      }

      this.APIDownloadReport = function(reportId) {
          var url = apiPaths.apiSerivicesUrl+'/uploadedreports/download/'+reportId;
          return url;
      }

      this.scheduleReportsList = function() {
          return 'http://localhost:9000/assets/json/reportScheduleList.json';
      }



  }

  commonModule.service("urlService", ['apiPaths', 'constants', urlFactory]);

}());
