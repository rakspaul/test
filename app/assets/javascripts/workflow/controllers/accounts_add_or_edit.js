
(function() {
    'use strict';

    angObj.controller('AccountsAddOrEdit', function($scope, $modalInstance,accountsService) {
        $scope.close=function(){
            $modalInstance.dismiss();
            $scope.resetBrandAdvertiserAfterEdit();
        };


        $scope.saveClients = function(){
            if($scope.mode == 'edit'){
                var clientObj =  accountsService.getToBeEditedClient();
                var body = constructRequestBody(clientObj);
                console.log(body);
                accountsService.updateClient(body,body.id).then(function(result){
                    if (result.status === "OK" || result.status === "success") {
                        $scope.close();
                        $scope.fetchAllClients();
                        $scope.resetBrandAdvertiserAfterEdit();
                    }

                });
            }
            else{
                var body = constructRequestBody();
                accountsService.createClient(body).then(function(adv){
                    if (adv.status === "OK" || adv.status === "success") {
                        accountsService.createAdvertiserUnderClient($scope.client.id, adv.data.data.id).then(function (result) {
                            if (result.status === "OK" || result.status === "success") {
                                $scope.fetchAllAdvertisers($scope.client.id);
                                $scope.close();
                                //$scope.resetBrandAdvertiserAfterEdit();
                            }
                        },function(err){
                            console.log('error')
                        });
                    }
                });
            }
        }

        function constructRequestBody(obj) {
            var respBody = {}
            respBody.name = $scope.clientName;
            if ($scope.mode == 'edit') {
                respBody.id = obj.id;
                respBody.updatedAt = obj.updatedAt;
                respBody.billableAccountId = obj.billableAccountId;
                respBody.clientType = obj.clientType;
                respBody.parentId = obj.parentId;
                respBody.referenceId = obj.referenceId;
            }
            else{
                respBody.billableAccountId = 1;
                respBody.clientType = "AGENCY";
            }

            return respBody;
        }
    });
}());
