define(['angularAMD','common/services/constants_service','reporting/dashboard/dashboard_model','reporting/brands/brands_model','reporting/campaignSelect/campaign_select_model','login/login_model','reporting/common/d3/bubble_chart_directive','reporting/common/d3/gauge_directive'],function (angularAMD) {
  'use strict';
  angularAMD.controller('DashboardController', function ($scope, $rootScope, constants, dashboardModel, brandsModel, campaignSelectModel ,loginModel) {

        $(".main_navigation_holder").find('.active_tab').removeClass('active_tab') ;
        $(".main_navigation").find('.active').removeClass('active').end().find('#dashboard_nav_link').addClass('active');
        $scope.data = dashboardModel.getData();
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.brandSelectedFromBubble = false;
        $scope.textConstants = constants;

        var updateTitle = function () {
            dashboardModel.setTitle();
        }

        var selectBrand = function (brand, event_type) {
            var obj = {"brand": brand, "event_type": event_type}
            $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD, obj);
        };

        var selectAdvertiser = function (advertiser, event_type) {
            var obj = {"advertiser": advertiser, "event_type": event_type}
            $rootScope.$broadcast(constants.EVENT_ADVERTISER_CHANGED_FROM_DASHBOARD, obj);
        };

        $scope.clickOnBrandButton = function (e) {
            analytics.track(loginModel.getUserRole(), 'dashboard_bubble_widget', 'close_campaign_view', loginModel.getLoginName());
            // if brand selected from bubble then on close reset advertiser and brand to all else retain advertiser
            if ($scope.brandSelectedFromBubble) {
                selectAdvertiser(advertiserModel.getAdvertiser().allAdvertiserObject, 'clicked');
            } else {
                selectBrand(brandsModel.getAllBrand(), 'clicked');
            }
            $scope.brandSelectedFromBubble = false;
        };

        $scope.statusDropdown = function (status, event_type) {
            dashboardModel.getData().selectedStatus = status;
            localStorage.setItem('dashboardStatusFilter', JSON.stringify(dashboardModel.getData().selectedStatus));
            var obj = {'status': status, 'event_type': event_type};
            $rootScope.$broadcast(constants.EVENT_STATUS_FILTER_CHANGED, obj);
        };

        var bubbleBrandClickedFunc = $rootScope.$on(constants.BUBBLE_BRAND_CLICKED, function (event, args) {
            $scope.brandSelectedFromBubble = true;
            var brand = {id: args.brandId, name: args.className};
            selectAdvertiser({"id": args.advertiserId, "name": args.advertiserName, "referedFrom": 'dashboard'});
            selectBrand(brand, 'clicked');
        });

        //if selected All Brands
        if (brandsModel.getSelectedBrand().id == -1) {
            dashboardModel.setSelectedBrand(brandsModel.getAllBrand());
        } else {
            dashboardModel.setSelectedBrand(brandsModel.getSelectedBrand());
        }
        updateTitle();

        var eventBrandChangedFunc = $rootScope.$on(constants.EVENT_BRAND_CHANGED, function () {
            dashboardModel.setSelectedBrand(brandsModel.getSelectedBrand());
            updateTitle();
        });

        var statusChangedFunc = $rootScope.$on(constants.EVENT_STATUS_FILTER_CHANGED, function () {
            dashboardModel.setSelectedBrand(brandsModel.getSelectedBrand());
            updateTitle();
        });

        $scope.$on('$destroy', function () {
            bubbleBrandClickedFunc();
            eventBrandChangedFunc();
            statusChangedFunc();
        });
    })
});
