define(['angularAMD','reporting/subAccount/sub_account_model'],function (angularAMD) {
    angularAMD.controller('subAccountController', function ($scope,subAccountModel) {
     $scope.accountSubType = [{'id':1,'name':'One'},{'id':2,'name':'Two'}];
     $scope.subAccountData = subAccountModel.getSubAccounts();
    });
});
