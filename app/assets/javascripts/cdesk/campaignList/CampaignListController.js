(function() {
  'use strict';

  campaignListModule.controller('campaignListController', function($scope, campaignListModel, utils, $location, _, constants, brandsModel, dataTransferService) {
    //Hot fix to show the campaign tab selected
    $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
    $scope.campaigns = new campaignListModel();
    $scope.$on(constants.EVENT_BRAND_CHANGED, function(event) {
      $scope.campaigns.filterByBrand(brandsModel.getSelectedBrand());
    });
    $scope.campaigns.fetchDashboardData();

    $scope.$on("fromCampaignDetails", function(event, args) {
      $scope.loadMoreStrategies(args.campaignId);
    });

    $scope.viewReports = function(campaign) {
      console.log(campaign);
       var param = {
                selectedCampaign :campaign,
                selectedStrategy : null,
                navigationFromReports : false
            };

      //dataTransferService.initOptimizationData(param);
      dataTransferService.initReportingData(param);
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