define(['angularAMD', 'common/services/constants_service',
    'common/services/vistoconfig_service', 'common/services/account_service',
    'common/services/sub_account_service', 'workflow/services/filter_service'], function (angularAMD) {
    'use strict';

    angularAMD.directive('filterDirective', function () {
        return {
            controller: function ($scope,$rootScope, workflowService, loginModel, constants, vistoconfig,
                                  accountService, subAccountService, filterService) {

                $scope.filterData = {};
                $scope.filterData.subAccountList = [];
                $scope.filterData.subAccSelectedName = '';
                $scope.filterData.subAccSelectedId = '';
                $scope.constants = constants;

                var fetchAdvertiserAndBroadCast = function (accountId, onClientSelect) {
                    onClientSelect = onClientSelect || false;

                    filterService
                        .fetchAdvertisers(accountId, function (advertiserData) {
                            var args = {
                                from: $scope.from,
                                clientId: accountId,
                                advertiserId: -1
                            };
                            console.log('advertiserData', advertiserData);
                        });
                };


                $scope.selectClient = function (subAccount) {
                     $('#subAcc_name_selected').text(subAccount.displayName);
                     $scope.filterData.subAccountList = subAccount;
                     fetchAdvertiserAndBroadCast(true);
                 };

                $scope.selectAdvertisers = function (advertiser) {
                     var advertiserObj = {
                             id: advertiser.id,
                             name: advertiser.name,
                             referedFrom: 'filterDirective'
                         },

                         args;

                     $scope.filterData.advertiserSelectedName = advertiser.name;
                     $scope.filterData.advertiserSelectedId = advertiser.id;

                     //set to localstorage
                     localStorage.setItem('setAdvertiser', JSON.stringify(advertiserObj));

                     args = {
                         from: $scope.from,
                         clientId: $scope.filterData.subAccSelectedId,
                         advertiserId: advertiser.id
                     };

                     $rootScope.$broadcast('filterChanged',args);
                };

                var accountId,
                    accountList = subAccountService.getSubAccounts();

                $scope.filterData.subAccountList = accountList;
                accountId = vistoconfig.getSelectedAccountId();
                fetchAdvertiserAndBroadCast(accountId);
            },

            restrict: 'EAC',
            scope : {from:'@'},
            templateUrl: assets.html_filter_drop_down,
            link: function () {}
        };
    });
});
