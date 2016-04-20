var angObj = angObj || {};

define(['angularAMD', '../../../workflow/services/account_service', 'common/services/constants_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEdit', function ($scope, $rootScope, $modalInstance,
                                                        accountsService, constants) {

        var _currCtrl = this;
        $scope.currencySelected = '';
        $scope.referenceId;
        getCountries();
        getTimezones();

        if ($scope.mode === 'edit') {
            $scope.clientName = $scope.clientObj.name;
            $scope.clientType = $scope.clientObj.clientType;
            $scope.selectedCurrency = $scope.clientObj.currency && $scope.clientObj.currency.id;
            $scope.selectedCountry = $scope.clientObj.country && $scope.clientObj.country.id;
            $scope.timezone = $scope.clientObj.timezone;
        }

        $scope.close = function () {
            $modalInstance.dismiss();
            $scope.resetBrandAdvertiserAfterEdit();
        };

        $scope.setSelectedClientType = function (type) {
            $scope.clientType = type;
            accountsService[type === 'MARKETER' ? 'getAllAdvertisers' : 'getAgencies']().then(function (result) {
                $scope.allAdvertiser = result.data.data;
            });
        };

        $scope.selectClientAdvertiser = function (advertiser) {
            $scope.dropdownCss.display = 'none';
            $scope.clientName = advertiser.name;
            $scope.referenceId = advertiser.id;
        };
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
                            $scope.getSubClientList('ev', {id:body.parentId});
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

                    })
                 //   body = constructRequestBody();
                 //   createClient(body);
                }
                return;
                billableBody = createBillableBody();
                createBillableAccount = function () {
                    accountsService
                        .createBillableAccount(billableBody)
                        .then(function (result) {
                            var body;

                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.billableAccountId = result.data.data.id;
                                body = constructRequestBody();
                                createClient(body);
                            }
                        });
                };
                if ($scope.clientType === 'MARKETER') {
                    accountsService
                        .createAdvertiser(billableBody)
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.referenceId = result.data.data.id;
                                createBillableAccount();
                            }
                        });
                } else if ($scope.clientType === 'AGENCY') {
                    accountsService
                        .createAgencies(billableBody)
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.referenceId = result.data.data.id;
                                createBillableAccount();
                            }
                        });
                } else {
                    createBillableAccount();
                }
            }
        };

        function createClient(body) {
            accountsService
                .createClient(body)
                .then(function (adv) {
                    if (adv.status === 'OK' || adv.status === 'success') {
                        if($scope.isCreateTopClient){
                            $scope.fetchAllClients();
                        }else{
                            delete $scope.clientsDetails[body.parentId];
                            $scope.getSubClientList('ev', {id:body.parentId});
                        }
                        $scope.close();
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
                respBody.currency = Number($scope.selectedCurrency);
                respBody.countryId=Number($scope.selectedCountry);
                if(!$scope.isCreateTopClient) {
                    respBody.parentId = obj.parentId;
                }
            } else {
                respBody.billableAccountId = $scope.billableAccountId;
                respBody.clientType = $scope.clientType;
                respBody.currency = Number($scope.selectedCurrency);
                respBody.countryId=Number($scope.selectedCountry);
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
    });
});
