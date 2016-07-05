var angObj = angObj || {};

define(['angularAMD', '../../../workflow/services/account_service', // jshint ignore:line
    '../../services/constants_service', 'common/moment_utils', 'workflow/directives/custom_date_picker',
    'common/services/data_service', 'common/services/url_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEditAdvertiser', function ($scope, $rootScope, $modalInstance,
                                                                   accountsService, constants, momentService,
                                                                   dataService, urlService) {
        var _currCtrl = this,
            selectedBillingTypeName;

        _currCtrl.downloadPixelIds = [];

        _currCtrl.getIABCategoryList = function () {
            accountsService
                .getIABCategoryList()
                .then(function (res) {
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        $scope.advertiserAddOrEditData.IABCategoryList = res.data.data;
                    }
                }, function (err) {
                    console.log('Error = ', err);
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

        _currCtrl.verifyCreateAdvInputs = function () {
            var ret = true,
                errMsg = 'Error';

            if ($scope.advertiserCodeExist){
                return false;
            }

            if (!$scope.selectedAdvertiserId || $scope.selectedAdvertiserId === '') {
                $rootScope.setErrAlertMessage(constants.EMPTY_ADV_SELECTION);
                return false;
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
                clientId: $scope.client.id,
                lookbackImpressions : 14,
                lookbackClicks : 14,
                adChoice: '',
                iabCategoryId: null,
                techBillingTypeId: null,
                techBillingValue: null,
                serviceBillingTypeId: null,
                serviceBillingValue: null,
                costBillingTypeId: null,
                costBillingValue: null
            };

            if (!$scope.isEditMode){
                requestData.code = $scope.setSelectedAdvertiserCode === 'Others' ?
                    $scope.customAdvertiserCode :
                    $scope.setSelectedAdvertiserCode;
            }

            if ($scope.advertiserAddOrEditData.adChoiceCode) {
                requestData.adChoice = $scope.advertiserAddOrEditData.adChoiceCode;
            }

            if ($scope.advertiserAddOrEditData.selectedIABSubCategoryId) {
                requestData.iabCategoryId = Number($scope.advertiserAddOrEditData.selectedIABSubCategoryId);
            } else {
                if ($scope.advertiserAddOrEditData.selectedIABCategory) {
                    requestData.iabCategoryId = Number($scope.advertiserAddOrEditData.selectedIABCategoryId);
                }
            }

            if ($scope.billingData.techFees.billingValue) {
                requestData.techBillingTypeId = Number($scope.billingData.techFees.billingTypeId);
                requestData.techBillingValue = Number($scope.billingData.techFees.billingValue);
            }

            if ($scope.billingData.serviceFees.billingValue) {
                requestData.serviceBillingTypeId = Number($scope.billingData.serviceFees.billingTypeId);
                requestData.serviceBillingValue = Number($scope.billingData.serviceFees.billingValue);
            }

            if ($scope.billingData.cost.billingValue) {
                requestData.costBillingTypeId = Number($scope.billingData.cost.billingTypeId);
                requestData.costBillingValue = Number($scope.billingData.cost.billingValue);
            }

            accountsService
                .createAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
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
                    } else {
                        $rootScope.setErrAlertMessage(result.data.data.message);
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

        function addPixeltoAdvertiserUnderClient(clientId, advId) { // jshint ignore:line
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
            _.each($scope.advertiserData.pixels, function (item, index) { // jshint ignore:line
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

        function constructRequestBody(obj) { // jshint ignore:line
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
                        saveAs(res.file, res.fileName); // jshint ignore:line
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
                _currCtrl.downloadPixelIds =
                    _.filter(_currCtrl.downloadPixelIds, function (item) { // jshint ignore:line
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
                _currCtrl.downloadPixelIds = _.pluck($scope.advertiserData.pixels, 'id'); // jshint ignore:line
            } else {
                $scope.advertiserData.disableDownLoadPixel = true;
                _currCtrl.downloadPixelIds = [];
            }
        };

        $scope.checkDuplicatePixel = function (name) {
            $scope.advertiserAddOrEditData.duplicatePixelName = false;

            _.each($scope.advertiserData.pixels, function (item, i) { // jshint ignore:line
                if (!$scope.advertiserAddOrEditData.duplicatePixelName) {
                    $scope.advertiserAddOrEditData.duplicatePixelName =
                        ((item.name === name) && ($scope.pixelIndex !== i)) ? true : false;
                }
            });
        };

        $scope.leaveFocusCustomAdvertiserCode = function(){
            accountsService
                .checkAdvertiserCodeExist($scope.customAdvertiserCode)
                .then(function(result){
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.advertiserCodeExist = result.data.data.isExists;
                    }
                }, function (err) {
                    console.log('Error = ', err);
                });
        };

        $scope.selectAdvertiser = function (advertiser) {
            $scope.selectedAdvertiserId = advertiser.id;
            $scope.selectedAdvertiser = advertiser.name;
        };

        $scope.selectAdvertiserCode = function(ev, code){
            $scope.setSelectedAdvertiserCode = code;
        };

        //Search Hide / Show
        $scope.searchShowInput = function () {
            var searchInputForm = $('.searchInputForm');

            $('.searchInputBtn').hide();
            $('.searchInputBtnInline').show();
            searchInputForm.show();
            searchInputForm.animate({width: '250px'}, 'fast');
        };

        $scope.searchHideInput = function () {
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

        _currCtrl.getIABCategoryList();

        getBillingTypes();

        if ($scope.isEditMode) {
            // Prefill saved data for editing
            $scope.selectedAdvertiserId = $scope.savedAdvertiserData.advertiserId;

            // 1. Ad Choice
            $scope.advertiserAddOrEditData.adChoiceCode = $scope.savedAdvertiserData.adChoice;

            // 2. IAB Category
            if ($scope.savedAdvertiserData.iabCategory) {
                $scope.advertiserAddOrEditData.selectedIABCategory = $scope.savedAdvertiserData.iabCategory.groupName;
                $scope.advertiserAddOrEditData.selectedIABCategory = $scope.savedAdvertiserData.iabCategory.groupName;
                $scope.advertiserAddOrEditData.selectedIABCategoryId = $scope.savedAdvertiserData.iabCategory.groupId;

                // If sub-category has been selected & saved
                if ($scope.savedAdvertiserData.iabCategory.groupName !== $scope.savedAdvertiserData.iabCategory.name) {
                    $scope.advertiserAddOrEditData.selectedIABSubCategory = $scope.savedAdvertiserData.iabCategory.name;
                    $scope.advertiserAddOrEditData.selectedIABSubCategoryId = $scope.savedAdvertiserData.iabCategory.id;
                } else {
                    $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';
                    $scope.advertiserAddOrEditData.selectedIABSubCategoryId = null;
                }

                _currCtrl.getIABSubCategoryList($scope.advertiserAddOrEditData.selectedIABCategoryId);
            } else {
                $scope.advertiserAddOrEditData.selectedIABCategory = 'Select';
                $scope.advertiserAddOrEditData.selectedIABCategoryId = null;
                $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';
                $scope.advertiserAddOrEditData.selectedIABSubCategoryId = null;
            }

            // 3. Billing
            if ($scope.savedAdvertiserData.techBillingTypeId) {
                $scope.billingData.techFees.billingTypeId = $scope.savedAdvertiserData.techBillingTypeId;
                $scope.billingData.techFees.billingTypeName = 'CPM';
                $scope.billingData.techFees.billingValue = $scope.savedAdvertiserData.techBillingValue;
            }

            if ($scope.savedAdvertiserData.serviceBillingTypeId) {
                $scope.billingData.serviceFees.billingTypeId = $scope.savedAdvertiserData.serviceBillingTypeId;

                if (parseInt($scope.savedAdvertiserData.serviceBillingTypeId) === 8) {
                    $scope.billingData.serviceFees.billingTypeName = 'CPM';
                } else if (parseInt($scope.savedAdvertiserData.serviceBillingTypeId) === 6) {
                    $scope.billingData.serviceFees.billingTypeName = 'COG+ %';
                }

                $scope.billingData.serviceFees.billingValue = $scope.savedAdvertiserData.serviceBillingValue;
            }

            if ($scope.savedAdvertiserData.costBillingTypeId) {
                $scope.billingData.cost.billingTypeId = $scope.savedAdvertiserData.costBillingTypeId;
                if (parseInt($scope.savedAdvertiserData.costBillingTypeId) === 6) {
                    $scope.billingData.cost.billingTypeName = 'COG+ %';
                }
                $scope.billingData.cost.billingValue = $scope.savedAdvertiserData.costBillingValue;
            }

            setTimeout(function () {
                $('#advertiser, .setSelectedAdvertiserCode').addClass('disabled');
            }, 100);
        } else {
            // Create mode
            $scope.advertiserAddOrEditData.selectedIABCategory = 'Select';
            $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';
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
