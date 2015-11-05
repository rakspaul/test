
(function() {
    'use strict';

    angObj.controller('AccountsAddOrEditAdvertiser', function($scope, $modalInstance,accountsService) {
        $scope.close=function(){
            $scope.advertiserName = '';
            accountsService.setToBeEditedAdvertiser(null);
            $modalInstance.dismiss();
        };

        $scope.saveAdvertisers = function(){
            if($scope.mode == 'edit'){
                var advertiserObj =  accountsService.getToBeEditedAdvertiser();
                var body = constructRequestBody(advertiserObj);
                accountsService.updateAdvertiser(body,body.id).then(function(){
                    $scope.close();
                    $scope.fetchAllAdvertisers($scope.client.id);
                    $scope.resetBrandAdvertiserAfterEdit();

                });
            }
            else{
                var body = constructRequestBody();
                accountsService.createAdvertiser(body).then(function(adv){
                    accountsService.createAdvertiserUnderClient($scope.client.id,adv.id).then(function() {
                        $scope.close();
                        $scope.fetchAllAdvertisers($scope.client.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                    });
                });
            }
        }



        function constructRequestBody(obj){
            var respBody = {};
            if($scope.mode == 'edit' && obj){
                respBody.name = $scope.advertiserName;
                respBody.id = obj.id;
                respBody.updatedAt = obj.updatedAt;
            }
            else{
                respBody.name = $scope.advertiserName;
            }

            return respBody;
        }


        
    });
}());
