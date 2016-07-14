define(['angularAMD', '../../common/services/constants_service', 'workflow/services/workflow_service', 'common/services/vistoconfig_service', 'login/login_model', 'common/moment_utils', 'workflow/directives/clear_row', 'common/directives/ng_upload_hidden', 'workflow/campaign/pixels_controller', 'workflow/campaign/budget_controller', 'workflow/campaign/line_item_controller', 'common/controllers/confirmation_modal_controller', 'workflow/directives/custom_date_picker', 'workflow/campaign/campaign_archive_controller','common/directives/decorate_numbers'], function (angularAMD) {
    angularAMD.controller('CreateCampaignController', function ($scope, $window, $rootScope, $filter, $routeParams, $locale, $location, $timeout, $modal, constants, workflowService, vistoconfig, loginModel, momentService, localStorageService) {

        $scope.selectedKeywords = [];
        $scope.platformKeywords = [];
        $scope.dropdownCss = {
            display: 'none', 'max-height': '100px', overflow: 'scroll', top: '60px',
            left: '0px'
        };
        $scope.keywordText = "";
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
        $scope.newLineItem = {}; // this is where line items created are stored
        $scope.lineItemName = '';
        $scope.lineItemType = {};
        $scope.lineItemType.name = 'Select Type';
        $scope.lineRate = '';
        $scope.adGroupName = '';
        $scope.lineTarget = '';
        $scope.campaignDate = '' ;
        $scope.flightDateChosen = '' ;
        $scope.isMediaPlanArchive =  false;

        $scope.checkUniqueMediaPlanNameNotFound = false;
        $scope.executionPlatforms = [];
        $scope.kpiNameList = [
            {name: 'Action Rate'},
            {name: 'CPA'},
            {name: 'CPC'},
            {name: 'CPM'},
            {name: 'CTR'},
            {name: 'Impressions'},
            {name: 'VTC'}
        ];
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
        //line item edit flags
        $scope.rateReadOnlyEdit = false;
        $scope.rateTypeReadOnlyEdit = false;
        $scope.volumeFlagEdit = true;
        $scope.amountFlagEdit = true;
        $scope.hideLineItemRateEdit = false;
        $scope.hideAdGroupNameEdit = false;
        $scope.showPixelsListEdit = false;
        $scope.disableFlatFeeEdit = false; // this is to hide flat fee in edit mode
        $scope.showSystemOfRecordEdit = true;

        $scope.editLineItem = {};
        $scope.vendorConfig = [];

        //mediaplan dates
        $scope.mediaPlanStartDate = '';
        $scope.mediaPlanSEndDate = '';
        // line item creation date
        $scope.lineItemStartDate = '';
        $scope.lineItemEndDate = '';
        $scope.mediaPlanNameExists = false;
        $scope.selectedCampaign.costAttributes = {};

        //flag to make API call to save media plan along with line item
        $scope.saveMediaPlan = false;

        var selectedAdvertiser;
        $scope.periodDays = 0 ;
        $scope.lessdiffDays = 0 ;
        $scope.ifClonedDateLessThanStartDate = false ;
        $scope.lineItemdiffDays = 0;
        $scope.newdiffDays = 0 ;

        //loader Flags - popup loader
        $scope.createNewLineItemLoader = false;
        $scope.Campaign.editLineItemLoader = false;
        $scope.bulkUploadItemLoader = false;
        //loader Flags - normal edit save button loader
        $scope.Campaign.createNewLineItemLoaderEdit = false;
        $scope.editLineItemLoaderEdit = false;
        $scope.bulkUploadItemLoaderEdit = false;

        $scope.Campaign.saveBtnLoader= false;

        if (!loginModel.getMasterClient().isLeafNode) {
            $scope.showSubAccount = true;
        }

        var createCampaign = {
            campaignData: {},

            clients: function () {
                workflowService.getClients().then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['clients'] = _.sortBy(responseData, 'name');
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            vendor: function (costCategoryId) {
                workflowService.getVendors(costCategoryId, {cache: false}).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['vendor'] = responseData;
                    }
                })


            },
            platforms: function (advertiserId) {
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
                workflowService.getAdvertisers('write', clientId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['advertisers'] = _.sortBy(responseData, 'name');
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchBrands: function (clientId, advertiserId) {
                workflowService.getBrands(clientId, advertiserId, 'write').then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['brands'] = _.sortBy(responseData, 'name');
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchSubAccounts: function () {
                workflowService.getSubAccounts('write').then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.workflowData['subAccounts'] = result.data.data;
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchRateTypes: function () {
                if($scope.selectedCampaign.advertiserId){
                    workflowService.getRatesTypes($scope.selectedCampaign.clientId,$scope.selectedCampaign.advertiserId).then(function (result) {
                        if(result.status === "OK" || result.status === "success"){
                            $scope.type = result.data.data;
                            workflowService.setRateTypes(angular.copy($scope.type));
                        }
                    })
                    //this.fetchBillingTypeValue();
                }
            },

            fetchBillingTypeValue: function () {
                if($scope.selectedCampaign.advertiserId){
                    workflowService.getBillingTypeValue($scope.selectedCampaign.clientId,$scope.selectedCampaign.advertiserId).then(function (result) {
                        if(result.status === "OK" || result.status === "success"){
                            $scope.advertiserTypeValue = result.data.data;
                            workflowService.setAdvertiserTypeValue(angular.copy($scope.advertiserTypeValue));
                        }
                    })
                }
            },

            fetchVendorConfigs: function () {
                workflowService.getVendorConfigs($scope.selectedCampaign.advertiserId, $scope.selectedCampaign.clientId).then(function (result) {
                    $scope.selectedCampaign.vendorConfig = workflowService.processVendorConfig(result.data.data);
                });
            },

            fetchCostAttributes: function () {
                workflowService.getCostAttr($scope.selectedCampaign.advertiserId, $scope.selectedCampaign.clientId).then(function (result) {
                    $scope.selectedCampaign.costAttributes = workflowService.processCostAttr(result.data.data);
                });
            },
            fetchSystemOfRecord: function() {
                workflowService.getSystemOfRecord($scope.selectedCampaign.advertiserId, $scope.selectedCampaign.clientId).then(function (result) {
                    $scope.selectedCampaign.systemOfRecord = result.data.data;
                });
            },

            fetchLineItemDetails: function (campaignId) {
                workflowService.getLineItem(campaignId, true).then(function (results) {
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
                 var flightDateObj = {
                     startTime: momentService.utcToLocalTime(campaignData.startTime),
                     endTime: momentService.utcToLocalTime(campaignData.endTime)
                 };

                //media plan name
                if (campaignData.name) {
                    $scope.selectedCampaign.campaignName = $scope.cloneMediaPlanName || campaignData.name;
                    $scope.selectedCampaign.oldCampaignName = campaignData.name;
                    $scope.selectedCampaign.campaignId = campaignData.id;
                }

                //set Sub Account
                if (campaignData.clientId && campaignData.clientName) {
                    $scope.selectedCampaign.clientName = campaignData.clientName;
                    $scope.selectedCampaign.clientId = campaignData.clientId;
                } else {
                    $scope.selectedCampaign.clientId = loginModel.getSelectedClient().id;
                }

                //set Advertiser
                if (campaignData.advertiserId && campaignData.advertiserName) {
                    $scope.selectedCampaign.advertiserName = campaignData.advertiserName;
                    $scope.selectedCampaign.advertiserId = campaignData.advertiserId;
                    var advertiserObj = {'id': campaignData.advertiserId, 'name': campaignData.advertiserName}; // to be removed
                    $scope.selectHandler('advertiser', advertiserObj, null)
                }

                //set Brand
                if (campaignData.brandId && campaignData.brandName) {
                    $scope.selectedCampaign.brandName = campaignData.brandName;
                    $scope.selectedCampaign.brandId = campaignData.brandId;
                }

                //set purchase Order
                if (campaignData.purchaseOrder) {
                    $scope.selectedCampaign.purchaseOrder = campaignData.purchaseOrder;
                }

                //set labels
                if (campaignData.labels && campaignData.labels.length > 0) {
                    $scope.tags = workflowService.recreateLabels(campaignData.labels);
                }

                $scope.mediaPlanAPIStartTime = campaignData.startTime;
                $scope.mediaPlanAPIEndTime = campaignData.endTime;

                if( $scope.campaignDate ) {
                    $scope.periodDays = momentService.dateDiffInDays(flightDateObj.startTime,flightDateObj.endTime)   ;
                }

                $scope.newdiffDays =  momentService.dateDiffInDays(flightDateObj.startTime ,$scope.campaignDate)  ;

                $scope.ifClonedDateLessThanStartDate = momentService.isDateBefore($scope.campaignDate , flightDateObj.startTime ) ;

                if( $scope.ifClonedDateLessThanStartDate ) {
                    // when the cloned date is smaller than  the media plan date
                    $scope.lessdiffDays = momentService.dateDiffInDays($scope.campaignDate , flightDateObj.startTime)  ;
                }

                if( $scope.campaignDate && $scope.flightDateChosen == "automaticFlightDates") {
                    flightDateObj.startTime = $scope.campaignDate ;
                    flightDateObj.endTime = momentService.addDaysCustom(flightDateObj.startTime, 'MM/DD/YYYY', $scope.periodDays);
                }

                //set startDate
                if (flightDateObj.startTime) {
                    $scope.selectedCampaign.startTime = $scope.modifiedMediaPlanAPIStartTime = flightDateObj.startTime ;
                }

                //set endDate
                if (flightDateObj.endTime) {
                    $scope.selectedCampaign.endTime = $scope.modifiedMediaPlanAPIEndTime = flightDateObj.endTime;
                    $scope.initiateDatePicker();
                    $scope.handleFlightDate(flightDateObj);
                }

                //set updateAt value in hidden field.
                if (campaignData.updatedAt) {
                    $scope.selectedCampaign.updatedAt = campaignData.updatedAt;
                }

                if (campaignData.status) {
                    $scope.selectedCampaign.status = campaignData.status;
                }
                //set KPI type
                if (campaignData.kpiType) {
                    //$scope.kpiName = $filter('toPascalCase')(campaignData.kpiType);
                    if (campaignData.kpiType.toLowerCase() === 'action rate' || campaignData.kpiType.toLowerCase() === 'impressions') {
                        $scope.kpiName = $filter('toPascalCase')(campaignData.kpiType);
                    }
                    else {
                        $scope.kpiName = campaignData.kpiType;
                    }
                }

                //set Kpi Value
                if (campaignData.kpiValue) {
                    $scope.selectedCampaign.kpiValue = campaignData.kpiValue;
                }

                //set Media Plan Budget & Margin
                if (campaignData.totalBudget && campaignData.marginPercent >= 0) {
                    $scope.Campaign.totalBudget = campaignData.totalBudget;
                    $scope.Campaign.marginPercent = campaignData.marginPercent;
                    $scope.ComputeCost();
                }

                //set cost Data
                if (campaignData.campaignCosts && campaignData.campaignCosts.length > 0) {
                    $scope.selectedCampaign.additionalCosts = _.filter(campaignData.campaignCosts, function (obj) {
                        return obj.costType && obj.costType.toUpperCase() === 'MANUAL';
                    });

                    if ($scope.selectedCampaign.additionalCosts.length > 0) {
                        _.each($scope.selectedCampaign.additionalCosts, function (obj) {
                            $scope.selectedCampaign.selectedCostAttr.push(obj.campaignCostObj);
                        })
                        $timeout(function () {
                            $("#budget").find("[data-target='#addAdditionalCost']").click();
                        }, 1500)
                    }
                }

                // line item edit mode
                createCampaign.fetchLineItemDetails(campaignData.id);

                $scope.editCampaignData = campaignData;
            }
        };

        $scope.initiateDatePicker = function () {
            var campaignStartTime,
                currentDateTime,
                startDateElem = $('#startDateInput'),
                endDateElem = $('#endDateInput'),
                today = momentService.utcToLocalTime();

            if ($scope.mode == 'edit' || $scope.campaignDate ) {

                campaignStartTime = $scope.selectedCampaign.startTime;
                currentDateTime = momentService.utcToLocalTime();

                if (moment(campaignStartTime).isAfter(currentDateTime)) {

                    startDateElem.datepicker("setStartDate", currentDateTime);
                    startDateElem.datepicker("update", campaignStartTime);
                    startDateElem.datepicker("setEndDate", campaignStartTime);

                } else {

                    startDateElem.datepicker("setStartDate", campaignStartTime);
                    startDateElem.datepicker("setEndDate", campaignStartTime);
                    startDateElem.datepicker("update", campaignStartTime);
                }

            } else {

                $scope.selectedCampaign.startTime = today;
                $scope.selectedCampaign.endTime = today;

                startDateElem.datepicker("setStartDate", today);
                startDateElem.datepicker("update", today);

                endDateElem.datepicker("setStartDate", today);
                endDateElem.datepicker("update", today);
            }

        };

        $scope.percentageValueCheck = function (value) {

            if (($scope.kpiName.toUpperCase() == 'CTR' || $scope.kpiName.toUpperCase() == 'VTC' || $scope.kpiName.toUpperCase() == 'ACTION RATE') && Number(value) > 100) {
                $scope.selectedCampaign.kpiValue = 100;
            }

        }

        $scope.calculateEffective = function () {

            for (var ind = 0; ind < $scope.Campaign.kpiArr.length; ind++) {
                if ($scope.Campaign.kpiArr[ind].isPrimary || $scope.Campaign.kpiArr[ind].isPrimary == "true") {
                    if (angular.uppercase($scope.Campaign.kpiArr[ind].kpiType) == "IMPRESSIONS" || angular.uppercase($scope.Campaign.kpiArr[ind].kpiType) == "VIEWABLE IMPRESSIONS") {
                        if (parseFloat($scope.Campaign.kpiArr[ind].kpiValue) > 0)
                            return parseFloat($scope.Campaign.deliveryBudget) / parseFloat($scope.Campaign.kpiArr[ind].kpiValue) * 1000;
                        else
                            return "NA";
                    }
                    else {
                        if (parseFloat($scope.Campaign.kpiArr[ind].kpiValue) > 0)
                            return parseFloat($scope.Campaign.deliveryBudget) / parseFloat($scope.Campaign.kpiArr[ind].kpiValue);
                        else
                            return "NA";
                    }
                }
            }

        };


        $scope.processEditCampaignData = function () {
            workflowService.getCampaignData($scope.campaignId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    if (result.data.data.isArchived) {
                        $scope.isMediaPlanArchive = true;
                    }

                    createCampaign.prefillMediaPlan(result.data.data);
                }
            });
        };

        $scope.selectHandler = function (type, data, event) {
            switch (type) {
                case 'client' :

                    $scope.workflowData['advertisers'] = [];
                    $scope.workflowData['brands'] = [];
                    $scope.selectedCampaign.advertiser = '';

                    if ($scope.showSubAccount) {
                        $scope.workflowData['subAccounts'] = [];
                        $scope.selectedCampaign.clientId = '';
                        createCampaign.fetchSubAccounts();
                    } else {
                        $scope.selectedCampaign.clientId = data.id;
                        createCampaign.fetchAdvertisers(data.id);
                    }
                    createCampaign.fetchRateTypes();
                    break;

                case 'subAccount':

                    $scope.selectedCampaign.advertiser = '';
                    $scope.selectedCampaign.advertiserName = 'Select Advertiser';
                    $scope.selectedCampaign.clientId = data.id;
                    $scope.workflowData['advertisers'] = [];
                    createCampaign.fetchAdvertisers(data.id);
                    $scope.mediaPlanOverviewClient = {'id':data.id,'name':data.name};
                    resetPixelMediaPlan();
                    break;

                case 'advertiser' :

                    resetPixelMediaPlan();
                    $scope.workflowData['brands'] = [];
                    $scope.selectedCampaign.brand = '';
                    $scope.selectedCampaign.advertiserId = data.id;
                    $scope.selectedCampaign.advertiserName = data.name;
                    selectedAdvertiser = data;
                    workflowService.setSelectedAdvertiser(selectedAdvertiser);

                    if ($scope.mode === 'create') {
                        $("#brandDDL").parents('.dropdown').find('button').html("Select Brand <span class='icon-arrow-solid-down'></span>");
                    }
                    $scope.isMediaPlanNameExist();
                    createCampaign.fetchBrands($scope.selectedCampaign.clientId, data.id);
                    $scope.selectedCampaign.selectedPixel = [];
                    createCampaign.platforms(data.id);
                    createCampaign.fetchCostAttributes();
                    createCampaign.fetchVendorConfigs();
                    createCampaign.fetchSystemOfRecord(); // for line item system of record
                    $scope.selectedCampaign.resetLineItemParameters(); //close new line item and reset all its fields
                    createCampaign.fetchRateTypes(); // fetch rates for line item based on advertiser and client
                    $scope.$broadcast('fetch_pixels');
                    break;

                case 'brand' :
                    $scope.selectedCampaign.brandId = data.id;
                    break;
            }
        }


        // media plan master dates handle
        $scope.handleFlightDate = function (data) {
            var startTime = data.startTime;
            var endTime = data.endTime;
            var endDateElem = $('#endDateInput')
            var changeDate;

            if ($scope.mode !== 'edit' && !$scope.campaignDate ) {
                if (startTime) {
                    if (moment(startTime).isAfter(endTime)) {
                        endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                        changeDate = moment(startTime).format(constants.DATE_US_FORMAT);
                        endDateElem.datepicker("setStartDate", changeDate);
                        endDateElem.datepicker("update", changeDate);
                    } else {
                        endDateElem.datepicker("setStartDate", startTime);
                    }
                }
            } else {
                endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                endDateElem.datepicker("setStartDate", endTime);
                endDateElem.datepicker("update", endTime);
            }
            if (startTime && moment(startTime).isAfter(endTime, 'day')) {
                endDateElem.datepicker("update", startTime);
            }
        };

        $scope.sucessHandler = function (result) {
            $rootScope.setErrAlertMessage('Media plan successfully' + ($scope.mode === 'edit' ? ' updated ' : ' created ') , 0);
            var url = '/mediaplan/' + result.data.data.id + '/overview';
            $timeout(function() {
                $scope.Campaign.saveBtnLoader= false;
                $location.url(url);
            }, 800);

        }

        createCampaign.getBrandId = function (brandId, postDataObj) {
            brandId = Number(brandId);
            if (brandId > 0) {
                postDataObj.brandId = brandId;
            }
        };

        $scope.saveCampaign = function (lineItemMode, saveMediaPlanBeforeLineItem) {

            saveMediaPlanBeforeLineItem  = saveMediaPlanBeforeLineItem || false;

            $scope.$broadcast('show-errors-check-validity');

            var formElem,
                formData,
                postDataObj,
                utcStartTime,
                utcEndTime;

            if ($scope.lineItems.lineItemList.length == 0) {
                $rootScope.setErrAlertMessage('Please create a Line Item');
                return false;
            }

            if ($scope.mode === 'edit' && $scope.editCampaignData.bookedSpend > $scope.Campaign.deliveryBudget) {
                $rootScope.setErrAlertMessage('Booked Spent should not exceed the campaign budget');
                return false;
            }

            if ($scope.createCampaignForm.$valid && $scope.lineItems.lineItemList.length > 0) {
                $scope.Campaign.saveBtnLoader= true;
                $scope.Campaign.editLineItemLoader = true ;

                formElem = $("#createCampaignForm").serializeArray();
                formData = _.object(_.pluck(formElem, 'name'), _.pluck(formElem, 'value'));
                postDataObj = {};

                createCampaign.getBrandId(formData.brandId, postDataObj);

                // create mode
                postDataObj.name = formData.campaignName;
                postDataObj.advertiserId = Number(formData.advertiserId);

                if ($scope.showSubAccount) {
                    postDataObj.clientId = $scope.selectedCampaign.clientId;
                } else {
                    postDataObj.clientId = loginModel.getSelectedClient().id;
                }

                postDataObj.labels = _.pluck($scope.tags, "label");

                if (formData.purchaseOrder) {
                    postDataObj.purchaseOrder = formData.purchaseOrder;
                }

                utcStartTime = momentService.localTimeToUTC($scope.selectedCampaign.startTime, 'startTime');
                utcEndTime = momentService.localTimeToUTC($scope.selectedCampaign.endTime, 'endTime');
                if($scope.mode ==='edit') {
                    utcStartTime = (moment($scope.selectedCampaign.startTime).isSame($scope.modifiedMediaPlanAPIStartTime, "day")) ?   $scope.mediaPlanAPIStartTime : utcStartTime;
                    utcEndTime = (moment($scope.selectedCampaign.endTime).isSame($scope.modifiedMediaPlanAPIEndTime, "day"))  ? $scope.mediaPlanAPIEndTime :  utcEndTime;
                }

                postDataObj.startTime = utcStartTime;
                postDataObj.endTime = utcEndTime;

                postDataObj.kpiType = formData.kpi;
                postDataObj.kpiValue = formData.kpiValue;
                postDataObj.marginPercent = formData.marginPercent;
                postDataObj.deliveryBudget = formData.deliveryBudget;
                postDataObj.totalBudget = workflowService.stripCommaFromNumber(formData.totalBudget);

                if ($scope.mode === 'create' || $scope.cloneMediaPlanName) {
                    postDataObj.lineItems = workflowService.processLineItemsObj(angular.copy($scope.lineItems.lineItemList));
                }

                postDataObj.campaignType = 'Display';
                postDataObj.labels = _.pluck($scope.tags, "label");
                postDataObj.campaignPixels = _.pluck($scope.selectedCampaign.selectedPixel, "id");

                //for updateAt
                if ($scope.selectedCampaign.updatedAt) {
                    postDataObj.updatedAt = $scope.selectedCampaign.updatedAt;
                }

                //for cost
                var campaignCosts = [];
                if (!$.isEmptyObject($scope.selectedCampaign.selectedCostAttr)) {
                    for (var i in $scope.selectedCampaign.selectedCostAttr) {
                        campaignCosts.push($scope.selectedCampaign.selectedCostAttr[i])
                    }

                    if (campaignCosts.length > 0) {
                        postDataObj.campaignCosts = campaignCosts;
                    }
                }

                if ($routeParams.campaignId) {
                    postDataObj.campaignId = $routeParams.campaignId;
                }

                //display loader
                if(lineItemMode === 'create'){
                    $scope.createNewLineItemLoader = true;
                } else if(lineItemMode === 'edit'){
                    $scope.Campaign.editLineItemLoader = true;
                } else if(lineItemMode === 'upload'){
                    $scope.bulkUploadItemLoader = true;
                }

                workflowService[($scope.mode === 'edit' && !$scope.cloneMediaPlanName) ? 'updateCampaign' : 'saveCampaign'](postDataObj).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        workflowService.setMediaPlanClone(null);
                        $scope.cloneMediaPlanName = null;

                        if(!saveMediaPlanBeforeLineItem) {
                            $scope.selectedCampaign.resetLineItemParameters();
                        }

                        $scope.editLineItem = {};
                        if(($scope.mode === 'create') && ($scope.mediaPlanOverviewClient != undefined)) {
                            loginModel.setSelectedClient($scope.mediaPlanOverviewClient);
                        }
                        if($scope.saveMediaPlan && lineItemMode){

                            if(!saveMediaPlanBeforeLineItem) {
                                $rootScope.setErrAlertMessage('Media plan successfully' + ($scope.mode === 'edit' ? ' updated ' : ' created '), 0);
                            }
                            $scope.saveMediaPlan = false;
                            $scope.selectedCampaign.updatedAt = result.data.data.updatedAt;
                            //trigger save the line item now after successful updation of media plan
                            if(lineItemMode === 'create'){
                                $scope.createNewLineItemInEditMode();
                            } else if(lineItemMode === 'edit'){
                                $scope.updateLineItemInEditMode();
                            } else if(lineItemMode === 'upload'){
                                $scope.uploadFileChosenLineItem();
                            }
                            $scope.Campaign.saveBtnLoader= false;
                            $scope.Campaign.editLineItemLoader = false ;

                        } else {
                            $scope.sucessHandler(result);
                        }

                    } else {
                        $scope.Campaign.saveBtnLoader= false;
                        $scope.Campaign.editLineItemLoader = false ;

                        $rootScope.setErrAlertMessage('Unable to ' + (($scope.mode === 'edit') ? ' update ' : ' create ') + ' Media Plan');
                    }
                }, function (result) {
                    $scope.Campaign.saveBtnLoader= false;
                    $scope.Campaign.editLineItemLoader = false ;

                    $rootScope.setErrAlertMessage('Unable to ' + (($scope.mode === 'edit') ? ' update ' : ' create ') + ' Media Plan');
                });
            }
        };

        $scope.repushCampaign = function () {
            $scope.repushCampaignLoader = true;
            $scope.repushData.campaignId = $routeParams.campaignId;
            workflowService.updateCampaign($scope.repushData).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
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
        }
        $scope.reset = function () {
            $scope.$broadcast('show-errors-reset');
            $scope.selectedCampaign = {};
        };

        $scope.resetFlashMessage = function () {
            $rootScope.setErrAlertMessage('', 0);
        };

        $scope.showHideDropdownWithSearch = function(event) {
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dropdown-menu-with-search").toggle() ;
        }

        $scope.validateDateLineItem = function (date, dateType) {
            if ('startdate' === dateType) {
                $scope.lineItemStartDate = date;
            }
            else {
                $scope.lineItemEndDate = date;
            }
        }
        //*********************** End of date ***************

        // initial initialization
        $(function () {
            $(".main_navigation_holder").find('.active_tab').removeClass('active_tab');
            $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
            $("html").css('background', '#fff');
            $scope.locale = $locale;

            // This is for the drop down list. Perhaps adding this to a more general controller
            $(document).on('click', '.dropdown-menu li.available a', function () {
                $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="icon-arrow-solid-down"></span>');
                $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
            });
            $('.dropdown-workflow a').each(function () {
                var text = $(this).text()
                if (text.length > 14)
                    $(this).val(text).text(text.substr(0, 20) + '…')
            });
            // DDL ChkBox Prevent Default
            $('.dropdown-menu.multiSelectDDL').find('input').click(function (e) {
                e.stopPropagation();
            });
            $scope.textConstants = constants;
            $scope.workflowData = {};
            $scope.selectedCampaign = {};
            $scope.repushCampaignEdit = false;
            $scope.campaignId = $routeParams.campaignId;
            $scope.mode = workflowService.getMode();
            $scope.deleteCampaignFailed = false;
            $scope.numberOnlyPattern = /[^0-9]/g;
            $scope.hideKpiValue = false;
            $scope.client = loginModel.getSelectedClient();
            $scope.isClientDropDownDisable = false;
            //createCampaign.fetchRateTypes();// remove this
            if ($scope.client.name) {
                $scope.isClientDropDownDisable = true;
                $scope.clientName = $scope.client.name;
                ($scope.mode === 'create') && $scope.selectHandler('client', $scope.client, null);
            }

            $(document).ready(function () {
                $('.input-daterange').datepicker({
                    format: "mm/dd/yyyy",
                    orientation: "top auto",
                    autoclose: true,
                    todayHighlight: true
                });


                //media plan clone
                var cloneMediaPlanObj = workflowService.getMediaPlanClone();
                if (cloneMediaPlanObj) {
                    $scope.cloneMediaPlanName = cloneMediaPlanObj.name;
                    $scope.campaignId = cloneMediaPlanObj.id;
                    $scope.campaignDate = cloneMediaPlanObj.date;
                    $scope.flightDateChosen = cloneMediaPlanObj.originalFlightdates ;
                    $scope.mode = 'create';
                }

                if ($scope.mode == 'edit' || $scope.cloneMediaPlanName) {
                    $scope.processEditCampaignData();
                } else {
                    $timeout(function () {
                        $scope.initiateDatePicker();
                    }, 1000)
                }
            });
        })

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
            var inputSearch = $('.searchInputForm input');
            inputSearch.val('');
        };

        //$('body').click(function (e) {
        //    if ($(e.target).closest('.searchInput').length === 0) {
        //        $scope.searchHideInput();
        //    }
        //});

        //Show Add Credits
        $scope.showAddCreditForm = function () {
            $(".addCreditForm").toggle();
            $(".showAddCreditForm .icon-arrow-solid-down").toggleClass("active");
        };


        // ************** PAGE 1 ******************************
        $scope.setKPIName = function (kpi) {
            $scope.kpiName = kpi;
            $scope.selectedCampaign.kpiValue = '';

        }

        // nav control
        $scope.highlightLeftNav = function (pageno) {
            $(".eachStepCompLabel").removeClass('active')
            $(".eachStepCompLabel")[pageno].classList.add("active");
        }


        $scope.isMediaPlanNameExist = function (event) {
            var target = (event)?event.target:'',
                //cloneMediaPlanName = target.value,
                cloneMediaPlanName = $scope.selectedCampaign.campaignName,
                subAccountId=$scope.selectedCampaign.clientId,
                advertiserId = $scope.selectedCampaign.advertiserId,
                url,
                cloneObjValue={
                    subAccountId:subAccountId,
                    advertiserId:advertiserId,
                    cloneMediaPlanName:cloneMediaPlanName
                };

            $scope.checkUniqueMediaPlanNameNotFound = true;
            if($scope.selectedCampaign.oldCampaignName != cloneMediaPlanName && advertiserId) {
                workflowService.checkforUniqueMediaPlan(cloneObjValue).then(function (results) {
                    $scope.checkUniqueMediaPlanNameNotFound = false;
                    if (results.status === 'OK' || results.status === 'success') {
                        var responseData = results.data.data;
                        $scope.mediaPlanNameExists = responseData.isExists;
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

        function resetPixelMediaPlan() {
            $scope.lineItems.lineItemList = [];
            $scope.selectedCampaign.selectedPixel = [];
        }

        $scope.redirectUserFromArchivedCampaign = function () {
            $scope.isMediaPlanArchive = false;
            $location.url(vistoconfig.MEDIA_PLANS_LINK);
        };

        $scope.redirectToOverViewPage = function (campaignId) {
            workflowService.setMediaPlanClone(null);
            $location.url('/mediaplan/' + campaignId + '/overview');
        }


        $scope.$on("$locationChangeStart", function (event, next, current) {
            if ($scope.cloneMediaPlanName) {
                $scope.cloneMediaPlanName = null;
                workflowService.setMediaPlanClone(null);
            }
        });

        $scope.$watch('selectedCampaign.endTime',function(newVal,oldVal){
            if(selectedAdvertiser){
                if(createCampaign.campaignData && createCampaign.campaignData.pixels){
                    $scope.$broadcast('fetch_pixels', createCampaign.campaignData.pixels);
                } else {
                    $scope.$broadcast('fetch_pixels');
                }
            }
            //set the flag to save the media plan along with line item
            if($scope.mode === 'edit'){
                if (typeof oldVal === 'undefined') return;
                if (newVal !== oldVal) {
                    $scope.saveMediaPlan = true;
                }
            }
        });

        $scope.$watch('selectedCampaign.startTime',function(newVal,oldVal){
            //set the flag to save the media plan along with line item
            if($scope.mode === 'edit'){
                if (typeof oldVal === 'undefined') return;

                if (newVal !== oldVal) {
                    $scope.saveMediaPlan = true;
                }
            }
        });

        $scope.$watch('Campaign.totalBudget',function(newVal,oldVal){
            //set the flag to save the media plan along with line item
            if($scope.mode === 'edit'){
                if (typeof oldVal === 'undefined') return;
                if (newVal !== oldVal) {
                    $scope.saveMediaPlan = true;
                }
            }
        });

        $scope.$watch('Campaign.marginPercent',function(newVal,oldVal){
            //set the flag to save the media plan along with line item
            if($scope.mode === 'edit'){
                if (typeof oldVal === 'undefined' || oldVal === 0) return;
                if (newVal !== oldVal) {
                    $scope.saveMediaPlan = true;
                }
            }
        });


        $(function () {
            $(".masterContainer").on('click', '.leftNavLink', function (event) {
                var target = $(event.target);
                var selectedSubModule = target.attr("data-target");
                if (selectedSubModule !== '#addLineItems') {
                    $timeout(function () {
                        $("#hideLineItemCreateBox").click();
                    }, 100)
                } else {
                    // in case there were no line items created by user in create mode show create line item box
                    if($scope.mode === 'create' && $scope.lineItems.lineItemList.length == 0){
                        $('.createLineItemBtn').click();
                    }
                }
            })
        });

        // This sets dynamic width to line to take 100% height
        // This sets dynamic width to line to take 100% height
        function colResize() {
            var winHeight = $(window).height() - 50;
            $("#campaignCreate .settingWrap").css('min-height', winHeight + 'px');
            $(".tbody.thin").css('max-height', winHeight - 298 + 'px');
            $(".selectedPixels").css('height', winHeight - 243 + 'px');
        }

        setTimeout(function () {
            colResize();
        }, 1000);


        $(window).resize(function () {
            colResize();
        });
    });
});
