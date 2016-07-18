define(['angularAMD', 'reporting/subAccount/sub_account_service', 'common/services/constants_service',
    'login/login_model'], function (angularAMD) {
    'use strict';

    angularAMD.controller('subAccountController', function ($scope, $rootScope, $location, subAccountModel,
                                                            constants, loginModel) {
        var initializeDataObj = function() {
            var locationPath = $location.url();

            if ((locationPath === '/dashboard') || (locationPath === '/')) {
                $scope.isDashboardFilter = true;
            }

            $scope.subAccountData = {
                subAccounts: {},

                selectedsubAccount:  {
                    id: -1,
                    name: 'Loading...'
                }
            };
        };

        function fetchSubAccounts(from) {
            subAccountModel.fetchSubAccounts(from, function () {
                if ($scope.isDashboardFilter) {
                    $scope.subAccountData.subAccounts = subAccountModel.getDashboardSubAccounts();
                    $scope.subAccountData.selectedsubAccount.id = loginModel.getDashboardClient().id;
                    $scope.subAccountData.selectedsubAccount.name = loginModel.getDashboardClient().name;
                } else {
                    $scope.subAccountData.subAccounts = subAccountModel.getSubAccounts();
                    $scope.subAccountData.selectedsubAccount.id = loginModel.getSelectedClient().id;
                    $scope.subAccountData.selectedsubAccount.name = loginModel.getSelectedClient().name;
                }
            });
        }

        function getSubAccounts() {
            $scope.subAccountData.subAccounts = subAccountModel.getSubAccounts();
            $scope.subAccountData.selectedsubAccount.id = loginModel.getSelectedClient().id;
            $scope.subAccountData.selectedsubAccount.name = loginModel.getSelectedClient().name;
        }

        $scope.constants = constants;
        $scope.isDashboardFilter = false;

        initializeDataObj();

        (function getOrFetchSubAccounts() {
            if (subAccountModel.getSubAccounts().length > 0 && !$scope.isDashboardFilter) {
                getSubAccounts();
            } else {
                fetchSubAccounts('subAccountCtrl');
            }
        })();

        $scope.showSubAccountDropDown = function () {
            var subAccountDropdownList = $('#subAccountDropDownList');

            subAccountDropdownList.toggle();
            $('#cdbMenu').closest('.each_filter').removeClass('filter_dropdown_open');
            subAccountDropdownList.closest('.each_filter').toggleClass('filter_dropdown_open');
            $('#cdbDropdown').hide();
            $('#profileDropdown').hide();
        };

        $scope.selectSubAccount = function (subAccount) {
            var subAccountNameSelected = $('#sub_account_name_selected'),

                subAccountIdName = {
                    id: subAccount.id,
                    name: subAccount.displayName
                };

            $scope.subAccountData.selectedsubAccount.id = subAccount.id;

            subAccountNameSelected.text(subAccount.displayName);
            subAccountNameSelected.attr('title' , subAccount.displayName);
            $('#subAccountDropdown').attr('placeholder', subAccount.displayName).val('');
            $('#subAccountDropDownList').hide() ;

            $scope.subAccountData.showAll = true;

            if ($scope.isDashboardFilter) {
                subAccountModel.setSelectedDashboardSubAcc(subAccountIdName);
            } else {
                subAccountModel.setSelectedSubAccount(subAccountIdName);
            }

            $rootScope.$broadcast(constants.ACCOUNT_CHANGED, {
                client: subAccount.id,
                event_type: 'clicked'
            });

            $scope.selectedSubAccount = null;
        };

        $scope.disableShowAll = function () {
            $scope.subAccountData.showAll = false;
        };

        // TODO: should we have this???
        $rootScope.$on(constants.EVENT_CLIENT_CHANGED_FROM_DASHBOARD, function (event, args) {
            $scope.selectSubAccount(args.subAccount, args.event_type);
        });

        $rootScope.$on(constants.EVENT_MASTER_CLIENT_CHANGED, function () {
            var isLeafNode,
                subAccountId;

            initializeDataObj();
            subAccountModel.resetSubAccount();

            isLeafNode = loginModel.getMasterClient().isLeafNode;
            subAccountId = loginModel.getSelectedClient().id;

            if (!isLeafNode) {
                fetchSubAccounts('MasterClientChanged');
            }

            $rootScope.$broadcast(constants.ACCOUNT_CHANGED, {
                client: subAccountId,
                event_type: 'clicked'
            });
        });

        $(function () {
            $('header').on('click', '#subAccountDropdownDiv', function () {
                $('.subAccountList_ul').scrollTop($(this).offset().top - 20 + 'px');
            });
        });
    });
});
