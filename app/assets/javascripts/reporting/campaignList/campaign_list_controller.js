(function() {
  'use strict';

  campaignListModule.controller('CampaignListController', function($scope,  $rootScope, kpiSelectModel ,  campaignListModel, campaignSelectModel, strategySelectModel, utils, $location, _, constants, brandsModel, loginModel, analytics, gaugeModel, RoleBasedService) {
    //Hot fix to show the campaign tab selected
    $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
    $scope.campaigns = new campaignListModel();

    $scope.sortReverse = false;

    $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;

    $scope.textConstants = constants;

    $scope.isWorkFlowUser = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;
    
    $scope.$on(constants.EVENT_BRAND_CHANGED, function(event) {
      $scope.campaigns.filterByBrand(brandsModel.getSelectedBrand());
        //$scope.campaigns.fetchData();
    });

    var selectedBrand = brandsModel.getSelectedBrand();
    $scope.isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();

      var accountChanged = $rootScope.$on(constants.ACCOUNT_CHANGED, function () {
          	$scope.campaigns.fetchData();
      });

      $rootScope.$on(constants.EVENT_ADVERTISER_CHANGED,function(){
          $scope.campaigns.fetchData();
      })

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

    //braodcasting from campaignListModel.js
    $scope.$on("updateCampaignAsBrandChange", function(event, campaignData) {
        campaignSelectModel.setSelectedCampaign(campaignData);
    });

      $scope.viewReports = function(campaign) {
        var selectedCampaign = {
            id : campaign.id,
            name : campaign.name,
            startDate : campaign.startDate,
            endDate : campaign.endDate,
            kpi : campaign.kpiType
        };
        campaignSelectModel.setSelectedCampaign(selectedCampaign);
        kpiSelectModel.setSelectedKpi(selectedCampaign.kpi);
        strategySelectModel.setSelectedStrategy(constants.ALL_STRATEGIES_OBJECT);

        $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
        $location.path('/performance');
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
     $(function() {
        $( "#cost_block,#performance_block" ).scroll(function(){
             var window_scrollTop = $(window).scrollTop();
/*             var scroll_to_element= $(".squaredFour").offset().top -15;
             if(scroll_to_element < window_scrollTop){
                window.scrollTo(0,scroll_to_element);
             }*/
             if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
                  var test_height = parseInt($(this).height())+1;
                  $(this).height(test_height);
              }
        });
     });

  });

}());