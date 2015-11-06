
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
                accountsService.updateAdvertiser(body,body.id).then(function(result){
                    if (result.status === "OK" || result.status === "success") {
                        $scope.close();
                        $scope.fetchAllAdvertisers($scope.client.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                    }


                });
            }
            else if($scope.selectedAdvertiserId != ''){
                createAdvertiserUnderClient($scope.selectedAdvertiserId);
            }
            else{
                var body = constructRequestBody();
                accountsService.createAdvertiser(body).then(function(adv){
                    if (adv.status === "OK" || adv.status === "success") {
                        //accountsService.createAdvertiserUnderClient($scope.client.id, adv.data.data.id).then(function (result) {
                        //    if (result.status === "OK" || result.status === "success") {
                        //        $scope.close();
                        //        $scope.fetchAllAdvertisers($scope.client.id);
                        //        $scope.resetBrandAdvertiserAfterEdit();
                        //    }
                        //},function(err){
                        //    console.log('error')
                        //});
                        createAdvertiserUnderClient(adv.data.data.id);
                    }
                });
            }
        }

        function createAdvertiserUnderClient(advId){
            accountsService.createAdvertiserUnderClient($scope.client.id, advId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.close();
                    $scope.fetchAllAdvertisers($scope.client.id);
                    $scope.resetBrandAdvertiserAfterEdit();
                }
            },function(err){
                $scope.close();
                console.log('error')
            });
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
