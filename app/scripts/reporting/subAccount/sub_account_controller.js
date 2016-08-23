define(['angularAMD', 'common/services/sub_account_service', 'common/services/constants_service', 'login/login_model', 'common/services/vistoconfig_service'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('subAccountController', function ($scope, $rootScope, $route, $routeParams, $location, subAccountService, constants, loginModel, vistoconfig,
                                                            utils, accountService) {
        $scope.constants = constants;

        $scope.subAccountData = {
            subAccounts : {},
            selectedSubAccount : {}
        };

        $scope.showSubAccountDropDown = function () {
            var subAccountDropdownList = $('#subAccountDropDownList');

            subAccountDropdownList.toggle();
            $('#cdbMenu').closest('.each_filter').removeClass('filter_dropdown_open');
            subAccountDropdownList.closest('.each_filter').toggleClass('filter_dropdown_open');
            $('#cdbDropdown').hide();
            $('#profileDropdown').hide();
        };

        $scope.selectSubAccount = function (subAccount) {
            var subAccountNameSelected = $('#sub_account_name_selected');

            $scope.subAccountData.selectedSubAccount.id = subAccount.id;
            subAccountNameSelected.text(subAccount.displayName);
            subAccountNameSelected.attr('title' , subAccount.displayName);
            $('#subAccountDropdown').attr('placeholder', subAccount.displayName).val('');
            $('#subAccountDropDownList').hide() ;

            $scope.subAccountData.showAll = true;
            $routeParams.subAccountId = subAccount.id;
            subAccountService.changeSubAccount(vistoconfig.getMasterClientId(), subAccount);
        };

        $scope.disableShowAll = function () {
            $scope.subAccountData.showAll = false;
        };

        function fetchSubAccounts() {
            var selectedSubAccount;

            console.log(' $scope.subAccountData = ',  $scope.subAccountData.valueOf());
            if ($location.path().endsWith('/dashboard')) {
                $scope.subAccountData.subAccounts = subAccountService.getDashboardSubAccountList();
                $scope.subAccountData.selectedSubAccount.id = subAccountService.getSelectedDashboardSubAccount().id;
                $scope.subAccountData.selectedSubAccount.name = subAccountService.getSelectedDashboardSubAccount().displayName;
            } else {
                console.log('subAccountController.fetchSubAccounts(): $routeParams.accountId = ', $routeParams.accountId);
                $scope.subAccountData.subAccounts = subAccountService.getSubAccounts();

                // TODO: Is this the correct call, or redundant as we have the following code below?
                $scope.subAccountData.selectedSubAccount.id = vistoconfig.getSelectedAccountId();

                // TODO: Redundant???
                //$scope.subAccountData.selectedSubAccount.id = subAccountService.getSelectedSubAccount();
                selectedSubAccount = subAccountService.getSelectedSubAccount();
console.log('$scope.subAccountData = ', $scope.subAccountData);
                if (selectedSubAccount) {
                    $scope.subAccountData.selectedSubAccount.id = selectedSubAccount.id;
                    $scope.subAccountData.selectedSubAccount.name = selectedSubAccount.displayName;
                }
            }
        }

        (function getOrFetchSubAccounts() {
            if (!accountService.getSelectedAccount().isLeafNode) {
                fetchSubAccounts('subAccountCtrl');
            }
        })();

        $(function () {
            $('header').on('click', '#subAccountDropdownDiv', function () {
                $('.subAccountList_ul').scrollTop($(this).offset().top - 20 + 'px');
            });
        });
    });
});
