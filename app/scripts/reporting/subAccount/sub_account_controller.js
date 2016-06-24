define(['angularAMD','reporting/subAccount/sub_account_model','common/services/constants_service','login/login_model','common/utils'],function (angularAMD) {
    angularAMD.controller('subAccountController', function ($scope, $rootScope, $route, $routeParams, $location, subAccountModel,constants,loginModel,utils, accountService, subAccountService) {

        var search = false;
        var searchCriteria = utils.typeaheadParams;
        $scope.constants = constants;
        // $scope.isDashboardFilter = false;
        $scope.subAccountData = {
            subAccounts : {},
            selectedsubAccount :  {}
        };


        // var initializeDataObj = function() {
        //     var locationPath = $location.path();
        //     if (locationPath.endsWith('/dashboard')) {
        //         $scope.isDashboardFilter = true;
        //     }

        //     $scope.subAccountData = {
        //         subAccounts : {},
        //         selectedsubAccount :  {
        //             id: -1,
        //             name : 'Loading...'
        //         }
        //     };
        // };

        // initializeDataObj();

        function fetchSubAccounts(from, searchCriteria, search) {
            if($location.path().endsWith('/dashboard')) {
                $scope.subAccountData.subAccounts = subAccountService.getDashboadSubAccountList();
                $scope.subAccountData.selectedsubAccount.id = subAccountService.getSelectedDashboardSubAccount().id;
                $scope.subAccountData.selectedsubAccount.name = subAccountService.getSelectedDashboardSubAccount().displayName;
            } else {
                $scope.subAccountData.subAccounts = subAccountService.getSubAccounts();
                $scope.subAccountData.selectedsubAccount.id = subAccountService.getSelectedSubAccount().id;
                $scope.subAccountData.selectedsubAccount.name = subAccountService.getSelectedSubAccount().displayName;
            }
            // subAccountModel.fetchSubAccounts(from,function () {
            //     if($scope.isDashboardFilter) {
            //         $scope.subAccountData.subAccounts = subAccountModel.getDashboardSubAccounts();
            //         $scope.subAccountData.selectedsubAccount.id = loginModel.getDashboardClient().id;
            //         $scope.subAccountData.selectedsubAccount.name = loginModel.getDashboardClient().name;
            //     } else {
            //         $scope.subAccountData.subAccounts = subAccountModel.getSubAccounts();
            //         $scope.subAccountData.selectedsubAccount.id = loginModel.getSelectedClient().id;//$scope.subAccountData.subAccounts[0].id;
            //         $scope.subAccountData.selectedsubAccount.name = loginModel.getSelectedClient().name;//$scope.subAccountData.subAccounts[0].name;
            //     }

            // });
        };

        // function getSubAccounts(searchCriteria, search) {
        //     $scope.subAccountData.subAccounts = subAccountModel.getSubAccounts();
        //     $scope.subAccountData.selectedsubAccount.id = loginModel.getSelectedClient().id;//$scope.subAccountData.subAccounts[0].id;
        //     $scope.subAccountData.selectedsubAccount.name = loginModel.getSelectedClient().name;//$scope.subAccountData.subAccounts[0].name;
        // }

        (function getOrFetchSubAccounts() {
            // if(subAccountModel.getSubAccounts().length > 0 && !$scope.isDashboardFilter) {
            //     getSubAccounts();
            // } else {
            if (!accountService.getSelectedAccount().isLeafNode) {
                fetchSubAccounts('subAccountCtrl');
            }
            // }
        })();


        $scope.showSubAccountDropDown = function () {
          //  fetchAdvertisers(searchCriteria, search);
            $("#subAccountDropDownList").toggle();
            $("#cdbMenu").closest(".each_filter").removeClass("filter_dropdown_open");
            $("#subAccountDropDownList").closest(".each_filter").toggleClass("filter_dropdown_open");
            $("#cdbDropdown").hide();
            $("#profileDropdown").hide();
        };

        $scope.selectSubAccount = function (sub_account, event_type) {
            var subAccountIdName = {'id': sub_account.id, 'name': sub_account.displayName};

            $scope.subAccountData.selectedsubAccount.id = sub_account.id;

            $("#sub_account_name_selected").text(sub_account.displayName);
            $("#sub_account_name_selected").attr("title" , sub_account.displayName);
            $('#subAccountDropdown').attr('placeholder', sub_account.displayName).val('');
            $("#subAccountDropDownList").hide() ;

            $scope.subAccountData.showAll = true;
            $routeParams.subAccountId = sub_account.id;

            // var currentURL = $location.url(),
            //     parts = currentURL.split('/');
            // parts[4] = sub_account.id;

            // console.log('currentURL', currentURL);
            // console.log('newURL', parts.join('/'));
            // $location.url(parts.join('/'));
            subAccountService.changeSubAccount(accountService.getSelectedAccount(), sub_account);



            // if($scope.isDashboardFilter) {
            //     subAccountModel.setSelectedDashboardSubAcc(subAccountIdName);
            // } else {
            //     subAccountModel.setSelectedSubAccount(subAccountIdName);
            // }

            // $rootScope.$broadcast(constants.ACCOUNT_CHANGED, {'client':sub_account.id, 'event_type': 'clicked'});
            // $scope.selectedSubAccount = null;
        };

        $scope.disableShowAll = function () {
            $scope.subAccountData.showAll = false;
        };

        //shold we have this
        // var eventClientChangedFromDashBoard = $rootScope.$on(constants.EVENT_CLIENT_CHANGED_FROM_DASHBOARD, function (event, args) {
        //     $scope.selectSubAccount(args.subAccount, args.event_type);
        // });

        // var masterClientChanged = $rootScope.$on(constants.EVENT_MASTER_CLIENT_CHANGED, function (event, args) {
        //     initializeDataObj();
        //     subAccountModel.resetSubAccount();
        //     var isLeafNode = loginModel.getMasterClient().isLeafNode;
        //     var subAccountId = loginModel.getSelectedClient().id;
        //     if(!isLeafNode) {
        //         fetchSubAccounts('MasterClientChanged');
        //     }
        //     $rootScope.$broadcast(constants.ACCOUNT_CHANGED, {'client':subAccountId, 'event_type': 'clicked'});
        // });


        $(function () {
            $("header").on('click', '#subAccountDropdownDiv', function () {
                $('.subAccountList_ul').scrollTop($(this).offset().top - 20 + 'px')
            });
        });



    });
});
