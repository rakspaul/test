define(['angularAMD', 'common/services/sub_account_service', 'common/services/constants_service',
    'login/login_model'], function (angularAMD) {
    'use strict';

    angularAMD.controller('subAccountController', function ($scope, $rootScope, $route, $routeParams, $location,
                                                            subAccountService, constants, loginModel, utils,
                                                            accountService) {


        var fetchSubAccounts =  function () {
            if($location.path().endsWith('/dashboard')) {
                $scope.subAccountData.subAccounts = subAccountService.getDashboadSubAccountList();
                $scope.subAccountData.selectedsubAccount.id =
                    subAccountService.getSelectedDashboardSubAccount().id;
                $scope.subAccountData.selectedsubAccount.name =
                    subAccountService.getSelectedDashboardSubAccount().displayName;
            } else {
                $scope.subAccountData.subAccounts = subAccountService.getSubAccounts();
                $scope.subAccountData.selectedsubAccount.id = subAccountService.getSelectedSubAccount().id;
                $scope.subAccountData.selectedsubAccount.name = subAccountService.getSelectedSubAccount().displayName;
            }
        };


        $scope.constants = constants;
        $scope.subAccountData = {
            subAccounts : {},
            selectedsubAccount :  {}
        };

        (function getOrFetchSubAccounts() {
            if (!accountService.getSelectedAccount().isLeafNode) {
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

        $scope.selectSubAccount = function (sub_account) {
            var subAccountNameSelected = $('#sub_account_name_selected');

            $scope.subAccountData.selectedsubAccount.id = sub_account.id;

            subAccountNameSelected.text(sub_account.displayName);
            subAccountNameSelected.attr('title' , sub_account.displayName);
            $('#subAccountDropdown').attr('placeholder', sub_account.displayName).val('');
            $('#subAccountDropDownList').hide() ;

            $scope.subAccountData.showAll = true;
            $routeParams.subAccountId = sub_account.id;

            subAccountService.changeSubAccount(accountService.getSelectedAccount(), sub_account);
        };

        $scope.disableShowAll = function () {
            $scope.subAccountData.showAll = false;
        };


        $(function () {
            $('header').on('click', '#subAccountDropdownDiv', function () {
                $('.subAccountList_ul').scrollTop($(this).offset().top - 20 + 'px');
            });
        });
    });
});
