var angObj = angObj || {};

define(['angularAMD','../../../workflow/services/account_service', '../../services/constants_service', 'common/moment_utils'
    ,'workflow/directives/custom_date_picker'],function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEditAdvertiser', function ($scope, $rootScope, $modalInstance,
        accountsService, constants, momentService) {

        var _currCtrl = this;
        $scope.close=function () {
            $scope.resetBrandAdvertiserAfterEdit();
            $modalInstance.dismiss();
        };
        $(".miniTabLinks.sub .btn").removeClass("active");
        $(".miniTabLinks.sub .subBasics").addClass("active");
        $modalInstance.opened.then(function() {
            $('popup-msg').appendTo(document.body);
        });
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
                    }else if(!item.expiryDate || item.expiryDate == ""){
                        errMsg = constants.EMPTY_PIXEL_EXPIREAT;
                        ret = false;
                    }
                }
            });
            if(!ret) {
                $rootScope.setErrAlertMessage(errMsg);
            }
            return ret;
        }
        $scope.saveAdvertisers = function(){
            if(!_currCtrl.verifyCreateAdvInputs()){
                return;
            }
//            if($scope.isEditMode){
//                createAdvertiserUnderClient($scope.selectedAdvertiserId);
//            }else{
            createAdvertiserUnderClient($scope.selectedAdvertiserId);
//            }
        };
        function createAdvertiserUnderClient(advId) {
            var requestData = {
                lookbackImpressions : Number($scope.advertiserData.lookbackImpressions),
                lookbackClicks : Number($scope.advertiserData.lookbackClicks)
            }
            accountsService
                .createAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.fetchAllAdvertisersforClient($scope.client.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();
                        if($scope.advertiserData.pixels.length) {
                            createPixelsforAdvertiser($scope.clientId, advId);
                        }else{
                            //$scope.fetchAllAdvertisersforClient($scope.client.id);
                            $scope.fetchAllClients();
                        }
                        if($scope.isEditMode){
                            $rootScope.setErrAlertMessage('Advertiser updated successfully', 0);
                        }else{
                            $rootScope.setErrAlertMessage('Advertiser add successfully', 0);
                        }
                    }else{
                    }
                }, function (err) {
                    $scope.close();
                    if($scope.isEditMode){
                        $rootScope.setErrAlertMessage('Error in updating advertiser under client.', 0);
                    }else {
                        $rootScope.setErrAlertMessage('Error in creating advertiser under client.');
                    }
                });
        }
        function addPixeltoAdvertiserUnderClient(clientId, advId){
            var requestData = {
                lookbackImpressions : Number($scope.advertiserData.lookbackImpressions),
                lookbackClicks : Number($scope.advertiserData.lookbackClicks)
            }
            accountsService
                .updateAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $rootScope.setErrAlertMessage('Pixels added successfully', 0);
                    }else{
                        $scope.close();
                        $rootScope.setErrAlertMessage(constants.ERR_ADD_PIXEL);
                    }
                }, function (err) {
                    $scope.close();
                    $rootScope.setErrAlertMessage(constants.ERR_ADD_PIXEL);
                });
        }
        function getRequestDataforPixel(clientId, advertiserId){
            var id = null;
            _.each($scope.advertiserData.pixels, function(item, index){
                $scope.advertiserData.pixels[index] = {
                    name : item.name,
                    clientId : clientId,
                    advertiserId : advertiserId,
                    pixelType : item.pixelType,
                    poolSize : 0,
                    description: item.description,
                    createdBy: item.createdBy,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    expiryDate: momentService.newMoment(item.expiryDate).format('YYYY-MM-DD HH:MM:SS.SSS')
                }
                if(item.id){
                    $scope.advertiserData.pixels[index].id = item.id;
                }
            });
            return $scope.advertiserData.pixels;
        }
        function createPixelsforAdvertiser(clientId, advId){
            accountsService
                .createPixelsUnderAdvertiser(clientId, advId, getRequestDataforPixel(clientId, advId))
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        // $scope.fetchAllAdvertisersforClient($scope.client.id);
                        $scope.fetchAllClients();
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