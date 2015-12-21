(function () {
  "use strict";
  dashboardModule.controller('DashboardController', function ($scope, $rootScope, constants, dashboardModel, advertiserModel, brandsModel, campaignSelectModel ,loginModel, analytics) {
    $(".main_navigation").find('.active').removeClass('active').end().find('#dashboard_nav_link').addClass('active');
    $scope.data = dashboardModel.getData();
    $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;

    $scope.textConstants = constants;

    var updateTitle = function() {
      dashboardModel.setTitle();
    }

    var selectBrand = function(brand) {
      $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD, brand);
    };

    var selectAdvertiser = function(advertiser) {
      $rootScope.$broadcast(constants.EVENT_ADVERTISER_CHANGED_FROM_DASHBOARD, advertiser);
    };

    $scope.clickOnBrandButton = function (e) {
      analytics.track(loginModel.getUserRole(), 'dashboard_bubble_widget', 'close_campaign_view', loginModel.getLoginName());
      selectAdvertiser(advertiserModel.getAdvertiser().allAdvertiserObject);
    };

    $scope.statusDropdown = function(status) {

        if(status.toLowerCase() == "active" )
            dashboardModel.getData().selectedStatus = constants.DASHBOARD_STATUS_ACTIVE;
        else if(status.toLowerCase() == "completed")
            dashboardModel.getData().selectedStatus = constants.DASHBOARD_STATUS_COMPLETED;
        else
            dashboardModel.getData().selectedStatus = constants.DASHBOARD_STATUS_ALL;

        localStorage.setItem('dashboardStatusFilter', JSON.stringify(dashboardModel.getData().selectedStatus));

        $rootScope.$broadcast(constants.EVENT_STATUS_FILTER_CHANGED, status);

    };
      


    var bubbleBrandClickedFunc = $rootScope.$on(constants.BUBBLE_BRAND_CLICKED, function (event, args) {
      var brand = {id: args.brandId, name: args.className};
      selectAdvertiser({"id":args.advertiserId,"name":args.advertiserName});
      selectBrand(brand);
    });

    //onload
    //if selected All Brands
    if(brandsModel.getSelectedBrand().id == -1) {
      dashboardModel.setSelectedBrand(brandsModel.getAllBrand());
    }else {
      dashboardModel.setSelectedBrand(brandsModel.getSelectedBrand());
    }
    updateTitle();

    var eventBrandChangedFunc = $rootScope.$on(constants.EVENT_BRAND_CHANGED , function() {
        //alert('im the listener');
      dashboardModel.setSelectedBrand(brandsModel.getSelectedBrand());
      updateTitle();
    });

    var statusChangedFunc = $rootScope.$on(constants.EVENT_STATUS_FILTER_CHANGED , function() {
        dashboardModel.setSelectedBrand(brandsModel.getSelectedBrand());
        updateTitle();
    });

    $scope.$on('$destroy', function() {
      bubbleBrandClickedFunc();
      eventBrandChangedFunc();
      statusChangedFunc();
    });
  })
}());