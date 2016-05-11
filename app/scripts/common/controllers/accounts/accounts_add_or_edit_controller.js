var angObj = angObj || {};

define(['angularAMD', '../../../workflow/services/account_service', 'common/services/constants_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEdit', function ($scope, $rootScope, $modalInstance,
        accountsService, constants) {

        var _currCtrl = this;
        _currCtrl.isAdChoiceInClient = false;
        $scope.selectedIABCategory = "Select Category";
        $scope.currencySelected = '';
        $scope.selectedBillType = 'Select';
        $scope.selectedRateType = 'Select';
        $scope.referenceId;
        getCountries();
        getTimezones();
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
            accountsService.getIABCategoryForClient($scope.clientObj.id).then(function(res){
                if((res.status === 'OK' || res.status === 'success') && res.data.data) {
                    $scope.selectedIABCategory = res.data.data.category;
                    $scope.selectedIABCategoryId = res.data.data.id;
                }
            },function(err){

            })
        }
        _currCtrl.saveIABCategory = function(){
            var reqBody = {
                name: $scope.selectedIABCategory,
                id: $scope.selectedIABCategoryId
            }
            accountsService.saveIABCategoryForClient($scope.clientObj.id, reqBody).then(function(res){
                if((res.status === 'OK' || res.status === 'success') && res.data.data) {
                }
            },function(err){

            });
        }
        _currCtrl.getAdChoiceData = function(){
            accountsService.getAdChoiceDataFromClient($scope.clientObj.id).then(function(res){
                _currCtrl.isAdChoiceInClient = false;
                if((res.status === 'OK' || res.status === 'success') && res.data.data) {
                    _currCtrl.isAdChoiceInClient = true;
                    $scope.enableAdChoice = res.data.data.enabled;
                    $scope.adChoiceCode = res.data.data.code;
                }
            },function(err){
            });
        }
        _currCtrl.saveAdChoiceData = function(){
            if(typeof $scope.enableAdChoice == "undefined"){
                return true;
            }
            var reqBody = {
                enabled: $scope.enableAdChoice,
                code: $scope.adChoiceCode
            }
            accountsService.saveAdChoiceDataForClient($scope.clientObj.id, reqBody).then(function(res){
            },function(err){
            })
        }
        _currCtrl.getAdnlData = function(){
            _currCtrl.getAdChoiceData();
        //    _currCtrl.getIABCategory();
        }
        _currCtrl.saveAdnlData = function(){
            _currCtrl.saveAdChoiceData();
        //    _currCtrl.saveIABCategory();
        }
        if ($scope.mode === 'edit') {
            $scope.clientName = $scope.clientObj.name;
            $scope.clientType = $scope.clientObj.clientType;
            $scope.selectedCurrency = $scope.clientObj.currency && $scope.clientObj.currency.currencyCode;
            $scope.selectedCurrencyId = $scope.clientObj.currency && $scope.clientObj.currency.id;
            $scope.selectedCountryId = $scope.clientObj.country && $scope.clientObj.country.id;
            $scope.selectedCountry = $scope.clientObj.country && $scope.clientObj.country.name;
            $scope.timezone = $scope.clientObj.timezone;
            _currCtrl.getAdnlData();
            setTimeout(function(){
                $("#geography").addClass("disabled");
            },100);
        }
        $scope.showUserModeText = function(){
            return ($scope.mode === "create" ? 'Add Account' : 'Edit Account ( '+$scope.clientObj.name+' )');
        }
        $scope.close = function () {
            $modalInstance.dismiss();
            $scope.resetBrandAdvertiserAfterEdit();
        };

        $scope.setSelectedClientType = function (type) {
            $scope.clientType = type;
//            accountsService[type === 'MARKETER' ? 'getAllAdvertisers' : 'getAgencies']().then(function (result) {
//                $scope.allAdvertiser = result.data.data;
//            });
        };

        $scope.selectClientAdvertiser = function (advertiser) {
            $scope.dropdownCss.display = 'none';
            $scope.clientName = advertiser.name;
            $scope.referenceId = advertiser.id;
        };
        $scope.show_respective_method = function(type){
            $scope.selectedBillType = type;
        }
        _currCtrl.verifyInput = function(){
            var ret = true,
                err = "";
            if(!$scope.clientType || $scope.clientType == ""){
                err = constants.SELECT_CLIENT_TYPE;
                ret = false;
            }else if(!$scope.clientName || $scope.clientName == ""){
                err = constants.SELECT_CLIENT_NAME;
                ret = false;
            } else if(!$scope.selectedCurrency || $scope.selectedCurrency == ""){
                err = constants.SELECT_CURRENCY;
                ret = false;
            } else if(!$scope.selectedCountry || $scope.selectedCountry == ""){
                err = constants.SELECT_GEOGRAPHY;
                ret = false;
            } else if(!$scope.timezone || $scope.timezone == ""){
                err = constants.SELECT_TIMEZONE;
                ret = false;
            }
            if(!ret){
                $rootScope.setErrAlertMessage(err);
            }
            return ret;
        }
        $scope.saveClients = function () {
            if(!_currCtrl.verifyInput()){
                return true;
            }
            var clientObj,
                body,
                billableBody,
                createBillableAccount;
            if ($scope.mode === 'edit') {
                clientObj =  accountsService.getToBeEditedClient();
                body = constructRequestBody(clientObj);
                accountsService
                    .updateClient(body, body.id)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.close();
                            $scope.fetchAllClients();
                            $rootScope.setErrAlertMessage('Account updated successfully', 0);
                            $scope.resetBrandAdvertiserAfterEdit();
                            delete $scope.clientsDetails[body.parentId];
                            if(body.parentId) {
                                $scope.getSubClientList('ev', {id: body.parentId});
                            }
                            _currCtrl.saveAdnlData();
                        }
                    });
            } else {
                if($scope.isCreateTopClient){
                    accountsService
                        .createBillableAccount(createBillableBody())
                        .then(function (result) {
                            //  var body;
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.billableAccountId = result.data.data.id;
                                body = constructRequestBody();
                                createClient(body);
                            }
                        });
                }else{
                    accountsService.getClient($scope.clientObj).then(function(res){
                        if (res.status === 'OK' || res.status === 'success') {
                            body = constructRequestBody();
                            body.billableAccountId = res.data.data.billableAccountId;
                            body.parentId = $scope.clientObj;
                            createClient(body);
                        }
                    },function(err){

                    });
                }
            }
        };

        function createClient(body) {
            accountsService
                .createClient(body)
                .then(function (adv) {
                    if (adv.status === 'OK' || adv.status === 'success') {
                        $scope.fetchAllClients();
                        $scope.close();
                        _currCtrl.saveAdnlData();
                        $rootScope.setErrAlertMessage('Account created successfully', 0);
                    }
                });
        }

        function createBillableBody() {
            var respBody = {
                name: $scope.clientName
            };

            return respBody;
        }

        function constructRequestBody(obj) {
            var respBody = {
                name: $scope.clientName
            };

            if ($scope.mode === 'edit') {
                respBody.id = obj.id;
                respBody.updatedAt = obj.updatedAt;
                respBody.billableAccountId = obj.billableAccountId;
                respBody.clientType = $scope.clientType;
                respBody.referenceId = obj.referenceId;
                respBody.timezone = $scope.timezone;
                respBody.currency = Number($scope.selectedCurrencyId);
                respBody.countryId=Number($scope.selectedCountryId);
                if(!$scope.isCreateTopClient) {
                    respBody.parentId = obj.parentId;
                }
            } else {
                respBody.billableAccountId = $scope.billableAccountId;
                respBody.clientType = $scope.clientType;
                respBody.currency = Number($scope.selectedCurrencyId);
                respBody.countryId=Number($scope.selectedCountryId);
                respBody.referenceId = $scope.referenceId;
                respBody.timezone = $scope.timezone;
                respBody.billableAccountId = $scope.billableAccountId;
                //temp hardcoded
//                if(!$scope.isCreateTopClient) {
//                    respBody.parentId = 1;
//                }
            }
            return respBody;
        }

        function getCountries() {
            accountsService
                .getCountries()
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.Geography = result.data.data;
                    }
                });
        }

        function getTimezones() {
            $scope.timezones = {
                'EST'        : 'Eastern Standard Time(UTC-05:00)',
                'US/Eastern' : 'Eastern Time',
                'US/Central' : 'Central Standard Time(UTC-06:00)',
                'US/Mountain': 'Mountain Standard Time(UTC-07:00)',
                'US/Pacific' : 'Pacific Standard Time(UTC-08:00)',
                'UTC'        : 'UTC',
                'GB'         : 'British Summer Time (UTC+01:00)'
            };
        }
        $scope.$on("$locationChangeSuccess", function(){
            $scope.close();
        });
        $scope.selectCurrency = function(curr){
            $scope.selectedCurrency = curr.currencyCode;
            $scope.selectedCurrencyId = curr.id;
        }
        $scope.selectCountry = function(country){
            $scope.selectedCountry = country.name;
            $scope.selectedCountryId = country.id;
        }
        $scope.selectTimeZone = function(timezone){
            $scope.timezone=timezone;
        }

    });
});
