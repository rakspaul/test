(function() {
  'use strict';

  campaignListModule.controller('campaignListController', function($scope, campaignListModel, utils, $location, _) {
    //Hot fix to show the campaign tab selected
    $("ul.nav:first").find('.active').removeClass('active').end().find('li:first').addClass('active');
    $scope.campaigns = new campaignListModel();

    $scope.campaigns.fetchDashboardData();

    $scope.$on("fromCampaignDetails", function(event, args) {
      $scope.loadMoreStrategies(args.campaignId);
    });

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

    $scope.reloadGraphs = function() {
      $scope.campaigns.reloadGraphs();
    }
  });

}());