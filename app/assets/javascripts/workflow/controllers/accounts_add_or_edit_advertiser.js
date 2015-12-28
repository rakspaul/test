
(function() {
    'use strict';

    angObj.controller('AccountsAddOrEditAdvertiser', function($scope,$rootScope, $modalInstance,accountsService) {
        $scope.close=function(){
            $scope.resetBrandAdvertiserAfterEdit();
            $modalInstance.dismiss();
        };

        $scope.saveAdvertisers = function(){
            if($scope.mode == 'edit'){ //edit mode
                var advertiserObj =  accountsService.getToBeEditedAdvertiser();
                var body = constructRequestBody(advertiserObj);
                accountsService.updateAdvertiser(body,body.id).then(function(result){
                    if (result.status === "OK" || result.status === "success") {
                        $scope.fetchAllAdvertisers($scope.client.id);
                        $scope.close();
                        $rootScope.setErrAlertMessage('Advertiser updated successfully',0);
                        $scope.resetBrandAdvertiserAfterEdit();
                    }
                }, function(err) {
                    $scope.close();
                    $rootScope.setErrAlertMessage('Error in creating advertiser');
                    console.log('error')
                });
            }
            else if($scope.selectedAdvertiserId != ''){ //when user does select and existing advertiser under a client
                createAdvertiserUnderClient($scope.selectedAdvertiserId);
            }
            else{ // when user creates a brand new advertiser
                var body = constructRequestBody();
                accountsService.createAdvertiser(body).then(function(adv){
                    if (adv.status === "OK" || adv.status === "success") {
                        createAdvertiserUnderClient(adv.data.data.id);
                    }
                });
            }
        }

        function createAdvertiserUnderClient(advId){
            accountsService.createAdvertiserUnderClient($scope.client.id, advId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.fetchAllAdvertisers($scope.client.id);
                    $scope.resetBrandAdvertiserAfterEdit();
                    $scope.close();
                    $rootScope.setErrAlertMessage('Advertiser created successfully',0);
                }
            },function(err){
                $scope.close();
                $rootScope.setErrAlertMessage('Error in creating advertiser under client.');
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
