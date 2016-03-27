define(['angularAMD', 'workflow/services/workflow_service','common/services/constants_service'], function (angularAMD) {
    angularAMD.service("subAccountModel", function ($rootScope, workflowService,constants) {
        var self = this;
        self.subAccounts = {
            allSubAccounts: []
        };

        this.setSelectedSubAccount = function (selected_sub_account) {
            localStorage.setItem('selectedClient', JSON.stringify(selected_sub_account));
        }

        this.setSubAccounts = function (dataAry) {
            self.subAccounts.allSubAccounts = dataAry;
        }

        this.resetSubAccount = function() {
            self.subAccounts.allSubAccounts = [];
        }

        this.getSubAccounts = function () {
            return self.subAccounts.allSubAccounts;
        }

        this.fetchSubAccounts = function (successCallBack, searchCritera, search) {
            workflowService.getSubAccounts().then(function (response) {
                self.setSelectedSubAccount({'id': response.data.data[0].id, 'name': response.data.data[0].name});
                self.setSubAccounts(response.data.data);
                successCallBack();
            });
        }

        this.broadCastSubAccount = function(subAccount,eventType) {
            //$rootScope.$broadcast(constants.EVENT_SUB_ACCOUNT_CHANGED,{'subAccount':subAccount,'event_type':eventType});
        }

    });
});
