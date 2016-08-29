define(['angularAMD', 'dashboard-model', 'campaign-select-model', 'bubble-chart-directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('DashboardController', ['$scope', '$rootScope', '$routeParams', '$location', 'constants',
        'dashboardModel', 'brandsModel', 'advertiserModel', 'campaignSelectModel', 'loginModel', 'subAccountService',
        'vistoconfig', 'workflowService', function ($scope, $rootScope, $routeParams, $location, constants,
                                                           dashboardModel, brandsModel, advertiserModel,
                                                           campaignSelectModel, loginModel, subAccountService,
                                                           vistoconfig, workflowService) {

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
        $scope.data.advertiserSelected = false;
        $scope.textConstants = constants;

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




        $scope.removeAdvertiserButton = function () {
            var url = '/a/' + $routeParams.accountId;

            if ($routeParams.subAccountId) {
                url += '/sa/' + $routeParams.subAccountId;
            }

//            ($routeParams.advertiserId > 0) && (url += '/adv/' + $routeParams.advertiserId);
            url += '/dashboard';
            console.log('url', url);
            $location.url(url);

        };

    }]);
});
