(function () {
  "use strict";
  var CampaignModel = function () {
    //following variables are returned by API
    this.id = -1;
    this.name = '';
    this.status = 'draft';
    this.start_date = '';
    this.end_date = '';
    this.kpi_type = '';
    this.kpi_value = '';
    this.total_impressions = '';
    this.total_media_cost = 0;
    this.expected_media_cost = '';
    this.brand_name = '';
    this.lineitems_count = '';
    this.actions_count = '';
    this.kpi_status = -1;

    //following variables are used by campaignListModel
    this.setVariables = function() {
      this.orderId = this.id;
      this.startDate = this.start_date;
      this.endDate = this.end_date;
      this.fromSuffix = ''
      this.toSuffix = ''
      this.campaignTitle = this.name;
      this.brandName = this.brand_name;
      this.statusIcon = this.status;
      this.kpiType = this.kpi_type;
      this.kpiValue = this.kpi_value;
      this.totalImpressions = this.total_impressions;
      this.totalMediaCost = this.total_media_cost;
      this.expectedMediaCost = this.expected_media_cost;
      this.lineitemsCount = this.lineitems_count;
      this.actionsCount = this.actions_count;
      this.campaignStrategies = null;
      this.tacticMetrics = [];
      this.chart = true;
      this.campaignStrategiesLoadMore = null;
    }

    //following are redundant variables and should be removed from single campaign object as they are properties of campaign list.
    this.periodStartDate = '';
    this.periodEndDate = '';
    this.constructor = function() {
      return this;
    }
  }
  commonModule.value('campaignModel',CampaignModel);
}());