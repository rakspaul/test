define(['angularAMD', 'workflow/services/filter_service', 'common/services/constants_service',
    'common/services/vistoconfig_service', 'common/services/account_service'], function (angularAMD) {
    'use strict';

    angularAMD.directive('filterDirective', function (filterService) {
        return {
            controller: function ($scope,$rootScope, workflowService, loginModel, constants, vistoconfig,
                                  accountService) {
                var setAdvertiserOnLSAndShow = function () {
                        //set to localstorage
                        var advertiserObj = {
                            id: $scope.filterData.advertiserList[0].id,
                            name: $scope.filterData.advertiserList[0].name,
                            referedFrom: 'filterDirective'
                        };

                        localStorage.setItem('setAdvertiser', JSON.stringify(advertiserObj));

                        $scope.filterData.advertiserSelectedId  = $scope.filterData.advertiserList[0].id;
                        $scope.filterData.advertiserSelectedName = $scope.filterData.advertiserList[0].name;
                    },

                    fetchAdvertiserAndBroadCast = function (onClientSelect) {
                        onClientSelect = onClientSelect || false;

                        filterService.fetchAdvertisers($scope.filterData.subAccSelectedId, function (advertiserData) {
                            var args = {
                                from: $scope.from,
                                clientId: $scope.filterData.subAccSelectedId,
                                advertiserId: -1
                            };

                            $scope
                                .filterData.advertiserList= [{
                                    id: '-1',
                                    name: constants.ALL_ADVERTISERS
                                }]
                                .concat(advertiserData);

                            if (onClientSelect) {
                                setAdvertiserOnLSAndShow();
                            }

                            $rootScope.$broadcast('filterChanged', args);
                        });
                    },

                    fetchSubAccounts = function () {
                        filterService.getSubAccount(function (accountData) {
                            var selectedAdvertiser = JSON.parse(localStorage.getItem('setAdvertiser'));

                            $scope.filterData.subAccountList = accountData;

                            if (vistoconfig.getMasterClientId()) {
                                $scope.filterData.subAccSelectedId = vistoconfig.getMasterClientId();
                                $scope.filterData.subAccSelectedName = accountService.getSelectedAccount().name;
                            } else {
                                $scope.filterData.subAccSelectedName = accountData[0].displayName;
                                $scope.filterData.subAccSelectedId = accountData[0].id;
                            }

                            if (selectedAdvertiser) {
                                $scope.filterData.advertiserSelectedId = selectedAdvertiser.id;
                                $scope.filterData.advertiserSelectedName = selectedAdvertiser.name;
                            } else {
                                $scope.filterData.advertiserSelectedId  = $scope.filterData.advertiserList[0].id;
                                $scope.filterData.advertiserSelectedName = $scope.filterData.advertiserList[0].name;
                            }

                            fetchAdvertiserAndBroadCast();
                        });
                    };

                $scope.filterData = {};
                $scope.filterData.subAccountList = [];
                $scope.filterData.subAccSelectedName = '';
                $scope.filterData.subAccSelectedId = '';
                $scope.constants = constants;

                $scope.filterData.advertiserList = [{
                    id: '-1',
                    name: constants.ALL_ADVERTISERS
                }];

                $scope.filterData.advertiserSelectedName = '';
                $scope.filterData.advertiserSelectedId ='';

                fetchSubAccounts();

                $scope.selectClient = function (subAccount) {
                    $('#subAcc_name_selected').text(subAccount.displayName);
                    $scope.filterData.subAccSelectedName = subAccount.displayName;
                    $scope.filterData.subAccSelectedId = subAccount.id;

                    loginModel.setSelectedClient({
                        id: subAccount.id,
                        name: subAccount.displayName
                    });

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

                $scope.showAdvertisersDropDown = function () {
                    $('#advertisersDropDownList')
                        .toggle()
                        .closest('.each_filter')
                        .toggleClass('filter_dropdown_open');
                };

               $rootScope.$on(constants.EVENT_MASTER_CLIENT_CHANGED, function () {
                   setAdvertiserOnLSAndShow();
                });
            },

            restrict: 'EAC',
            scope : {from:'@'},
            templateUrl: assets.html_filter_drop_down,
            link: function () {}
        };
    });
});
