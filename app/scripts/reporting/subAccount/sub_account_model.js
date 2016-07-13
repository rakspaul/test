define(['angularAMD', 'workflow/services/workflow_service', 'common/services/constants_service', // jshint ignore:line
    'login/login_model'], function (angularAMD) {
    'use strict';

    angularAMD.service('subAccountModel', function ($rootScope, $location, workflowService, constants, loginModel) {
        var self = this;

        self.subAccounts = {
            allSubAccounts: [],
            dashboardSubAccounts: []
        };

        this.setSelectedSubAccount = function (selected_sub_account) {
            localStorage.setItem('selectedClient', JSON.stringify(selected_sub_account));
        };

        this.setSelectedDashboardSubAcc = function (selected_dash_sub_account) {
            localStorage.setItem('dashboardClient', JSON.stringify(selected_dash_sub_account));
        };

        this.setSubAccounts = function (dataAry) {
            self.subAccounts.allSubAccounts = dataAry;
        };

        this.resetSubAccount = function () {
            self.subAccounts.allSubAccounts = [];
        };

        this.getSubAccounts = function () {
            return self.subAccounts.allSubAccounts;
        };

        // reset dashboard subaccount's local storage
        this.resetDashboardSubAccStorage = function () {
            loginModel.setDashboardClient({
                id: loginModel.getMasterClient().id,
                name: 'All'
            });
        };

        this.isDashboardSubAccount = function () {
            var locationPath = $location.url();

            if ((locationPath === '/dashboard') || (locationPath === '/')) {
                return true;
            }

            return false;
        };

        // Dashboard subAccount setter
        this.setDashboardSubAccounts = function (dataAry) {
            self.subAccounts.dashboardSubAccounts = dataAry;
        };

        // Dashboard subAccount getter
        this.getDashboardSubAccounts = function () {
            return self.subAccounts.dashboardSubAccounts;
        };

        this.getDashboardAccountId = function () {
            var clientId;

            if (self.isDashboardSubAccount() && !loginModel.getMasterClient().isLeafNode) {
                clientId = loginModel.getDashboardClient().id;
            } else {
                clientId = loginModel.getSelectedClient().id;
            }
            return clientId;
        };

        this.fetchSubAccounts = function (from, successCallBack) {
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
                            self.setSelectedSubAccount({
                                id: response.data.data[0].id,
                                name: response.data.data[0].displayName
                            });
                        } else {
                            selectedClient = loginModel.getSelectedClient();

                            if (selectedClient && selectedClient.id){
                                self.setSelectedSubAccount({
                                    id: selectedClient.id,
                                    name: selectedClient.name
                                });
                            }
                        }

                        self.setSubAccounts(response.data.data);
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

                        self.setDashboardSubAccounts(dashboardSubAccArr);
                        successCallBack();
                    });
            }
        };
    });
});
