define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service','login/login_model','common/moment_utils','workflow/directives/clear_row', 'workflow/directives/ng_upload_hidden'], function (angularAMD) {
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
        $scope.objectiveSet="Select all that apply";
        $scope.deliveryLesserBookedspend = false;
        $scope.Campaign.nonInventoryCost = '00.00';
        $scope.Campaign.deliveryBudget = '00.00';
        $scope.Campaign.effectiveCPM = '00.00';
        $scope.repushCampaignLoader = false;
        $scope.showSubAccount = false;
        $scope.newLineItem = {};
        $scope.lineItemName = '';
        $scope.lineItemType = '';
        $scope.lineRate = '';
        $scope.adGroupName = '';
        $scope.lineTarget = '';
        $scope.createItemList = false;
        $scope.executionPlatforms = [];
        $scope.kpiName = 'Impressions';
        //$scope.type = [{"name":"CPM"},{"name":"CPC"},{"name":"CPCV"},{"name":"COGS + Percentage Markup"},{"name":"COGS + CPM Markup"},{"name":"Flat Fee"},{"name":"Post Impression CPA"},{"name":"Post Click CPA"},{"name":"Total CPA"}];
        $scope.types = {};
        $scope.lineItemList = [];
        $scope.rateReadOnly = false;
        $scope.rateTypeReadOnly = false;
        $scope.volumeFlag = true;
        $scope.amountFlag = true;

        if(!loginModel.getMasterClient().isLeafNode) {
          $scope.showSubAccount = true;
        }




        $scope.ComputeCost = function () {
            $scope.effectiveNegative = false;
            $scope.deliveryBudgetNegative = false;
            $scope.costRowSum = 0;
            if ($scope.Campaign.costArr.length > 0 && $scope.Campaign.kpiArr.length > 0) {
                for (var i = 0; i < $scope.Campaign.costArr.length; i++) {
                    if ($scope.Campaign.costArr[i].rateTypeId) {
                        var targetValue = [];
                        if ($scope.Campaign.costArr[i].rateTypeId == 1) {
                            targetValue = _.filter($scope.Campaign.kpiArr, function (obj) {
                                return (angular.uppercase(obj.kpiType) === "IMPRESSIONS") || (angular.uppercase(obj.kpiType) === "VIEWABLE IMPRESSIONS")
                            });
                            $scope.calculateRowSum(i, targetValue, 'CPM');
                        }
                        else if ($scope.Campaign.costArr[i].rateTypeId == 2) {
                            targetValue = _.filter($scope.Campaign.kpiArr, function (obj) {
                                return angular.uppercase(obj.kpiType) === "CLICKS"
                            });
                            $scope.calculateRowSum(i, targetValue, 'CPC');
                        }
                        else if ($scope.Campaign.costArr[i].rateTypeId == 3) {
                            targetValue = _.filter($scope.Campaign.kpiArr, function (obj) {
                                return angular.uppercase(obj.kpiType) === "ACTIONS"
                            });
                            $scope.calculateRowSum(i, targetValue, 'CPA');
                        }
                        else if ($scope.Campaign.costArr[i].rateTypeId == 5) {
                            //targetValue=_.filter($scope.Campaign.kpiArr, function(obj) { return obj.kpiType === "Actions"});
                            $scope.calculateRowSum(i, '', 'FIXED');
                        }
                    }
                }

            }
            $scope.Campaign.nonInventoryCost = Math.round($scope.costRowSum * 100) / 100;//$scope.costRowSum;
            var intermediate = (parseFloat($scope.Campaign.totalBudget) * (100 - parseFloat($scope.Campaign.marginPercent)) / 100);
            $scope.Campaign.deliveryBudget = parseFloat(intermediate) - parseFloat($scope.Campaign.nonInventoryCost);
            $scope.Campaign.effectiveCPM = $scope.calculateEffective();
            if (parseFloat($scope.Campaign.nonInventoryCost) > parseFloat($scope.Campaign.totalBudget)) {
                $scope.inventoryExceeds = true;
            }else{
                $scope.inventoryExceeds=false;
            }
            if (parseFloat($scope.Campaign.deliveryBudget) < 0) {
                $scope.deliveryBudgetNegative = true;
            }else{
                $scope.deliveryBudgetNegative = false;
            }
            if (parseFloat($scope.Campaign.effectiveCPM) < 0) {
                $scope.effectiveNegative = true;
            }else{
                $scope.effectiveNegative = false;
            }
            if($scope.mode=='edit'){
                if (parseFloat($scope.Campaign.deliveryBudget) < parseFloat($scope.editCampaignData.bookedSpend)) {
                        $scope.deliveryLesserBookedspend = true;
                    }else{
                        $scope.deliveryLesserBookedspend = false;
                    }
            }
            if($scope.inventoryExceeds ||$scope.deliveryBudgetNegative ||$scope.effectiveNegative || $scope.deliveryLesserBookedspend){
                $scope.saveDisabled=true;
            }else{
                $scope.saveDisabled=false;
            }

        }

        $scope.calculateRowSum = function (index, kpiTargetArr, type) {
            if ($scope.Campaign.costArr[index].rateValue && $scope.Campaign.costArr[index].targetPercentage) {
                if (type === "FIXED") {
                    var rowsummation = parseFloat($scope.Campaign.costArr[index].rateValue) * (parseFloat($scope.Campaign.costArr[index].targetPercentage) / 100);

                } else {
                    var rowsummation = parseFloat($scope.Campaign.costArr[index].rateValue) * (parseFloat($scope.Campaign.costArr[index].targetPercentage) / 100) * parseFloat(kpiTargetArr[0].kpiValue);
                }
                if (type === "CPM") {
                    $scope.Campaign.costArr[index].rowSum = (rowsummation) / 1000;
                } else {
                    $scope.Campaign.costArr[index].rowSum = rowsummation;
                }
                $scope.costRowSum += $scope.Campaign.costArr[index].rowSum;

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
            Kpi: function () {
                //$scope.workflowData['Kpi'] = [{id: 1, name: 'Impressions', active: true}, {
                //    id: 1,
                //    name: 'Clicks',
                //    active: true
                //}, {id: 2, name: 'Viewable Impressions', active: true}, {id: 3, name: 'Actions', active: false}];
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
                    $scope.Campaign.kpiArr.push({
                        kpiType: 'Impressions',
                        isPrimary: true,
                        vendorId: '',
                        vendorName: '',
                        kpiValue: '',
                        isBillable: true
                    });
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
                workflowService.getPlatforms({cache: false}, advertiserId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        //wrapper to transform new API response to old one
                        responseData = workflowService.platformResponseModifier(responseData);
                        $scope.platformKeywords = responseData.fullIntegrationsPlatforms;
                        console.log("$scope.platformKeywords==",$scope.platformKeywords)
                    }
                })

            },
            costCategories: function () {
                //workflowService.getCostCategories({cache: false}).then(function (result) {
                //   if (result.status === "OK" || result.status === "success") {
                //        var responseData = result.data.data;
                //        $scope.workflowData['costCategory'] = responseData;
                //        createCampaign.vendor(responseData[responseData.length - 1].id);
                //    }
                //})
                // $scope.workflowData['costCategory']=[{id:0, name: 'Attribution'},{id:1, name: 'Ad Serving'},{id:2, name: 'Research'},{id:3, name: 'Verification'}];

            },
            calculation: function () {
                //$scope.workflowData['calculation'] = [{id: 1, name: 'CPM', type: 'Impressions', active: true}, {
                //    id: 2,
                //    name: 'CPC',
                //    type: "Clicks",
                //    active: false
                //}, {id: 3, name: 'CPA', type: 'Actions', active: false}, {
                //    id: 5,
                //    name: 'CPV',
                //    type: 'Actions',
                //    active: false
                //}];
            },
            vendorRate: function (categoryId, index) {
                var clientId = JSON.parse(localStorage.selectedClient).id;
                workflowService.getVendorForSelectedCostCategory(clientId, categoryId, {cache: false}).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.vendorRateData[index] = responseData;
                        if(responseData.length<=0){
                            $scope.Campaign.costArr[index].rateTypeId='';
                            $scope.Campaign.costArr[index].vendorId='';
                            $scope.Campaign.costArr[index].vendorName='Select';
                            $scope.Campaign.costArr[index].rateValue='';
                            $scope.Campaign.costArr[index].rateTypeName='Select';
                            $scope.Campaign.costArr[index].targetPercentage='';
                            $scope.Campaign.costArr[index].description='';
                            $scope.ComputeCost();
                        }
                    }
                })
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
                    console.log($scope.type)
                })
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
                    $("#brandDDL").parents('.dropdown').find('button').html("Select Brand <span class='icon-arrow-down'></span>");
                    createCampaign.fetchBrands($scope.selectedCampaign.clientId, data.id);
                    createCampaign.platforms(data.id);
                    break;
                case 'brand' :
                    $scope.selectedCampaign.brandId = data.id;
                    break;
            }
        }

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

            var isPrimarySelected = $scope.checkIfPrimaryKpiSelected();
            $scope.isPrimarySelected = isPrimarySelected;
            $scope.removeEmptyObjectCostArr();
            $scope.ComputeCost();

            var formElem = $("#createCampaignForm");
            var formData = formElem.serializeArray();
            formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));


            if ($scope.createCampaignForm.$valid && isPrimarySelected && !$scope.saveDisabled) {
                var formElem = $("#createCampaignForm");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                var postDataObj = {};
                createCampaign.getBrandId(formData.brandId, postDataObj);
                console.log('formData == ',formData)
                postDataObj.name = formData.campaignName;
                postDataObj.totalBudget = $scope.Campaign.totalBudget;
                postDataObj.marginPercent = $scope.Campaign.marginPercent ? $scope.Campaign.marginPercent :0;
                postDataObj.campaignKpis = $scope.Campaign.kpiArr;
                postDataObj.campaignCosts = $scope.newCostArr;//$scope.Campaign.costArr;
                postDataObj.campaignObjectives = $scope.checkedObjectiveList;
                postDataObj.preferredPlatforms = $scope.platFormArr;
                postDataObj.purchaseOrder = $scope.selectedCampaign.purchaseOrder;
                postDataObj.labels = _.pluck($scope.tags, "label");

                if($scope.showSubAccount) {
                    postDataObj.clientId = $scope.selectedCampaign.clientId;
                }else {
                    postDataObj.clientId = loginModel.getSelectedClient().id;
                }
                if ($scope.mode == 'edit') {
                    if (moment(formData.startTime).format(constants.DATE_UTC_SHORT_FORMAT) === momentService.utcToLocalTime($scope.editCampaignData.startTime, constants.DATE_UTC_SHORT_FORMAT))
                        postDataObj.startTime = $scope.editCampaignData.startTime;
                    else
                        postDataObj.startTime = momentService.localTimeToUTC(formData.startTime, 'startTime');//the formtime hardcoded to 23:59:59:999
                    if (moment(formData.endTime).format(constants.DATE_UTC_SHORT_FORMAT) === momentService.utcToLocalTime($scope.editCampaignData.endTime, constants.DATE_UTC_SHORT_FORMAT))
                        postDataObj.endTime = $scope.editCampaignData.endTime;
                    else
                        postDataObj.endTime = momentService.localTimeToUTC(formData.endTime, 'endTime');
                    postDataObj.advertiserId = $scope.editCampaignData.advertiserId;
                    postDataObj.updatedAt = $scope.editCampaignData.updatedAt;
                    postDataObj.campaignId = $routeParams.campaignId;
                    $scope.repushCampaignEdit = true;
                    $scope.repushData = postDataObj;
                } else {
                    $scope.saveCampaignClicked=true;
                    postDataObj.startTime = momentService.localTimeToUTC(formData.startTime, 'startTime');
                    postDataObj.endTime = momentService.localTimeToUTC(formData.endTime, 'endTime');
                    postDataObj.advertiserId = Number(formData.advertiserId);
                    workflowService.saveCampaign(postDataObj).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            $scope.saveCampaignClicked=false;
                            $scope.sucessHandler(result);
                            localStorage.setItem('topAlertMessage', $scope.textConstants.CAMPAIGN_CREATED_SUCCESS);
                        }
                    }, function() {
                        $scope.saveCampaignClicked=false;
                    });
                }
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

        $scope.getRandom = function () {
            return Math.floor((Math.random() * 6) + 1);
        };

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

          startDateElem.datepicker("setStartDate", $scope.selectedCampaign.startTime);
          startDateElem.datepicker("update", $scope.selectedCampaign.startTime);
          startDateElem.datepicker("setEndDate", $scope.selectedCampaign.startTime);

          endDateElem.datepicker("setStartDate", $scope.selectedCampaign.startTime);
          endDateElem.datepicker("update", $scope.selectedCampaign.endTime );
          endDateElem.datepicker("setEndDate", $scope.selectedCampaign.endTime);
      };

        //$scope.showKeywords = function (keyword) {
        //    if ( keyword.length > 0 )
        //        $scope.dropdownCss.display = 'block';
        //    else
        //        $scope.dropdownCss.display = 'none';
        //};
        //
        //$scope.convertPreferredPlatformToArr = function (platformsObj) {
        //    $scope.platFormArr = [];
        //    for (var i = 0; i < platformsObj.length; i++) {
        //        $scope.platFormArr.push(platformsObj[i].id);
        //    }
        //};
        //
        //$scope.selectKeyword = function (keyword) {
        //    $scope.dropdownCss.display = 'none';
        //    $scope.selectedKeywords.push(keyword);
        //    var index = _.findIndex($scope.platformKeywords, function (item) {
        //        return item.id == keyword.id
        //    });
        //    $scope.platformKeywords.splice(index, 1);
        //    $('.keyword-txt').val('');
        //    $scope.convertPreferredPlatformToArr($scope.selectedKeywords);
        //};
        //
        //$scope.removeKeyword = function (keyword) {
        //    $scope.platformKeywords.push(keyword);
        //    var index = _.findIndex($scope.selectedKeywords, function (item) {
        //        return item.id == keyword.id
        //    });
        //    $scope.selectedKeywords.splice(index, 1);
        //    $('.keyword-txt').val('');
        //};
        //$scope.highlightLeftNav=function(pageno){
        //    $(".eachStepCompLabel").removeClass('active')
        //    $(".eachStepCompLabel")[pageno].classList.add("active");
        //}

         //$scope.hideMediaPlanDropdown = function(){
         //       $('.multiSelectDDL').hide();
         //}


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
            createCampaign.Kpi();
            //createCampaign.platforms();

            // createCampaign.vendor();/*from costcategory*/
            //createCampaign.costCategories();
            //createCampaign.calculation();

            if ($scope.mode == 'edit') {
                $scope.processEditCampaignData();
            } else {
                createCampaign.objectives();
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

        $scope.createNewLineItem = function() {
            var newItem = {};
            if(newItem.name != ''){
                newItem.name = $scope.lineItemName;
                newItem.lineItemType = $scope.lineItemType;
                newItem.lineRate = $scope.lineRate;
                newItem.contractedValue = $scope.contractedValue;
                newItem.adGroupName = $scope.adGroupName;
                newItem.lineTarget = $scope.lineTarget;
                newItem.startDate = $scope.startTime;
                $scope.lineItemList.push(newItem);
                resetLineItemParameters();
            }
        };

      $scope.setLineItem = function(name,rate){
          $scope.lineItemType = name;
          $scope.lineRate = '';
          $scope.rateReadOnly = false;
          $scope.volumeFlag = true;
          $scope.amountFlag = true;

          if("COGS + Percentage Markup" === $scope.lineItemType){
              $scope.rateReadOnly = true;
              $scope.lineRate = "30% Markup";// to get via advertiser api
              $scope.volumeFlag = false;
          }
          else if("COGS + CPM Markup" === $scope.lineItemType){
              $scope.rateReadOnly = true;
              $scope.lineRate = "$3 CPM"; //to get via advertiser api
              $scope.volumeFlag = false;
          }
          else if ("Flat Fee" === $scope.lineItemType){
              $scope.volumeFlag = false;
              $scope.amountFlag = false;
          }
      };


      function resetLineItemParameters(){
          $scope.lineItemName = '';
          $scope.lineItemType = null;
          $scope.lineRate = '';
          $scope.contractedValue = '';
          $scope.adGroupName = '';
          $scope.lineTarget = '';
          $scope.createItemList = false;
          $scope.rateReadOnly = false;
          $scope.volumeFlag = true;
          $scope.amountFlag = true;
      }

      //Line Item Table Row Edit
      $scope.showEditItemRow = function(event,lineItem) {
          $(".tr .tableNormal").show();
          $(".tr .tableEdit").hide();

          var target =  event.currentTarget;
          $(target).toggle();
          $(target).closest('.tr').find('.tableEdit').toggle();
      };

      $scope.$watch('selectedCampaign.endTime',function(){
            $scope.initiateLineItemDatePicker();
      });

      $scope.$watch('selectedCampaign.startTime',function(){
          $scope.initiateLineItemDatePicker();
      });





    });
});
