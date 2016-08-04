define(['angularAMD', 'common/services/constants_service',
    'common/services/vistoconfig_service', 'common/services/account_service',
    'common/services/sub_account_service', 'workflow/services/filter_service'], function (angularAMD) {
    'use strict';

    angularAMD.directive('filterDirective', function () {
        return {
            controller: function ($scope,$rootScope, $location, workflowService, loginModel, constants, vistoconfig,
                                  accountService, subAccountService, filterService) {

                $scope.filterData = {};
                $scope.filterData.subAccountList = [];
                $scope.filterData.subAccSelectedName = '';
                $scope.filterData.subAccSelectedId = '';
                $scope.constants = constants;

                var fetchAdvertiserAndBroadCast = function (clientId, onClientSelect) {

                    onClientSelect = onClientSelect || false;

                    filterService
                        .fetchAdvertisers(clientId, function (advertiserData) {

                            $scope.filterData.advertiserList= [{
                                id: '-1',
                                name: constants.ALL_ADVERTISERS
                            }].concat(advertiserData);

                            $scope.filterData.advertiserSelectedId  = Number($scope.filterData.advertiserList[0].id);
                            $scope.filterData.advertiserSelectedName = $scope.filterData.advertiserList[0].name;

                            $rootScope.$broadcast('filterChanged', {
                                clientId: clientId,
                                advertiserId: $scope.filterData.advertiserSelectedId
                            });
                        });
                };


                $scope.selectClient = function (subAccount) {
                    console.log("subAccount", subAccount);
                    $('#subAcc_name_selected').text(subAccount.displayName);
                    $scope.filterData.subAccSelectedName = subAccount.displayName;
                    $scope.filterData.subAccSelectedId = subAccount.id;
                    fetchAdvertiserAndBroadCast(subAccount.id);

                 };

                $scope.showAdvertisersDropDown = function () {
                    $('#advertisersDropDownList')
                        .toggle()
                        .closest('.each_filter')
                        .toggleClass('filter_dropdown_open');
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

                     args = {
                         from: $scope.from,
                         clientId: $scope.filterData.subAccSelectedId,
                         advertiserId: advertiser.id
                     };

                     $rootScope.$broadcast('filterChanged',args);
                };

                var accountData =  accountService.getSelectedAccount();
                var clientId;
                if(!accountData.isLeafNode) {
                    accountData = subAccountService.getSubAccounts();
                    clientId = accountData[0].id;
                    $scope.filterData.subAccountList = accountData;
                    $scope.filterData.subAccSelectedName = accountData[0].displayName;
                    $scope.filterData.subAccSelectedId = accountData[0].id;
                } else {
                    clientId = accountData.id;
                }
                fetchAdvertiserAndBroadCast(clientId);

            },

            restrict: 'EAC',
            scope : {from:'@'},
            templateUrl: assets.html_filter_drop_down,
            link: function () {}
        };
    });
});
