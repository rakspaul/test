define(['angularAMD', 'workflow/services/workflow_service','common/services/constants_service','login/login_model'], function (angularAMD) {
    angularAMD.service("subAccountModel", function ($rootScope, workflowService,constants,loginModel) {
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


        this.fetchSubAccounts = function (from,successCallBack, searchCritera, search) {
            console.log('Subaccount Model: ',from)
            workflowService.getSubAccounts().then(function (response) {
                if(from == 'MasterClientChanged') {
                    self.setSelectedSubAccount({'id': response.data.data[0].id, 'name': response.data.data[0].name});
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

        this.broadCastSubAccount = function(subAccount,eventType) {
            //$rootScope.$broadcast(constants.EVENT_SUB_ACCOUNT_CHANGED,{'subAccount':subAccount,'event_type':eventType});
        }

    });
});
