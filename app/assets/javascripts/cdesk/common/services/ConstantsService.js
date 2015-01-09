(function() {
  var constants = function () {
    this.CAMPAIGN_LIST_CANCELLER = 1;
    this.COST_CANCELLER = 2;
    this.DASHBOARD_CANCELLER = 3;
    this.PERIOD_LIFE_TIME = 'life_time';
    this.PERIOD_LAST_7_DAYS = 'last_7_days';
    this.PERIOD_LAST_30_DAYS = 'last_30_days';
    this.SORT_DESC = 'desc';
    this.ACTIVE_UNDERPERFORMING = '(active,underperforming)';
    this.ALL_BRANDS = 'All Brands';
    this.EVENT_BRAND_CHANGED = "brandChanged";
    this.EVENT_TIMEPERIOD_CHANGED = "timePeriodChanged";
    this.GA_DASHBOARD = 'dashboard-widget';
    this.GA_CLICK = 'click';
    this.GA_EVENT = 'event';
    this.GA_SEND = 'send';
  }

  commonModule.service("constants", constants);

}());