
(function() {
    'use strict';

    angObj.controller('AccountsAddOrEdit', function($scope, $modalInstance,accountsService) {
        //$scope.clientType = 'AGENCY';
        $scope.currencySelected = '';
        $scope.referenceId;

        if($scope.mode == 'edit'){
            $scope.clientName = $scope.clientObj.name;
            $scope.clientType = $scope.clientObj.clientType;
            $scope.selectedCurrency = $scope.clientObj.currency && $scope.clientObj.currency.id;
            $scope.timezone = $scope.clientObj.timezone;
        }

        $scope.close=function(){
            $modalInstance.dismiss();
            $scope.resetBrandAdvertiserAfterEdit();
        };

        $scope.setSelectedClientType = function(type){
            $scope.clientType = type;
            accountsService[type == 'MARKETER' ? 'getAllAdvertisers' : 'getAgencies']().then(function(result){
                $scope.allAdvertiser = result.data.data;
            })

            if(type == 'MARKETER'){
                accountsService.getAllAdvertisers().then(function(result){
                    $scope.allAdvertiser = result.data.data;
                })
            } else {
              accountsService.getAllAdvertisers().then(function(result){
                  $scope.allAdvertiser = result.data.data;
              })
            }
        }

        $scope.selectClientAdvertiser = function(advertiser){
            $scope.dropdownCss.display = 'none';
            $scope.clientName = advertiser.name;
            $scope.referenceId = advertiser.id;
        }

        $scope.saveClients = function(){
            if($scope.mode == 'edit'){
                var clientObj =  accountsService.getToBeEditedClient();
                var body = constructRequestBody(clientObj);
                accountsService.updateClient(body,body.id).then(function(result){
                    if (result.status === "OK" || result.status === "success") {
                        $scope.close();
                        $scope.fetchAllClients();
                        $scope.flashMessage.message = 'Account updated successfully' ;
                        $scope.msgtimeoutReset();
                        $scope.resetBrandAdvertiserAfterEdit();
                    }
                });
            }
            else{
                var billableBody = createBillableBody();
                var createBillableAccount = function() {
                  accountsService.createBillableAccount(billableBody).then(function(result){
                      if (result.status === "OK" || result.status === "success") {
                          $scope.billableAccountId = result.data.data.id;
                          var body = constructRequestBody();
                          createClient(body);
                      }
                  })
                }
                accountsService[$scope.clientType == 'MARKETER' ? 'createAdvertiser' : 'createAgencies'](billableBody).then(function(result){
                  if (result.status === "OK" || result.status === "success") {
                    $scope.referenceId = result.data.data.id;
                    createBillableAccount();
                  }
                });
            }
        }

        function createClient(body){
            accountsService.createClient(body).then(function(adv){
                if (adv.status === "OK" || adv.status === "success") {
                    $scope.fetchAllClients();
                    $scope.close();
                    $scope.flashMessage.message = 'Account created successfully' ;
                    $scope.msgtimeoutReset();
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
                respBody.clientType = $scope.clientType;
                respBody.parentId = obj.parentId;
                respBody.referenceId = obj.referenceId;
                respBody.timezone = $scope.timezone;
                respBody.currency = Number($scope.selectedCurrency);
            }
            else{
                respBody.billableAccountId = 1;
                respBody.clientType = $scope.clientType;
                respBody.currency = Number($scope.selectedCurrency);
                respBody.referenceId = $scope.referenceId;
                respBody.timezone = $scope.timezone;
                respBody.billableAccountId = $scope.billableAccountId;
                respBody.parentId = 1; //temp hardcoded
            }

            return respBody;
        }
    });
}());
