define(['angularAMD','common/services/url_service','reporting/timePeriod/time_period_model','common/services/data_service','reporting/brands/brands_model','reporting/dashboard/dashboard_model','common/services/request_cancel_service','common/services/constants_service','login/login_model','reporting/advertiser/advertiser_model', 'reporting/subAccount/sub_account_model'],function (angularAMD) {
  'use strict';
  angularAMD.service('bubbleChartModel', ['urlService', 'timePeriodModel', 'dataService', 'brandsModel', 'dashboardModel', 'requestCanceller', 'constants', 'loginModel','advertiserModel','subAccountModel', function (urlService, timePeriodModel, dataService, brandsModel, dashboardModel, requestCanceller, constants, loginModel,advertiserModel,subAccountModel) {

    var bubbleWidgetData = {
      brandData: {},
      dataNotAvailable: true,
      budget_top_title: {},
      campaignDataForSelectedBrand: {},
      campaignDataForAllBrands: {}
    };

    this.getBubbleChartData = function () {
        var isDashboardSubAccount = subAccountModel.isDashboardSubAccount();
      var queryObj = {
        "clientId": isDashboardSubAccount?loginModel.getDashboardClient().id:loginModel.getSelectedClient().id,
        "advertiserId": advertiserModel.getSelectedAdvertiser().id,
        "brandId": brandsModel.getSelectedBrand().id,
        "dateFilter": constants.PERIOD_LIFE_TIME,
        "campaignStatus": dashboardModel.campaignStatusToSend()
      };
      var url = urlService.APISpendWidgetForAllBrands(queryObj);
        console.log('bubble chart on dashboard: ',url);
      //var canceller = requestCanceller.initCanceller(constants.SPEND_CHART_CANCELLER);
      return dataService.fetch(url).then(function (response) {
        if (response.data && response.data.data.length > 0) {
          var total_brands = response.data.data.length;
          var data = _.chain(response.data.data).sortBy(function (d) {
            return d.budget;
          }).reverse().slice(0, 5).value();

          if (data.length > 0) {
            bubbleWidgetData['dataNotAvailable'] = false;
            bubbleWidgetData['brandData'] = data;
            bubbleWidgetData['budget_top_title'] = (total_brands >= 5) ? "(Top 5 brands)" : "(All Brands)";
          } else {
            bubbleWidgetData['dataNotAvailable'] = true;
          }
        } else {
          bubbleWidgetData['dataNotAvailable'] = true;
        }
        return bubbleWidgetData['brandData'];
      })
    };

    // getBubbleChartDataForCampaign
    this.getBubbleChartDataForCampaign = function (selectedBrand) {
      var clientId = loginModel.getSelectedClient().id;
      var advertiserId = advertiserModel.getSelectedAdvertiser().id;
      var isDashboardSubAccount = subAccountModel.isDashboardSubAccount();

      var queryObj = {
        "clientId": isDashboardSubAccount?loginModel.dashboardClient().id:loginModel.getSelectedClient().id,
        "advertiserId": advertiserModel.getSelectedAdvertiser().id,
        "brandId": ((selectedBrand == undefined) ? -1 : selectedBrand),
        "dateFilter": constants.PERIOD_LIFE_TIME,
        "campaignStatus": dashboardModel.campaignStatusToSend()
      };
      //  var url = urlService.APISpendWidgetForCampaigns(clientId, advertiserId, selectedBrand, timePeriodModel.timeData.selectedTimePeriod.key, dashboardModel.getData().selectedStatus);
      var url = urlService.APISpendWidgetForCampaigns(queryObj);
        console.log('bubble chart on dashboard: ',url);
      var canceller = requestCanceller.initCanceller(constants.BUBBLE_CHART_CAMPAIGN_CANCELLER);
      return dataService.fetchCancelable(url, canceller, function (response) {

        var campaigns = (response.data.data !== undefined) ? response.data.data.campaigns : {};
        var campaignLength = (campaigns !== undefined) ? campaigns.length : 0;

        if (campaigns != undefined) {
          bubbleWidgetData['dataNotAvailable'] = false;
          bubbleWidgetData['campaignDataForSelectedBrand'] = campaigns;
          bubbleWidgetData['budget_top_title'] = (campaignLength >= 5) ? "(Top 5 Media Plans)" : "(All Media Plans)";

          var allCampaignsHaveZeroBudget = true;
          for (var i in campaigns) {
            if (campaigns[i].budget > 0)
              allCampaignsHaveZeroBudget = false;
          }
          bubbleWidgetData['dataNotAvailable'] = allCampaignsHaveZeroBudget;

        } else {
          bubbleWidgetData['dataNotAvailable'] = true;
        }
        return campaigns;
      })
    };

    // So that user can fire paraller request to fetch campaigns of a brands.
    this.getBubbleChartDataForCampaignWithOutCanceller = function (selectedBrand) {
        var isDashboardSubAccount = subAccountModel.isDashboardSubAccount();
      if(loginModel.getSelectedClient()) {
          var queryObj = {
              "clientId": isDashboardSubAccount?loginModel.dashboardClient().id:loginModel.getSelectedClient().id,
              "advertiserId": advertiserModel.getSelectedAdvertiser().id,
              "brandId": ((selectedBrand == undefined) ? -1 : selectedBrand),
              "dateFilter": constants.PERIOD_LIFE_TIME,
              "campaignStatus": dashboardModel.campaignStatusToSend()
          };
          var url = urlService.APISpendWidgetForCampaigns(queryObj);
          console.log('dashboard bubblechart model url: ',url);
          return dataService.fetch(url).then(function (response) {
              if (response) {
                  var campaigns = (response.data.data !== undefined) ? response.data.data.campaigns : {};
                  var campaignLength = (campaigns !== undefined) ? campaigns.length : 0;

                  if (campaigns != undefined) {
                      bubbleWidgetData['dataNotAvailable'] = false;
                      bubbleWidgetData['campaignDataForSelectedBrand'] = campaigns;
                      bubbleWidgetData['budget_top_title'] = (campaignLength >= 5) ? "(Top 5 Media Plans)" : "(All Media Plans)";

                  } else {
                      bubbleWidgetData['dataNotAvailable'] = true;
                  }
              }
              return campaigns;
          })
      }
    };


    this.getbubbleWidgetData = function () {
      return bubbleWidgetData;
    };
  }]);
});
