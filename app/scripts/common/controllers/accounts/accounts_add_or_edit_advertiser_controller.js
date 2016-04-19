var angObj = angObj || {};

define(['angularAMD','../../../workflow/services/account_service', '../../services/constants_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEditAdvertiser', function ($scope, $rootScope, $modalInstance,
                                                                    accountsService, constants) {

        var _currCtrl = this;
        $scope.close=function () {
            $scope.resetBrandAdvertiserAfterEdit();
            $modalInstance.dismiss();
        };

        _currCtrl.verifyCreateAdvInputs = function(){
            var ret = true,
                errMsg = "Error";
            if(!$scope.selectedAdvertiserId || $scope.selectedAdvertiserId == ""){
                $rootScope.setErrAlertMessage(constants.EMPTY_ADV_SELECTION);
                return false;
            }
            if(!$scope.advertiserData.lookbackImpressions || $scope.advertiserData.lookbackImpressions == ""){
                $rootScope.setErrAlertMessage(constants.EMPTY_LOOKBACK_IMPRESSION);
                return false;
            }
            if(!$scope.advertiserData.lookbackClicks || $scope.advertiserData.lookbackClicks == ""){
                $rootScope.setErrAlertMessage(constants.EMPTY_LOOKBACK_CLICK);
                return false;
            }
            _.each($scope.advertiserData.pixels, function(item){
                if(ret){
                    if(!item.name || item.name == "") {
                        errMsg = constants.EMPTY_PIXEL_FIELD;
                        ret = false;
                    }else if(!item.pixelType || item.pixelType == ""){
                        errMsg = constants.EMPTY_PIXEL_TYPE;
                        ret = false;
                    }else if(!item.expireAt || item.expireAt == ""){
                        errMsg = constants.EMPTY_PIXEL_EXPIREAT;
                        ret = false;
                    }
                }
            });
           // if(advertiserData.impressionLookBack)
            if(!ret) {
                $rootScope.setErrAlertMessage(errMsg);
            }
            return ret;
        }
        $scope.saveAdvertisers = function(){
            if(!_currCtrl.verifyCreateAdvInputs()){
                return;
            }
            console.log("$scope.selectedAdvertiserId....."+$scope.selectedAdvertiserId)

            if($scope.isEditMode){
                createPixelsforAdvertiser($scope.client.id, $scope.selectedAdvertiserId)
            }else{
                createAdvertiserUnderClient($scope.selectedAdvertiserId);
//                accountsService.createAdvertiser({name:$scope.advertiserName}).then(function (adv) {
//                    if (adv.status === 'OK' || adv.status === 'success') {
//                        createAdvertiserUnderClient(adv.data.data.id);
//                        //        createPixelsforAdvertiser();
//                    }
//                });
            }
//            var advertiserObj,
//                body;
////            createPixelsforAdvertiser($scope.client.id, 270);
////return;
//            if ($scope.mode === 'edit') {
//                advertiserObj =  accountsService.getToBeEditedAdvertiser();
//                body = constructRequestBody(advertiserObj);
//                accountsService.updateAdvertiser($scope.clientId, $scope.response.advertiserId, $scope.advertiserData).then(function (result) {
//                    if (result.status === 'OK' || result.status === 'success') {
//                        $scope.fetchAllAdvertisers($scope.client.id);
//                        $scope.close();
//                        $rootScope.setErrAlertMessage('Advertiser updated successfully', 0);
//                        $scope.resetBrandAdvertiserAfterEdit();
//                    }
//                }, function (err) {
//                    $scope.close();
//                    $rootScope.setErrAlertMessage('Error in creating advertiser');
//                });
//            }
//            else if ($scope.selectedAdvertiserId !== '') {
//                 //when user does select and existing advertiser under a client
//                createAdvertiserUnderClient($scope.selectedAdvertiserId);
//            } else {
//                accountsService.createAdvertiser({name:$scope.advertiserName}).then(function (adv) {
//                    if (adv.status === 'OK' || adv.status === 'success') {
//                        createAdvertiserUnderClient(adv.data.data.id);
//                //        createPixelsforAdvertiser();
//                    }
//                });
//            }
        };

        function createAdvertiserUnderClient(advId) {
            var requestData = {
                lookbackImpressions : $scope.advertiserData.lookbackImpressions,
                lookbackClicks : $scope.advertiserData.lookbackClicks
            }
            accountsService
                .createAdvertiserUnderClient($scope.client.id, advId, {})
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.fetchAllAdvertisersforClient($scope.client.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();
                        addPixeltoAdvertiserUnderClient($scope.client.id, advId)
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
        function addPixeltoAdvertiserUnderClient(clientId, advId){
            var requestData = {
                lookbackImpressions : $scope.advertiserData.lookbackImpressions,
                lookbackClicks : $scope.advertiserData.lookbackClicks
            }
            accountsService
                .updateAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
//                        $scope.fetchAllAdvertisersforClient($scope.client.id);
//                        $scope.resetBrandAdvertiserAfterEdit();
//                        $scope.close();
//                        createPixelsforAdvertiser($scope.client.id, advId);
                        $rootScope.setErrAlertMessage('Pixels added successfully', 0);
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
                    advertiserId : advertiserId,
                    pixelType : item.pixelType,
                    poolSize : 0,
                    description: "pixel desc",
                    createdBy: 11568,
                    createdAt: "2016-04-18 16:12:34.085",
                    updatedAt: "2016-04-18 16:12:34.085",
                    expireAt: item.expireAt
                }
            });
            return $scope.advertiserData.pixels;
        }
        function createPixelsforAdvertiser(clientId, advId){
            console.log("createPixelsforAdvertiser.....clientId..."+clientId+".....advId....."+advId);
            //var requestData = getRequestDataforPixel();
            accountsService
                .createPixelsUnderAdvertiser(clientId, advId, getRequestDataforPixel(clientId, advId))
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.fetchAllAdvertisersforClient($scope.client.id);
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
