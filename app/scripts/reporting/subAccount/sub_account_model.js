define(['angularAMD', 'workflow/services/workflow_service','common/services/constants_service','login/login_model'], function (angularAMD) {
    angularAMD.service("subAccountModel", function ($rootScope,$location,workflowService,constants,loginModel) {
        var self = this;
        self.subAccounts = {
            allSubAccounts: [],
            dashboardSubAccounts: []
        };

        this.setSelectedSubAccount = function (selected_sub_account) {
            localStorage.setItem('selectedClient', JSON.stringify(selected_sub_account));
        };

        this.setSelectedDashboardSubAcc = function(selected_dash_sub_account) {
            localStorage.setItem('dashboardClient', JSON.stringify(selected_dash_sub_account));
        };

        this.setSubAccounts = function (dataAry) {
            self.subAccounts.allSubAccounts = dataAry;
        };

        this.resetSubAccount = function() {
            self.subAccounts.allSubAccounts = [];
        };

        this.getSubAccounts = function () {
            return self.subAccounts.allSubAccounts;
        };

        //Dashboard subAccount setter
        this.setDashboardSubAccounts = function(dataAry) { console.log('setting');
            self.subAccounts.dashboardSubAccounts = dataAry;
        };

        this.isDashboardSubAccount = function() {
            var locationPath = $location.url();
            if((locationPath === '/dashboard') || (locationPath === '/')) {
                return true;
            }
            return false;
        }

        //Dashboard subAccount getter
        this.getDashboardSubAccounts = function() {
            console.log('getDashboardsubaccount',self.subAccounts.dashboardSubAccounts);
            return self.subAccounts.dashboardSubAccounts;
        };

        this.fetchSubAccounts = function (from,successCallBack, searchCritera, search) {
            var isLeafNode = loginModel.getMasterClient().isLeafNode;
            var isDashboardFilter = false;
            var locationPath = $location.url();

            if((locationPath === '/dashboard') || (locationPath === '/')) {
                isDashboardFilter = true;
            }

            $rootScope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {
                console.log('prev path: ' + absOldUrl);
            });

            if(!isLeafNode){
                workflowService.getSubAccounts().then(function (response) {
                    if(from == 'MasterClientChanged') {
                        self.setSelectedSubAccount({'id': response.data.data[0].id, 'name': response.data.data[0].displayName});
                    } else {
                        var selectedClient = loginModel.getSelectedClient();
                        if(selectedClient && selectedClient.id){
                            self.setSelectedSubAccount({'id': selectedClient.id, 'name': selectedClient.name});
                        }
                    }
                    self.setSubAccounts(response.data.data);
                    successCallBack();
                });
            }
            if(!isLeafNode && isDashboardFilter) {
                var modifiedResArr = [{'id':loginModel.getMasterClient().id,'displayName':'All'}];
                workflowService.getDashboardSubAccount().then(function(response) {
                    var dashboardSubAccArr = modifiedResArr.concat(response.data.data);
                    var selectedDashboardClient = loginModel.getDashboardClient();

                    if(!selectedDashboardClient) {
                        loginModel.setDashboardClient({'id':dashboardSubAccArr[0].id,'name':dashboardSubAccArr[0].displayName});
                    }

                    self.setDashboardSubAccounts(dashboardSubAccArr);
                    successCallBack();
                })
            }

        }

    });
});
