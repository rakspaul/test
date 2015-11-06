
(function() {
    'use strict';

    angObj.controller('AccountsAddOrEdit', function($scope, $modalInstance,accountsService) {
        $scope.close=function(){
            $modalInstance.dismiss();
        };


        $scope.saveClients = function(){
            if($scope.mode == 'edit'){
                var clientObj =  accountsService.getToBeEditedClient();
                var body = constructRequestBody(clientObj);
                console.log(body);
                accountsService.updateAccount(body,body.id).then(function(result){
                    if (result.status === "OK" || result.status === "success") {
                        $scope.close();
                        $scope.fetchAllClients();
                        $scope.resetBrandAdvertiserAfterEdit();
                    }

                });
            }
            //else{
            //    var body = constructRequestBody();
            //    accountsService.createAdvertiser(body).then(function(adv){
            //        if (adv.status === "OK" || adv.status === "success") {
            //            accountsService.createAdvertiserUnderClient($scope.client.id, adv.data.data.id).then(function (result) {
            //                if (result.status === "OK" || result.status === "success") {
            //                    $scope.close();
            //                    $scope.fetchAllAdvertisers($scope.client.id);
            //                    $scope.resetBrandAdvertiserAfterEdit();
            //                }
            //            },function(err){
            //                console.log('error')
            //            });
            //        }
            //    });
            //}
        }

        function constructRequestBody(obj){
            var respBody = {}
            respBody.name = $scope.clientName;
            respBody.id = obj.id;
            respBody.updatedAt = obj.updatedAt;
            respBody.billableAccountId = obj.billableAccountId;
            respBody.clientType = obj.clientType;
            respBody.parentId = obj.parentId;
            respBody.referenceId = obj.referenceId;
            return respBody;
        }
    });
}());
