define(['angularAMD', 'filter-service'], function (angularAMD) {
    'use strict';

    angularAMD.directive('filterDirective', function () {
        return {
            controller: function ($scope, $rootScope, $location, $routeParams, workflowService, loginModel, constants, vistoconfig,
                                  accountService, subAccountService, filterService, urlBuilder) {

                $scope.filterData = {};
                $scope.filterData.subAccountList = [];
                $scope.filterData.subAccSelectedName = '';
                $scope.filterData.subAccSelectedId = '';
                $scope.constants = constants;


                var fetchAdvertiserAndBroadCast = function (clientId, onClientSelect) {

                    onClientSelect = onClientSelect || false;

                    filterService
                        .fetchAdvertisers(clientId, function (advertiserData) {
                            var selectedAdvertiserData;

                            $scope.filterData.advertiserList= [{
                                id: '-1',
                                name: constants.ALL_ADVERTISERS
                            }].concat(advertiserData);

                            if($scope.filterData.advertiserList) {

                                if($routeParams.advertiserId) {
                                    selectedAdvertiserData = _.find($scope.filterData.advertiserList, function(obj) {
                                        return obj.id === Number($routeParams.advertiserId);
                                    });
                                } else {
                                    selectedAdvertiserData = $scope.filterData.advertiserList[0];
                                }

                                $scope.filterData.advertiserSelectedId = Number(selectedAdvertiserData.id);
                                $scope.filterData.advertiserSelectedName = selectedAdvertiserData.name;
                            }

                            $rootScope.$broadcast('filterChanged', {
                                clientId: clientId,
                                advertiserId: $scope.filterData.advertiserSelectedId
                            });
                        });
                };

                $scope.showSubAccountDropDown = function () {
                    var subAccountDropdownList = $('#subAccountDropDownList');

                    subAccountDropdownList.toggle();
                    $('#cdbMenu').closest('.each_filter').removeClass('filter_dropdown_open');
                    subAccountDropdownList.closest('.each_filter').toggleClass('filter_dropdown_open');
                    $('#cdbDropdown').hide();
                    $('#profileDropdown').hide();
                    $('#advertisersDropDownList').hide();
                };

                $scope.showAdvertisersDropDown = function () {
                    $('#advertisersDropDownList')
                        .toggle()
                        .closest('.each_filter')
                        .toggleClass('filter_dropdown_open');
                    $('#subAccountDropDownList').hide();
                };

                $scope.selectAdvertisers = function (advertiser) {
                     if(advertiser) {
                         urlBuilder.creativeListUrl($routeParams.clientId, $routeParams.subAccountId, advertiser.id);
                     }
                };

                $scope.changeSubAccount =  function(account) {
                    $scope.filterData.subAccSelectedName = account.displayName ;
                    var url = '/a/' + $routeParams.accountId+'/sa/'+ account.id +'/creative/list';
                    $location.url(url);
                };

                $(function() {
                    var accountData =  accountService.getSelectedAccount(),
                        selectedSubAccount,
                        clientId;

                    if(!accountData.isLeafNode) {
                        accountData = subAccountService.getSubAccounts();
                        selectedSubAccount = subAccountService.getSelectedSubAccount();
                        clientId = selectedSubAccount.id;
                        $scope.filterData.subAccountList = _.sortBy(accountData, 'displayName');
                        $scope.filterData.subAccSelectedName = selectedSubAccount.displayName;
                        $scope.filterData.subAccSelectedId = selectedSubAccount.id;
                    } else {
                        clientId = accountData.id;
                    }
                    fetchAdvertiserAndBroadCast(clientId);
                });


            },

            restrict: 'EAC',
            scope : {from:'@'},
            templateUrl: assets.html_filter_drop_down,
            link: function () {}
        };
    });
});
