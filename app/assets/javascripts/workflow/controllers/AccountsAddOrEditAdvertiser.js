
(function() {
    'use strict';

    collectiveReportModule.controller('AccountsAddOrEditAdvertiser', function($scope, $modalInstance,accountsService) {
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
                    $scope.fetchAllAdvertisers($scope.client);
                    $scope.client = '';
                });
            }
        }

        function constructRequestBody(obj){
            var respBody = {}
            respBody.name = $scope.advertiserName;
            respBody.id = obj.id;
            respBody.updatedAt = obj.updatedAt;
            return respBody;
        }


        
    });
}());
