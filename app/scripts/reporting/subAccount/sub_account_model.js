define(['angularAMD','workflow/services/workflow_service'],function (angularAMD) {
    angularAMD.factory("subAccountModel", function ($rootScope,workflowService) {
        var subAccounts = [];
        return {
            setSelectedSubAccount: function(selected_sub_account) {
                localStorage.setItem('selectedClient', JSON.stringify(selected_sub_account));

            },
            fetchSubAccounts: function (successCallBack, searchCritera, search) {
                workflowService.getSubAccounts().then(function (response) {
                      console.log('response',response.data.data);
                       subAccounts = response.data.data;
                       //self.setSelectedSubAccount({'id':response.data.data[0].id,'name':response.data.data[0].name});
                    localStorage.setItem('selectedClient', JSON.stringify({'id':response.data.data[0].id,'name':response.data.data[0].name}));
                       successCallBack();
                });
            },
            getSubAccounts: function() {
                return subAccounts;
            }

        }
    });
});
