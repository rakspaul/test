
(function() {
    'use strict';

    angObj.controller('AccountsAddOrEditBrand', function($scope, $modalInstance,accountsService) {

        $scope.close=function(){
            $modalInstance.dismiss();
            $scope.resetBrandAdvertiserAfterEdit();
        };

        $scope.saveBrands = function(){
            if($scope.mode == 'edit'){
                var brandObj =  accountsService.getToBeEditedBrand();
                var body = constructRequestBody(brandObj);
                accountsService.updateBrand(body,body.id).then(function(result){
                    if (result.status === "OK" || result.status === "success") {
                        $scope.fetchBrands($scope.client.id, $scope.advertiser.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();
                    }

                });
            }
            else if($scope.selectedBrandId != ''){ //when user does select and existing brand under a advertiser
                createBrandUnderAdvertiser($scope.selectedBrandId);
            }
            else{
                var body = constructRequestBody();
                accountsService.createBrand(body).then(function(brand){
                    if (brand.status === "OK" || brand.status === "success") {
                        //accountsService.createAdvertiserUnderClient($scope.client.id, adv.data.data.id).then(function (result) {
                        //    if (result.status === "OK" || result.status === "success") {
                        //        $scope.close();
                        //        $scope.fetchAllAdvertisers($scope.client.id);
                        //        $scope.resetBrandAdvertiserAfterEdit();
                        //    }
                        //},function(err){
                        //    console.log('error')
                        //});
                        createBrandUnderAdvertiser(brand.data.data.id)
                    }
                });
            }
        }

        function createBrandUnderAdvertiser(brandId){
            accountsService.createBrandUnderAdvertiser($scope.client.id, $scope.advertiser.id,brandId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.close();
                    $scope.fetchBrands($scope.client.id,$scope.advertiser.id);
                    $scope.resetBrandAdvertiserAfterEdit();
                }
            },function(err){
                $scope.close();
                console.log('error')
            });
        }

        function constructRequestBody(obj){
            var respBody = {};
            if($scope.mode == 'edit' && obj) {
                respBody.name = $scope.brandName;
                respBody.id = obj.id;
                respBody.updatedAt = obj.updatedAt;
            }
            else{
                respBody.name = $scope.brandName;
            }
            return respBody;
        }
        
    });
}());
