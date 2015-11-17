
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
                        $scope.flashMessage.message = 'Brands updated successfully' ;
                        $scope.msgtimeoutReset();
                    }

                }, function(err){
                    $scope.close();
                    $scope.flashMessage.message = 'Error in creating brand.' ;
                    $scope.flashMessage.isErrorMsg = 1 ;
                    $scope.msgtimeoutReset();
                    console.log('error')
                });
            }
            else if($scope.selectedBrandId != ''){ //when user does select and existing brand under a advertiser
                createBrandUnderAdvertiser($scope.selectedBrandId);
            }
            else{
                var body = constructRequestBody();
                accountsService.createBrand(body).then(function(brand){
                    if (brand.status === "OK" || brand.status === "success") {
                        createBrandUnderAdvertiser(brand.data.data.id)
                    }
                });
            }
        }

        function createBrandUnderAdvertiser(brandId){
            accountsService.createBrandUnderAdvertiser($scope.client.id, $scope.advertiser.id,brandId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.fetchBrands($scope.client.id,$scope.advertiser.id);
                    $scope.resetBrandAdvertiserAfterEdit();
                    $scope.close();
                    $scope.flashMessage.message = 'Brands created successfully' ;
                    $scope.msgtimeoutReset();
                }
            },function(err){
                $scope.close();
                $scope.flashMessage.message = 'Error in creating brand under advertiser.' ;
                $scope.flashMessage.isErrorMsg = 1 ;
                $scope.msgtimeoutReset();
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
