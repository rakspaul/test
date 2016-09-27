define(['angularAMD', 'dashboard-model', 'campaign-select-model', 'bubble-chart-directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('DashboardController', ['$scope', '$rootScope', '$routeParams', '$location', 'constants', 'dashboardModel', 'brandsModel', 'advertiserModel',
        'campaignSelectModel', 'loginModel', 'subAccountService', 'vistoconfig', 'pageLoad', function ($scope, $rootScope, $routeParams, $location, constants, dashboardModel,
                                                                                                       brandsModel, advertiserModel, campaignSelectModel, loginModel,
                                                                                                       subAccountService, vistoconfig, pageLoad) {
            $('.main_navigation_holder').find('.active_tab').removeClass('active_tab');

            $('.main_navigation')
                .find('.active')
                .removeClass('active')
                .end()
                .find('#dashboard_nav_link')
                .addClass('active');

            var localStoredCampaignStatus = localStorage.getItem('dashboardStatusFilter');

            dashboardModel.setSelectedStatus(localStoredCampaignStatus);
            $scope.data = dashboardModel.getData();
            $scope.data.advertiserSelected = false;
            $scope.textConstants = constants;

            $scope.statusDropdown = function (status, eventType) {
                    var obj = {
                        status: status,
                        event_type: eventType
                    };

                    dashboardModel.setSelectedStatus(status);
                    localStorage.setItem('dashboardStatusFilter', dashboardModel.getSelectedStatus());
                    $rootScope.$broadcast(constants.EVENT_STATUS_FILTER_CHANGED, obj);
                    $scope.data = dashboardModel.getData();
                };

            $scope.hide_bubble_tooltip = function() {
                $('.bubble_tooltip').hide();
            };

            $scope.removeAdvertiserButton = function () {
                var url = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {
                    url += '/sa/' + $routeParams.subAccountId;
                }

                url += '/dashboard';
                $location.url(url);
            };

            console.log('DASHBOARD controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();



            $rootScope.$on(constants.EVENT_ADVERTISER_CHANGED, function () {
                dashboardModel.setSelectedBrand(vistoconfig.getSelectedBrandId());
                dashboardModel.setSelectedAdvertiser(vistoconfig.getSelectAdvertiserId());
            });

        }
    ]);
});
