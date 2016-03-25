define(['angularAMD','reporting/subAccount/sub_account_model'],function (angularAMD) {
    angularAMD.controller('subAccountController', function ($scope,$rootScope,subAccountModel) {

        $scope.subAccountData = {
            subAccounts : {},
            selectedsubAccount :  {
                id: -1,
                name : 'Loading...'
            }
        };

        function fetchSubAccounts(searchCriteria, search) {
            subAccountModel.fetchSubAccounts(function () {
                $scope.subAccountData.subAccounts = subAccountModel.getSubAccounts();
                $scope.subAccountData.selectedsubAccount.id = $scope.subAccountData.subAccounts[0].id;
                $scope.subAccountData.selectedsubAccount.name = $scope.subAccountData.subAccounts[0].name;
            });
        };

        function getSubAccounts(searchCriteria, search) {
            $scope.subAccountData.subAccounts = subAccountModel.getSubAccounts();
            $scope.subAccountData.selectedsubAccount.id = $scope.subAccountData.subAccounts[0].id;
            $scope.subAccountData.selectedsubAccount.name = $scope.subAccountData.subAccounts[0].name;
        }

        function init() {
            if(subAccountModel.getSubAccounts().length > 0) {
                getSubAccounts();
            } else {
                fetchSubAccounts();
            }
        }

        init();

        $scope.showSubAccountDropDown = function () {
          //  fetchAdvertisers(searchCriteria, search);
            $("#subAccountDropDownList").toggle();
            $("#cdbMenu").closest(".each_filter").removeClass("filter_dropdown_open");
            $("#subAccountDropDownList").closest(".each_filter").toggleClass("filter_dropdown_open");
            $("#cdbDropdown").hide();
            $("#profileDropdown").hide();
        };

        $scope.selectSubAccount = function (sub_account, event_type) {
            $("#sub_account_name_selected").text(sub_account.name);
            $('#subAccountDropdown').attr('placeholder', sub_account.name).val('');
            $scope.subAccountData.showAll = true;
            var subAccountIdName = {'id':sub_account.id,'name': sub_account.name};
            subAccountModel.setSelectedSubAccount(subAccountIdName);
            $scope.subAccountData.selectedsubAccount.id = sub_account.id ;
        };

        $scope.disableShowAll = function () { 
            $scope.subAccountData.showAll = false;
        };

        $(function () {
            $("header").on('click', '#subAccountDropdownDiv', function () {
                $('.subAccountList_ul').scrollTop($(this).offset().top - 20 + 'px')
            });
        });



    });
});
