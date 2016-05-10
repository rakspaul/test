define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service','login/login_model','common/moment_utils','workflow/directives/clear_row', 'workflow/directives/ng_upload_hidden','workflow/controllers/pixels_controller','workflow/controllers/budget_controller', 'workflow/controllers/line_item_controller', 'common/controllers/confirmation_modal_controller', 'workflow/directives/custom_date_picker'], function (angularAMD) {
    angularAMD.controller('CreateCampaignController', function ($scope,  $window, $timeout, $rootScope, $filter, $routeParams, $locale, $location, $timeout, $modal, constants, workflowService,loginModel,momentService, localStorageService) {

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
        $scope.selectedCampaign ={};
        $scope.tags = [];
        $scope.saveCampaignClicked=false;
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
        $scope.createItemList = false;
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
        $scope.lineItemList = [];
        $scope.lineItemErrorFlag = false;
        // line item create flags
        $scope.rateReadOnly = false;
        $scope.rateTypeReadOnly = false;
        $scope.volumeFlag = true;
        $scope.amountFlag = true;
        $scope.hideLineItemRate = false;
        $scope.hideAdGroupName = false;
        $scope.showPixelsList = false;
        //line item edit flags
        $scope.rateReadOnlyEdit = false;
        $scope.rateTypeReadOnlyEdit = false;
        $scope.volumeFlagEdit = true;
        $scope.amountFlagEdit = true;
        $scope.hideLineItemRateEdit = false;
        $scope.hideAdGroupNameEdit = false;
        $scope.showPixelsListEdit = false;

        $scope.editLineItem = {};
        $scope.vendorConfig = [];
        $scope.costAttributes = {};

        $scope.budgetLineItemErrorFlag = false;

        //mediaplan dates
        $scope.mediaPlanStartDate = '';
        $scope.mediaPlanSEndDate = '';
        // line item creation date
        $scope.lineItemStartDate = '';
        $scope.lineItemEndDate = '';
        $scope.mediaPlanNameExists = false;

        $scope.additionalCosts = [];

        var selectedAdvertiser;

        if(!loginModel.getMasterClient().isLeafNode) {
            $scope.showSubAccount = true;
        }


        var createCampaign = {
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
                workflowService.getAdvertisers('write',clientId).then(function (result) {
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
                workflowService.getBrands(clientId,advertiserId, 'write').then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['brands'] = _.sortBy(responseData, 'name');
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchSubAccounts: function(){
                workflowService.getSubAccounts('write').then(function(result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.workflowData['subAccounts'] = result.data.data;
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },
            fetchRateTypes: function(){
                workflowService.getRatesTypes().then(function(result){
                    $scope.type = result.data.data;
                    workflowService.setRateTypes(angular.copy($scope.type));
                })
            },

            fetchVendorConfigs: function(){
                workflowService.getVendorConfigs($scope.selectedCampaign.advertiserId,$scope.selectedCampaign.clientId).then(function(result){
                    var configList = result.data.data;
                    $scope.vendorConfig = workflowService.processVendorConfig(configList);
                });
            },

            fetchCostAttributes: function(){
                workflowService.getCostAttr($scope.selectedCampaign.advertiserId,$scope.selectedCampaign.clientId).then(function(result){
                    result = result.data.data ;
                    $scope.costAttributes = workflowService.processCostAttr(result) ;
                });
            },

            fetchBillingTypesAndValues: function(){
                workflowService.getBillingTypeAndValue($scope.selectedCampaign.advertiserId,$scope.selectedCampaign.clientId).then(function(result){
                    result = result.data.data ;
                    $scope.costAttributes = workflowService.processCostAttr(result) ;
                });
            },
            fetchLineItemDetails: function(campaignId){
                workflowService.getLineItem(campaignId).then(function (results) {
                    if (results.status === 'success' && results.data.statusCode === 200) {
                        var lineItemList = results.data.data;
                        $scope.processLineItemEditMode(lineItemList);

                    }
                });
            },

            errorHandler: function (errData) {
                console.log(errData);
            },

            prefillMediaPlan : function(campaignData) {
                var startDateElem,
                    today;

                startDateElem = $('#startDateInput');

                //media plan name
                if(campaignData.name) {
                    $scope.selectedCampaign.campaignName = $scope.cloneMediaPlanName || campaignData.name;
                    $scope.selectedCampaign.campaignId = campaignData.id;
                }

                //set Sub Account
                if(campaignData.clientId && campaignData.clientName) {
                    $scope.selectedCampaign.clientName = campaignData.clientName;
                    $scope.selectedCampaign.clientId = campaignData.clientId;
                } else {
                    $scope.selectedCampaign.clientId = loginModel.getSelectedClient().id;
                }


                //set Advertiser
                if(campaignData.advertiserId && campaignData.advertiserName) {
                    $scope.selectedCampaign.advertiserName = campaignData.advertiserName;
                    $scope.selectedCampaign.advertiserId = campaignData.advertiserId;
                    var advertiserOb = {'id': campaignData.advertiserId, 'name': campaignData.advertiserName};
                    $scope.selectHandler('advertiser', advertiserOb, null)
                }

                //set Brand
                if(campaignData.brandId && campaignData.brandName) {
                    $scope.selectedCampaign.brandName = campaignData.brandName;
                    $scope.selectedCampaign.brandId = campaignData.brandId;
                    createCampaign.fetchBrands(campaignData.clientId, campaignData.advertiserId);
                }

                //set purchase Order
                if(campaignData.purchaseOrder) {
                    $scope.selectedCampaign.purchaseOrder = campaignData.purchaseOrder;
                }

                //set labels
                if(campaignData.labels && campaignData.labels.length >0) {
                    $scope.tags = workflowService.recreateLabels(campaignData.labels);
                }

                var flightDateObj= {
                    startTime : momentService.utcToLocalTime(campaignData.startTime),
                    endTime :  momentService.utcToLocalTime(campaignData.endTime),
                }

                //set startDate
                if (flightDateObj.startTime) {
                    $scope.selectedCampaign.startTime = flightDateObj.startTime;
                    startDateElem.datepicker("setStartDate", $scope.selectedCampaign.startTime);
                    startDateElem.datepicker("update", $scope.selectedCampaign.startTime);
                }

                //set endDate
                if (flightDateObj.endTime) {
                    $scope.selectedCampaign.endTime = flightDateObj.endTime;
                    $scope.handleFlightDate(flightDateObj);
                }

                //set updateAt value in hidden field.
                if(campaignData.updatedAt) {
                    $scope.selectedCampaign.updatedAt = campaignData.updatedAt;
                }

                if(campaignData.status) {
                    $scope.selectedCampaign.status = campaignData.status;
                }
                //set KPI type
                if (campaignData.kpiType) {
                    $scope.kpiName = $filter('toPascalCase')(campaignData.kpiType);
                }

                //set Kpi Value
                if (campaignData.kpiValue) {
                    $scope.kpiValue = campaignData.kpiValue;
                }

                //set Pixel Dara
                if(campaignData.pixels && campaignData.pixels.length >0) {
                    $scope.$broadcast('fetch_pixels', campaignData.pixels);
                }

                //set Media Plan Budget & Margin
                if(campaignData.totalBudget && campaignData.marginPercent >=0) {
                    $scope.Campaign.totalBudget = campaignData.totalBudget;
                    $scope.Campaign.marginPercent = campaignData.marginPercent;
                    $scope.ComputeCost();
                }

                //set cost Data
                if(campaignData.campaignCosts && campaignData.campaignCosts.length >0) {
                    $scope.additionalCosts = _.filter(campaignData.campaignCosts, function(obj) { return obj.costType && obj.costType.toUpperCase() === 'MANUAL'; });

                    $timeout(function() {
                        $("#budget").find("[data-target='#addAdditionalCost']").click();
                    }, 1500)
                }

                // line item edit mode
                createCampaign.fetchLineItemDetails(campaignData.id);

                $scope.editCampaignData = campaignData;
            }
        };

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

                    if($scope.showSubAccount){
                        $scope.workflowData['subAccounts'] = [];
                        $scope.selectedCampaign.clientId = '';
                        createCampaign.fetchSubAccounts();
                    } else {
                        $scope.selectedCampaign.clientId = data.id;
                        createCampaign.fetchAdvertisers(data.id);
                    }
                    break;

                case 'subAccount':

                    $scope.selectedCampaign.advertiser = '';
                    $scope.selectedCampaign.clientId = data.id;
                    $scope.workflowData['advertisers'] = [];
                    createCampaign.fetchAdvertisers(data.id);
                    resetPixelMediaPlan();
                    break;

                case 'advertiser' :
                    resetPixelMediaPlan();
                    $scope.workflowData['brands'] = [];
                    $scope.selectedCampaign.brand = '';
                    $scope.selectedCampaign.advertiserId = data.id;
                    selectedAdvertiser = data;
                    workflowService.setSelectedAdvertiser(selectedAdvertiser);
                    $("#brandDDL").parents('.dropdown').find('button').html("Select Brand <span class='icon-arrow-down'></span>");
                    createCampaign.fetchBrands($scope.selectedCampaign.clientId, data.id);
                    $scope.selectedCampaign.selectedPixel = [];
                    createCampaign.platforms(data.id);
                    createCampaign.fetchVendorConfigs();
                    createCampaign.fetchCostAttributes();
                    //close new line item and reset all its fields
                    $scope.resetLineItemParameters();
                    //make call to fetch billing type and values
                    createCampaign.fetchBillingTypesAndValues();
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

            if ($scope.mode !== 'edit') {
                if (startTime) {
                    if(moment(startTime).isAfter(endTime)) {
                        endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                        changeDate = moment(startTime).format(constants.DATE_US_FORMAT);
                        endDateElem.datepicker("setStartDate", changeDate);
                        endDateElem.datepicker("update", changeDate);
                    }
                }
            } else {
                endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                endDateElem.datepicker("setStartDate", endTime);
                endDateElem.datepicker("update", endTime);
            }
            if (moment(startTime).isAfter(endTime, 'day')) {
                endDateElem.datepicker("update", startTime);
            }
        };

        $scope.sucessHandler = function (result) {
            var url = '/mediaplan/' + result.data.data.id + '/overview';
            $location.url(url);
        }

        createCampaign.getBrandId = function (brandId, postDataObj) {
            brandId = Number(brandId);
            if (brandId > 0) {
                postDataObj.brandId = brandId;
            }
        };

        $scope.saveCampaign = function () {
            $scope.$broadcast('show-errors-check-validity');

            var formElem,
                formData,
                postDataObj;

            if($scope.lineItemList.length == 0){
                $scope.lineItemErrorFlag = true;
            }
            //budget of lineItem

            if($scope.selectedCampaign.lineItemBillableAmountTotal > $scope.Campaign.deliveryBudget){
                $scope.budgetLineItemErrorFlag = true;
            }
            if ($scope.createCampaignForm.$valid && $scope.lineItemList.length > 0 && $scope.budgetLineItemErrorFlag == true) {
                formElem = $("#createCampaignForm").serializeArray();
                formData = _.object(_.pluck(formElem, 'name'), _.pluck(formElem, 'value'));
                postDataObj = {};

                createCampaign.getBrandId(formData.brandId, postDataObj);

                // create mode
                postDataObj.name = formData.campaignName;
                postDataObj.advertiserId = Number(formData.advertiserId);

                if($scope.showSubAccount) {
                    postDataObj.clientId = $scope.selectedCampaign.clientId;
                } else {
                    postDataObj.clientId = loginModel.getSelectedClient().id;
                }

                postDataObj.labels = _.pluck($scope.tags, "label");

                if(formData.purchaseOrder){
                    postDataObj.purchaseOrder = formData.purchaseOrder;
                }

                postDataObj.startTime = momentService.localTimeToUTC($scope.selectedCampaign.startTime, 'startTime');
                postDataObj.endTime = momentService.localTimeToUTC($scope.selectedCampaign.endTime, 'endTime');
                postDataObj.kpiType = formData.kpi;
                postDataObj.kpiValue = formData.kpiValue;
                postDataObj.marginPercent = formData.marginPercent;
                postDataObj.deliveryBudget = formData.deliveryBudget;
                postDataObj.totalBudget = formData.totalBudget;

                if($scope.mode === 'create'){
                    postDataObj.lineItems = workflowService.processLineItemsObj(angular.copy($scope.lineItemList));
                }

                postDataObj.campaignType = 'Display';
                postDataObj.labels = _.pluck($scope.tags, "label");
                postDataObj.campaignPixels = _.pluck($scope.selectedCampaign.selectedPixel, "id");

                //for updateAt
                if($scope.selectedCampaign.updatedAt) {
                    postDataObj.updatedAt = $scope.selectedCampaign.updatedAt;
                }

                //for cost
                var campaignCosts = [];
                if(!$.isEmptyObject($scope.selectedCampaign.selectedCostAttr)) {
                    for(var i in $scope.selectedCampaign.selectedCostAttr) {
                        campaignCosts.push($scope.selectedCampaign.selectedCostAttr[i])
                    }

                    if(campaignCosts.length >0) {
                        postDataObj.campaignCosts = campaignCosts;
                    }
                }

                if($routeParams.campaignId) {
                    postDataObj.campaignId = $routeParams.campaignId;
                }

                workflowService[$scope.mode ==='edit' ? 'updateCampaign' : 'saveCampaign'](postDataObj).then(function(result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.resetLineItemParameters();
                        $scope.editLineItem = {};
                        $scope.sucessHandler(result);
                    } else {
                        console.log(result);
                    }
                }, function(result) {
                    console.log(result)
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


        //***************** Date Picker ********************
        $scope.initiateDatePicker = function () {
            var startDateElem = $('#startDateInput');
            var endDateElem = $('#endDateInput');
            var today = momentService.utcToLocalTime();
            if ($scope.mode == 'edit') {
                var campaignStartTime = momentService.utcToLocalTime($scope.editCampaignData.startTime);
                var campaignEndTime = momentService.utcToLocalTime($scope.editCampaignData.endTime);
                var currentDateTime = momentService.utcToLocalTime();
                if (moment(campaignStartTime).isAfter(currentDateTime)) {
                    startDateElem.datepicker("setStartDate", currentDateTime);
                    startDateElem.datepicker("update", campaignStartTime);
                    startDateElem.datepicker("setEndDate", campaignStartTime);
                } else {
                    startDateElem.datepicker("setStartDate", campaignStartTime);
                    startDateElem.datepicker("update", campaignStartTime);
                    startDateElem.datepicker("setEndDate", campaignStartTime);
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



        $scope.validateDateLineItem = function(date,dateType){
            if('startdate' === dateType){
                $scope.lineItemStartDate = date;
            }
            else {
                $scope.lineItemEndDate = date;
            }
        }
        //*********************** End of date ***************

        // initial initialization
        $(function () {
            $(".main_navigation_holder").find('.active_tab').removeClass('active_tab') ;
            $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
            $("html").css('background', '#fff');
            $scope.locale = $locale;
            // This sets dynamic width to line to take 100% height
            function colResize() {
                var winHeight = $(window).height() - 50;
                $("#campaignCreate .settingWrap").css('min-height', winHeight + 'px');
                $(".tbody.thin").css('max-height', winHeight - 298 + 'px');
                $(".selectedPixels").css('height', winHeight - 243 + 'px');
            }
            setTimeout(function(){ colResize(); }, 1000);


            $(window).resize(function () {
                colResize();
            });

            // This is for the drop down list. Perhaps adding this to a more general controller
            $(document).on('click', '.dropdown-menu li.available a', function () {
                $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="icon-arrow-down"></span>');
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
            $scope.campaignArchive = false;
            $scope.deleteCampaignFailed = false;
            $scope.numberOnlyPattern = /[^0-9]/g;
            $scope.hideKpiValue = false;
            $scope.client = loginModel.getSelectedClient();
            $scope.isClientDropDownDisable = false;
            createCampaign.fetchRateTypes();
            if ($scope.client.name) {
                $scope.isClientDropDownDisable = true;
                $scope.clientName = $scope.client.name;
                ($scope.mode == 'create') && $scope.selectHandler('client', $scope.client, null);
            }

            $(document).ready(function() {
                $('.input-daterange').datepicker({
                    format: "mm/dd/yyyy",
                    orientation: "top auto",
                    autoclose: true,
                    todayHighlight: true
                });


                //media plan clone
                var cloneMediaPlanObj = workflowService.getMediaPlanClone();
                if(cloneMediaPlanObj) {
                    $scope.cloneMediaPlanName = cloneMediaPlanObj.name;
                    $scope.campaignId = cloneMediaPlanObj.id;
                    $scope.mode = 'edit';
                }

                if ($scope.mode == 'edit') {
                    $scope.processEditCampaignData();
                } else {
                    $timeout(function() {
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
            setTimeout(function () {
                $('.searchClearInputBtn').fadeIn();
            }, 300);
        };

        // *************** generalized show hide of search field ***************

        $scope.searchHideInput = function () {
            var inputSearch = $('.searchInputForm input');

            $('.searchInputBtn').show();
            $('.searchClearInputBtn, .searchInputBtnInline').hide();
            $('.searchInputForm').animate({width: '34px'}, 'fast');
            setTimeout(function () {
                $('.searchInputForm').hide();
            }, 100);
        };

        $scope.searchClearInput = function () {
            var inputSearch = $('.searchInputForm input');
            inputSearch.val('');
        };

        $('body').click(function(e) {
            if ($(e.target).closest('.searchInput').length === 0) {
                $scope.searchHideInput();
            }
        });

        //Show Add Credits
        $scope.showAddCreditForm = function() {
            $(".addCreditForm").toggle();
            $(".showAddCreditForm .icon-arrow-down-thick").toggleClass("active");
        };





        // ************** PAGE 1 ******************************
        $scope.setKPIName = function(kpi){
            $scope.kpiName = kpi;
            $scope.kpiValue = '';

        }

        // nav control
        $scope.highlightLeftNav=function(pageno){
            $(".eachStepCompLabel").removeClass('active')
            $(".eachStepCompLabel")[pageno].classList.add("active");
        }


        $scope.isMediaPlanNameExist = function() {
            var target =  event.target,
                cloneMediaPlanName = target.value,
                advertiserId = $scope.selectedCampaign.advertiserId,
                url;
            $scope.checkUniqueMediaPlanNameNotFound = true;
            workflowService.checkforUniqueMediaPlan(advertiserId, cloneMediaPlanName).then(function (results) {
                $scope.checkUniqueMediaPlanNameNotFound = false;
                if (results.status === 'OK' || results.status === 'success') {
                    var responseData = results.data.data;
                    $scope.mediaPlanNameExists = responseData.isExists;
                }
            });
        };

        // use this method to access createCampaign in child
        $scope.createCampaignAccess = function(){
            return createCampaign.fetchLineItemDetails($scope.selectedCampaign.id);
        };

        function resetPixelMediaPlan(){
            $scope.lineItemList = [];
            $scope.selectedCampaign.selectedPixel = [];
        }


        $scope.$on("$locationChangeStart", function(event, next, current) {
            if ($scope.cloneMediaPlanName) {
                $modalInstance = $modal.open({
                    templateUrl: assets.html_confirmation_modal,
                    controller: 'ConfirmationModalController',
                    scope: $scope,
                    windowClass: 'delete-dialog',
                    resolve: {
                        headerMsg: function () {
                            return textConstants.MEDIA_PLAN_CLONE;
                        },
                        mainMsg: function () {
                            return textConstants.MEDIA_PLAN_WARNING_MESSAGE
                        },
                        buttonName: function () {
                            return 'Ok';
                        },
                        execute: function () {
                            return function () {
                                $scope.cloneMediaPlanName =null;
                                $location.path((next.substring($location.absUrl().length - $location.url().length)));
                            }
                        }
                    }
                });
                event.preventDefault();
            }
        });
    });
});
