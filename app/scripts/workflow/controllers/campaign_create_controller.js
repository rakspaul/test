define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service','login/login_model','common/moment_utils','workflow/directives/clear_row', 'workflow/directives/ng_upload_hidden','workflow/controllers/mediaplan_pixels_controller','workflow/directives/custom_date_picker'], function (angularAMD) {
    angularAMD.controller('CreateCampaignController', function ($scope,  $rootScope,$routeParams, $locale, $location, $timeout,constants, workflowService,loginModel,momentService) {

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
        $scope.selectedCampaign;
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
        $scope.lineItemType = '';
        $scope.lineRate = '';
        $scope.adGroupName = '';
        $scope.lineTarget = '';
        $scope.createItemList = false;
        $scope.executionPlatforms = [];
        $scope.kpiName = 'Impressions';
        $scope.kpiValue = '';

        $scope.type = {};
        $scope.lineItemList = [];
        // line item create flags
        $scope.rateReadOnly = false;
        $scope.rateTypeReadOnly = false;
        $scope.volumeFlag = true;
        $scope.amountFlag = true;
        $scope.hideLineItemRate = false;
        //line item edit flags
        $scope.rateReadOnlyEdit = false;
        $scope.rateTypeReadOnlyEdit = false;
        $scope.volumeFlagEdit = true;
        $scope.amountFlagEdit = true;
        $scope.hideLineItemRateEdit = false;

        $scope.editLineItem = {};
        $scope.vendorConfig = [];
        $scope.costAttributes = {};

        //mediaplan dates
        $scope.mediaPlanStartDate = '';
        $scope.mediaPlanSEndDate = '';
        // line item creation date
        $scope.lineItemStartDate = '';
        $scope.lineItemEndDate = '';
        $scope.totalBillableAmount = 0;

        var selectedAdvertiser,
            campaignId = '-999',
            CONST_FLAT_FEE = 'Flat Fee',
            CONST_COGS_PERCENT = 'COGS + Percentage Markup',
            CONST_COGS_CPM = 'COGS + CPM Markup';

        if(!loginModel.getMasterClient().isLeafNode) {
            $scope.showSubAccount = true;
        }




        $scope.ComputeCost = function () {
            var intermediate = (parseFloat($scope.Campaign.totalBudget) * (100 - parseFloat($scope.Campaign.marginPercent)) / 100);
            $scope.Campaign.deliveryBudget = parseFloat(intermediate) - parseFloat($scope.Campaign.nonInventoryCost);
            $scope.Campaign.effectiveCPM = $scope.calculateEffective();

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
            //workflowService.getCampaignData($scope.campaignId).then(function (result) {
            //    if (result.status === "OK" || result.status === "success") {
            //        createCampaign.objectives();
            //        $scope.editCampaignData = result.data.data;
            //        $scope.selectedCampaign.clientId = $scope.editCampaignData.clientId;
            //        $scope.selectedCampaign.advertiserId = $scope.editCampaignData.advertiserId;
            //        $scope.selectedCampaign.startTime = momentService.utcToLocalTime($scope.editCampaignData.startTime);
            //        $scope.selectedCampaign.endTime = momentService.utcToLocalTime($scope.editCampaignData.endTime);
            //        $scope.editCampaignData.brandName = $scope.editCampaignData.brandName || 'Select Brand';
            //        /*edit for new media plan*/
            //        $scope.Campaign.totalBudget = $scope.editCampaignData.totalBudget;
            //        $scope.Campaign.marginPercent = $scope.editCampaignData.marginPercent ? $scope.editCampaignData.marginPercent :0;
            //        $scope.Campaign.deliveryBudget = $scope.editCampaignData.deliveryBudget;
            //        if( $scope.editCampaignData.labels && $scope.editCampaignData.labels.length > 0){
            //            $scope.tags = workflowService.recreateLabels(_.uniq($scope.editCampaignData.labels));
            //        }
            //
            //        $scope.initiateDatePicker();
            //        $scope.mode === 'edit' && createCampaign.fetchBrands($scope.selectedCampaign.clientId, $scope.selectedCampaign.advertiserId);
            //    }
            //});
        };

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
            objectives: function () {
                workflowService.getObjectives({cache: false}).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        var branding = _.filter(responseData, function (obj) {
                            return obj.objective === "Branding"
                        });
                        $scope.workflowData['branding'] = branding[0].subObjectives;
                        var performance = _.filter(responseData, function (obj) {
                            return obj.objective === "Performance"
                        })
                        $scope.workflowData['performance'] = performance[0].subObjectives;
                        if ($scope.mode == 'edit') {
                            $scope.setObjectiveCheckedData();
                        }
                    }
                });
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
                    //$scope.Campaign.kpiArr.push({
                    //    kpiType: 'Impressions',
                    //    isPrimary: true,
                    //    vendorId: '',
                    //    vendorName: '',
                    //    kpiValue: '',
                    //    isBillable: true
                    //});
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
                //workflowService.getPlatforms({cache: false}, advertiserId).then(function (result) {
                //    if (result.status === "OK" || result.status === "success") {
                //        var responseData = result.data.data;
                //        //wrapper to transform new API response to old one
                //        responseData = workflowService.platformResponseModifier(responseData);
                //        $scope.platformKeywords = responseData.fullIntegrationsPlatforms;
                //        console.log("$scope.platformKeywords==",$scope.platformKeywords)
                //    }
                //})

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
                    workflowService.setRateTypes($scope.type);
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

            errorHandler: function (errData) {
                console.log(errData);
            }
        }

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
                case 'advertiser' :
                    $scope.workflowData['brands'] = [];
                    $scope.selectedCampaign.brand = '';
                    $scope.selectedCampaign.advertiserId = data.id;
                    selectedAdvertiser = data;
                    $("#brandDDL").parents('.dropdown').find('button').html("Select Brand <span class='icon-arrow-down'></span>");
                    createCampaign.fetchBrands($scope.selectedCampaign.clientId, data.id);
                    createCampaign.platforms(data.id);
                    createCampaign.fetchVendorConfigs();
                    createCampaign.fetchCostAttributes();
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
                endDateElem.attr("disabled", "disabled").css({'background': '#eee'});
                if (startTime) {
                    endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                    changeDate = moment(startTime).format(constants.DATE_US_FORMAT);
                    endDateElem.datepicker("setStartDate", changeDate);
                    endDateElem.datepicker("update", changeDate);
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

            if ($scope.createCampaignForm.$valid) {
                var formElem = $("#createCampaignForm").serializeArray();
                console.log(formElem)
                console.log(_.object(_.pluck(formElem, 'name'), _.pluck(formElem, 'value')));
                // var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formElem, 'name'), _.pluck(formElem, 'value'));
                var postDataObj = {};
                createCampaign.getBrandId(formData.brandId, postDataObj);

                // create mode
                postDataObj.name = formData.campaignName;
                postDataObj.advertiserId = Number(formData.advertiserId);
                if($scope.showSubAccount) {
                    postDataObj.clientId = $scope.selectedCampaign.clientId;
                }else {
                    postDataObj.clientId = loginModel.getSelectedClient().id;
                }
                postDataObj.labels = _.pluck($scope.tags, "label");
                if(formData.purchaseOrder){
                    postDataObj.labels = formData.purchaseOrder;
                }
                postDataObj.startTime = momentService.localTimeToUTC($scope.selectedCampaign.startTime, 'startTime');
                postDataObj.endTime = momentService.localTimeToUTC($scope.selectedCampaign.endTime, 'endTime');
                postDataObj.kpiType = formData.kpi;
                postDataObj.kpiValue = formData.kpiValue;
                postDataObj.marginPercent = formData.marginPercent;
                postDataObj.deliveryBudget = formData.deliveryBudget;
                postDataObj.totalBudget = formData.totalBudget;
                postDataObj.lineItems = workflowService.processLineItemsObj(angular.copy($scope.lineItemList));

                postDataObj.campaignType = 'Display';
                postDataObj.labels = _.pluck($scope.tags, "label");
                postDataObj.campaignPixels = _.pluck($scope.selectedPixel, "id");

                //for cost
                var campaignCosts = [];
                if(!$.isEmptyObject($scope.selectedCostAttr)) {
                    for(var i in $scope.selectedCostAttr) {
                        campaignCosts.push($scope.selectedCostAttr[i])
                    }

                    if(campaignCosts.length >0) {
                        postDataObj.campaignCosts = campaignCosts;
                    }
                }

                workflowService.saveCampaign(postDataObj).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        console.log('success');
                        $scope.resetLineItemParameters();
                        $scope.editLineItem = {};
                        $scope.sucessHandler(result);

                    }
                }, function() {
                });

                console.log('formData == ',formData,'postDataObj',postDataObj);
            }
        };

        $scope.repushCampaign = function () {
            $scope.repushCampaignLoader = true;
            workflowService.updateCampaign($scope.repushData, $routeParams.campaignId).then(function (result) {
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
        //
        //$scope.getRandom = function () {
        //    return Math.floor((Math.random() * 6) + 1);
        //};
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

        // line item date picker
        $scope.initiateLineItemDatePicker = function () {
            var startDateElem = $('#lineItemStartDateInput');
            var endDateElem = $('#lineItemEndDateInput');
            //var startDateElem = $('#startDateInput');
            //var endDateElem = $('#endDateInput');
            var today = momentService.utcToLocalTime();
            console.log("$scope.selectedCampaign.startTime",$('#startDateInput').val(),"$scope.selectedCampaign.endTime",$scope.selectedCampaign.endTime);
            $scope.lineItemStartDate = $scope.selectedCampaign.startTime;
            $scope.lineItemEndDate = $scope.selectedCampaign.endTime;

            //startDateElem.datepicker("setStartDate", $scope.selectedCampaign.startTime);
            startDateElem.datepicker("update", $scope.selectedCampaign.startTime);
            //startDateElem.datepicker("setEndDate", $scope.selectedCampaign.startTime);

            //endDateElem.datepicker("setStartDate", $scope.selectedCampaign.startTime);
            endDateElem.datepicker("update", $scope.selectedCampaign.endTime );
            //endDateElem.datepicker("setEndDate", $scope.selectedCampaign.endTime);
        };

        $scope.validateDateLineItem = function(date,dateType){
            console.log(date);
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
            });

            if ($scope.mode == 'edit') {
                $scope.processEditCampaignData();
            } else {
                //createCampaign.objectives();
                $scope.initiateDatePicker();
                $scope.initiateLineItemDatePicker();

            }
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



        $scope.showNormalItemRow = function(event) {
            var target =  event.currentTarget;
            $(target).closest('.tr').find('.tableNormal').toggle();
            $(target).closest('.tr').find('.tableEdit').toggle();
        };

        // ************** PAGE 1 ******************************
        $scope.setKPIName = function(kpi){
            $scope.kpiName = kpi;
        }

        //*************** LINE ITEM ****************************

        $scope.showNewLineItemForm = function(){
            $scope.createItemList = true;
            //selectedAdvertiser ={};
            //selectedAdvertiser.billingType = 'COGS + Percentage Markup';
            //selectedAdvertiser.billingValue = 23;
            if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){

                var index = _.findIndex($scope.type, function (item) {
                    return item.id === selectedAdvertiser.billingType.id;
                });

                $scope.setLineItem($scope.type[index],'create');
            }
        }


        $scope.createNewLineItem = function(mode) {
            var newItem = {};
            if(mode === 'create'){
                if($scope.lineItemName != ''){
                    newItem.name = $scope.lineItemName;
                    newItem.lineItemType = $scope.lineItemType;
                    newItem.pricingMethodId = $scope.lineItemType.id;
                    newItem.adGroupName = ($scope.adGroupName === '')?$scope.lineItemName:$scope.adGroupName;
                    newItem.billableAmount = $scope.billableAmount;
                    newItem.volume = $scope.volume;
                    newItem.pricingRate = $scope.pricingRate;
                    newItem.startTime = $scope.lineItemStartDate;
                    newItem.endTime = $scope.lineItemEndDate;
                    newItem.campaignId = campaignId;
                    //$scope.totalBillableAmount +=  $scope.billableAmount;x
                    $scope.lineItemList.push(newItem);
                    $scope.resetLineItemParameters();
                }
            } else {
                newItem.name = $scope.editLineItem.lineItemName;
                newItem.lineItemType = $scope.editLineItem.lineItemType;
                newItem.pricingMethodId = $scope.editLineItem.lineItemType.id;
                newItem.adGroupName = $scope.editLineItem.adGroupName;
                newItem.billableAmount = $scope.editLineItem.billableAmount;
                newItem.volume = $scope.editLineItem.volume;
                newItem.pricingRate = $scope.editLineItem.pricingRate;
                newItem.startTime = $scope.editLineItem.startTime;
                newItem.endTime = $scope.editLineItem.endTime;
                newItem.campaignId = (campaignId === '-999')?'-999':campaignId; // handle real edit mode
                $scope.lineItemList.push(newItem);

            }

        };

        $scope.setLineItem = function(obj,mode){
            if(mode !== 'edit'){
                $scope.lineItemType = obj;
            } else {
                $scope.editLineItem.lineItemType = obj;
            }

            if(mode === 'create'){
                $scope.lineRate = '';
                $scope.rateReadOnly = false;
                $scope.volumeFlag = true;
                $scope.amountFlag = true;
                $scope.rateTypeReadOnly = false;
                $scope.hideLineItemRate = false;
                $scope.pricingRate = '';

                if(CONST_COGS_PERCENT === $scope.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue + "% Markup";// to get via advertiser api
                        //$scope.rateTypeReadOnly = true;


                    }
                    console.log("$scope.type",$scope.type)
                    $scope.volumeFlag = false;
                    $scope.volume = '';
                }
                else if(CONST_COGS_CPM === $scope.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        //$scope.rateTypeReadOnly = true;

                    }
                    console.log("$scope.type",$scope.type)
                    $scope.volumeFlag = false;
                    $scope.volume = '';
                }
                else if (CONST_FLAT_FEE === $scope.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnly = true;

                    }

                    $scope.hideLineItemRate = true;
                    $scope.pricingRate = '0';

                    $scope.volumeFlag = false;
                    $scope.volume = '';
                    //$scope.amountFlag = false;
                    $scope.billableAmount = '';
                }
            } else {
                $scope.rateReadOnlyEdit = false;
                $scope.billableAmount = '';
                $scope.volumeFlagEdit = true;
                $scope.amountFlagEdit = true;
                $scope.hideLineItemRateEdit = false;
                //$scope.editLineItem.pricingRate = (obj.pricingRate)?obj.pricingRate:'';

                if(CONST_COGS_PERCENT === $scope.editLineItem.lineItemType.name){

                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';

                }
                else if(CONST_COGS_CPM === $scope.editLineItem.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';

                }
                else if (CONST_FLAT_FEE === $scope.editLineItem.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.hideLineItemRateEdit = true;
                    $scope.editLineItem.pricingRate = '0';

                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';
                    //$scope.amountFlagEdit = false;
                    //$scope.editLineItem.billableAmount = '';
                }
            }
        };


        $scope.resetLineItemParameters = function(){
            $scope.lineItemName = '';
            $scope.lineItemType = {};
            $scope.lineItemType.name = 'Select Type';
            $scope.volume = '';
            $scope.billableAmount = '';
            $scope.pricingRate = '';
            $scope.adGroupName = '';
            $scope.lineTarget = '';
            $scope.createItemList = false;

            $scope.rateReadOnly = false;
            $scope.volumeFlag = true;
            $scope.amountFlag = true;
        }

        var oldLineItem;
        //Line Item Table Row Edit
        $scope.showEditItemRow = function(event,lineItem) {
            oldLineItem = angular.copy(lineItem);
            $(".tr .tableNormal").show();
            $(".tr .tableEdit").hide();

            var target =  event.currentTarget;
            $(target).toggle();
            $(target).closest('.tr').find('.tableEdit').toggle();

            console.log(lineItem);
            //populate edit lineitem fields
            populateLineItemEdit(lineItem);

        };

        $scope.updateLineItem = function(newItem){
            $scope.deleteLineItem(newItem);
            console.log(newItem);
            $scope.createNewLineItem('edit');
            //$scope.lineItemList.push(index,1);

        }

        $scope.deleteLineItem = function(newItem){
            var index = _.findIndex($scope.lineItemList,function(item){
                console.log("item",item,'oldLineItem',oldLineItem);
                if(item.name === oldLineItem.name && item.billingTypeId === oldLineItem.billingTypeId && item.pricingRate === oldLineItem.pricingRate){
                    return true;
                }
            });
            $scope.lineItemList.splice(index,1);
        }

        //populate line item in case of edit and cancel of edit
        function populateLineItemEdit(lineItem) {
            $scope.editLineItem.lineItemName = lineItem.name;
            $scope.editLineItem.lineItemType = lineItem.lineItemType;
            $scope.editLineItem.pricingRate = lineItem.pricingRate;
            $scope.editLineItem.billableAmount = lineItem.billableAmount;
            $scope.editLineItem.volume = lineItem.volume;
            $scope.editLineItem.startTime = lineItem.startTime;
            $scope.editLineItem.endTime = lineItem.endTime;
            if(lineItem.adGroupName){
                $scope.editLineItem.adGroupName = lineItem.adGroupName;
            }
            $scope.setLineItem($scope.editLineItem.lineItemType,'edit');
        }

        $scope.$watch('selectedCampaign.endTime',function(){
            $scope.initiateLineItemDatePicker();
        });

        $scope.$watch('selectedCampaign.startTime',function(){
            $scope.initiateLineItemDatePicker();
        });








        // start of pixels page controller

        $scope.selectedPixel = [];
        $scope.pixelList = [];
        $scope.selectAllPixelsChecked = false;


        var _pixelTargetting = {
            resetPixel: function () {
                var i;
                for (i = 0; i < $scope.pixelList.length; i++) {
                    $scope.pixelList[i].isChecked = false;
                    $scope.pixelList[i].isIncluded = null;
                }
            }


        }

        var pixels = {
            fetchPixels: function (clientId,advertiserId) {
                workflowService.getPixels($scope.selectedCampaign.advertiserId,$scope.selectedCampaign.clientId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.pixelList = _.sortBy(responseData, 'name');
                        _.each($scope.pixelList, function( item , i ){
                            item.createdAt = momentService.newMoment(item.createdAt).format('YYYY-MM-DD');
                        });
                    }
                    else {
                        console.log(result) ;
                    }
                });
            }
        };


        $scope.$on('fetch_pixels' , function() {
            pixels.fetchPixels() ;
        }) ;

        $scope.additionalCosts = [];

        $scope.addAdditionalCost = function() {
            $scope.additionalCosts.push({
                key: "",
                name: "",
                value: "",
                hide: true
            });

        }

        $scope.removeCostDimension = function(event) {
            var elem = $(event.target) ;
            elem.closest(".each-cost-dimension").hide();
        }

        $scope.selectedCostAttr = {} ;
        $scope.costAttributesSelected = function(costObj, attr , $event, type) {
                var index = Number($(event.target).closest('.each-cost-dimension').attr('data-index'));
                var selectedCostObj = {};
                if(!$scope.selectedCostAttr[index] || $scope.selectedCostAttr[index].length ===0) {
                    $scope.selectedCostAttr[index] = {};
                }

                $scope.selectedCostAttr[index].clientVendorConfigId = costObj.clientVendorConfigurationId;

                if(type === 'category') {
                    $scope.selectedCostAttr[index].costCategoryId = attr.id;
                }

                if(type === 'vendor') {
                    $scope.selectedCostAttr[index].vendorId = attr.id;
                }

                if(type === 'offer') {
                    $scope.selectedCostAttr[index].name = attr.id;
                }

                if(type === 'rateValue') {
                    $scope.selectedCostAttr[index]['rateValue'] = Number(attr.rateValue);
                    $scope.selectedCostAttr[index]['rateTypeId'] = costObj.rateTypeId;
                    $scope.selectedCostAttr[index]['costType'] = 'MANUAL'
                }
                console.log("$scope.selectedCostAttr", $scope.selectedCostAttr);
        }

        //select or unselect indiviual audience
        $scope.selectPixel = function (pixel) {
              var pixelIndex = _.findIndex($scope.selectedPixel, function (item) {
                return item.id === pixel.id;
              });
              if (pixelIndex === -1) {
                pixel.isChecked = true;
                pixel.isIncluded = true;
                $scope.selectedPixel.push(pixel);
              } else {
                $scope.selectedPixel.splice(pixelIndex, 1);
                var index = _.findIndex($scope.pixelList, function (list) {
                  return pixel.id == list.id;
                })
                $scope.pixelList[index].isChecked = false;
                $scope.pixelList[index].isIncluded = null;
              }
            };


            $scope.selectAllPixel = function (event) {
              var i;
              $scope.selectedPixel = []; //empty the selected pixel array before populating/empting it with all the pixel
              $scope.selectAllPixelChecked = event.target.checked;
              if ($scope.selectAllPixelChecked) {
                console.log("inside if") ;
                for (i = 0; i < $scope.pixelList.length; i++) {
                  $scope.selectedPixel.push($scope.pixelList[i]);
                  $scope.pixelList[i].isChecked = true;
                  $scope.pixelList[i].isIncluded = true;
                }
              } else {
                _pixelTargetting.resetPixel(); // deselect all
              }
            };

            $scope.clearAllSelectedPixel = function () {
              _pixelTargetting.resetPixel();
              $scope.selectedPixel = [];
            };

        // end of pixels page controller


        // nav control

        $scope.highlightLeftNav=function(pageno){
            $(".eachStepCompLabel").removeClass('active')
            $(".eachStepCompLabel")[pageno].classList.add("active");
        }



    });
});
