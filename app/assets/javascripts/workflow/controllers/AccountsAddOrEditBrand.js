
(function() {
    'use strict';

    angObj.controller('AccountsAddOrEditBrand', function($scope, $modalInstance,accountsService) {

        $scope.close=function(){
            $modalInstance.dismiss();
        };

        $scope.saveBrands = function(){
            if($scope.mode == 'edit'){
                var brandObj =  accountsService.getToBeEditedBrand();
                var body = constructRequestBody(brandObj);
                accountsService.updateBrand(body,body.id).then(function(result){
                    if (result.status === "OK" || result.status === "success") {
                        $scope.close();
                        $scope.fetchBrands($scope.client, $scope.advertiser.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                    }

                });
            }
        }



        function constructRequestBody(obj){
            var respBody = {}
            respBody.name = $scope.brandName;
            respBody.id = obj.id;
            respBody.updatedAt = obj.updatedAt;
            return respBody;
        }
        
    });
}());
