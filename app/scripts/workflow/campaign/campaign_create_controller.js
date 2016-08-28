define(['angularAMD', 'campaign-service','common-utils', 'clear-row', 'ng-upload-hidden', 'pixels-controller', 'budget-controller',
    'line-item-controller', 'confirmation-modal-controller', 'custom-date-picker', 'campaign-archive-controller',
    'decorate-numbers'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CreateCampaignController', ['$scope', '$window', '$rootScope', '$filter', '$routeParams',
        '$locale', '$location', '$timeout', '$modal', 'constants', 'workflowService', 'vistoconfig', 'loginModel',
        'momentService', 'campaignService', 'utils', 'accountService', 'urlBuilder', 'subAccountService',
        function ($scope, $window, $rootScope, $filter, $routeParams,
                                                                $locale, $location, $timeout, $modal, constants,
                                                                workflowService, vistoconfig, loginModel,
                                                                momentService, campaignService, utils,
                                                                accountService, urlBuilder, subAccountService) {
        var selectedAdvertiser,

            createCampaign = {
                campaignData: {},

                vendor: function (costCategoryId) {
                    workflowService
                        .getVendors(costCategoryId, {cache: false})
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.workflowData.vendor = result.data.data;
                            }
                        });
                },

                platforms: function () {
                    if ($scope.mode === 'create') {
                        $scope.Campaign.costArr.push({
                            costCategoryId: '',
                            costCategoryName: '',
                            type: 'variable',
                            rateTypeId: '',
                            vendorId: '',
                            vendorName: '',
                            rateValue: '',
                            targetPercentage: 100,
                            description: ''
                        });
                    }
                },

                fetchAdvertisers: function (clientId) {
                    workflowService
                        .getAdvertisers(clientId, 'write')
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                var responseData = result.data.data;
                                $scope.workflowData.advertisers = _.sortBy(responseData, 'name');
                            }
                            else {
                                createCampaign.errorHandler(result);
                            }
                        }, createCampaign.errorHandler);
                },

                fetchBrands: function (clientId, advertiserId) {
                    workflowService
                        .getBrands(clientId, advertiserId, 'write')
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.workflowData.brands = _.sortBy(result.data.data, 'name');
                            } else {
                                createCampaign.errorHandler(result);
                            }
                        }, createCampaign.errorHandler);
                },


                fetchRateTypes: function () {
                    if ($scope.selectedCampaign.advertiserId) {
                        workflowService
                            .getRatesTypes($scope.selectedCampaign.clientId,$scope.selectedCampaign.advertiserId)
                            .then(function (result) {
                                if (result.status === 'OK' || result.status === 'success') {
                                    $scope.type = result.data.data;
                                    campaignService.setRateTypes(angular.copy($scope.type));
                                }
                            });
                    }
                },

                fetchVendorConfigs: function () {
                    workflowService
                        .getVendorConfigs($scope.selectedCampaign.advertiserId, $scope.selectedCampaign.clientId, $scope.selectedCampaign.brandId)
                        .then(function (result) {
                            $scope.selectedCampaign.vendorConfig =
                                campaignService.processVendorConfig(result.data.data);
                        });
                },

                fetchCostAttributes: function () {
                    workflowService
                        .getCostAttr($scope.selectedCampaign.advertiserId, $scope.selectedCampaign.clientId, $scope.selectedCampaign.brandId)
                        .then(function (result) {
                            $scope.selectedCampaign.costAttributes = workflowService.processCostAttr(result.data.data);
                        });
                },

                fetchSystemOfRecord: function () {
                    workflowService
                        .getSystemOfRecord($scope.selectedCampaign.advertiserId, $scope.selectedCampaign.clientId, $scope.selectedCampaign.brandId)
                        .then(function (result) {
                            $scope.selectedCampaign.systemOfRecord = result.data.data;
                        });
                },

                fetchLineItemDetails: function (clientId, campaignId) {
                    workflowService
                        .getLineItem(clientId, campaignId, true)
                        .then(function (results) {
                            if (results.status === 'success' && results.data.statusCode === 200) {
                                $scope.lineItems.lineItemList = [];
                                $scope.processLineItemEditMode(results.data.data);
                            }
                        });
                },

                errorHandler: function (errData) {
                    console.log(errData);
                },

                prefillMediaPlan: function (campaignData) {

                    var advertiserObj,
                        accountData,

                        flightDateObj = {
                            startTime: momentService.utcToLocalTime(campaignData.startTime),
                            endTime: momentService.utcToLocalTime(campaignData.endTime)
                        };

                    // media plan name
                    if (campaignData.name) {
                        $scope.selectedCampaign.campaignName = $scope.cloneMediaPlanName || campaignData.name;
                        $scope.selectedCampaign.oldCampaignName = campaignData.name;
                        $scope.selectedCampaign.campaignId = campaignData.id;
                    }

                    // set Sub Account
                    if (campaignData.clientId && campaignData.clientName) {
                        $scope.selectedCampaign.clientName = campaignData.clientName;
                        $scope.selectedCampaign.clientId = campaignData.clientId;

                        accountData = accountService.getSelectedAccount();

                        if(!accountData.isLeafNode) {
                            accountData = _.find(subAccountService.getSubAccounts(), function (data) {
                                return data.id === campaignData.clientId;
                            });
                        }

                        workflowService.setAccountTimeZone(accountData.timezone);

                    } else {
                        $scope.selectedCampaign.clientId = vistoconfig.getMasterClientId();
                    }

                    // set Advertiser
                    if (campaignData.advertiserId && campaignData.advertiserName) {
                        $scope.selectedCampaign.advertiserName = campaignData.advertiserName;
                        $scope.selectedCampaign.advertiserId = campaignData.advertiserId;

                        // TODO:  // to be removed
                        advertiserObj = {'id': campaignData.advertiserId, 'name': campaignData.advertiserName};

                        $scope.selectHandler('advertiser', advertiserObj, null);
                    }

                    // set Brand
                    if (campaignData.brandId && campaignData.brandName) {
                        $scope.selectedCampaign.brandName = campaignData.brandName;
                        $scope.selectedCampaign.brandId = campaignData.brandId;
                    }

                    // set purchase Order
                    if (campaignData.purchaseOrder) {
                        $scope.selectedCampaign.purchaseOrder = campaignData.purchaseOrder;
                    }

                    // set labels
                    if (campaignData.labels && campaignData.labels.length > 0) {
                        $scope.tags = workflowService.recreateLabels(campaignData.labels);
                    }

                    $scope.mediaPlanAPIStartTime = campaignData.startTime;
                    $scope.mediaPlanAPIEndTime = campaignData.endTime;

                    if ( $scope.campaignDate) {
                        $scope.periodDays = momentService.dateDiffInDays(flightDateObj.startTime,flightDateObj.endTime);
                    }

                    $scope.newdiffDays =  momentService.dateDiffInDays(flightDateObj.startTime ,$scope.campaignDate);

                    $scope.ifClonedDateLessThanStartDate =
                        momentService.isDateBefore($scope.campaignDate , flightDateObj.startTime);

                    if ( $scope.ifClonedDateLessThanStartDate) {
                        // when the cloned date is smaller than  the media plan date
                        $scope.lessdiffDays =
                            momentService.dateDiffInDays($scope.campaignDate , flightDateObj.startTime);
                    }

                    if ( $scope.campaignDate && $scope.flightDateChosen === 'automaticFlightDates') {
                        flightDateObj.startTime = $scope.campaignDate;

                        flightDateObj.endTime =
                            momentService.addDaysCustom(flightDateObj.startTime, 'MM/DD/YYYY', $scope.periodDays);
                    }

                    // set startDate
                    if (flightDateObj.startTime) {
                        $scope.selectedCampaign.startTime = flightDateObj.startTime;
                    }

                    // set endDate
                    if (flightDateObj.endTime) {
                        $scope.selectedCampaign.endTime = flightDateObj.endTime;
                        $scope.initiateDatePicker();
                        $scope.handleEndFlightDate(flightDateObj);
                    }

                    // set updateAt value in hidden field.
                    if (campaignData.updatedAt) {
                        $scope.selectedCampaign.updatedAt = campaignData.updatedAt;
                    }

                    if (campaignData.status) {
                        $scope.selectedCampaign.status = campaignData.status;
                    }

                    // set KPI type
                    if (campaignData.kpiType) {
                        if (campaignData.kpiType.toLowerCase() === 'action rate' ||
                            campaignData.kpiType.toLowerCase() === 'impressions' ||
                            campaignData.kpiType.toLowerCase() === 'viewable impressions' ||
                            campaignData.kpiType.toLowerCase() === 'suspicious activity rate' ||
                            campaignData.kpiType.toLowerCase() === 'spend' ||
                            campaignData.kpiType.toLowerCase() === 'post click cpa' ||
                            campaignData.kpiType.toLowerCase() === 'viewable rate') {
                            $scope.kpiName = $filter('toPascalCase')(campaignData.kpiType);
                        } else {
                            $scope.kpiName = campaignData.kpiType;
                        }
                    }

                    // set Kpi Value
                    if (campaignData.kpiValue) {
                        $scope.selectedCampaign.kpiValue = campaignData.kpiValue;
                    }

                    // set Media Plan Budget & Margin
                    if (campaignData.totalBudget && campaignData.marginPercent >= 0) {
                        $scope.Campaign.totalBudget = campaignData.totalBudget;
                        $scope.Campaign.marginPercent = campaignData.marginPercent;
                        $scope.ComputeCost();
                    }

                    // set cost Data
                    if (campaignData.campaignCosts && campaignData.campaignCosts.length > 0) {
                        $scope.selectedCampaign.additionalCosts = _.filter(campaignData.campaignCosts, function (obj) {
                            return obj.costType && obj.costType.toUpperCase() === 'MANUAL';
                        });

                        if ($scope.selectedCampaign.additionalCosts.length > 0) {
                            _.each($scope.selectedCampaign.additionalCosts, function (obj) {
                                $scope.selectedCampaign.selectedCostAttr.push(obj.campaignCostObj);
                            });

                            $timeout(function () {
                                $('#budget').find('[data-target="#addAdditionalCost"]').click();
                            }, 1500);
                        }
                    }

                    // line item edit mode
                    createCampaign.fetchLineItemDetails(campaignData.clientId, campaignData.id);

                    $scope.editCampaignData = campaignData;
                }
            };

        function resetPixelMediaPlan() {
            $scope.lineItems.lineItemList = [];
            $scope.selectedCampaign.selectedPixel = [];
        }

        $scope.selectedKeywords = [];
        $scope.platformKeywords = [];

        $scope.dropdownCss = {
            display: 'none',
            'max-height': '100px',
            overflow: 'scroll',
            top: '60px',
            left: '0px'
        };

        $scope.keywordText = '';

        $scope.Campaign = {
            kpiArr: [],
            costArr: []
        };

        $scope.selectedCampaign = {};
        $scope.tags = [];
        $scope.saveCampaignClicked = false;
        $scope.platFormArr = [];
        $scope.Campaign.marginPercent = 0;
        $scope.isPrimarySelected = true;
        $scope.costRowSum = 0;
        $scope.workflowData = {};
        $scope.vendorRateData = [];
        $scope.brand = [];
        $scope.performance = [];
        $scope.Campaign.nonInventoryCost = '00.00';
        $scope.Campaign.deliveryBudget = '00.00';
        $scope.Campaign.effectiveCPM = '00.00';
        $scope.repushCampaignLoader = false;
        $scope.showSubAccount = false;

        // this is where line items created are stored
        $scope.newLineItem = {};

        $scope.lineItemName = '';
        $scope.lineItemType = {};
        $scope.lineItemType.name = 'Select Type';
        $scope.lineRate = '';
        $scope.adGroupName = '';
        $scope.lineTarget = '';
        $scope.campaignDate = '';
        $scope.flightDateChosen = '';
        $scope.isMediaPlanArchive =  false;

        $scope.checkUniqueMediaPlanNameNotFound = false;
        $scope.executionPlatforms = [];

        $scope.kpiNameList = vistoconfig.kpiList;

        $scope.kpiName = 'Action Rate';
        $scope.kpiValue = '';

        $scope.type = {};
        $scope.advertiserTypeValue = {};
        $scope.lineItems = {};
        $scope.lineItems.lineItemList = [];

        // line item create flags
        $scope.rateReadOnly = false;

        $scope.rateTypeReadOnly = false;
        $scope.volumeFlag = true;
        $scope.amountFlag = true;
        $scope.hideLineItemRate = false;
        $scope.hideAdGroupName = false;
        $scope.showPixelsList = false;
        $scope.showSystemOfRecord = true;

        // line item edit flags
        $scope.rateReadOnlyEdit = false;

        $scope.rateTypeReadOnlyEdit = false;
        $scope.volumeFlagEdit = true;
        $scope.amountFlagEdit = true;
        $scope.hideLineItemRateEdit = false;
        $scope.hideAdGroupNameEdit = false;
        $scope.showPixelsListEdit = false;

        // this is to hide flat fee in edit mode
        $scope.disableFlatFeeEdit = false;

        $scope.showSystemOfRecordEdit = true;
        $scope.editLineItem = {};
        $scope.vendorConfig = [];

        // mediaplan dates
        $scope.mediaPlanStartDate = '';

        $scope.mediaPlanSEndDate = '';

        // line item creation date
        $scope.lineItemStartDate = '';

        $scope.lineItemEndDate = '';
        $scope.mediaPlanNameExists = false;
        $scope.selectedCampaign.costAttributes = {};

        // flag to make API call to save media plan along with line item
        $scope.saveMediaPlan = false;

        $scope.periodDays = 0;
        $scope.lessdiffDays = 0;
        $scope.ifClonedDateLessThanStartDate = false;
        $scope.lineItemdiffDays = 0;
        $scope.newdiffDays = 0;

        // loader Flags - popup loader
        $scope.createNewLineItemLoader = false;
        $scope.Campaign.editLineItemLoader = false;
        $scope.bulkUploadItemLoader = false;

        // loader Flags - normal edit save button loader
        $scope.Campaign.createNewLineItemLoaderEdit = false;

        // flag for entering 0 in lineitem budget - show popup
        $scope.Campaign.showBudgetZeroPopup = false;
        $scope.Campaign.methods = '';
        $scope.Campaign.section = ''; // create or edit part of the page is clicked

        $scope.editLineItemLoaderEdit = false;
        $scope.bulkUploadItemLoaderEdit = false;

        $scope.Campaign.saveBtnLoader= false;

        if (!accountService.getSelectedAccount().isLeafNode) {
            $scope.showSubAccount = true;
        }

        $scope.initiateDatePicker = function () {
            var campaignStartTime,
                currentDateTime,
                startDateElem = $('#startDateInput'),
                endDateElem = $('#endDateInput'),
                today = momentService.utcToLocalTime();

            if ($scope.mode === 'edit' || $scope.campaignDate) {
                campaignStartTime = $scope.selectedCampaign.startTime;
                currentDateTime = momentService.utcToLocalTime();

                if (moment(campaignStartTime).isAfter(currentDateTime)) {
                    startDateElem.datepicker('setStartDate', currentDateTime);
                    startDateElem.datepicker('update', campaignStartTime);
                    startDateElem.datepicker('setEndDate', campaignStartTime);
                } else {
                    startDateElem.datepicker('setStartDate', campaignStartTime);
                    startDateElem.datepicker('setEndDate', campaignStartTime);
                    startDateElem.datepicker('update', campaignStartTime);
                }
            } else {
                $scope.selectedCampaign.startTime = today;
                $scope.selectedCampaign.endTime = today;

                startDateElem.datepicker('setStartDate', today);
                startDateElem.datepicker('update', today);

                endDateElem.datepicker('setStartDate', today);
                endDateElem.datepicker('update', today);
            }
        };

        $scope.percentageValueCheck = function (value) {
            if (($scope.kpiName.toUpperCase() === 'CTR' ||
                $scope.kpiName.toUpperCase() === 'VTC' ||
                $scope.kpiName.toUpperCase() === 'ACTION RATE' ||
                $scope.kpiName.toUpperCase() === 'SUSPICIOUS ACTIVITY RATE' ||
                $scope.kpiName.toUpperCase() === 'VIEWABLE RATE') &&
                Number(value) > 100) {
                $scope.selectedCampaign.kpiValue = 100;
            }
        };

        $scope.calculateEffective = function () {
            var ind;

            for (ind = 0; ind < $scope.Campaign.kpiArr.length; ind++) {
                if ($scope.Campaign.kpiArr[ind].isPrimary || $scope.Campaign.kpiArr[ind].isPrimary === 'true') {
                    if (angular.uppercase($scope.Campaign.kpiArr[ind].kpiType) === 'IMPRESSIONS' ||
                        angular.uppercase($scope.Campaign.kpiArr[ind].kpiType) === 'VIEWABLE IMPRESSIONS') {
                        if (parseFloat($scope.Campaign.kpiArr[ind].kpiValue) > 0) {
                            return parseFloat($scope.Campaign.deliveryBudget) /
                                parseFloat($scope.Campaign.kpiArr[ind].kpiValue) * 1000;
                        } else {
                            return 'NA';
                        }
                    } else {
                        if (parseFloat($scope.Campaign.kpiArr[ind].kpiValue) > 0) {
                            return parseFloat($scope.Campaign.deliveryBudget) /
                                parseFloat($scope.Campaign.kpiArr[ind].kpiValue);
                        } else {
                            return 'NA';
                        }
                    }
                }
            }

        };

        $scope.processEditCampaignData = function () {

            workflowService
                .getCampaignData(vistoconfig.getSelectedAccountId(), $scope.campaignId)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        if (result.data.data.isArchived) {
                            $scope.isMediaPlanArchive = true;
                        }

                        createCampaign.prefillMediaPlan(result.data.data);
                    }
                });
        };

        $scope.selectHandler = function (type, data) {
            switch (type) {
                case 'account':
                    $scope.selectedCampaign.advertiser = '';
                    $scope.selectedCampaign.advertiserName = 'Select Advertiser';
                    $scope.selectedCampaign.clientId = data.id;
                    $scope.workflowData.advertisers = [];
                    createCampaign.fetchAdvertisers(data.id);
                    $scope.mediaPlanOverviewClient = {'id':data.id,'name':data.name};
                    resetPixelMediaPlan();
                    workflowService.setAccountTimeZone(data.timezone);
                    break;

                case 'advertiser':
                    resetPixelMediaPlan();
                    $scope.workflowData.brands = [];
                    $scope.selectedCampaign.brand = '';
                    $scope.selectedCampaign.advertiserId = data.id;
                    $scope.selectedCampaign.advertiserName = data.name;
                    selectedAdvertiser = data;
                    workflowService.setSelectedAdvertiser(selectedAdvertiser);

                    if ($scope.mode === 'create') {
                        $('#brandDDL')
                            .parents('.dropdown')
                            .find('button')
                            .html('Select Brand <span class="icon-arrow-solid-down"></span>');

                        $('#advertiserDDL')
                            .parents('.dropdown')
                            .find('button')
                            .html('Select Advertiser <span class="icon-arrow-solid-down"></span>');
                    }

                    $scope.isMediaPlanNameExist();
                    createCampaign.fetchBrands($scope.selectedCampaign.clientId, data.id);
                    $scope.selectedCampaign.selectedPixel = [];
                    createCampaign.platforms(data.id);
                    createCampaign.fetchCostAttributes();
                    createCampaign.fetchVendorConfigs();

                    // for line item system of record
                    createCampaign.fetchSystemOfRecord();

                    // close new line item and reset all its fields
                    $scope.selectedCampaign.resetLineItemParameters();

                    // fetch rates for line item based on advertiser and client
                    createCampaign.fetchRateTypes();

                    $scope.$broadcast('fetch_pixels');
                    break;

                case 'brand':
                    $scope.selectedCampaign.brandId = data.id;

                    createCampaign.fetchCostAttributes();
                    createCampaign.fetchVendorConfigs();

                    // for line item system of record
                    createCampaign.fetchSystemOfRecord();
                    break;
            }
        };

        // media plan master dates handle
        $scope.handleEndFlightDate = function (data) {
            var startTime = data.startTime,
                endTime = data.endTime,
                endDateElem = $('#endDateInput'),
                changeDate;

            if ($scope.mode !== 'edit' && !$scope.campaignDate) {
                if (startTime) {
                    if (moment(startTime).isAfter(endTime)) {
                        endDateElem.removeAttr('disabled').css({'background': 'transparent'});
                        changeDate = moment(startTime).format(constants.DATE_US_FORMAT);
                        endDateElem.datepicker('setStartDate', changeDate);
                        endDateElem.datepicker('update', changeDate);
                    } else {
                        endDateElem.datepicker('setStartDate', startTime);
                    }
                }
            } else {
                endDateElem.removeAttr('disabled').css({'background': 'transparent'});
                endDateElem.datepicker('setStartDate', endTime);
                endDateElem.datepicker('update', endTime);
            }

            if (startTime && moment(startTime).isAfter(endTime, 'day')) {
                endDateElem.datepicker('update', startTime);
            }
        };

        $scope.changeSubAccount =  function(account) {
            var url = '/a/' + $routeParams.accountId+'/sa/'+ account.id +'/mediaplan/create';
            $location.url(url);
        };

        $scope.sucessHandler = function (result) {

            var url = '/a/' + $routeParams.accountId+'/sa/'+result.data.data.clientId+'/mediaplan/'+ result.data.data.id+'/overview';

            $rootScope.setErrAlertMessage('Media plan successfully' +
                ($scope.mode === 'edit' ? ' updated ' : ' created ') , 0);

            $timeout(function () {
                $scope.Campaign.saveBtnLoader= false;

                $location.url(url);
            }, 800);
        };

        createCampaign.getBrandId = function (brandId, postDataObj) {
            brandId = Number(brandId);

            if (brandId > 0) {
                postDataObj.brandId = brandId;
            }
        };

        $scope.saveCampaign = function (lineItemMode, saveMediaPlanBeforeLineItem) {
            var formElem,
                formData,
                postDataObj,
                utcStartTime,
                utcEndTime,
                campaignCosts = [],
                dateTimeZone,
                i,
                clientId = vistoconfig.getSelectedAccountId(),
                campaignId = vistoconfig.getSelectedCampaignId(),
                isDateChanged = true;

            saveMediaPlanBeforeLineItem  = saveMediaPlanBeforeLineItem || false;
            $scope.$broadcast('show-errors-check-validity');

            if ($scope.lineItems.lineItemList.length === 0) {
                $rootScope.setErrAlertMessage('Please create a Line Item');
                return false;
            }

            if ($scope.mode === 'edit' && $scope.editCampaignData.bookedSpend > $scope.Campaign.deliveryBudget) {
                $rootScope.setErrAlertMessage('Delivery Budget should be more than or equal to the Total Billable Amount');
                return false;
            }

            if ($scope.createCampaignForm.$valid && $scope.lineItems.lineItemList.length > 0) {
                $scope.Campaign.saveBtnLoader= true;
                $scope.Campaign.editLineItemLoader = true;

                formElem = $('#createCampaignForm').serializeArray();
                formData = _.object(_.pluck(formElem, 'name'), _.pluck(formElem, 'value'));
                postDataObj = {};
                createCampaign.getBrandId(formData.brandId, postDataObj);

                postDataObj.clientId = clientId;

                // create mode
                postDataObj.name = formData.campaignName;
                postDataObj.advertiserId = Number(formData.advertiserId);



                postDataObj.labels = _.pluck($scope.tags, 'label');

                if (formData.purchaseOrder) {
                    postDataObj.purchaseOrder = formData.purchaseOrder;
                }

                dateTimeZone = workflowService.getAccountTimeZone();

                if($scope.mediaPlanAPIStartTime && moment($scope.selectedCampaign.startTime).startOf('day').isSame(moment($scope.mediaPlanAPIStartTime).startOf('day'))) {
                    isDateChanged = false;
                }

                utcStartTime = momentService.localTimeToUTC($scope.selectedCampaign.startTime,
                    'startTime', dateTimeZone, isDateChanged);

                utcEndTime = momentService.localTimeToUTC($scope.selectedCampaign.endTime,
                    'endTime', dateTimeZone);

                if ($scope.mode ==='edit') {

                    if(moment(utcStartTime).startOf('day').isSame(moment($scope.mediaPlanAPIStartTime).startOf('day')))  {
                        utcStartTime = $scope.mediaPlanAPIStartTime;
                    }

                    if(moment(utcEndTime).unix() === moment($scope.mediaPlanAPIEndTime).unix())  {
                        utcEndTime = $scope.mediaPlanAPIEndTime;
                    }
                }

                postDataObj.startTime = utcStartTime;
                postDataObj.endTime = utcEndTime;

                postDataObj.kpiType = formData.kpi;
                postDataObj.kpiValue = formData.kpiValue;
                postDataObj.marginPercent = formData.marginPercent;
                postDataObj.deliveryBudget = formData.deliveryBudget;
                postDataObj.totalBudget = utils.stripCommaFromNumber(formData.totalBudget);

                if ($scope.mode === 'create' || $scope.cloneMediaPlanName) {
                    postDataObj.lineItems =
                        workflowService.processLineItemsObj(angular.copy($scope.lineItems.lineItemList));
                }

                postDataObj.campaignType = 'Display';
                postDataObj.labels = _.pluck($scope.tags, 'label');
                postDataObj.campaignPixels = _.pluck($scope.selectedCampaign.selectedPixel, 'id');

                // for updateAt
                if ($scope.selectedCampaign.updatedAt) {
                    postDataObj.updatedAt = $scope.selectedCampaign.updatedAt;
                }

                // for cost
                if (!$.isEmptyObject($scope.selectedCampaign.selectedCostAttr)) {
                    for (i in $scope.selectedCampaign.selectedCostAttr) {
                        campaignCosts.push($scope.selectedCampaign.selectedCostAttr[i]);
                    }

                    if (campaignCosts.length > 0) {
                        postDataObj.campaignCosts = campaignCosts;
                    }
                }

                if (campaignId) {
                    postDataObj.campaignId = campaignId;
                }

                // display loader
                if (lineItemMode === 'create') {
                    $scope.createNewLineItemLoader = true;
                } else if (lineItemMode === 'edit') {
                    $scope.Campaign.editLineItemLoader = true;
                } else if (lineItemMode === 'upload') {
                    $scope.bulkUploadItemLoader = true;
                }

                workflowService[($scope.mode === 'edit' && !$scope.cloneMediaPlanName) ?
                    'updateCampaign' : 'saveCampaign'](postDataObj.clientId , postDataObj).then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        workflowService.setMediaPlanClone(null);
                        $scope.cloneMediaPlanName = null;

                        if (!saveMediaPlanBeforeLineItem) {
                            $scope.selectedCampaign.resetLineItemParameters();
                        }

                        $scope.editLineItem = {};

                        if (($scope.mode === 'create') && ($scope.mediaPlanOverviewClient !== undefined)) {
                            loginModel.setSelectedClient($scope.mediaPlanOverviewClient);
                        }

                        if ($scope.saveMediaPlan && lineItemMode) {
                            if (!saveMediaPlanBeforeLineItem) {
                                $rootScope.setErrAlertMessage('Media plan successfully' + ($scope.mode === 'edit' ?
                                        ' updated ' : ' created '), 0);
                            }

                            $scope.saveMediaPlan = false;
                            $scope.selectedCampaign.updatedAt = result.data.data.updatedAt;

                            // trigger save the line item now after successful updation of media plan
                            if (lineItemMode === 'create') {
                                $scope.createNewLineItemInEditMode();
                            } else if (lineItemMode === 'edit') {
                                $scope.updateLineItemInEditMode();
                            } else if (lineItemMode === 'upload') {
                                $scope.uploadFileChosenLineItem();
                            }

                            $scope.Campaign.saveBtnLoader= false;
                            $scope.Campaign.editLineItemLoader = false;
                        } else {
                            $scope.sucessHandler(result);
                        }
                    } else {
                        $scope.Campaign.saveBtnLoader= false;
                        $scope.Campaign.editLineItemLoader = false;

                        $rootScope.setErrAlertMessage('Unable to ' + (($scope.mode === 'edit') ?
                                ' update ' : ' create ') + ' Media Plan');
                    }
                }, function () {
                    $scope.Campaign.saveBtnLoader= false;
                    $scope.Campaign.editLineItemLoader = false;

                    $rootScope.setErrAlertMessage('Unable to ' + (($scope.mode === 'edit') ?
                            ' update ' : ' create ') + ' Media Plan');
                });
            }
        };

        $scope.repushCampaign = function () {
            $scope.repushCampaignLoader = true;
            $scope.repushData.campaignId = $routeParams.campaignId;

            workflowService
                .updateCampaign($scope.repushData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.sucessHandler(result);
                        localStorage.setItem('topAlertMessage', $scope.textConstants.CAMPAIGN_UPDATED_SUCCESS);
                        localStorage.setItem('campaignData', '');
                        $scope.repushCampaignEdit = false;
                        $scope.repushCampaignLoader = false;
                    } else {
                        $scope.repushCampaignEdit = false;
                        $scope.repushCampaignLoader = false;
                    }
                });
        };

        $scope.cancelRepushCampaign = function () {
            $scope.repushCampaignEdit = false;
            localStorage.setItem('campaignData', '');
        };

        $scope.reset = function () {
            $scope.$broadcast('show-errors-reset');
            $scope.selectedCampaign = {};
        };

        $scope.resetFlashMessage = function () {
            $rootScope.setErrAlertMessage('', 0);
        };

        $scope.showHideDropdownWithSearch = function (event) {
            $(event.target).closest('.dropdown').find('.dropdown-menu-with-search').toggle();
        };

        $scope.validateDateLineItem = function (date, dateType) {
            if ('startdate' === dateType) {
                $scope.lineItemStartDate = date;
            } else {
                $scope.lineItemEndDate = date;
            }
        };
        // *********************** End of date ***************

        // initial initialization
        $(function () {
            $('.main_navigation_holder').find('.active_tab').removeClass('active_tab');

            $('.main_navigation')
                .find('.active')
                .removeClass('active')
                .end()
                .find('#campaigns_nav_link')
                .addClass('active');

            $('html').css('background', '#fff');
            $scope.locale = $locale;

            // This is for the drop down list. Perhaps adding this to a more general controller
            $(document).on('click', '.dropdown-menu li.available a', function () {
                $(this)
                    .parents('.dropdown')
                    .find('.btn')
                    .html($(this).text() + '<span class="icon-arrow-solid-down"></span>');

                $(this).parents('.dropdown').find('.btn').val($(this).data('value'));
            });

            $(document).on('click', '.dropdown .btn', function () {
                $scope.trimText();
            });

            $scope.trimText = function() {
                $('.dropdown-workflow a').each(function () {
                    var text = $(this).text();

                    if (text.length > 25) {
                        $(this).val(text).text(text.substr(0, 25) + '…');
                    }
                });
            };
            $scope.trimText();

            // DDL ChkBox Prevent Default
            $('.dropdown-menu.multiSelectDDL').find('input').click(function (e) {
                e.stopPropagation();
            });

            $scope.textConstants = constants;
            $scope.workflowData = {};
            $scope.selectedCampaign = {};
            $scope.repushCampaignEdit = false;
            $scope.campaignId = vistoconfig.getSelectedCampaignId();
            $scope.mode = workflowService.getMode();
            $scope.deleteCampaignFailed = false;
            $scope.numberOnlyPattern = /[^0-9]/g;
            $scope.hideKpiValue = false;
            $scope.client = vistoconfig.getMasterClientId();
            $scope.isClientDropDownDisable = false;
            $scope.editCampaignData = [];

            $(document).ready(function () {
                var cloneMediaPlanObj = workflowService.getMediaPlanClone();

                $('.input-daterange').datepicker({
                    format: 'mm/dd/yyyy',
                    orientation: 'top auto',
                    autoclose: true,
                    todayHighlight: true
                });

                // media plan clone
                if (cloneMediaPlanObj) {
                    $scope.cloneMediaPlanName = cloneMediaPlanObj.name;
                    $scope.campaignId = cloneMediaPlanObj.id;
                    $scope.campaignDate = cloneMediaPlanObj.date;
                    $scope.flightDateChosen = cloneMediaPlanObj.originalFlightdates;
                    $scope.mode = 'create';
                }

                var clientData = accountService.getSelectedAccount();
                $scope.workflowData.subAccounts = _.sortBy(subAccountService.getSubAccounts(), 'displayName');
                $scope.isClientDropDownDisable = true;

                if($scope.mode === 'create' && !$scope.cloneMediaPlanName) {
                    if(!clientData.isLeafNode) {
                        clientData = subAccountService.getSelectedSubAccount();
                        $scope.selectedCampaign.clientName = clientData.displayName;
                    }

                    $scope.selectHandler('account', clientData, null);
                }

                if ($scope.mode === 'edit' || $scope.cloneMediaPlanName) {
                    $scope.processEditCampaignData();
                } else {
                    $timeout(function () {
                        $scope.initiateDatePicker();
                    }, 1000);
                }
            });
        });

        // Search show / hide
        $scope.searchShowInput = function () {
            var searchInputForm = $('.searchInputForm');

            $('.searchInputBtn').hide();
            $('.searchInputBtnInline').show();
            searchInputForm.show();
            searchInputForm.animate({width: '400px'}, 'fast');
        };

        // *************** generalized show hide of search field ***************
        $scope.searchClearInput = function () {
            $('.searchInputForm input').val('');
        };

        // Show Add Credits
        $scope.showAddCreditForm = function () {
            $('.addCreditForm').toggle();
            $('.showAddCreditForm .icon-arrow-solid-down').toggleClass('active');
        };

        // ************** PAGE 1 ******************************
        $scope.setKPIName = function (kpi) {
            $scope.kpiName = kpi;
            $scope.selectedCampaign.kpiValue = '';
        };

        // nav control
        $scope.highlightLeftNav = function (pageno) {
            var eachStepCompLabel = $('.eachStepCompLabel');

            eachStepCompLabel.removeClass('active');
            eachStepCompLabel[pageno].classList.add('active');
        };


        $scope.isMediaPlanNameExist = function () {
            var cloneMediaPlanName = $scope.selectedCampaign.campaignName,
                clientId = $scope.selectedCampaign.clientId,
                advertiserId = $scope.selectedCampaign.advertiserId,

                cloneObjValue = {
                    advertiserId:advertiserId,
                    cloneMediaPlanName:cloneMediaPlanName
                };

            $scope.checkUniqueMediaPlanNameNotFound = true;

            if ($scope.selectedCampaign.oldCampaignName !== cloneMediaPlanName && advertiserId) {
                workflowService
                    .checkforUniqueMediaPlan(clientId, cloneObjValue)
                    .then(function (results) {
                        $scope.checkUniqueMediaPlanNameNotFound = false;

                        if (results.status === 'OK' || results.status === 'success') {
                            $scope.mediaPlanNameExists = results.data.data.isExists;
                        }
                    });
            } else {
                $scope.checkUniqueMediaPlanNameNotFound = false;
                $scope.mediaPlanNameExists = false;
            }
        };

        // use this method to access createCampaign in child
        $scope.createCampaignAccess = function () {
            return createCampaign;
        };

        $scope.redirectUserFromArchivedCampaign = function () {
            $scope.isMediaPlanArchive = false;
            $location.url(urlBuilder.mediaPlansListUrl());
        };

        $scope.redirectToOverViewPage = function (campaignId) {
            workflowService.setMediaPlanClone(null);
            $location.url(urlBuilder.mediaPlanOverviewUrl(campaignId));
        };

        $scope.$on('$locationChangeStart', function () {
            if ($scope.cloneMediaPlanName) {
                $scope.cloneMediaPlanName = null;
                workflowService.setMediaPlanClone(null);
            }
        });

        $scope.redirectToMediaPlanList = function() {
            $location.url(urlBuilder.mediaPlansListUrl());
        };

        $scope.$watch('selectedCampaign.endTime',function (newVal, oldVal) {
            var selectedPixelData;
            if (selectedAdvertiser) {
                if($scope.selectedCampaign.selectedPixel.length >0) {
                    selectedPixelData =  _.pluck($scope.selectedCampaign.selectedPixel, 'id');
                } else {
                    selectedPixelData = $scope.editCampaignData.pixels;
                }

                if (selectedPixelData && selectedPixelData.length >0) {
                    $scope.$broadcast('fetch_pixels', selectedPixelData);
                } else {
                    $scope.$broadcast('fetch_pixels');
                }
            }

            // set the flag to save the media plan along with line item
            if ($scope.mode === 'edit') {
                if (typeof oldVal === 'undefined') {
                    return;
                }

                if (newVal !== oldVal) {
                    $scope.saveMediaPlan = true;
                }
            }
        });

        $scope.$watch('selectedCampaign.startTime',function (newVal,oldVal) {
            // set the flag to save the media plan along with line item
            if ($scope.mode === 'edit') {
                if (typeof oldVal === 'undefined') {
                    return;
                }

                if (newVal !== oldVal) {
                    $scope.saveMediaPlan = true;
                }
            }
        });

        $scope.$watch('Campaign.totalBudget',function (newVal,oldVal) {
            // set the flag to save the media plan along with line item
            if ($scope.mode === 'edit') {
                if (typeof oldVal === 'undefined') {
                    return;
                }

                if (newVal !== oldVal) {
                    $scope.saveMediaPlan = true;
                }
            }
        });

        $scope.$watch('Campaign.marginPercent',function (newVal,oldVal) {
            // set the flag to save the media plan along with line item
            if ($scope.mode === 'edit') {
                if (typeof oldVal === 'undefined' || oldVal === 0) {
                    return;
                }

                if (newVal !== oldVal) {
                    $scope.saveMediaPlan = true;
                }
            }
        });

        $scope.checkKpiType = function(kpiName) {
            kpiName = kpiName.toUpperCase();
            var symbol = '#';

            if(kpiName === 'VIEWABLE IMPRESSIONS' ||kpiName === 'IMPRESSIONS' || kpiName === 'Impressions') {
                symbol = '#';
            }

            if(kpiName === 'CTR' || kpiName === 'VTC' || kpiName === 'ACTION RATE'|| kpiName === 'VIEWABLE RATE' || kpiName === 'SUSPICIOUS ACTIVITY RATE') {
                symbol = '%';
            }

            if(kpiName === 'CPA' || kpiName === 'CPM' || kpiName === 'CPC' || kpiName === 'SPEND' || kpiName === 'POST CLICK CPA') {
                symbol = '$';
            }

            return symbol;
        };

        $(function () {
            $('.masterContainer').on('click', '.leftNavLink', function (event) {
                var target = $(event.target),
                    selectedSubModule = target.attr('data-target');

                if (selectedSubModule !== '#addLineItems') {
                    $timeout(function () {
                        $('#hideLineItemCreateBox').click();
                    }, 100);
                } else {
                    // in case there were no line items created by user in create mode show create line item box
                    if ($scope.mode === 'create' && $scope.lineItems.lineItemList.length === 0) {
                        $('.createLineItemBtn').click();
                    }
                }
            });
        });

        // This sets dynamic width to line to take 100% height
        // This sets dynamic width to line to take 100% height
        function colResize() {
            var winHeight = $(window).height() - 50;

            $('#campaignCreate .settingWrap').css('min-height', winHeight + 'px');
            $('.tbody.thin').css('max-height', winHeight - 298 + 'px');
            $('.selectedPixels').css('height', winHeight - 243 + 'px');
        }

        setTimeout(function () {
            colResize();
        }, 1000);

        $(window).resize(function () {
            colResize();
        });
    }]);
});
