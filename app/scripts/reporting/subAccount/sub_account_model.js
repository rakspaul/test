define(['angularAMD', 'workflow/services/workflow_service'], function (angularAMD) {
    angularAMD.service("subAccountModel", function ($rootScope, workflowService) {
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

        this.getSubAccounts = function () {
            return self.subAccounts.allSubAccounts;
        }

        this.fetchSubAccounts = function (successCallBack, searchCritera, search) {
            workflowService.getSubAccounts().then(function (response) {
                self.setSelectedSubAccount({'id': response.data.data[0].id, 'name': response.data.data[0].name});
                console.log({'id': response.data.data[0].id, 'name': response.data.data[0].name});
                self.setSubAccounts(response.data.data);
                successCallBack();
            });
        }
    });
});
