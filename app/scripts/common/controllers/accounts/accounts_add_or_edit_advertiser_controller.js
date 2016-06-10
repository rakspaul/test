var angObj = angObj || {};

define(['angularAMD', '../../../workflow/services/account_service', '../../services/constants_service',
    'common/moment_utils', 'workflow/directives/custom_date_picker', 'common/services/data_service',
    'common/services/url_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEditAdvertiser', function ($scope, $rootScope, $modalInstance,
                                                                   accountsService, constants, momentService,
                                                                   dataService, urlService) {
        var _currCtrl = this,
            selectedBillingTypeName;

        _currCtrl.downloadPixelIds = [];

        _currCtrl.clearAdvInputField = function () {
            $scope.advertiserAddOrEditData.enableAdChoice = false;
            $scope.advertiserAddOrEditData.adChoiceCode = '';
            _currCtrl.isAdChoiceInClient = false;
            _currCtrl.isAdChoiceInAdv = false;
            $scope.advertiserAddOrEditData.resAdChoiceData = {};
        };

        _currCtrl.getIABCategoryList = function () {
            accountsService
                .getIABCategoryList()
                .then(function (res) {
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        $scope.advertiserAddOrEditData.IABCategoryList = res.data.data;
                    }
                }, function (err) {
                });
        };

        _currCtrl.getIABSubCategoryList = function (groupId) {
            accountsService
                .getIABSubCategoryList(groupId)
                .then(function (res) {
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        $scope.advertiserAddOrEditData.IABSubCategoryList = res.data.data;
                    } else {
                        console.log('Error: To get the sub-category list');
                    }
                }, function (err) {
                    console.log('Error = ', err);
                });
        };

        _currCtrl.getIABCategory = function () {
            accountsService
                .getIABCategoryForAdv($scope.client.id, $scope.selectedAdvertiserId)
                .then(function (res) {
                    var result = res.data.data;

                    _currCtrl.isAdChoiceInClient = false;

                    if ((res.status === 'OK' || res.status === 'success') && res.data.data && res.data.data.id) {
                        _currCtrl.isAdChoiceInClient = true;
                        $scope.advertiserAddOrEditData.selectedIABCategory = result.groupName;
                        $scope.advertiserAddOrEditData.selectedIABCategoryId = result.groupId;

                        if (result.groupId !== result.id) {
                            $scope.advertiserAddOrEditData.selectedIABSubCategory = result.name;
                            $scope.advertiserAddOrEditData.selectedIABSubCategoryId = result.id;
                        }

                        _currCtrl.getIABSubCategoryList($scope.advertiserAddOrEditData.selectedIABCategoryId);
                    }
                }, function (err) {
                    console.log('Error = ', err);
                });
        };

        _currCtrl.saveIABCategory = function () {
            var id = $scope.advertiserAddOrEditData.selectedIABSubCategoryId ?
                    $scope.advertiserAddOrEditData.selectedIABSubCategoryId :
                    $scope.advertiserAddOrEditData.selectedIABCategoryId,
                reqBody = {
                    iabId: id
                };

            accountsService
                .saveIABCategoryForAdv($scope.client.id, $scope.selectedAdvertiserId, reqBody)
                .then(null, function (err) {
                    console.log('Error = ', err);
                });
        };

        _currCtrl.getAdChoiceDataFromClient = function () {
            accountsService
                .getAdChoiceDataFromClient($scope.client.id, $scope.selectedAdvertiserId)
                .then(function (res) {
                    _currCtrl.isAdChoiceInClient = false;

                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        _currCtrl.isAdChoiceInClient = true;
                        $scope.advertiserAddOrEditData.enableAdChoice = res.data.data.enabled;
                        $scope.advertiserAddOrEditData.adChoiceCode = res.data.data.code;
                        $scope.advertiserAddOrEditData.resAdChoiceData = res.data.data;
                    }
                }, function (err) {
                    console.log('Error = ', err);
                });
        };

        _currCtrl.getAdChoiceData = function () {
            accountsService
                .getAdChoiceDataFromAdv($scope.client.id, $scope.selectedAdvertiserId)
                .then(function (resAdv) {
                    _currCtrl.isAdChoiceInAdv = false;

                    if ((resAdv.status === 'OK' || resAdv.status === 'success') && resAdv.data.data) {
                        _currCtrl.isAdChoiceInAdv = true;
                        $scope.advertiserAddOrEditData.enableAdChoice = resAdv.data.data.enabled;
                        $scope.advertiserAddOrEditData.adChoiceCode = resAdv.data.data.code;
                        $scope.advertiserAddOrEditData.resAdChoiceData = resAdv.data.data;
                    } else {
                        _currCtrl.getAdChoiceDataFromClient();
                    }
                }, function (err) {
                    _currCtrl.getAdChoiceDataFromClient();
                    console.log('Error = ', err);
                });
        };

        _currCtrl.saveAdChoiceData = function () {
            var reqBody = {
                enabled: $scope.advertiserAddOrEditData.enableAdChoice,
                code: $scope.advertiserAddOrEditData.adChoiceCode
            };
            if (reqBody.enabled !== $scope.advertiserAddOrEditData.resAdChoiceData.enabled ||
                reqBody.code !== $scope.advertiserAddOrEditData.resAdChoiceData.code) {
                accountsService
                    .saveAdChoiceDataForAdv($scope.client.id, $scope.selectedAdvertiserId, reqBody)
                    .then(null, function (err) {
                        console.log('Error = ', err);
                    });
            }
        };

        _currCtrl.getBillingData = function () {
            accountsService
                .getBillingDataForAdv($scope.client.id, $scope.selectedAdvertiserId)
                .then(function (res) {
                    var result = res.data.data;

                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        _.each(result, function (item) {
                            switch (item.billedFor) {
                                case 'TECH_FEES':
                                    $scope.billingData.techFees.billingTypeId = item.billingTypeId;
                                    $scope.billingData.techFees.billingTypeName = 'CPM';
                                    $scope.billingData.techFees.billingValue = item.billingValue;
                                    break;

                                case 'SERVICE_FEES':
                                    $scope.billingData.serviceFees.billingTypeId = item.billingTypeId;

                                    if (parseInt(item.billingTypeId) === 8) {
                                        $scope.billingData.serviceFees.billingTypeName = 'CPM';
                                    } else if (parseInt(item.billingTypeId) === 6) {
                                        $scope.billingData.serviceFees.billingTypeName = 'COG+ %';
                                    }

                                    $scope.billingData.serviceFees.billingValue = item.billingValue;
                                    break;

                                case 'COST':
                                    $scope.billingData.cost.billingTypeId = item.billingTypeId;

                                    if (parseInt(item.billingTypeId) === 6) {
                                        $scope.billingData.cost.billingTypeName = 'COG+ %';
                                    }

                                    $scope.billingData.cost.billingValue = item.billingValue;
                                    break;
                            }
                        });
                    }
                }, function (err) {
                    console.log('Error = ', err);
                });
        };

        _currCtrl.saveBillingData = function () {
            var list = [],
                idx = 0,
                reqBody;

            if ($scope.billingData.techFees.billingValue) {
                list[idx++] = {
                    billedFor: 'TECH_FEES',
                    billingTypeId: $scope.billingData.techFees.billingTypeId,
                    billingValue: $scope.billingData.techFees.billingValue
                };
            }

            if ($scope.billingData.serviceFees.billingValue) {
                list[idx++] = {
                    billedFor: 'SERVICE_FEES',
                    billingTypeId: $scope.billingData.serviceFees.billingTypeId,
                    billingValue: $scope.billingData.serviceFees.billingValue
                };
            }

            if ($scope.billingData.cost.billingValue) {
                list[idx++] = {
                    billedFor: 'COST',
                    billingTypeId: $scope.billingData.cost.billingTypeId,
                    billingValue: $scope.billingData.cost.billingValue
                };
            }

            _.each(list, function (item) {
                item.clientId = $scope.client.id;
                item.advertiserId = $scope.selectedAdvertiserId;
            });

            reqBody = {
                list: list
            };

            accountsService
                .saveBillingDataForAdv($scope.client.id, $scope.selectedAdvertiserId, reqBody)
                .then(null, function (err) {
                    console.log('Error = ', err);
                });
        };

        _currCtrl.saveAdnlData = function () {
            _currCtrl.saveAdChoiceData();
            _currCtrl.saveIABCategory();
            // TODO: save for BillingMethods
            _currCtrl.saveBillingData();
        };

        _currCtrl.verifyCreateAdvInputs = function () {
            var ret = true,
                errMsg = 'Error';
            if($scope.advertiserCodeExist){
                return false;
            }
            if (!$scope.selectedAdvertiserId || $scope.selectedAdvertiserId === '') {
                $rootScope.setErrAlertMessage(constants.EMPTY_ADV_SELECTION);
                return false;
            }

            if ($scope.advertiserAddOrEditData.enableAdChoice && !$scope.advertiserAddOrEditData.adChoiceCode) {
                errMsg = constants.EMPTY_ADCHOICE_CODE;
                ret = false;
            }

            if (!$scope.advertiserAddOrEditData.selectedIABCategory ||
                $scope.advertiserAddOrEditData.selectedIABCategory === 'Select') {
                errMsg = constants.EMPTY_IAB_CATEGORY;
                ret = false;
            }

            if (!ret) {
                $rootScope.setErrAlertMessage(errMsg);
            }

            return ret;
        };

        function createAdvertiserUnderClient(advId) {
            var requestData = {
                lookbackImpressions : 14,
                lookbackClicks : 14
            };
            if(!$scope.isEditMode){
                requestData['code'] = $scope.setSelectedAdvertiserCode == "Others" ? $scope.customAdvertiserCode : $scope.setSelectedAdvertiserCode;
            }
            accountsService
                .createAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        _currCtrl.saveAdnlData();
                        $scope.fetchAllAdvertisersforClient($scope.client.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();

                        if ($scope.advertiserData.pixels.length) {
                            createPixelsforAdvertiser($scope.clientId, advId);
                        } else {
                            $scope.fetchAllClients();
                        }

                        if ($scope.isEditMode) {
                            $rootScope.setErrAlertMessage('Advertiser updated successfully', 0);
                        } else {
                            $rootScope.setErrAlertMessage('Advertiser added successfully', 0);
                        }
                    }
                }, function (err) {
                    $scope.close();
                    console.log('Error = ', err);

                    if ($scope.isEditMode) {
                        $rootScope.setErrAlertMessage('Error in updating advertiser under client.', 0);
                    } else {
                        $rootScope.setErrAlertMessage('Error in creating advertiser under client.', 0);
                    }
                });
        }

        function addPixeltoAdvertiserUnderClient(clientId, advId) {
            var requestData = {
                lookbackImpressions: Number($scope.advertiserData.lookbackImpressions),
                lookbackClicks: Number($scope.advertiserData.lookbackClicks)
            };

            accountsService
                .updateAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $rootScope.setErrAlertMessage('Pixels added successfully', 0);
                    } else {
                        $scope.close();
                        $rootScope.setErrAlertMessage(constants.ERR_ADD_PIXEL);
                    }
                }, function (err) {
                    $scope.close();
                    console.log('Error = ', err);
                    $rootScope.setErrAlertMessage(constants.ERR_ADD_PIXEL);
                });
        }

        function getRequestDataforPixel(clientId, advertiserId) {
            _.each($scope.advertiserData.pixels, function (item, index) {
                $scope.advertiserData.pixels[index] = {
                    name: item.name,
                    clientId: clientId,
                    advertiserId: advertiserId,
                    pixelType: item.pixelType,
                    poolSize: 0,
                    description: item.description,
                    createdBy: item.createdBy,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    impLookbackWindow: item.impLookbackWindow,
                    clickLookbackWindow: item.clickLookbackWindow,
                    expiryDate: momentService.localTimeToUTC(item.expiryDate, 'endTime'),
                    pixelCode: item.pixelCode
                };

                if (item.id) {
                    $scope.advertiserData.pixels[index].id = item.id;
                }
            });

            return $scope.advertiserData.pixels;
        }

        function createPixelsforAdvertiser(clientId, advId) {
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
                    console.log('Error = ', err);
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
                        $scope.billingData.serviceFees.billingTypesArr =  billingTypes.filter(function (obj) {
                            return obj.id === 6 || obj.id === 8;
                        });

                        // Sort the array in desc. order so that CPM comes first
                        $scope.billingData.serviceFees.billingTypesArr.sort(function (a, b) {
                            return a.id < b.id;
                        });

                        if ($scope.clientObj && $scope.clientObj.billingTypeId) {
                            $scope.billingData.serviceFees.billingTypeId = $scope.clientObj.billingTypeId;

                            selectedBillingTypeName =
                                $scope.billingData.serviceFees.billingTypesArr.filter(function (obj) {
                                    return obj.id === $scope.clientObj.billingTypeId;
                                });

                            $scope.billingData.serviceFees.billingTypeId = selectedBillingTypeName[0].name;
                        }

                        // Billing types for "Cost"
                        // id = 6 (COGS)
                        $scope.billingData.cost.billingTypesArr =  billingTypes.filter(function (obj) {
                            return obj.id === 6;
                        });

                        $scope.billingData.cost.billingTypesArr.push({
                            id: -1,
                            name: 'Arbitrage'
                        });

                        if ($scope.clientObj && $scope.clientObj.billingTypeId) {
                            $scope.billingData.cost.billingTypeId = $scope.clientObj.billingTypeId;

                            selectedBillingTypeName = $scope.billingData.cost.billingTypesArr.filter(function (obj) {
                                return obj.id === $scope.clientObj.billingTypeId;
                            });

                            $scope.billingData.cost.billingTypeName = selectedBillingTypeName[0].name;
                        }
                    }
                }, function (err) {
                    console.log('Error = ', err);
                });
        }

        $scope.advertiserData.disableDownLoadPixel = true;

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
                billingValue: null,
                billingTypesArr: []
            },

            cost: {
                name: 'Cost',
                value: 'COST',
                billingTypeId: 6,
                billingTypeName: 'COGS+ %',
                billingValue: null,
                billingTypesArr: []
            }
        };
        $scope.selectedRateType = 'Select';

        $scope.advertiserAddOrEditData.selectedIABCategory = 'Select';
        $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';

        $scope.selectedBillingTypeChanged = function (billingType, billedFor) {
            if (billedFor === 'SERVICE_FEES') {
                $scope.billingData.serviceFees.billingTypeId = billingType.id;
                $scope.billingData.serviceFees.billingTypeName = billingType.name;
                $scope.billingData.serviceFees.billingValue = null;
                $('#serviceFeesBillingValue').trigger('focus');
            } else if (billedFor === 'COST') {
                $scope.billingData.cost.billingTypeId = billingType.id;
                $scope.billingData.cost.billingTypeName = billingType.name;
                $scope.billingData.cost.billingValue = null;

                setTimeout(function () {
                    $('#costBillingValue').trigger('focus');
                }, 0);
            }
        };

        $scope.showUserModeText = function () {
            return ($scope.mode === 'create'? 'Add Advertiser':'Edit Advertiser ( ' + $scope.advObj.name + ' )');
        };

        $scope.close = function () {
            $scope.resetBrandAdvertiserAfterEdit();
            $modalInstance.dismiss();
            _currCtrl.clearAdvInputField();
            $scope.advertiserAddOrEditData.duplicatePixelName = false;
        };

        $scope.selectIABCategory = function (type) {
            $scope.advertiserAddOrEditData.selectedIABCategory = type.name;
            $scope.advertiserAddOrEditData.selectedIABCategoryId = type.id;
            $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';
            $scope.advertiserAddOrEditData.selectedIABSubCategoryId = null;
            _currCtrl.getIABSubCategoryList(type.id);
        };

        $scope.selectIABSubCategory = function (type) {
            $scope.advertiserAddOrEditData.selectedIABSubCategory = type.name;
            $scope.advertiserAddOrEditData.selectedIABSubCategoryId = type.id;
        };

        $scope.getAdnlData = function () {
            _currCtrl.getAdChoiceData();
            _currCtrl.getIABCategory();
            // TODO: get data for BillingMethods
            _currCtrl.getBillingData();
        };

        $scope.saveAdvertisers = function () {
            if (!_currCtrl.verifyCreateAdvInputs()) {
                return;
            }

            createAdvertiserUnderClient($scope.selectedAdvertiserId);
        };

        $scope.showRespectiveMethod = function (type) {
            $scope.selectedBillType = type;
        };

        $scope.downLoadPixel = function () {
            var url = urlService.downloadAdminAdvPixel($scope.client.id, $scope.selectedAdvertiserId);

            if (!_currCtrl.downloadPixelIds.length) {
                return false;
            }

            if (_currCtrl.downloadPixelIds.length &&
                (_currCtrl.downloadPixelIds.length < $scope.advertiserData.pixels.length)) {
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
                $scope.advertiserData.disableDownLoadPixel = false;

                if (_currCtrl.downloadPixelIds.indexOf(pixelId) === -1) {
                    _currCtrl.downloadPixelIds.push(pixelId);
                }
            } else {
                _currCtrl.downloadPixelIds = _.filter(_currCtrl.downloadPixelIds, function (item) {
                    return item !== pixelId;
                });

                if (!_currCtrl.downloadPixelIds.length) {
                    $scope.advertiserData.disableDownLoadPixel = true;
                }
            }
        };

        $scope.selectAllPixels = function () {
            var checkBoxes = $('.pixelSelect');

            checkBoxes.prop('checked', !checkBoxes.prop('checked'));

            if (checkBoxes.prop('checked')) {
                $scope.advertiserData.disableDownLoadPixel = false;
                _currCtrl.downloadPixelIds = _.pluck($scope.advertiserData.pixels, 'id');
            } else {
                $scope.advertiserData.disableDownLoadPixel = true;
                _currCtrl.downloadPixelIds = [];
            }
        };

        $scope.checkDuplicatePixel = function (name) {
            $scope.advertiserAddOrEditData.duplicatePixelName = false;

            _.each($scope.advertiserData.pixels, function (item, i) {
                if (!$scope.advertiserAddOrEditData.duplicatePixelName) {
                    $scope.advertiserAddOrEditData.duplicatePixelName =
                        ((item.name === name) && ($scope.pixelIndex != i)) ? true : false;
                }
            });
        };


        $scope.leaveFocusCustomAdvertiserCode = function(){
            accountsService.checkAdvertiserCodeExist($scope.customAdvertiserCode).then(function(result){
                if (result.status === 'OK' || result.status === 'success') {
                    $scope.advertiserCodeExist = result.data.data.isExists
                }
            },function(err){});
        }
        $scope.selectAdvertiser = function (advertiser) {
            $scope.selectedAdvertiserId = advertiser.id;
            $scope.selectedAdvertiser = advertiser.name;
        };

        $scope.selectAdvertiserCode = function(ev, code){
            $scope.setSelectedAdvertiserCode = code;
        }
        //Search Hide / Show
        $scope.searchShowInput = function () {
            var searchInputForm = $('.searchInputForm');

            $('.searchInputBtn').hide();
            $('.searchInputBtnInline').show();
            searchInputForm.show();
            searchInputForm.animate({width: '250px'}, 'fast');
        };

        $scope.searchHideInput = function (evt) {
            evt && $(evt.target).hide();
            $('.searchInputForm input').val('');
            $('.searchInputBtn').show();
            $('.searchClearInputBtn, .searchInputBtnInline').hide();
            $('.searchInputForm').animate({width: '34px'}, 'fast');

            setTimeout(function () {
                $('.searchInputForm').hide();
            }, 100);
        };

        $('.miniTabLinks.sub .btn').removeClass('active');
        $('.miniTabLinks.sub .subBasics').addClass('active');

        $modalInstance
            .opened
            .then(function () {
                $('popup-msg').appendTo(document.body);
            });

        _currCtrl.clearAdvInputField();
        _currCtrl.getIABCategoryList();

        getBillingTypes();

        if ($scope.isEditMode) {
            $scope.getAdnlData();

            setTimeout(function () {
                $('#advertiser, .setSelectedAdvertiserCode').addClass('disabled');
            }, 100);
        }

        $scope.$on('$locationChangeSuccess', function () {
            $scope.close();
        });

        $('html').click(function (e) {
            if ($(e.target).closest('.searchInput').length === 0) {
                $scope.searchHideInput();
            }
        });
    });
});
