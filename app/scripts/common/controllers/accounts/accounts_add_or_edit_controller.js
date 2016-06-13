var angObj = angObj || {};

define(['angularAMD', '../../../workflow/services/account_service', 'common/services/constants_service'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('AccountsAddOrEdit', function ($scope, $rootScope, $modalInstance, accountsService,
                                                             constants) {
            var _currCtrl = this,
                selectedBillingTypeName;

            _currCtrl.isAdChoiceInClient = false;

            _currCtrl.getAdChoiceData = function () {
                accountsService
                    .getAdChoiceDataFromClient($scope.clientObj.id)
                    .then(function (res) {
                        _currCtrl.isAdChoiceInClient = false;

                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                            _currCtrl.isAdChoiceInClient = true;
                            $scope.enableAdChoice = res.data.data.enabled;
                            $scope.adChoiceCode = res.data.data.code;
                        }
                    }, function (err) {
                        console.log('Error = ', err);
                    });
            };

            _currCtrl.saveAdChoiceData = function () {
                var reqBody;

                if (typeof $scope.enableAdChoice === 'undefined') {
                    return true;
                }

                reqBody = {
                    enabled: $scope.enableAdChoice,
                    code: $scope.adChoiceCode
                };

                accountsService
                    .saveAdChoiceDataForClient($scope.clientObj.id, reqBody)
                    .then(null, function (err) {
                        console.log('ERROR = ', err);
                    });
            };

            _currCtrl.getAdnlData = function () {
                _currCtrl.getAdChoiceData();
            };

            _currCtrl.saveAdnlData = function () {
                _currCtrl.saveAdChoiceData();
            };

            _currCtrl.verifyInput = function () {
                var ret = true,
                    err = '';
                if($scope.clientCodeExist){
                    return false;
                }
                if (!$scope.clientType || $scope.clientType === '') {
                    err = constants.SELECT_CLIENT_TYPE;
                    ret = false;
                } else if (!$scope.clientName || $scope.clientName === '') {
                    err = constants.SELECT_CLIENT_NAME;
                    ret = false;
                } else if (!$scope.selectedCurrency || $scope.selectedCurrency === '') {
                    err = constants.SELECT_CURRENCY;
                    ret = false;
                } else if (!$scope.selectedCountry || $scope.selectedCountry === '') {
                    err = constants.SELECT_GEOGRAPHY;
                    ret = false;
                } else if (!$scope.timezone || $scope.timezone === '') {
                    err = constants.SELECT_TIMEZONE;
                    ret = false;
                }

                if (!ret) {
                    $rootScope.setErrAlertMessage(err);
                }

                return ret;
            };

            function createBillableBody() {
                return {
                    name: $scope.clientName
                };
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
                    respBody.countryId = Number($scope.selectedCountryId);

                    if (!$scope.isCreateTopClient) {
                        respBody.parentId = obj.parentId;
                    }
                    respBody.code = $scope.setSelectedClientCode == "Others" ? $scope.customClientCode : $scope.setSelectedClientCode;
                } else {
                    respBody.billableAccountId = $scope.billableAccountId;
                    respBody.clientType = $scope.clientType;
                    respBody.currency = Number($scope.selectedCurrencyId);
                    respBody.countryId=Number($scope.selectedCountryId);
                    respBody.referenceId = $scope.referenceId;
                    respBody.timezone = $scope.timezone;
                    respBody.billableAccountId = $scope.billableAccountId;
                    respBody.code = $scope.setSelectedClientCode == "Others" ? $scope.customClientCode : $scope.setSelectedClientCode;
                }

                // TODO: This has to be modified to match with the new API
                if ($scope.billingData.techFees.billingValue) {
                    respBody.techFeesBillingTypeId = $scope.billingData.techFees.billingTypeId;
                    respBody.techFeesBillingValue = $scope.billingData.techFees.billingValue;
                }

                if ($scope.billingData.serviceFees.billingValue) {
                    respBody.serviceFeesBillingTypeId = $scope.billingData.serviceFees.billingTypeId;
                    respBody.serviceFeesBillingValue = $scope.billingData.serviceFees.billingValue;
                }
/*
 techFees: {
 name: 'Tech Fees',
 value: 'TECH_FEES',
 billingTypeId: '8',
 billingTypeName: 'CPM',
 billingValue: null
 },
 */
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
                    EST          : 'Eastern Standard Time(UTC-05:00)',
                    'US/Eastern' : 'Eastern Time',
                    'US/Central' : 'Central Standard Time(UTC-06:00)',
                    'US/Mountain': 'Mountain Standard Time(UTC-07:00)',
                    'US/Pacific' : 'Pacific Standard Time(UTC-08:00)',
                    UTC          : 'UTC',
                    GB           : 'British Summer Time (UTC+01:00)'
                };
            }

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

            function getBillingTypes() {
                accountsService
                    .getBillingTypes()
                    .then(function (res) {
                        var billingTypes;

                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                            billingTypes = res.data.data;

                            // Billing types for "Service Fees"
                            // id = 6 (COGS)
                            // id = 8 (CPM)
                            $scope.billingData.billingTypesArr =  billingTypes.filter(function (obj) {
                                return obj.id === 6 || obj.id === 8;
                            });

                            // Sort the array in desc. order so that CPM comes first
                            $scope.billingData.billingTypesArr.sort(function (a, b) {
                                return a.id < b.id;
                            });

                            // Billing data
                            if ($scope.clientObj && $scope.clientObj.billingTypeId) {
                                $scope.billingData.serviceFees.billingTypeId = $scope.clientObj.billingTypeId;

                                selectedBillingTypeName = $scope.billingData.billingTypesArr.filter(function (obj) {
                                    return obj.id === $scope.clientObj.billingTypeId;
                                });

                                $scope.billingData.serviceFees.billingTypeId = selectedBillingTypeName[0].name;
                            }
                        }
                    }, function (err) {
                        console.log('Error = ', err);
                    });
            }

            $scope.currencySelected = '';

            $scope.billingData = {
                techFees: {
                    name: 'Tech Fees',
                    value: 'TECH_FEES',
                    billingTypeId: '8',
                    billingTypeName: 'CPM',
                    billingValue: null
                },

                serviceFees: {
                    name: 'Service Fees',
                    value: 'SERVICE_FEES',
                    billingTypeId: '8',
                    billingTypeName: 'CPM',
                    billingValue: null
                },

                billingTypesArr: []
            };

            $scope.referenceId = '';

            getCountries();
            getTimezones();

            $scope.selectedBillingTypeChanged = function (billingType) {
                $scope.billingData.serviceFees.billingTypeId = billingType.id;
                $scope.billingData.serviceFees.billingTypeName = billingType.name;
                $scope.billingData.serviceFees.billingValue = null;
                $('#serviceFeesBillingValue').trigger('focus');
            };

            $scope.showUserModeText = function () {
                return ($scope.mode === 'create' ? 'Add Account' : 'Edit Account ( ' + $scope.clientObj.name + ' )');
            };

            $scope.close = function () {
                $modalInstance.dismiss();
                $scope.resetBrandAdvertiserAfterEdit();
            };
            $scope.showDropdown = function () {
                $scope.advertiserName = '';
                $scope.selectedAdvertiserId = '';
                $scope.brandName = '';
                $scope.selectedBrandId = '';
                $scope.dropdownCss.display = 'block';
                $('.account_name_list').show();
                $scope.getClientCode();
            };
            $scope.leaveFocusCustomClientCode = function(){
                $scope.clientCodeExist = false;
                $scope.customClientCode = $scope.customClientCode.replace(/ /g, "");
                $scope.textConstants.CLIENT_CODE_EXIST = constants.CLIENT_CODE_EXIST;
                if($scope.customClientCode.replace(/ /g, "").length != 5 || !(/^[a-zA-Z0-9_]*$/.test($scope.customClientCode))){
                    $scope.textConstants.CLIENT_CODE_EXIST = constants.CODE_VERIFICATION;
                    $scope.clientCodeExist = true;
                    return;
                }
                accountsService.checkClientCodeExist($scope.customClientCode).then(function(result){
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.clientCodeExist = result.data.data.isExists;
                    }
                },function(err){
                });
            }
            $scope.getClientCode = function(){
                accountsService
                    .getUserClientCode($scope.clientName).then(function(result){
                        if(result.status == "OK" || result.status == "success"){
                            var res = result.data.data;
                            if(res.length){
                                $scope.codeList = res;
                            }
                        }
                    },function(err){
                    });
            }
            $scope.setSelectedClientType = function (type) {
                $scope.clientType = type;
            };

            $scope.selectClientAdvertiser = function (advertiser) {
                $scope.dropdownCss.display = 'none';
                $scope.clientName = advertiser.name;
                $scope.referenceId = advertiser.id;
            };

            $scope.saveClients = function () {
                var clientObj,
                    body;

                if (!_currCtrl.verifyInput()) {
                    return true;
                }

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

                                if (body.parentId) {
                                    $scope.getSubClientList('ev', {id: body.parentId});
                                }

                                _currCtrl.saveAdnlData();
                            } else {
                                console.log('Failed to save data. Error = ', result.data.data.message);
                            }
                        }, function (err) {
                            console.log('Error = ', err);
                        });
                } else {
                    if ($scope.isCreateTopClient) {
                        accountsService
                            .createBillableAccount(createBillableBody())
                            .then(function (result) {
                                if (result.status === 'OK' || result.status === 'success') {
                                    $scope.billableAccountId = result.data.data.id;
                                    body = constructRequestBody();
                                    createClient(body);
                                }
                            }, function (err) {
                                console.log('Error = ', err);
                            });
                    } else {
                        accountsService
                            .getClient($scope.clientObj)
                            .then(function (res) {
                                if (res.status === 'OK' || res.status === 'success') {
                                    body = constructRequestBody();
                                    body.billableAccountId = res.data.data.billableAccountId;
                                    body.parentId = $scope.clientObj;
                                    createClient(body);
                                }
                            }, function (err) {
                                console.log('Error = ', err);
                            });
                    }
                }
            };

            $scope.$on('$locationChangeSuccess', function () {
                $scope.close();
            });

            $scope.selectCurrency = function (curr) {
                $scope.selectedCurrency = curr.currencyCode;
                $scope.selectedCurrencyId = curr.id;
            };

            $scope.selectCountry = function (country) {
                $scope.selectedCountry = country.name;
                $scope.selectedCountryId = country.id;
            };

            $scope.selectTimeZone = function (timezone) {
                $scope.timezone=timezone;
            };

            if ($scope.mode === 'edit') {
                $scope.clientName = $scope.clientObj.name;
                $scope.clientType = $scope.clientObj.clientType;
                $scope.selectedCurrency = $scope.clientObj.currency && $scope.clientObj.currency.currencyCode;
                $scope.selectedCurrencyId = $scope.clientObj.currency && $scope.clientObj.currency.id;
                $scope.selectedCountryId = $scope.clientObj.country && $scope.clientObj.country.id;
                $scope.selectedCountry = $scope.clientObj.country && $scope.clientObj.country.name;
                $scope.timezone = $scope.clientObj.timezone;
                $scope.setSelectedClientCode = $scope.clientObj.code;

                _currCtrl.getAdnlData();

                setTimeout(function () {
                    $('#geography, .setSelectedClientCode').addClass('disabled');
                }, 100);
            }

            getBillingTypes();

            if ($scope.clientObj) {
                if ($scope.clientObj.techFeesBillingValue) {
                    $scope.billingData.techFees.billingValue = $scope.clientObj.techFeesBillingValue;
                }

                if ($scope.clientObj.serviceFeesBillingValue) {
                    $scope.billingData.serviceFees.billingTypeId = $scope.clientObj.serviceFeesBillingTypeId;

                    if (parseInt($scope.clientObj.serviceFeesBillingTypeId, 10) === 6) {
                        $scope.billingData.serviceFees.billingTypeName = 'COGS+ %';
                    } else if (parseInt($scope.clientObj.serviceFeesBillingTypeId, 10) === 8) {
                        $scope.billingData.serviceFees.billingTypeName = 'CPM';
                    }

                    $scope.billingData.serviceFees.billingValue = $scope.clientObj.serviceFeesBillingValue;
                }
            }
            // End Billing & Invoice
        });
    }
);
