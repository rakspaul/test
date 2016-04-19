var angObj = angObj || {};

define(['angularAMD','../../../workflow/services/account_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEditAdvertiser', function ($scope, $rootScope, $modalInstance, accountsService) {
        $scope.close=function () {
            $scope.resetBrandAdvertiserAfterEdit();
            $modalInstance.dismiss();
        };

        $scope.saveAdvertisers = function () {
            var advertiserObj,
                body;
//            createPixelsforAdvertiser($scope.client.id, 270);
//return;
            if ($scope.mode === 'edit') {
                advertiserObj =  accountsService.getToBeEditedAdvertiser();
                body = constructRequestBody(advertiserObj);
                accountsService.updateAdvertiser($scope.clientId, $scope.response.advertiserId, $scope.advertiserData).then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.fetchAllAdvertisers($scope.client.id);
                        $scope.close();
                        $rootScope.setErrAlertMessage('Advertiser updated successfully', 0);
                        $scope.resetBrandAdvertiserAfterEdit();
                    }
                }, function (err) {
                    $scope.close();
                    $rootScope.setErrAlertMessage('Error in creating advertiser');
                });
            }
            else if ($scope.selectedAdvertiserId !== '') {
                 //when user does select and existing advertiser under a client
                createAdvertiserUnderClient($scope.selectedAdvertiserId);
            } else {
                accountsService.createAdvertiser({name:$scope.advertiserName}).then(function (adv) {
                    if (adv.status === 'OK' || adv.status === 'success') {
                        createAdvertiserUnderClient(adv.data.data.id);
                //        createPixelsforAdvertiser();
                    }
                });
            }
        };

        function createAdvertiserUnderClient(advId) {
            var requestData = {
                impressionLookBack : $scope.advertiserData.impressionLookBack,
                clickLookBack : $scope.advertiserData.clickLookBack
            }
            accountsService
                .createAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.fetchAllAdvertisers($scope.client.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();
                        createPixelsforAdvertiser($scope.client.id, advId);
                        $rootScope.setErrAlertMessage('Advertiser created successfully', 0);
                    }else{
                      //  createPixelsforAdvertiser($scope.client.id, advId);
                    }
                }, function (err) {
                    //createPixelsforAdvertiser($scope.client.id, advId);
                    $scope.close();
                    $rootScope.setErrAlertMessage('Error in creating advertiser under client.');
                });
        }
        function getRequestDataforPixel(clientId, advertiserId){
            _.each($scope.advertiserData.pixels, function(item, index){
                $scope.advertiserData.pixels[index] = {
                    name : item.name,
                    clientId : clientId,
                    advertiserId : 82,
                    pixelType : item.pixelType,
                    poolSize : 0,
                    description: "pixel desc",
                    createdBy: 11568,
                    createdAt: "2016-04-18 16:12:34.085",
                    updatedAt: "2016-04-18 16:12:34.085",
                    expireAt: item.date,
                    url: item.url
                }
            });
            return $scope.advertiserData.pixels;
        }
        function createPixelsforAdvertiser(clientId, advId){
            //var requestData = getRequestDataforPixel();
            accountsService
                .createPixelsUnderAdvertiser(clientId, advId, getRequestDataforPixel(clientId, advId))
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.fetchAllAdvertisers($scope.client.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();
                        $rootScope.setErrAlertMessage('Advertiser created successfully', 0);
                    }
                }, function (err) {
                    $scope.close();
                    $rootScope.setErrAlertMessage('Error in creating advertiser under client.');
                });
        }
        function constructRequestBody(obj) {
            var respBody = {};

            if ($scope.mode === 'edit' && obj) {
                respBody.name = $scope.advertiserName;
                respBody.id = obj.id;
                respBody.updatedAt = obj.updatedAt;
            } else {
                respBody.name = $scope.advertiserName;
            }
            return respBody;
        }
    });
});
