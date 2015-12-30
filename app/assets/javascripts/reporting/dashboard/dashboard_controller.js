(function () {
    "use strict";
    dashboardModule.controller('DashboardController', function ($scope, $rootScope, constants, dashboardModel, advertiserModel, brandsModel, campaignSelectModel, loginModel, analytics) {
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

        var selectAdvertiser = function (advertiser) {
            $rootScope.$broadcast(constants.EVENT_ADVERTISER_CHANGED_FROM_DASHBOARD, advertiser);
        };

        $scope.clickOnBrandButton = function (e) {
            analytics.track(loginModel.getUserRole(), 'dashboard_bubble_widget', 'close_campaign_view', loginModel.getLoginName());
            // if brand selected from bubble then on close reset advertiser and brand to all else retain advertiser
            if ($scope.brandSelectedFromBubble) {
                selectAdvertiser(advertiserModel.getAdvertiser().allAdvertiserObject);
            } else {
                selectBrand(brandsModel.getAllBrand(), 'clicked');
            }
            $scope.brandSelectedFromBubble = false;
        };

        $scope.statusDropdown = function (status, event_type) {
            dashboardModel.getData().selectedStatus = constants['DASHBOARD_STATUS_' + status.toUpperCase()];
            localStorage.setItem('dashboardStatusFilter', JSON.stringify(dashboardModel.getData().selectedStatus));
            var obj = {'status': status, 'event_type': event_type};
            $rootScope.$broadcast(constants.EVENT_STATUS_FILTER_CHANGED, obj);

        };

        var bubbleBrandClickedFunc = $rootScope.$on(constants.BUBBLE_BRAND_CLICKED, function (event, args) {
            $scope.brandSelectedFromBubble = true;
            var brand = {id: args.brandId, name: args.className};
            selectAdvertiser({"id": args.advertiserId, "name": args.advertiserName, "referedFrom": 'dashboard'});
            selectBrand(brand);
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
}());