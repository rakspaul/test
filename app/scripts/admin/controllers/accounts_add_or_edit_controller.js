define(['angularAMD', 'admin-account-service'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('AccountsAddOrEdit', ['$scope', '$rootScope', '$modalInstance', 'adminAccountsService', 'constants','momentService',
            function ($scope, $rootScope, $modalInstance, adminAccountsService, constants,momentService) {
            var _currCtrl = this,
                selectedBillingTypeName;

            _currCtrl.isAdChoiceInClient = false;

            _currCtrl.getAdChoiceData = function () {
                adminAccountsService
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

                adminAccountsService
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
                    err = '',

                    code = $scope.setSelectedClientCode === 'Others' ?
                        $scope.customClientCode :
                        $scope.setSelectedClientCode;

                if (!$scope.clientType || $scope.clientType === '') {
                    err = constants.SELECT_CLIENT_TYPE;
                    ret = false;
                } else if (!$scope.clientName || $scope.clientName === '') {
                    err = constants.SELECT_CLIENT_NAME;
                    ret = false;
                } else if (!code) {
                    err = constants.CODE_FIELD_EMPTY;
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

                    respBody.code = $scope.setSelectedClientCode === 'Others' ?
                        $scope.customClientCode :
                        $scope.setSelectedClientCode;
                } else {
                    respBody.billableAccountId = $scope.billableAccountId;
                    respBody.clientType = $scope.clientType;
                    respBody.currency = Number($scope.selectedCurrencyId);
                    respBody.countryId=Number($scope.selectedCountryId);
                    respBody.referenceId = $scope.referenceId;
                    respBody.timezone = $scope.timezone;
                    respBody.billableAccountId = $scope.billableAccountId;

                    respBody.code = $scope.setSelectedClientCode === 'Others' ?
                        $scope.customClientCode :
                        $scope.setSelectedClientCode;
                }

                respBody.nickname = $scope.nickname || $scope.clientName;

                if ($scope.billingData.techFees.billingValue) {
                    respBody.techFeesBillingTypeId = $scope.billingData.techFees.billingTypeId;
                    respBody.techFeesBillingValue = $scope.billingData.techFees.billingValue;
                }

                if ($scope.billingData.serviceFees.billingValue) {
                    respBody.serviceFeesBillingTypeId = $scope.billingData.serviceFees.billingTypeId;
                    respBody.serviceFeesBillingValue = $scope.billingData.serviceFees.billingValue;
                }

                return respBody;
            }

            function getCountries() {
                adminAccountsService
                    .getCountries()
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.Geography = result.data.data;
                        }
                    });
            }

            function getTimezones() {
                $scope.timezones = {
                     EST          : 'Eastern Standard Time (GMT-05:00)',
                    'US/Eastern' : 'Eastern Time',
                    'US/Alaska'  : 'Alaska Time',
                    'US/Hawaii'  : 'Hawaii Time',
                    'US/Central' : 'Central Time',
                    'US/Mountain': 'Mountain Time',
                    'US/Pacific' : 'Pacific Time',
                     UTC         : 'GMT',
                     GB          : 'British Summer Time'
                };
            }

            function createClient(body) {
                adminAccountsService
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
                adminAccountsService
                    .getBillingTypes()
                    .then(function (res) {
                        var billingTypes;

                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                            billingTypes = res.data.data;

                            // Billing types for 'Service Fees'
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



            function mapBillingSettingTypes(settings){
                var settingsMap = {};

                _.each(settings, function(item,index){
                    var name = item.abbreviatedName ? item.abbreviatedName : item.name;
                    
                    switch(name){
                        case 'COGS+%':
                            settingsMap.BILLING_TYPE_COGS_PLUS_PERCENTAGE_ID = item.id;
                            break;

                        case 'COGS+CPM':
                            settingsMap.BILLING_TYPE_COGS_PLUS_CPM_ID = item.id;
                            break;

                        case 'CPM':
                            settingsMap.BILLING_TYPE_CPM_ID = item.id;
                            break;

                        case 'CPC':
                            settingsMap.BILLING_TYPE_CPC_ID = item.id;
                            break;

                        case 'CPCV':
                            settingsMap.BILLING_TYPE_CPCV_ID = item.id;
                            break;

                        case 'PCCPA':
                            settingsMap.BILLING_TYPE_PCCPA_ID = item.id;
                            break;

                        case 'TCPA':
                            settingsMap.BILLING_TYPE_TCPA_ID = item.id;
                            break;

                        case 'Flat Fees':
                            settingsMap.BILLING_TYPE_MONTHLY_FLAT_FEES_ID = item.id;
                            break;

                        case '%GR':
                            settingsMap.BILLING_TYPE_GROSS_REVENUE_PERCENTAGE_ID = item.id;
                            break;

                        case '%NR':
                            settingsMap.BILLING_TYPE_NET_REVENUE_PERCENTAGE_ID = item.id;
                            break;

                         case 'Flat Fees+%':
                            settingsMap.BILLING_TYPE_FLATFEE_PERCENTAGE_ID = item.id;
                            break;
                    }
                 });

                return settingsMap;
            }

            function initBillingForm() {
                var count = 0;
                $scope.months = [];
                while (count < 12) $scope.months.push({'index':count + 1,'month':moment().month(count++).format("MMMM")});
                
                $scope.years = []
                var year = momentService.getCurrentYear();
                while (year < momentService.getCurrentYear() + 10) $scope.years.push(year++);
            }



            function getClientBillingTypes() {
                adminAccountsService
                    .getClientBillingTypes()
                    .then(function (res) {
                        var clientBillingTypesData;

                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                            clientBillingTypesData = res.data.data;
                         
                            $scope.clientBillingTypes = mapBillingSettingTypes(clientBillingTypesData);   
                            $scope.clientBillingTypesData = clientBillingTypesData;    
                           } 
                        }

                    , function (err) {
                        console.log('Error = ', err);
                    });
             }

                 function getAdvertiserBillingTypes() {
                adminAccountsService
                    .getAdvertiserBillingTypes()
                    .then(function (res) {
                        var advertiserBillingTypesData;                     

                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                             advertiserBillingTypesData = res.data.data;
                             $scope.advertiserBillingTypes =  mapBillingSettingTypes(advertiserBillingTypesData);                    
                           }
                        }
                    , function (err) {
                        console.log('Error = ', err);
                    });
             }

               function getClientBillingSettings(clientId){
                          adminAccountsService
                    .getClientBillingSettings(clientId)
                    .then(function (res) {

                      if ((res.status === 'OK' || res.status === 'success') && res.data.data) {  
                       var clientBillingSettings;

                     clientBillingSettings = res.data.data;
                     $scope.clientBillingSettings = {};
                      _.each(clientBillingSettings, function(item,index){

                             item.slices = [];
                             
                             for(var i = 1; i < constants.CLIENT_BILLING_SLICE_LIMIT + 1; i++){
                                var sliceLabel = item['slice' + i + 'Label'];
                                var sliceValue = item['slice' + i + 'Value'];

                                if(typeof sliceLabel !== 'undefined' && sliceLabel != ''){
                                    item.slices.push({'label' : sliceLabel, 'value' : sliceValue})
                                }                                
                             }

                             if(item.startTime){
                                item.startMonth = momentService.formatDate(item.startTime,"MMMM");
                                item.startYear = momentService.getYear(item.startTime);
                             }

                             if(item.slices.length > 0)
                                item.itemize = true;
                             else{
                                    item.slices.push({'label':'', 'value':''});
                                    item.itemize = false;
                                 }

                             $scope.clientBillingSettings[item.rateTypeId]=item;
                      }); 

                      _.each($scope.clientBillingTypes, function(item,index){
                        var rateTypeId = item;
                        
                        if(!$scope.clientBillingSettings[rateTypeId]){

                            $scope.clientBillingSettings[rateTypeId] = {};
                            $scope.clientBillingSettings[rateTypeId].clientId = clientId;
                            $scope.clientBillingSettings[rateTypeId].rateTypeId = rateTypeId; 
                            $scope.clientBillingSettings[rateTypeId].slices = [{'label':'', 'value':''}];
                        }
                      });

                      if(clientBillingSettings.length > 0){
                        $scope.seeFeeBill();
                        initBillingTypeDropdown();
                        }
                         
                        }
                       }
                    , function (err) {
                        console.log('Error = ', err);
                    });

            }


            function getAdvertiserBillingSettings(clientId){  
                     adminAccountsService
                    .getAdvertiserBillingSettings(clientId)
                    .then(function (res) {

                     if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                     var advertiserBillingSettings = res.data.data;
                      $scope.advertiserBillingSettings = {};
                      _.each(advertiserBillingSettings, function(item,index){

                             item.slices = [];
                             
                             for(var i = 1; i < constants.CLIENT_BILLING_SLICE_LIMIT + 1; i++){
                                var sliceLabel = item['slice' + i + 'Label'];
                                var sliceValue = item['slice' + i + 'Value'];

                                if(typeof sliceLabel !== 'undefined' && sliceLabel != ''){
                                    item.slices.push({'label' : sliceLabel, 'value' : sliceValue})
                                }                                
                             }

                             if(item.slices.length > 0)
                                item.itemize = true;
                             else{
                                    item.slices.push({'label':'', 'value':''});
                                    item.itemize = false;
                                 }

                             $scope.advertiserBillingSettings[item.rateTypeId]=item;
                      }); 

                      _.each($scope.advertiserBillingTypes, function(item,index){
                        var rateTypeId = item;

                        if(!$scope.advertiserBillingSettings[rateTypeId]){
                            $scope.advertiserBillingSettings[rateTypeId] = {};
                            $scope.advertiserBillingSettings[rateTypeId].clientId = clientId;
                            $scope.advertiserBillingSettings[rateTypeId].rateTypeId = item;
                            $scope.advertiserBillingSettings[rateTypeId].slices = [{'label':'', 'value':''}];
                          }
                       });                      
                                      
                           }
                        }
                    , function (err) {
                        console.log('Error = ', err);
                    });

            }

            function getBillingDataToSave(billingSettings){
                var settingsToSave = [];

                _.each(billingSettings, function(item,index){ 
                    if(item && item.rate){
                        var tempItem = {};

                        if(item.id)
                            tempItem.id = item.id;

                        tempItem.rate = Number(item.rate);
                        tempItem.rateTypeId = item.rateTypeId;    
                        tempItem.clientId = item.clientId;
                        tempItem.startTime = item.startTime;                    

                        if(item.rate && item.slices){

                            for(var i = 0 ; i < item.slices.length; i++){
                                if(item.slices[i].label && item.slices[i].label != ''){
                                    tempItem['slice'+ (i+1) + 'Label'] = item.slices[i].label;
                                    tempItem['slice'+ (i+1) + 'Value'] = item.slices[i].value;
                                }

                            }
                        }
                        settingsToSave.push(tempItem);
                    }                   
                });

                return settingsToSave;                 
            }

            $scope.addItemizationItem = function(itemizationArray){
                if(itemizationArray.length < 4)
                   itemizationArray.push({'label' : '', 'value' : ''});
            }


            $scope.deleteItemizationItem = function(itemizationArray,index){
               itemizationArray = itemizationArray.splice(index,1);
            }

           

            $scope.getClientBillingData = function(clientId){
                   adminAccountsService
                    .getClientBillingData(clientId)
                    .then(function (res) {
                        
                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                            rateTypes = res.data.data;

                            $scope.rateTypes =  rateTypes;
                          
                           }
                        }
                    , function (err) {
                        console.log('Error = ', err);
                    });
            };

            initBillingForm();
            getBillingTypes();
            getClientBillingTypes();   
            getAdvertiserBillingTypes();  

            if($scope.clientObj && $scope.clientObj.id > 0){     
                getClientBillingSettings($scope.clientObj.id);
                getAdvertiserBillingSettings($scope.clientObj.id);
            }

            $scope.selectedBillingTypeChanged = function (billingType) {
                $scope.billingData.serviceFees.billingTypeId = billingType.id;
                $scope.billingData.serviceFees.billingTypeName = billingType.name;
                $scope.billingData.serviceFees.billingValue = null;
                $('#serviceFeesBillingValue').trigger('focus');
            };

            function initBillingTypeDropdown(){            
                var billingTypeMonthlyFee =  $scope.clientBillingTypesData.find(function(o){return o.id == $scope.clientBillingTypes.BILLING_TYPE_MONTHLY_FLAT_FEES_ID});
                $scope.billingTypeName = billingTypeMonthlyFee.name; 
                $scope.feeSlotToggle(billingTypeMonthlyFee);
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

            $scope.leaveFocusCustomClientCode = function() {
                $scope.clientCodeExist = false;
                $scope.customClientCode = $scope.customClientCode.replace(/ /g, '');
                $scope.textConstants.CLIENT_CODE_EXIST = constants.CLIENT_CODE_EXIST;

                if ($scope.customClientCode.replace(/ /g, '').length !== 5 ||
                    !(/^[a-zA-Z0-9_]*$/.test($scope.customClientCode))) {
                    $scope.textConstants.CLIENT_CODE_EXIST = constants.CODE_VERIFICATION;
                    $scope.clientCodeExist = true;
                    return;
                }

                adminAccountsService.checkClientCodeExist($scope.customClientCode).then(function(result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.clientCodeExist = result.data.data.isExists;
                    }
                },function(err) {
                    console.log('Error = ', err);
                });
            };

            $scope.getClientCode = function() {
                if ($scope.clientName) {
                    adminAccountsService
                        .getUserClientCode($scope.clientName)
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                var res = result.data.data;

                                if (res.length) {
                                    $scope.codeList = res;
                                }
                            }
                        }, function (err) {
                            console.log('Error = ', err);
                        });
                }
            };

            $scope.setSelectedClientType = function (type) {
                $scope.clientType = type;
            };

            $scope.selectClientAdvertiser = function (advertiser) {
                $scope.dropdownCss.display = 'none';
                $scope.clientName = advertiser.name;
                $scope.referenceId = advertiser.id;
            };

            $scope.setStartMonth = function (month,monthIndex,feeTypeItem){
                feeTypeItem.startMonth = month; 
                if(!feeTypeItem.startTime) feeTypeItem.startTime = momentService.today();
                
                var newDate = momentService.setMonth(feeTypeItem.startTime,month); 
                feeTypeItem.startTime = momentService.setDate(newDate,1).toDate();

            }

            $scope.setStartYear = function (year,feeTypeItem){
                feeTypeItem.startYear = year;
                if(!feeTypeItem.startTime) feeTypeItem.startTime = momentService.today();
                
                var newDate = momentService.setYear(feeTypeItem.startTime,year); 
                feeTypeItem.startTime = momentService.setDate(newDate,1).toDate();   
            }

            function saveBillingData(clientId){

                var billingDataToSave = getBillingDataToSave($scope.clientBillingSettings,clientId);
                
                return adminAccountsService
                    .updateClientBillingSettings(clientId,billingDataToSave)
                        .then(function (result){
                             if (result.status === 'OK' || result.status === 'success') {
                                var advertiserBillingDataToSave = getBillingDataToSave($scope.advertiserBillingSettings,clientId);
                                return adminAccountsService
                                    .updateAdvertiserBillingSettings(clientId,advertiserBillingDataToSave);
                                        
                             }else{
                                 console.log('Failed to save data. Error = ', result.data.data.message);
                                 return result;
                             }
                        });
            };


            $scope.saveClients = function () {
                var clientObj,
                    body;

                if (!_currCtrl.verifyInput()) {
                    return true;
                }

                if ($scope.mode === 'edit') {
                    clientObj =  adminAccountsService.getToBeEditedClient();
                    body = constructRequestBody(clientObj);

                    adminAccountsService
                        .updateClient(body, body.id)
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                
                               saveBillingData(clientObj.id)
                                .then(function(result){
                                       
                                      if (result.status === 'OK' || result.status === 'success'){

                                            $scope.close();
                                            $scope.fetchAllClients();
                                            $rootScope.setErrAlertMessage('Account updated successfully', 0);
                                            $scope.resetBrandAdvertiserAfterEdit();
                                            delete $scope.clientsDetails[body.parentId];

                                            if (body.parentId) {
                                                $scope.getSubClientList('ev', {id: body.parentId});
                                            }

                                            _currCtrl.saveAdnlData();
                                        }else{
                                            console.log('Failed to save data. Error = ', result.data.data.message);
                                        }
                                    });
                            } else {
                                console.log('Failed to save data. Error = ', result.data.data.message);
                            }
                        }, function (err) {
                            console.log('Error = ', err);
                        });
                } else {
                    if ($scope.isCreateTopClient) {
                        adminAccountsService
                            .createBillableAccount(createBillableBody())
                            .then(function (result) {                                
                                if (result.status === 'OK' || result.status === 'success') {
                                    $scope.billableAccountId = result.data.data.id;
                                    body = constructRequestBody();
                                    createClient(body).then(function(result){
                                        saveBillingData().then(function(result){
                                            if(result.status!== 'OK' && result.status !== 'success')
                                                $rootScope.setErrAlertMessage(result.message);
                                        });
                                    });
                                }else{
                                    $rootScope.setErrAlertMessage(result.message);
                                }
                            }, function (err) {
                                console.log('Error = ', err);
                            });
                    } else {
                        adminAccountsService
                            .getClient($scope.clientObj)
                            .then(function (res) {
                                if (res.status === 'OK' || res.status === 'success') {
                                    body = constructRequestBody();
                                    body.billableAccountId = res.data.data.billableAccountId;
                                    body.parentId = $scope.clientObj;
                                    createClient(body).then(function(result){
                                        saveBillingData().then(function(result){
                                            if(result.status!== 'OK' && result.status !== 'success')
                                                $rootScope.setErrAlertMessage(result.message);
                                        });
                                    });
                                } else {
                                    $rootScope.setErrAlertMessage(res.message);
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
                $scope.nickname = $scope.clientObj.nickname || $scope.clientObj.name;

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

            $modalInstance
                .opened
                .then(function () {
                    $('popup-msg').appendTo(document.body);
                });

                  //Add and Edit Show-Hide
            $scope.noFeeBill = function() {
                $(".licenseFee").hide();
                $(".noFeeBill").addClass("active");
                $(".seeFeeBill").removeClass("active");
            }
            
            $scope.seeFeeBill = function() {
                $(".licenseFee").show();
                $(".seeFeeBill").addClass("active");
                $(".noFeeBill").removeClass("active");
            }
            
            $scope.feeSlotToggle = function (billingType) {
                $(".billingMethodSlot").hide();
                $(".feeSlot" + billingType.id).show();
                $scope.billingTypeName = billingType.name;
            }
            
            $scope.arbitrageBill = function() {
                $(".arbitrageBillView").show();
                $(".cogsBillView").hide();
                $(".arbitrageBill").addClass("active");
                $(".cogsBill").removeClass("active");
            }
            
            $scope.cogsBill = function() {
                $(".cogsBillView").show();
                $(".arbitrageBillView").hide();
                $(".cogsBill").addClass("active");
                $(".arbitrageBill").removeClass("active");
            }

        }]);
    }
);
