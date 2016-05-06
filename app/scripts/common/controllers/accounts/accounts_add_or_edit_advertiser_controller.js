var angObj = angObj || {};

define(['angularAMD','../../../workflow/services/account_service', '../../services/constants_service', 'common/moment_utils'
    ,'workflow/directives/custom_date_picker',
    'common/services/data_service', 'common/services/url_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEditAdvertiser', function ($scope, $rootScope, $modalInstance,
        accountsService, constants, momentService,
        dataService, urlService) {

        var _currCtrl = this;
        $scope.selectedBillType = 'Select';
        $scope.selectedRateType = 'Select';
        $scope.showUserModeText = function(){
            return ($scope.mode === 'create'? 'Add Advertiser':'Edit Advertiser ( '+$scope.advObj.name+' )');
        }
        $scope.advertiserAddOrEditData.selectedIABCategory = "Select Category";
        _currCtrl.clearAdvInputFiled = function(){
            $scope.advertiserAddOrEditData.enableAdChoice = false;
            $scope.advertiserAddOrEditData.adChoiceCode = "";
            _currCtrl.isAdChoiceInClient = false;
            _currCtrl.isAdChoiceInAdv = false;
            $scope.advertiserAddOrEditData.resAdChoiceData = {}
        }
        _currCtrl.clearAdvInputFiled();
        $scope.close=function () {
            $scope.resetBrandAdvertiserAfterEdit();
            $modalInstance.dismiss();
            _currCtrl.clearAdvInputFiled();
        };
        $(".miniTabLinks.sub .btn").removeClass("active");
        $(".miniTabLinks.sub .subBasics").addClass("active");
        $modalInstance.opened.then(function() {
            $('popup-msg').appendTo(document.body);
        });
        _currCtrl.getIABCategoryList = function(){
            accountsService.getIABCategoryList().then(function(res){
                if((res.status === 'OK' || res.status === 'success') && res.data.data) {
                    $scope.IABCategoryList = res.data.data;
                }
            },function(err){

            })
        }
        _currCtrl.getIABCategoryList();
        _currCtrl.getIABCategory = function(){
            accountsService.getIABCategoryForAdv($scope.client.id, $scope.selectedAdvertiserId).then(function(res){
                _currCtrl.isAdChoiceInClient = false;
                if((res.status === 'OK' || res.status === 'success') && res.data.data && res.data.data.id){
                    _currCtrl.isAdChoiceInClient = true;
                    $scope.advertiserAddOrEditData.selectedIABCategory = res.data.data.name;
                    $scope.advertiserAddOrEditData.selectedIABCategoryId = res.data.data.id;
                }
            },function(err){

            })
        }
        _currCtrl.saveIABCategory = function(){
            var reqBody = {
                iabId: $scope.advertiserAddOrEditData.selectedIABCategoryId
            }
            accountsService.saveIABCategoryForAdv($scope.client.id, $scope.selectedAdvertiserId, reqBody).then(function(res){
                if((res.status === 'OK' || res.status === 'success') && res.data.data) {
                }
            },function(err){

            });
        }
        _currCtrl.getAdChoiceDataFromClient = function(){
            accountsService.getAdChoiceDataFromClient($scope.client.id, $scope.selectedAdvertiserId).then(function (res) {
                _currCtrl.isAdChoiceInClient = false;
                if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                    _currCtrl.isAdChoiceInClient = true;
                    $scope.advertiserAddOrEditData.enableAdChoice = res.data.data.enabled;
                    $scope.advertiserAddOrEditData.adChoiceCode = res.data.data.code;
                    $scope.advertiserAddOrEditData.resAdChoiceData = res.data.data;
                }
            }, function (err) {
            });
        }
        _currCtrl.getAdChoiceData = function(){
            accountsService.getAdChoiceDataFromAdv($scope.client.id, $scope.selectedAdvertiserId).then(function(resAdv) {
                _currCtrl.isAdChoiceInAdv = false;
                if ((resAdv.status === 'OK' || resAdv.status === 'success') && resAdv.data.data) {
                    _currCtrl.isAdChoiceInAdv = true;
                    $scope.advertiserAddOrEditData.enableAdChoice = resAdv.data.data.enabled;
                    $scope.advertiserAddOrEditData.adChoiceCode = resAdv.data.data.code;
                    $scope.advertiserAddOrEditData.resAdChoiceData = resAdv.data.data;
                }else {
                    _currCtrl.getAdChoiceDataFromClient();
                }
            },function(err){
                _currCtrl.getAdChoiceDataFromClient();
            });
        }
        _currCtrl.saveAdChoiceData = function(){
            var reqBody = {
                enabled: $scope.advertiserAddOrEditData.enableAdChoice,
                code: $scope.advertiserAddOrEditData.adChoiceCode
            }
            if(reqBody.enabled && reqBody.code
                && (!$scope.advertiserAddOrEditData.resAdChoiceData.enabled || (
                    reqBody.enabled != $scope.advertiserAddOrEditData.resAdChoiceData.enabled ||
                     (!$scope.advertiserAddOrEditData.resAdChoiceData.code || reqBody.code != $scope.advertiserAddOrEditData.resAdChoiceData.code)
                    )
                   )
                )
            {
                accountsService.saveAdChoiceDataForAdv($scope.client.id, $scope.selectedAdvertiserId,reqBody).then(function(res){
                    if(res.status === 'OK' || res.status === 'success'){
                        // For Save Data
                    }else{
                        console.log("Error: Save Ad Choice in Advertiser");
                    }
                },function(err){
                    console.log("Error: Save Ad Choice in Advertiser");
                });
            }
        }
        $rootScope.$on('advertiserDataReceived',function(){
            $scope.getAdnlData();
        });
        $scope.selectIABCategory = function(type){
            $scope.advertiserAddOrEditData.selectedIABCategory = type.name;
            $scope.advertiserAddOrEditData.selectedIABCategoryId = type.id
        }
        $scope.getAdnlData = function(){
            _currCtrl.getAdChoiceData();
            _currCtrl.getIABCategory();
        }
        _currCtrl.saveAdnlData = function(){
            _currCtrl.saveAdChoiceData();
            _currCtrl.saveIABCategory();
        }
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
            if($scope.advertiserAddOrEditData.enableAdChoice && !$scope.advertiserAddOrEditData.adChoiceCode){
                errMsg = constants.EMPTY_ADCHOICE_CODE;
                ret = false;
            }
            if(!$scope.advertiserAddOrEditData.selectedIABCategory || $scope.advertiserAddOrEditData.selectedIABCategory == 'Select Category'){
                errMsg = constants.EMPTY_IAB_CATEGORY;
                ret = false;
            }
            if(!ret) {
                $rootScope.setErrAlertMessage(errMsg);
            }
            return ret;
        }
        $scope.saveAdvertisers = function(){
            if(!_currCtrl.verifyCreateAdvInputs()){
                return;
            }
            createAdvertiserUnderClient($scope.selectedAdvertiserId);
        };
        $scope.show_respective_method = function(type){
            $scope.selectedBillType = type;
        }
        $scope.downLoadPixel = function(){
           // accountsService.downloadAdminAdvPixel($scope.client.id, $scope.selectedAdvertiserId).then(function(res){
            dataService.downloadFile(urlService.downloadAdminAdvPixel($scope.client.id, $scope.selectedAdvertiserId)).then(function (res) {
                if(res.status === 'OK' || res.status === 'success'){
                    saveAs(res.file, res.fileName);
                    $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_SUCCESS, 0);
                }else{
                    $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_ERR)
                }
            },function(err){
                $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_ERR)
            })
        }
        function createAdvertiserUnderClient(advId) {
            var requestData = {
                lookbackImpressions : Number($scope.advertiserData.lookbackImpressions),
                lookbackClicks : Number($scope.advertiserData.lookbackClicks)
            }
            accountsService
                .createAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        _currCtrl.saveAdnlData();
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
                    expiryDate: momentService.localTimeToUTC(item.expiryDate, "endTime")//.format('YYYY-MM-DD HH:MM:SS.SSS')
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
        $scope.$on("$locationChangeSuccess", function(){
            $scope.close();
        });
    });
});