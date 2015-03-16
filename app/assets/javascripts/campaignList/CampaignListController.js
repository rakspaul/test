(function() {
  'use strict';

  campaignListModule.controller('campaignListController', function($scope,  $rootScope, campaignListModel, campaignSelectModel, strategySelectModel, utils, $location, _, constants, brandsModel, loginModel, analytics, gaugeModel) {
    //Hot fix to show the campaign tab selected
    $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
    $scope.campaigns = new campaignListModel();
    $scope.$on(constants.EVENT_BRAND_CHANGED, function(event) {
      $scope.campaigns.filterByBrand(brandsModel.getSelectedBrand());
    });
    //Based on gauge click, load the filter and reset data set after gauge click.
    var forceLoadCampaignsFilter;
    if(gaugeModel.dashboard.selectedFilter !== '') {
      forceLoadCampaignsFilter = gaugeModel.dashboard.selectedFilter;
    }
    $scope.campaigns.fetchDashboardData(forceLoadCampaignsFilter);
    gaugeModel.resetDashboardFilters();
    $scope.$on("fromCampaignDetails", function(event, args) {
      $scope.loadMoreStrategies(args.campaignId);
    });

    $scope.viewReports = function(campaign) {
        var selectedCampaign = {
            id : campaign.id,
            name : campaign.name,
            startDate : campaign.startDate,
            endDate : campaign.endDate
        };
        campaignSelectModel.setSelectedCampaign(selectedCampaign);
        $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
     // $rootScope.$broadcast(constants.NAVIGATION_FROM_CAMPAIGNS);
      document.location = '#/performance';
    };

    $scope.loadMoreStrategies = function(campaignId) {
      var pageSize = 3;
      var campaign = _.find($scope.campaigns.campaignList, function(c) {
        return c.orderId === parseInt(campaignId);
      });
      var loadMoreData = campaign.campaignStrategiesLoadMore;
      if (loadMoreData.length) {
        var moreData = loadMoreData.splice(0, pageSize);
        _.each(moreData, function(s) {
          campaign.campaignStrategies.push(s);
        });
      }
    };

    $scope.loadMoreTactics = function(strategyId, campaignId) {
      var pageSize = 3;
      var campaign = _.find($scope.campaigns.campaignList, function(c) {
        return c.orderId === parseInt(campaignId);
      });

      var strategy = _.find(campaign.campaignStrategies, function(s) {
        return s.id === parseInt(strategyId);
      });

      var loadMoreData = strategy.strategyTacticsLoadMore;
      if (loadMoreData.length) {
        var moreData = loadMoreData.splice(0, pageSize);
        _.each(moreData, function(t) {
          strategy.strategyTactics.push(s);
        });
      }
    };

    $scope.goToLocation = function(url) {
      utils.goToLocation(url);
    };

    $scope.highlightSearch = function(text, search) {
      return utils.highlightSearch(text, search);
    };

  });

}());