define(['angularAMD', 'admin-account-service'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('AccountsAddOrEdit', ['$scope', '$rootScope', '$modalInstance', 'adminAccountsService', 'constants','momentService','dataService','urlService',
            function ($scope, $rootScope, $modalInstance, adminAccountsService, constants, momentService, dataService, urlService) {
            var _currCtrl = this,
                selectedBillingTypeName;

            _currCtrl.isAdChoiceInClient = false;
            _currCtrl.downloadPixelIds = [];

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
                //_currCtrl.getAdChoiceData();
                _currCtrl.getPixels();
            };

            _currCtrl.saveAdnlData = function () {
                //_currCtrl.saveAdChoiceData();
                _currCtrl.savePixelData();
            };

            _currCtrl.savePixelData = function(){
                _currCtrl.createPixels();
            };

            _currCtrl.getPixels = function(){
                adminAccountsService
                    .getPixels($scope.clientObj.id)
                    .then(function (res) {
                        if (res.data.status === 'OK' || res.data.status === 'success') {
                            $scope.topCtrlData.pixels = res.data.data;

                            _.each($scope.topCtrlData.pixels, function (item, i) {
                                $scope.topCtrlData.pixels[i].pixelTypeName =
                                    (item.pixelType === 'PAGE_VIEW') ? constants.PIXEL_TYPE_PAGE_VIEW :
                                        (item.pixelType === 'AUDIENCE_CREATION') ?
                                            constants.PIXEL_TYPE_AUDIENCE_CREATION : constants.PIXEL_TYPE_RETARGETING;

                                $scope.topCtrlData.pixels[i].isFeedData = true;

                                if (item.expiryDate) {
                                    $scope.topCtrlData.pixels[i].expiryDate =
                                        momentService.utcToLocalTime(item.expiryDate,'YYYY/MM/DD');
                                }

                                $scope.topCtrlData.impLookbackWindow = item.impLookbackWindow;
                                $scope.topCtrlData.clickLookbackWindow = item.clickLookbackWindow;
                            });
                        }
                    },function () {
                    });
            };

            _currCtrl.verifyInput = function () {

                var ret = true,
                    err = '',
                    billingErrors = validateBillingData(),

                    code = $scope.setSelectedClientCode === 'Others' ?
                        $scope.clientNameData.customClientCode :
                        $scope.setSelectedClientCode;


                if (!$scope.clientType || $scope.clientType === '') {
                    err = constants.SELECT_CLIENT_TYPE;
                    ret = false;
                } else if (billingErrors && billingErrors !== ''){

                    err = billingErrors;
                    ret = false;
                }
                else if (!$scope.clientNameData.clientName || $scope.clientNameData.clientName === '') {
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

            function constructRequestBody(obj) {
                var respBody = {
                    name: $scope.clientNameData.clientName
                };

                if ($scope.mode === 'edit') {
                    respBody.id = obj.id;
                    respBody.updatedAt = obj.updatedAt;
                    respBody.isBillable = obj.isBillable;
                    respBody.clientType = $scope.clientType;
                    respBody.referenceId = obj.referenceId;
                    respBody.timezone = $scope.timezone;
                    respBody.currency = Number($scope.selectedCurrencyId);
                    respBody.countryId = Number($scope.selectedCountryId);

                    if (!$scope.isCreateTopClient) {
                        respBody.parentId = obj.parentId;
                    }

                    respBody.code = $scope.setSelectedClientCode === 'Others' ?
                        $scope.clientNameData.customClientCode :
                        $scope.setSelectedClientCode;
                } else {
                    respBody.isBillable = $scope.isBillable;
                    respBody.clientType = $scope.clientType;
                    respBody.currency = Number($scope.selectedCurrencyId);
                    respBody.countryId = Number($scope.selectedCountryId);
                    respBody.referenceId = $scope.referenceId;
                    respBody.timezone = $scope.timezone;

                    respBody.code = $scope.setSelectedClientCode === 'Others' ?
                        $scope.clientNameData.customClientCode :
                        $scope.setSelectedClientCode;
                }

                respBody.nickname = $scope.clientNameData.nickname || $scope.clientNameData.clientName;

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
                            $scope.GeographyList = $scope.Geography;
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

            function getErrorMessage(result){
                var message = '';
                var resultData = result.data.data;
                var indexes = ['name','code','currency','nickname','timezone','clientType'];

                if(resultData.data.length){
                    for(var i = 0; i < indexes.length; i++)
                        {
                            if(resultData.data[0][indexes[i]])
                            message += indexes[i] + ' ' + resultData.data[0][indexes[i]] + ' ';
                        }
                } else {
                    message = resultData.message;
                }

                return message;
            }

            function createClient(body) {
                return adminAccountsService
                    .createClient(body)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {

                            saveBillingData(result.data.data.id).then(function (result) {

                                if (result.status !== 'OK' && result.status !== 'success')
                                    $rootScope.setErrAlertMessage(result.message);
                            });

                            $scope.fetchAllClients();
                            $scope.close();
                            _currCtrl.saveAdnlData();
                          //  $rootScope.setErrAlertMessage(constants.ACCOUNT_CREATED_SUCCESSFULLY, 0);
                            return result;

                        }else {
                            $rootScope.setErrAlertMessage(getErrorMessage(result));
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

                var settingMapIds = {
                'COGS+%' : 'BILLING_TYPE_COGS_PLUS_PERCENTAGE_ID',
                'COGS+CPM' : 'BILLING_TYPE_COGS_PLUS_CPM_PERCENTAGE_ID',
                'CPM' : 'BILLING_TYPE_CPM_ID',
                'CPC' : 'BILLING_TYPE_CPC_ID',
                'CPCV' : 'BILLING_TYPE_CPCV_ID',
                'PCCPA' : 'BILLING_TYPE_PCCPA_ID',
                'TCPA' : 'BILLING_TYPE_TCPA_ID',
                'Flat Fees' : 'BILLING_TYPE_MONTHLY_FLAT_FEES_ID',
                'Flat Fee' : 'BILLING_TYPE_MONTHLY_FLAT_FEE_ID',
                '%GR' : 'BILLING_TYPE_GROSS_REVENUE_PERCENTAGE_ID',
                '%NR' : 'BILLING_TYPE_NET_REVENUE_PERCENTAGE_ID',
                'FlatFees+%' : 'BILLING_TYPE_FLATFEE_PERCENTAGE_ID'
                };

                _.each(settings, function(item,index){

                    var name = item.abbreviatedName ? item.abbreviatedName : item.name;

                    if(!settingsMap[settingMapIds[name]])
                        settingsMap[settingMapIds[name]] = item.id;
                 });

                return settingsMap;
            }

            function initBillingForm() {

                getClientBillingTypes().then(function(res){

                    if(res.status === 'OK' || res.status === 'success'){
                        getAdvertiserBillingTypes().then(function(res){
                             if(res.status === 'OK' || res.status === 'success'){

                                    var count = 0;
                                    $scope.months = [];
                                    while (count < 12) $scope.months.push({'index':count + 1,'month':moment().month(count++).format("MMMM")});

                                    $scope.years = []
                                    var year = momentService.getCurrentYear();
                                    while (year < momentService.getCurrentYear() + 10) $scope.years.push(year++);


                                    if($scope.mode === 'create'){
                                        createEmptyBillingSettings();
                                    }

                                    if($scope.mode === 'edit'){
                                        getClientBillingSettings($scope.clientObj.id);
                                        getAdvertiserBillingSettings($scope.clientObj.id);
                                    }

                                    initBillingTypeDropdown();
                             }
                        });
                    }
                });
            }



            function getClientBillingTypes() {
                return adminAccountsService
                    .getClientBillingTypes()
                    .then(function (res) {
                        var clientBillingTypesData;

                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                            clientBillingTypesData = res.data.data;

                            $scope.clientBillingTypes = mapBillingSettingTypes(clientBillingTypesData);
                            $scope.clientBillingTypesData = clientBillingTypesData;
                           }

                           return res;
                        }

                    , function (err) {
                        console.log('Error = ', err);
                    });
             }

             function getAdvertiserBillingTypes() {
                return adminAccountsService
                    .getAdvertiserBillingTypes()
                    .then(function (res) {
                        var advertiserBillingTypesData;

                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                             advertiserBillingTypesData = res.data.data;
                             $scope.advertiserBillingTypes =  mapBillingSettingTypes(advertiserBillingTypesData);
                           }
                           return res;
                        }
                    , function (err) {
                        console.log('Error = ', err);
                    });
             }

             function makeDefaultBillingSettings(clientId,billingTypes,settings){

             _.each(billingTypes, function(item,index){

                var rateTypeId = item;

                if(!settings[rateTypeId]){
                    settings[rateTypeId] = {};
                    settings[rateTypeId].clientId = clientId;
                    settings[rateTypeId].rateTypeId = item;
                    settings[rateTypeId].slices = [{'label':'', 'value':''}];
                  }

                  settings[rateTypeId].isPercent = index.indexOf('PERCENTAGE') > -1;
                  settings[rateTypeId].isPercent = (item === 21) ? false : settings[rateTypeId].isPercent;
               });

               return settings;
            }

            function createEmptyBillingSettings(){
                $scope.advertiserBillingSettings = makeDefaultBillingSettings(0,$scope.advertiserBillingTypes,{});
                $scope.clientBillingSettings = makeDefaultBillingSettings(0,$scope.clientBillingTypes,{});
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

                  $scope.clientBillingSettings =  makeDefaultBillingSettings(clientId,$scope.clientBillingTypes,$scope.clientBillingSettings);

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

                             item.useFlatFee = false;

                             if(item.rate == 1)
                                 item.useFlatFee = true;

                             if(item.slices.length > 0)
                                item.itemize = true;
                             else{
                                    item.slices.push({'label':'', 'value':''});
                                    item.itemize = false;
                                 }

                             $scope.advertiserBillingSettings[item.rateTypeId]=item;
                      });

                     $scope.advertiserBillingSettings = makeDefaultBillingSettings(clientId,$scope.advertiserBillingTypes,$scope.advertiserBillingSettings);

                           }
                        }
                    , function (err) {
                        console.log('Error = ', err);
                    });




            }

            function validateBillingDataSet(billingSettings){
                var isValid = true;

                _.each(billingSettings, function(item,index){

                    var flatFeeSelected = (typeof item.useFlatFee !== 'undefined');

                    if(item && item.rate  || flatFeeSelected){
                       if(item.rate && item.itemize){
                            var total = 0;

                            for(var i = 0 ; i < item.slices.length; i++){
                                if(item.slices[i].label && item.slices[i].label != ''){
                                    total += Number(item.slices[i].value);
                                }
                        }

                        item.isErrorMessage = '';
                        item.isError = false;

                         if(item.isPercent && (item.rate < 0  || item.rate > 100)){
                              item.isError = true;
                              item.isErrorMessage = constants.BILLING_SETTING_PERCENT_ERROR;
                              isValid = false;
                         }


                         var expectedItemizationSum = item.isPercent ? item.rate : 100;
                         var message = item.isPercent ? constants.BILLING_ITEMIZATION_PERCENT_ERROR : constants.BILLING_ITEMIZATION_SUM_ERROR;

                         if(isValid && expectedItemizationSum != total){
                              item.isError = true;
                              item.isErrorMessage = message + ' ' + expectedItemizationSum + ' percent';
                              isValid = false;
                            }

                        }
                    }
                });

                return isValid;
            }

            function validateBillingData(){
                var errors = '';
                errors = !validateBillingDataSet($scope.clientBillingSettings) ? $scope.textConstants.CLIENT_BILLING_SETTINGS_ERROR : '';
                errors += !validateBillingDataSet($scope.advertiserBillingSettings) ?  '<br /> ' + $scope.textConstants.ADVERTISER_BILLING_SETTINGS_ERROR : '';

                return errors;
            }

            function getBillingDataToSave(billingSettings,clientId){
                var settingsToSave = [],isError = false;

                _.each(billingSettings, function(item,index){

                    var flatFeeSelected = (typeof item.useFlatFee !== 'undefined');


                    if(item && item.rate  || flatFeeSelected){
                        var tempItem = {};

                        if(item.id)
                            tempItem.id = item.id;

                        tempItem.rate = Number(item.rate);
                        tempItem.rateTypeId = item.rateTypeId;
                        tempItem.clientId = clientId;
                        tempItem.startTime = item.startTime;
                        tempItem.isPercent = item.isPercent;

                        if(item.updatedAt)
                            tempItem.updatedAt = item.updatedAt;

                        if(item.rateTypeId == $scope.advertiserBillingTypes.BILLING_TYPE_MONTHLY_FLAT_FEE_ID){
                           tempItem.rate = item.useFlatFee ? 1 : 0;
                        }


                        if(item.rate && item.itemize && item.slices){

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
            };

            $scope.getClientBillingData = function(clientId){
                   adminAccountsService
                    .getClientBillingData(clientId)
                    .then(function (res) {
                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                            $scope.rateTypes = res.data.data;
                        }
                    }, function (err) {
                        console.log('Error = ', err);
                    });
            };


            getBillingTypes();

            initBillingForm();

            $scope.selectedBillingTypeChanged = function (billingType) {
                $scope.billingData.serviceFees.billingTypeId = billingType.id;
                $scope.billingData.serviceFees.billingTypeName = billingType.name;
                $scope.billingData.serviceFees.billingValue = null;
                $('#serviceFeesBillingValue').trigger('focus');
            };


            function initBillingTypeDropdown(){
                var billingSettingWithData = _.find($scope.clientBillingSettings,function(o){return o.rate > 0});
                var billingSettingType = null;

                if(billingSettingWithData)
                   billingSettingType = _.find($scope.clientBillingTypesData,function(o){return o.id == billingSettingWithData.rateTypeId});

                if(!billingSettingType)
                    billingSettingType = _.find($scope.clientBillingTypesData,function(o){return o.id == $scope.clientBillingTypes.BILLING_TYPE_MONTHLY_FLAT_FEES_ID});

                $scope.feeSlotToggle(billingSettingType);
            };

            $scope.clientNameData = {};

            $scope.textConstants = constants;

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
                $scope.clientNameData.customClientCode = $scope.clientNameData.customClientCode.replace(/ /g, '');
                $scope.textConstants.CLIENT_CODE_EXIST = constants.CLIENT_CODE_EXIST;

                if ($scope.clientNameData.customClientCode.replace(/ /g, '').length !== 5 ||
                    !(/^[a-zA-Z0-9_]*$/.test($scope.clientNameData.customClientCode))) {
                    $scope.textConstants.CLIENT_CODE_EXIST = constants.CODE_VERIFICATION;
                    $scope.clientCodeExist = true;
                    return;
                }

                adminAccountsService.checkClientCodeExist($scope.clientNameData.customClientCode).then(function(result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.clientCodeExist = result.data.data.isExists;
                    }
                },function(err) {
                    console.log('Error = ', err);
                });
            };

            $scope.getClientCode = function() {

                if ($scope.clientNameData.clientName) {
                    adminAccountsService
                        .getUserClientCode($scope.clientNameData.clientName)
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
                $scope.clientNameData.clientName = advertiser.name;
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

            $scope.downLoadPixel = function(){
                var url = urlService.downloadAdminAdvPixel($scope.clientObj.id);

                if (!_currCtrl.downloadPixelIds.length) {
                    return false;
                }

                if (_currCtrl.downloadPixelIds.length &&
                    (_currCtrl.downloadPixelIds.length <= $scope.topCtrlData.pixels.length)) {
                    url += '?ids=' + _currCtrl.downloadPixelIds.join(',');
                }

                dataService
                    .downloadFile(url)
                    .then(function (res) {
                        if (res.status === 'OK' || res.status === 'success') {
                            saveAs(res.file, res.fileName);
                            $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_SUCCESS, 0);
                        } else {
                            $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_ERR);
                        }
                    }, function (err) {
                        console.log('Error = ', err);
                        $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_ERR);
                    });
            };

            $scope.selectPixel = function (pixelId, isSelected) {
                if (isSelected) {
                    $scope.topCtrlData.disableDownLoadPixel = false;

                    if (_currCtrl.downloadPixelIds.indexOf(pixelId) === -1) {
                        _currCtrl.downloadPixelIds.push(pixelId);
                    }
                } else {
                    _currCtrl.downloadPixelIds =
                        _.filter(_currCtrl.downloadPixelIds, function (item) {
                            return item !== pixelId;
                        });

                    if (!_currCtrl.downloadPixelIds.length) {
                        $scope.topCtrlData.disableDownLoadPixel = true;
                    }
                }
            }

            $scope.saveClients = function () {
                $scope.saveAccounts = true;
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
                                          //  $rootScope.setErrAlertMessage(constants.ACCOUNT_UPDATED_SUCCESSFULLY, 0);
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
                        $scope.isBillable = true;
                        body = constructRequestBody();
                    } else {
                        $scope.isBillable = false;
                        body = constructRequestBody();
                        body.parentId = $scope.clientObj;
                    }

                    createClient(body);

                }
            };

            _currCtrl.createPixels = function(){
                var clientId = $scope.clientObj.id;
                adminAccountsService
                    .createPixels(clientId, getRequestDataforPixel(clientId))
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $rootScope.setErrAlertMessage(constants.ACCOUNT_CREATED_SUCCESSFULLY, 0);
                        }else{
                            $rootScope.setErrAlertMessage(getErrorMessage(result));
                        }
                    }, function (err) {
                        console.log("Error: Pixel updated");
                        $rootScope.setErrAlertMessage(getErrorMessage(err));
                    });
            };

            function getRequestDataforPixel(clientId){
                _.map($scope.topCtrlData.pixels, function (item, index) {
                    $scope.topCtrlData.pixels[index] = {
                        name: item.name,
                        clientId: clientId,
                        advertiserId: null,
                        pixelType: item.pixelType,
                        poolSize: 0,
                        description: item.description,
                        createdBy: item.createdBy,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        impLookbackWindow: item.impLookbackWindow,
                        clickLookbackWindow: item.clickLookbackWindow,
                        expiryDate: momentService.localTimeToUTC(item.expiryDate, 'endTime')
                    };

                    if (item.id) {
                        $scope.topCtrlData.pixels[index].id = item.id;
                    }
                });

                return $scope.topCtrlData.pixels;
            }

            $scope.filterCountries = function(){

                $scope.GeographyList = [];

                var input = $('#accountGeography').val();

                _.each($scope.Geography,function(item,index){
                  if(item.name.toLowerCase().indexOf(input.toLowerCase()) > -1){
                      $scope.GeographyList.push(item);
                  }
                });
                $('#geoDropdown').show();
            };

            $scope.$watch('selectedCountry',function(){
                     $scope.filterCountries();
            });

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
                $('#accountGeography').val($scope.selectedCountry);
                $('#geoDropdown').hide();
            };

            $scope.selectTimeZone = function (timezone) {
                $scope.timezone=timezone;
            };

            if ($scope.mode === 'edit') {
                $scope.clientNameData.clientName = $scope.clientObj.name;
                $scope.clientType = $scope.clientObj.clientType;
                $scope.selectedCurrency = $scope.clientObj.currency && $scope.clientObj.currency.currencyCode;
                $scope.selectedCurrencyId = $scope.clientObj.currency && $scope.clientObj.currency.id;
                $scope.selectedCountryId = $scope.clientObj.country && $scope.clientObj.country.id;
                $scope.selectedCountry = $scope.clientObj.country && $scope.clientObj.country.name;
                $scope.timezone = $scope.clientObj.timezone;
                $scope.setSelectedClientCode = $scope.clientObj.code;
                $scope.clientNameData.nickname = $scope.clientObj.nickname || $scope.clientObj.name;

                _currCtrl.getAdnlData();

                setTimeout(function () {
                    $('#geography, .setSelectedClientCode').addClass('disabled');
                    $('#accountGeography').attr("disabled","disabled");
                    $('#accountGeographyDD').hide();
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
