define(['angularAMD', 'common/services/constants_service', 'reporting/dashboard/dashboard_model',
    'reporting/brands/brands_model', 'reporting/advertiser/advertiser_model',
    'reporting/campaignSelect/campaign_select_model','login/login_model',
    'reporting/common/d3/bubble_chart_directive','reporting/common/d3/gauge_directive',
    'common/services/sub_account_service', 'common/services/vistoconfig_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('DashboardController', function ($scope, $rootScope, $routeParams, $location, constants,
                                                           dashboardModel, brandsModel, advertiserModel,
                                                           campaignSelectModel, loginModel, subAccountService,
                                                           vistoconfig) {

        var updateTitle = function () {
                dashboardModel.setTitle();
            };

        $('.main_navigation_holder').find('.active_tab').removeClass('active_tab');

        $('.main_navigation')
            .find('.active')
            .removeClass('active')
            .end()
            .find('#dashboard_nav_link')
            .addClass('active');

        $scope.data = dashboardModel.getData();
        $scope.textConstants = constants;


        $scope.removeBrandButton = function () {
            var url = '/a/' + $routeParams.accountId;

            if ($routeParams.subAccountId) {
                url += '/sa/' + $routeParams.subAccountId;
            }

            ($routeParams.advertiserId > 0) && (url += '/adv/' + $routeParams.advertiserId);
            url += '/dashboard';
            console.log('url', url);
            $location.url(url);

        };

        $scope.statusDropdown = function (status, eventType) {
            var obj = {
                status: status,
                event_type: eventType
            };

            dashboardModel.getData().selectedStatus = status;
            localStorage.setItem('dashboardStatusFilter', JSON.stringify(dashboardModel.getData().selectedStatus));
            $rootScope.$broadcast(constants.EVENT_STATUS_FILTER_CHANGED, obj);
        };

        if (subAccountService.getSelectedDashboardSubAccount()) {
            updateTitle();
        }

        $rootScope.$on(constants.EVENT_ADVERTISER_CHANGED, function () {
            dashboardModel.setSelectedBrand(vistoconfig.getSelectedBrandId());
            dashboardModel.setSelectedAdvertiser(vistoconfig.getSelectAdvertiserId());
            updateTitle();
        });

        $scope.hide_bubble_tooltip = function() {
            $('.bubble_tooltip').hide();
        };
    });
});
