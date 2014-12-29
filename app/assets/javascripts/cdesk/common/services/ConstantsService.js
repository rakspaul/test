(function() {
  var constants = function () {
    this.CAMPAIGN_LIST_CANCELLER = 1;
    this.COST_CANCELLER = 2;
    this.DASHBOARD_CANCELLER = 3;
    this.PERIOD_LIFE_TIME = 'life_time';
    this.PERIOD_LAST_7_DAYS = 'last_7_days';
    this.PERIOD_LAST_30_DAYS = 'last_30_days';
  }

  commonModule.service("constants", constants);

}());