define(['angularAMD', 'dashboard-model', 'campaign-select-model', 'bubble-chart-directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('DashboardController', ['$scope', '$rootScope', '$routeParams', '$location', 'constants', 'dashboardModel', 'brandsModel', 'advertiserModel',
        'campaignSelectModel', 'loginModel', 'subAccountService', 'vistoconfig', 'pageLoad','localStorageService', function ($scope, $rootScope, $routeParams, $location,
         constants, dashboardModel, brandsModel, advertiserModel, campaignSelectModel, loginModel, subAccountService, vistoconfig, pageLoad,localStorageService) {

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
            $scope.data.toolTipText = 'Loading...'
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
                    $scope.data.toolTipText = 'Loading...'

                };

            $scope.hide_bubble_tooltip = function() {
                $('.bubble_tooltip').hide();
            };

            $scope.removeAdvertiserButton = function () {
                var url = '/a/' + $routeParams.accountId;
                var isdashboardSubaccountSelected = localStorageService.isDashboardSubAccountSelected.get();

                /* if subaccount is selected from the dropdown and when advertiser is slected, on closing advertiser button, it should show the subaccount selected and if
                only advertiser is selected then respective subaccount will be shown in the dropdown but when the advertiser button is closed the subaccount in the dropdown should
                be the default 'All-subaccounts'
                */
                if ($routeParams.subAccountId && isdashboardSubaccountSelected) {
                    url += '/sa/' + $routeParams.subAccountId;
                } else if($routeParams.subAccountId) {
                    url += '/sa/' + vistoconfig.getMasterClientId();
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

            $rootScope.$on(constants.SUBACCOUNT_CHANGED,function(event,subaccount){
                if(subaccount.id === vistoconfig.getMasterClientId()) {
                    localStorageService.isDashboardSubAccountSelected.set(false);
                } else {
                    localStorageService.isDashboardSubAccountSelected.set(true);
                }
            });

        }
    ]);
});
