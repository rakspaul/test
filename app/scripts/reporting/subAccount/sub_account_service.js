define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service', // jshint ignore:line
    'login/login_model'], function (angularAMD) {
    'use strict';

    angularAMD.service('subAccountModel', function ($rootScope, $location, workflowService, constants, loginModel) {

        var subAccounts = {
            allSubAccounts: [],
            dashboardSubAccounts: []
        },

        setSelectedSubAccount = function (selected_sub_account) {
            localStorage.setItem('selectedClient', JSON.stringify(selected_sub_account));
        },

        setSelectedDashboardSubAcc = function (selected_dash_sub_account) {
            localStorage.setItem('dashboardClient', JSON.stringify(selected_dash_sub_account));
        },

        setSubAccounts = function (dataAry) {
            subAccounts.allSubAccounts = dataAry;
        },

        resetSubAccount = function () {
            subAccounts.allSubAccounts = [];
        },

        getSubAccounts = function () {
            return subAccounts.allSubAccounts;
        },

        // reset dashboard subaccount's local storage
        resetDashboardSubAccStorage = function () {
            loginModel.setDashboardClient({
                id: loginModel.getMasterClient().id,
                name: 'All'
            });
        },

        isDashboardSubAccount = function () {
            var locationPath = $location.url();

            if ((locationPath === '/dashboard') || (locationPath === '/')) {
                return true;
            }

            return false;
        },

        // Dashboard subAccount setter
        setDashboardSubAccounts = function (dataAry) {
            subAccounts.dashboardSubAccounts = dataAry;
        },

        // Dashboard subAccount getter
        getDashboardSubAccounts = function () {
            return subAccounts.dashboardSubAccounts;
        },

        getDashboardAccountId = function () {
            var clientId;

            if (isDashboardSubAccount() && !loginModel.getMasterClient().isLeafNode) {
                clientId = loginModel.getDashboardClient().id;
            } else {
                clientId = loginModel.getSelectedClient().id;
            }
            return clientId;
        },

        fetchSubAccounts = function (from, successCallBack) {
            var isLeafNode = loginModel.getMasterClient().isLeafNode,
                isDashboardFilter = false,
                locationPath = $location.url();

            if ((locationPath === '/dashboard') || (locationPath === '/')) {
                isDashboardFilter = true;
            }

            if (!isLeafNode){
                workflowService
                    .getSubAccounts()
                    .then(function (response) {
                        var selectedClient;

                        if (from === 'MasterClientChanged') {
                            setSelectedSubAccount({
                                id: response.data.data[0].id,
                                name: response.data.data[0].displayName
                            });
                        } else {
                            selectedClient = loginModel.getSelectedClient();

                            if (selectedClient && selectedClient.id){
                                setSelectedSubAccount({
                                    id: selectedClient.id,
                                    name: selectedClient.name
                                });
                            }
                        }

                        setSubAccounts(response.data.data);
                        successCallBack();
                    });
            }

            if (!isLeafNode && isDashboardFilter) {
                var modifiedResArr = [{
                        id: loginModel.getMasterClient().id,
                        displayName: 'All'
                    }],

                    selectedDashboardClient = loginModel.getDashboardClient();

                if (!selectedDashboardClient) {
                    loginModel.setDashboardClient({
                        id: modifiedResArr[0].id,
                        name: modifiedResArr[0].displayName
                    });
                }

                workflowService
                    .getDashboardSubAccount()
                    .then(function (response) {
                        var dashboardSubAccArr = modifiedResArr.concat(response.data.data);

                        setDashboardSubAccounts(dashboardSubAccArr);
                        successCallBack();
                    });
            }
        };

        return {

            setSelectedSubAccount : setSelectedSubAccount,
            setSelectedDashboardSubAcc : setSelectedDashboardSubAcc,
            setSubAccounts : setSubAccounts,
            resetSubAccount : resetSubAccount,
            getSubAccounts : getSubAccounts,
            resetDashboardSubAccStorage : resetDashboardSubAccStorage,
            isDashboardSubAccount : isDashboardSubAccount,
            setDashboardSubAccounts : setDashboardSubAccounts,
            getDashboardSubAccounts : getDashboardSubAccounts,
            getDashboardAccountId : getDashboardAccountId,
            fetchSubAccounts : fetchSubAccounts
        };
    });
});
