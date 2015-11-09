
(function() {
    'use strict';

    angObj.controller('AccountsAddOrEdit', function($scope, $modalInstance,accountsService) {
        $scope.clientType = 'AGENCY';
        $scope.currencySelected = '';
        $scope.referenceId;

        $scope.close=function(){
            $modalInstance.dismiss();
            $scope.resetBrandAdvertiserAfterEdit();
        };

        $scope.setSelectedClientType = function(type){
            console.log(type)
            $scope.clientType = type;
            if(type == 'MARKETER'){
                console.log('marketer')
                accountsService.getAllAdvertisers().then(function(result){
                    $scope.allAdvertiser = result.data.data;
                })
            }
        }
        //$scope.setCurrency = function(type){
        //    $scope.currencySelected = type;
        //}

        $scope.selectClientAdvertiser = function(advertiser){
            $scope.dropdownCss.display = 'none';
            $scope.clientName = advertiser.name;
            $scope.referenceId = advertiser.id;

        }


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
                var billableBody = createBillableBody();

                if($scope.clientType == 'MARKETER'){
                    accountsService.createBillableAccount(billableBody).then(function(result){
                        if (result.status === "OK" || result.status === "success") {
                            $scope.billableAccountId = result.data.data.id;
                            var body = constructRequestBody();
                            createClient(body);
                        }
                    })
                }
                else{
                    accountsService.createAgencies(billableBody).then(function(result){
                        if (result.status === "OK" || result.status === "success") {
                            $scope.referenceId = result.data.data.id;

                            accountsService.createBillableAccount(billableBody).then(function(result) {
                                if (result.status === "OK" || result.status === "success") {
                                    $scope.billableAccountId = result.data.data.id;
                                    var body = constructRequestBody();
                                    createClient(body);
                                }
                            });

                        }
                    })
                }


            }
        }

        function createClient(body){
            accountsService.createClient(body).then(function(adv){
                if (adv.status === "OK" || adv.status === "success") {
                   // accountsService.createAdvertiserUnderClient($scope.client.id, adv.data.data.id).then(function (result) {
                      //  if (result.status === "OK" || result.status === "success") {
                            $scope.fetchAllClients();
                            $scope.close();
                            //$scope.resetBrandAdvertiserAfterEdit();
                        //}
                    //},function(err){
                    //    console.log('error')
                    //});
                }
            });
        }

        function createBillableBody(){
            var respBody = {};
            respBody.name = $scope.clientName;
            return respBody;
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
                respBody.clientType = $scope.clientType;
                respBody.currency = $scope.currencySelected;
                respBody.referenceId = $scope.referenceId;
                respBody.billableAccountId = $scope.billableAccountId;
                respBody.parentId = 1; //temp hardcoded
                respBody.timezone = $scope.timezone;
            }

            return respBody;
        }
    });
}());
