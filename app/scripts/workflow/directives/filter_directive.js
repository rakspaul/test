define(['angularAMD', 'filter-service'], function (angularAMD) {
    'use strict';

    angularAMD.directive('filterDirective', function () {
        return {
            controller: function ($scope, $rootScope, $location, $routeParams, workflowService, loginModel, constants, vistoconfig,
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

                            if($scope.filterData.advertiserList) {
                                $scope.filterData.advertiserSelectedId = Number($scope.filterData.advertiserList[0].id);
                                $scope.filterData.advertiserSelectedName = $scope.filterData.advertiserList[0].name;
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
                     var args;

                     if(advertiser) {
                         $scope.filterData.advertiserSelectedName = advertiser.name;
                         $scope.filterData.advertiserSelectedId = advertiser.id;
                         //set to localstorage

                         args = {
                             from: $scope.from,
                             clientId: advertiser.clientId,
                             advertiserId: advertiser.id
                         };
                         $rootScope.$broadcast('filterChanged', args);
                         $scope.selectedAdvertiser = '';
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
