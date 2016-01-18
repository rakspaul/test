var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CreateCampaignController', function ($scope, $rootScope, $window, $routeParams, $locale, $timeout, $location, constants, workflowService, utils, loginModel, momentService) {
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
        $scope.platFormArr = [];
        $scope.selectedChannel = "Display";
        $scope.Campaign.marginPercent = 0;
        $scope.isPrimarySelected = true;
        $scope.costRowSum = 0;
        $scope.workflowData = {};
        $scope.vendorRateData = [];
        $scope.newCostArr = [];
        $scope.brand = [];
        $scope.performance = [];
        $scope.objectiveSet="Select all that apply";

        $scope.selectedKpi = function (index, kpi) {
            // $scope.Campaign.kpiArr[index]['kpiId']=kpi.id;
            $scope.Campaign.kpiArr[index]['kpiType'] = kpi.name;

            $scope.enableDisableCalculationType();
            if ($scope.Campaign.kpiArr[index].isPrimary || $scope.Campaign.kpiArr[index].isPrimary == "true") {
                if (angular.uppercase(kpi.name) === "IMPRESSIONS" || angular.uppercase(kpi.name) === "VIEWABLE IMPRESSIONS") {
                    $scope.primaryType = "CPM"
                }
                else if (angular.uppercase(kpi.name) == "CLICKS") {
                    $scope.primaryType = "CPC"
                }
                else if (angular.uppercase(kpi.name) == "ACTIONS") {
                    $scope.primaryType = "CPA"
                }
            }
        }
        $scope.enableDisableCalculationType = function () {
            var impression = _.filter($scope.Campaign.kpiArr, function (obj) {
                return (angular.uppercase(obj.kpiType) === "IMPRESSIONS" || angular.uppercase(obj.kpiType) === "VIEWABLE IMPRESSIONS")
            });
            if (impression.length > 0) {
                $scope.workflowData['calculation'][0].active = true;
            } else {
                $scope.workflowData['calculation'][0].active = false;
            }
            var clicks = _.filter($scope.Campaign.kpiArr, function (obj) {
                return angular.uppercase(obj.kpiType) === "CLICKS"
            });
            if (clicks.length > 0) {
                $scope.workflowData['calculation'][1].active = true;
            } else {
                $scope.workflowData['calculation'][1].active = false;
            }
            var actions = _.filter($scope.Campaign.kpiArr, function (obj) {
                return angular.uppercase(obj.kpiType) === "ACTIONS"
            });
            if (actions.length > 0) {
                $scope.workflowData['calculation'][2].active = true;
            } else {
                $scope.workflowData['calculation'][2].active = false;
            }
        }
        $scope.selectedVendor = function (index, vendor) {
            $scope.Campaign.kpiArr[index]['vendorId'] = vendor.id;
            $scope.Campaign.kpiArr[index]['vendorName'] = vendor.name;
        }
        $scope.primaryKpiSelected = function (event, index, isSet) {
            var target = $(event.target);
            target.parent().siblings().removeClass('active');
            target.parent().addClass('active');
            if (isSet) {
                /*left Nav primary Kpi impression Value*/
                $scope.PrimaryImpressions = $scope.Campaign.kpiArr[index].kpiValue;
                var primaryType = $scope.Campaign.kpiArr[index].kpiType;
                /*Effective CPM/CPC/CPA text value to change*/
                if (angular.uppercase(primaryType) == "IMPRESSIONS" || angular.uppercase(primaryType) == "VIEWABLE IMPRESSSIONS") {
                    $scope.primaryType = "CPM"
                }
                else if (angular.uppercase(primaryType) == "CLICKS") {
                    $scope.primaryType = "CPC"
                }
                else if (angular.uppercase(primaryType) == "ACTIONS") {
                    $scope.primaryType = "CPA"
                }
                /*set other primary Kpis as false*/
                for (var i in $scope.Campaign.kpiArr) {
                    console.log($scope.Campaign.kpiArr[i].isPrimary);
                    if ($scope.Campaign.kpiArr[i].isPrimary) {
                        $scope.Campaign.kpiArr[i].isPrimary = false;
                    }
                }
            } else {
                $scope.PrimaryImpressions = "undefined";
            }
            $scope.Campaign.kpiArr[index]['isPrimary'] = isSet;
        }
        $scope.setLeftNavPrimaryKpi = function (index) {
            if ($scope.Campaign.kpiArr[index].isPrimary || $scope.Campaign.kpiArr[index].isPrimary == "true") {
                /*left Nav primary Kpi impression Value*/
                $scope.PrimaryImpressions = $scope.Campaign.kpiArr[index].kpiValue;
            }
        }
        $scope.kpiBilling = function (event, index, isSet) {
            var target = $(event.target);
            target.parent().siblings().removeClass('active');
            target.parent().addClass('active');
            $scope.Campaign.kpiArr[index]['isBillable'] = isSet;
            console.log(index);
        }
        $scope.selectedCostCategory = function (index, costObj) {
            $scope.Campaign.costArr[index]['costCategoryId'] = costObj.id;
            $scope.Campaign.costArr[index]['costCategoryName'] = costObj.name;
            //make a call to vendorRate API with the ID
            createCampaign.vendorRate(costObj.id, index);
        }
        $scope.selectedCalculation = function (index, calObj) {
            $scope.Campaign.costArr[index]['rateTypeId'] = calObj.id;
            $scope.Campaign.costArr[index]['rateTypeName'] = calObj.name;
            /*set model for rateValue*/
            // console.log($scope.vendorRateData[index]['vendors']);
            if ($scope.vendorRateData[index] && ($scope.Campaign.costArr[index]['vendorId'])) {
                console.log("vendorID:", $scope.Campaign.costArr[index]['vendorId']);
                var selectedVendorIndex = _.filter($scope.vendorRateData[index], function (obj) {
                    return obj.id === Number($scope.Campaign.costArr[index]['vendorId'])
                });
//                    var selectedVendorIndex=_.filter($scope.vendorRateData[index]['vendors'], function(obj) { return obj.id === Number($scope.Campaign.costArr[index]['vendorId'])});
                console.log(selectedVendorIndex);
                console.log($scope.Campaign.costArr[index]['rateTypeName']);
                if ($scope.Campaign.costArr[index]['rateTypeName'] === "fixed") {
                    var rateObj = _.filter(selectedVendorIndex[0].rates, function (obj) {
                        return obj.rate_type === "FIXED"
                    });
                    $scope.Campaign.costArr[index]['rateValue'] = rateObj[0].rate_val;
                } else if ($scope.Campaign.costArr[index]['rateTypeName'] === "CPM") {
                    var rateObj = _.filter(selectedVendorIndex[0].rates, function (obj) {
                        return obj.rate_type === "CPM"
                    });
                    $scope.Campaign.costArr[index]['rateValue'] = rateObj[0].rate_val;
                } else if ($scope.Campaign.costArr[index]['rateTypeName'] === "CPC") {
                    var rateObj = _.filter(selectedVendorIndex[0].rates, function (obj) {
                        return obj.rate_type === "CPC"
                    });
                    $scope.Campaign.costArr[index]['rateValue'] = rateObj[0].rate_val;
                } else if ($scope.Campaign.costArr[index]['rateTypeName'] === "CPA") {
                    var rateObj = _.filter(selectedVendorIndex[0].rates, function (obj) {
                        return obj.rate_type === "CPA"
                    });
                    $scope.Campaign.costArr[index]['rateValue'] = rateObj[0].rate_val;
                }
            }
        }
        $scope.rateTypeSelected = function (event, index, isSet) {
            var target = $(event.target);
            target.parent().siblings().removeClass('active');
            target.parent().addClass('active');
            $scope.Campaign.costArr[index]['type'] = isSet;
            if (isSet == 'fixed') {
                $scope.Campaign.costArr[index]['rateTypeName'] = "Select";
                $scope.Campaign.costArr[index]['rateTypeId'] = 5;
                var selectedVendorIndex = _.filter($scope.vendorRateData[index], function (obj) {
                    return obj.id === Number($scope.Campaign.costArr[index]['vendorId'])
                });
//                var selectedVendorIndex=_.filter($scope.vendorRateData[index]['vendors'], function(obj) { return obj.id === Number($scope.Campaign.costArr[index]['vendorId'])});
                var rateObj = _.filter(selectedVendorIndex[0].rates, function (obj) {
                    return obj.rate_type === "FIXED"
                });
                $scope.Campaign.costArr[index]['rateValue'] = rateObj[0].rate_val;
            }
            console.log(index);
        }
        $scope.selectedVendorRate = function (index, vendorObj) {
            $scope.Campaign.costArr[index]['vendorId'] = vendorObj.id;
            $scope.Campaign.costArr[index]['vendorName'] = vendorObj.name;
            if ($scope.Campaign.costArr[index]['type'] === "fixed") {
                var rateObj = _.filter(vendorObj.rates, function (obj) {
                    return obj.rate_type === "FIXED"
                });
                $scope.Campaign.costArr[index]['rateValue'] = rateObj[0].rate_val;
            } else if ($scope.Campaign.costArr[index]['rateTypeName'] === "CPM") {
                var rateObj = _.filter(vendorObj.rates, function (obj) {
                    return obj.rate_type === "CPM"
                });
                $scope.Campaign.costArr[index]['rateValue'] = rateObj[0].rate_val;
            } else if ($scope.Campaign.costArr[index]['rateTypeName'] === "CPC") {
                var rateObj = _.filter(vendorObj.rates, function (obj) {
                    return obj.rate_type === "CPC"
                });
                $scope.Campaign.costArr[index]['rateValue'] = rateObj[0].rate_val;
            } else if ($scope.Campaign.costArr[index]['rateTypeName'] === "CPA") {
                var rateObj = _.filter(vendorObj.rates, function (obj) {
                    return obj.rate_type === "CPA"
                });
                $scope.Campaign.costArr[index]['rateValue'] = rateObj[0].rate_val;
            }
        }
        $scope.ComputeCost = function () {

            $scope.effectiveNegative = false;
            $scope.deliveryBudgetNegative = false;
            // $scope.Campaign.nonInventoryCost=parseInt($scope.Campaign.totalBudget)*((100-parseInt($scope.Campaign.marginPercent))/100);
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
            //console.log($scope.costRowSum);
            $scope.Campaign.nonInventoryCost = Math.round($scope.costRowSum * 100) / 100;//$scope.costRowSum;
            var intermediate = (parseFloat($scope.Campaign.totalBudget) * (100 - parseFloat($scope.Campaign.marginPercent)) / 100);
            $scope.Campaign.deliveryBudget = parseFloat(intermediate) - parseFloat($scope.Campaign.nonInventoryCost);
//                $scope.Campaign.deliveryBudget= parseFloat($scope.Campaign.totalBudget)*(100-parseFloat($scope.Campaign.marginPercent)) - $scope.Campaign.nonInventoryCost;
            $scope.Campaign.effectiveCPM = $scope.calculateEffective();
            if (parseFloat($scope.Campaign.nonInventoryCost) > parseFloat($scope.Campaign.totalBudget)) {
                $scope.inventoryExceeds = true;
            }
            if (parseFloat($scope.Campaign.deliveryBudget) < 0) {
                $scope.deliveryBudgetNegative = true;
            }
            if (parseFloat($scope.Campaign.effectiveCPM) < 0) {
                $scope.effectiveNegative = true;
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
        }
        $scope.checkedObjectiveList = [];
        $scope.addMoreKpi = function () {
            $scope.Campaign.kpiArr.push({
                kpiType: 'Select from list',
                isPrimary: false,
                vendorId: '',
                vendorName: '',
                kpiValue: 0,
                isBillable: true
            });
            $(".selectkpiObj").show();
        }
        $scope.addMoreCost = function () {
            $scope.Campaign.costArr.push({
                costCategoryId: '',
                costCategoryName: '',
                type: 'variable',
                rateTypeId: '',
                rateTypeName: '',
                vendorId: '',
                vendorName: '',
                rateValue: '',
                targetPercentage: 100,
                description: ''
            });
            $(".selectcostObj").show();

        }
        $scope.msgtimeoutReset = function () {
            $timeout(function () {
                $scope.resetFlashMessage();
            }, 3000);
        }
        $scope.triggerBudgetClick = function () {
            console.log("triggerEVENt")
            angular.element('.budget-page-trigger').trigger('click');
        }

        $scope.archiveCampaign = function (event) {
            var campaignArchiveErrorHandler = function () {
                $rootScope.setErrAlertMessage();
            }
            workflowService.deleteCampaign($scope.campaignId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.campaignArchive = false;
                    var url = '/mediaplans';
                    if ($scope.editCampaignData.adsCount > 0) {
                        localStorage.setItem('topAlertMessage', $scope.editCampaignData.name + " and " + $scope.editCampaignData.adsCount + " has been archived");
                    } else {
                        localStorage.setItem('topAlertMessage', $scope.editCampaignData.name + " has been archived");
                    }
                    $location.url(url);
                } else {
                    campaignArchiveErrorHandler();
                }
            }, campaignArchiveErrorHandler);
        }
        $scope.cancelArchiveCampaign = function () {
            $scope.campaignArchive = !$scope.campaignArchive;
        }

        $scope.numbersOnly = function (scopeVar) {
            if (scopeVar === 'budgetAmount' && $scope.mode != "edit" && $scope.selectedCampaign.budget != undefined)
                $scope.selectedCampaign.budget = $scope.selectedCampaign.budget.replace($scope.numberOnlyPattern, '');

        }
        $scope.channelSelected = function (event, channel) {
            var target = $(event.target);
            target.parent().siblings().removeClass('active');
            target.parent().addClass('active');
            $scope.selectedChannel = channel;
        }

        $scope.onObjectiveSelected = function (objectiveObj, type) {
            // console.log(objectiveObj);
            var index = _.findIndex($scope.checkedObjectiveList, function (item) {
                return item.campaignObjectiveTypeId == objectiveObj.campaignObjectiveTypeId
            }); //console.log(index);
            if (index >= 0) {
                $scope.checkedObjectiveList.splice(index, 1);
            } else {
                objectiveObj.isChecked = true;
                $scope.checkedObjectiveList.push(objectiveObj);
            }
            /*separate Brand and performance values in objectives into array to show on left Nav*/
            var isBrand = _.filter($scope.workflowData['branding'], function (obj) {
                return obj.campaignObjectiveTypeId == objectiveObj.campaignObjectiveTypeId
            });
            /*if it belongs to brands, add into brand Arr*/
            if (isBrand.length > 0) {
                var brandInd = _.findIndex($scope.brand, function (item) {
                    return item == objectiveObj.subObjective
                });
                if (brandInd >= 0) {
                    $scope.brand.splice(brandInd, 1);
                } else {
                    $scope.brand.push(objectiveObj.subObjective);
                }
            } else { /*belongs to performance*/
                var performanceId = _.findIndex($scope.performance, function (item) {
                    return item == objectiveObj.subObjective
                });
                if (performanceId >= 0) {
                    $scope.performance.splice(performanceId, 1);
                } else {
                    $scope.performance.push(objectiveObj.subObjective);
                }
            }
            $scope.ObjectiveSetLabel();
        };

        $scope.open_multiselect_dropdown = function (event) {
            var elem = $(event.target);
            if (elem.closest(".dropdown").find(".dropdown-menu ").is(":visible") == false) {
                elem.closest(".dropdown").find(".dropdown-menu ").show();
            } else {
                elem.closest(".dropdown").find(".dropdown-menu ").hide();
            }
        };

        $scope.processEditCampaignData = function () {
            workflowService.getCampaignData($scope.campaignId).then(function (result) {
                console.log(result);
                if (result.status === "OK" || result.status === "success") {
                    createCampaign.objectives();
                    $scope.editCampaignData = result.data.data;
                    $scope.selectedCampaign.clientId = $scope.editCampaignData.clientId;
                    $scope.selectedCampaign.advertiserId = $scope.editCampaignData.advertiserId;
                    $scope.selectedCampaign.startTime = momentService.utcToLocalTime($scope.editCampaignData.startTime);
                    $scope.selectedCampaign.endTime = momentService.utcToLocalTime($scope.editCampaignData.endTime);
                    $scope.editCampaignData.brandName = $scope.editCampaignData.brandName || 'Select Brand';
                    /*edit for new media plan*/
                    $scope.Campaign.totalBudget = $scope.editCampaignData.totalBudget;
                    $scope.Campaign.marginPercent = $scope.editCampaignData.marginPercent;
                    $scope.Campaign.deliveryBudget = $scope.editCampaignData.deliveryBudget;
                    /*write condition for orange text here also*/
                    if (parseFloat($scope.Campaign.deliveryBudget) < 0) {
                        $scope.deliveryBudgetNegative = true;
                    }
                    $scope.Campaign.nonInventoryCost=$scope.editCampaignData.nonInventoryCost;
                    $scope.Campaign.effectiveCPM=$scope.editCampaignData.effectiveCpm;
                    if(parseFloat($scope.Campaign.effectiveCPM)<0){$scope.effectiveNegative=true;}

                    $scope.selectedChannel = $scope.editCampaignData.campaignType;


                    /*Left Nav brands and Performance code*/
                    if ($scope.editCampaignData.selectedObjectives && $scope.editCampaignData.selectedObjectives.length > 0) {
                        $scope.processObjectiveData($scope.editCampaignData.selectedObjectives);
                    }
                    $scope.primaryType = $scope.editCampaignData.isPrimary == "IMPRESSIONS" ? 'CPM' : 'CPC';
                    /*for the effective CPC/CPM/CPA*/
                    if ($scope.editCampaignData.campaignKpis && $scope.editCampaignData.campaignKpis.length > 0) {
                        $scope.Campaign.kpiArr = $scope.editCampaignData.campaignKpis;
                        var index = _.findIndex($scope.Campaign.kpiArr, function (item) {
                            return item.isPrimary == true;
                        })
                        $scope.PrimaryImpressions = $scope.Campaign.kpiArr[index].kpiValue;
                    }
                    if ($scope.editCampaignData.campaignCosts && $scope.editCampaignData.campaignCosts.length > 0) {
                        for (var i = 0; i < $scope.editCampaignData.campaignCosts.length; i++) {
                            $scope.Campaign.costArr.push($scope.editCampaignData.campaignCosts[i].campaignCostObj);
                            createCampaign.vendorRate($scope.editCampaignData.campaignCosts[i].campaignCostObj.costCategoryId, i);
                        }
                        $scope.enableDisableCalculationType();
                    }
                    if ($scope.editCampaignData.preferredPlatforms) {
                        $scope.selectedKeywords = $scope.editCampaignData.preferredPlatforms['fullIntegrationsPlatforms'];
                    }

                    $scope.initiateDatePicker();
                    $scope.mode === 'edit' && createCampaign.fetchBrands($scope.selectedCampaign.clientId, $scope.selectedCampaign.advertiserId);
                }
            });
        }
        $scope.processObjectiveData = function (objectiveObj) {
            var brandingArr = _.filter(objectiveObj, function (obj) {
                return obj.objective === "Branding"
            })
            if (brandingArr.length > 0)
                $scope.brand = brandingArr[0].subObjectives;
            var performanceArr = _.filter(objectiveObj, function (obj) {
                return obj.objective === "Performance"
            })
            if (performanceArr.length > 0)
                $scope.performance = performanceArr[0].subObjectives;

            $scope.ObjectiveSetLabel();
        }
        $scope.ObjectiveSetLabel=function(){
            if($scope.brand.length>0 && $scope.performance.length>0){
                $scope.objectiveSet="Branding & Performance"
            }else if($scope.brand.length>0){
                $scope.objectiveSet="Branding"
            }else if($scope.performance.length>0){
                $scope.objectiveSet="Performance"
            }

        }
        $scope.setObjectiveCheckedData = function () {
            if ($scope.editCampaignData.campaignObjectives && $scope.editCampaignData.campaignObjectives.length > 0) {
                var objective = $scope.editCampaignData.campaignObjectives;
                $scope.brandArray = _.filter(objective, function (obj) {
                    return obj.campaignObjectiveType['objective'] === "Branding"
                })
                if ($scope.brandArray.length > 0) {
                    for (var i = 0; i < $scope.brandArray.length; i++) {
                        //   $scope.brandArray[i].campaignObjectiveType['isChecked']=true;
                        var index = _.findIndex($scope.workflowData['branding'], function (item) {
                            return item.campaignObjectiveTypeId == $scope.brandArray[i].campaignObjectiveType.campaignObjectiveTypeId
                        });
                        $scope.workflowData['branding'][index].isChecked = true;
                        $scope.checkedObjectiveList.push($scope.brandArray[i].campaignObjectiveType)
                    }
                }
                $scope.performanceArray = _.filter(objective, function (obj) {
                    return obj.campaignObjectiveType['objective'] === "Performance"
                })
                if ($scope.performanceArray.length > 0) {
                    for (var i = 0; i < $scope.performanceArray.length; i++) {
                        var index = _.findIndex($scope.workflowData['performance'], function (item) {
                            return item.campaignObjectiveTypeId == $scope.performanceArray[i].campaignObjectiveType.campaignObjectiveTypeId
                        });
                        $scope.workflowData['performance'][index].isChecked = true;
                        $scope.checkedObjectiveList.push($scope.performanceArray[i].campaignObjectiveType)
                    }
                }

            }
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
                $scope.workflowData['Kpi'] = [{id: 1, name: 'Impressions', active: true}, {
                    id: 1,
                    name: 'Clicks',
                    active: true
                }, {id: 2, name: 'Viewable Impressions', active: true}, {id: 3, name: 'Actions', active: false}];
            },
            vendor: function (costCategoryId) {
                workflowService.getVendors(costCategoryId, {cache: false}).then(function (result) {
                    console.log(result);
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['vendor'] = responseData;
                    }
                })


            },
            platforms: function () {
                if ($scope.mode === 'create') {
                    $scope.Campaign.kpiArr.push({
                        kpiType: 'Impressions',
                        isPrimary: true,
                        vendorId: '',
                        vendorName: '',
                        kpiValue: 0,
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
                workflowService.getPlatforms({cache: false}).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.platformKeywords = responseData.fullIntegrationsPlatforms;
                    }
                })

            },
            costCategories: function () {
                workflowService.getCostCategories({cache: false}).then(function (result) {
                    console.log(result);
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['costCategory'] = responseData;
                        console.log("responseData[responseData.length-1].id", responseData[responseData.length - 1].id)
                        createCampaign.vendor(responseData[responseData.length - 1].id);
                    }
                })
                // $scope.workflowData['costCategory']=[{id:0, name: 'Attribution'},{id:1, name: 'Ad Serving'},{id:2, name: 'Research'},{id:3, name: 'Verification'}];

            },
            calculation: function () {
                $scope.workflowData['calculation'] = [{id: 1, name: 'CPM', type: 'Impressions', active: true}, {
                    id: 2,
                    name: 'CPC',
                    type: "Clicks",
                    active: false
                }, {id: 3, name: 'CPA', type: 'Actions', active: false}, {
                    id: 5,
                    name: 'CPV',
                    type: 'Actions',
                    active: false
                }];
            },
            vendorRate: function (categoryId, index) { //console.log(index);
                var clientId = JSON.parse(localStorage.selectedClient).id;
                workflowService.getVendorForSelectedCostCategory(clientId, categoryId, {cache: false}).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        console.log(responseData);
                        $scope.vendorRateData[index] = responseData;
                    }
                })
            },
            fetchAdvertisers: function (clientId) {
                workflowService.getAdvertisers(clientId).then(function (result) {
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
                workflowService.getBrands(clientId, advertiserId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['brands'] = _.sortBy(responseData, 'name');
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            errorHandler: function (errData) {
                console.log(errData);
            }
        }

        $scope.selectHandler = function (type, data, event) {
            switch (type) {
                case 'client' :
                    $scope.workflowData['advertisers'] = {};
                    $scope.workflowData['brands'] = {};
                    $scope.selectedCampaign.advertiser = '';
                    $scope.selectedCampaign.clientId = data.id;
                    createCampaign.fetchAdvertisers(data.id);
                    break;
                case 'advertiser' :
                    $scope.workflowData['brands'] = {};
                    $scope.selectedCampaign.brand = '';
                    $scope.selectedCampaign.advertiserId = data.id;
                    $("#brandDDL").parents('.dropdown').find('button').html("Select Brand <span class='icon-arrow-down'></span>");
                    createCampaign.fetchBrands($scope.selectedCampaign.clientId, data.id);
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
                    changeDate = moment(startTime).format(constants.DATE_US_FORMAT); //console.log(moment(startTime).tz("EST").format('YYYY-MM-DD HH:mm:ss.SSS'));
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
        }

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
        $scope.checkIfPrimaryKpiSelected = function () {
            var kpiObj = _.filter($scope.Campaign.kpiArr, function (obj) {
                return obj.isPrimary == true || obj.isPrimary == 'true'
            });
            if (kpiObj.length <= 0) {
                return false;
            } else {
                return true;
            }
        }
        $scope.removeEmptyObjectCostArr = function () {
            for (var i = 0; i < $scope.Campaign.costArr.length; i++) {
                if ($scope.Campaign.costArr[i].costCategoryId && $scope.Campaign.costArr[i].rateTypeId && $scope.Campaign.costArr[i].rateValue && $scope.Campaign.costArr[i].vendorId) {
                    $scope.newCostArr.push($scope.Campaign.costArr[i]);
                }
            }
        }

        $scope.saveCampaign = function () {
            console.log("campaign create saveCampaign...");
            $scope.$broadcast('show-errors-check-validity');
            console.log($scope.createCampaignForm)
            var isPrimarySelected = $scope.checkIfPrimaryKpiSelected();
            $scope.isPrimarySelected = isPrimarySelected;
            console.log("$scope.isPrimarySelected", $scope.isPrimarySelected);
            $scope.removeEmptyObjectCostArr();
            if ($scope.createCampaignForm.$valid && isPrimarySelected) {
                var formElem = $("#createCampaignForm");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                var postDataObj = {};
                createCampaign.getBrandId(formData.brandId, postDataObj);

                postDataObj.name = formData.campaignName;
                postDataObj.campaignType = $scope.selectedChannel;
                postDataObj.totalBudget = $scope.Campaign.totalBudget;
                postDataObj.marginPercent = $scope.Campaign.marginPercent;
                postDataObj.campaignKpis = $scope.Campaign.kpiArr;
                postDataObj.campaignCosts = $scope.newCostArr;//$scope.Campaign.costArr;
                postDataObj.campaignObjectives = $scope.checkedObjectiveList;
                postDataObj.preferredPlatforms = $scope.platFormArr;
                postDataObj.clientId = loginModel.getSelectedClient().id;
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
                    console.log($scope.repushData);
                } else {
                    postDataObj.startTime = momentService.localTimeToUTC(formData.startTime, 'startTime');//console.log(postDataObj.startTime)
                    postDataObj.endTime = momentService.localTimeToUTC(formData.endTime, 'endTime');//console.log(postDataObj.endTime)
                    postDataObj.advertiserId = Number(formData.advertiserId);
                    console.log(postDataObj);
                    workflowService.saveCampaign(postDataObj).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            $scope.sucessHandler(result);
                            localStorage.setItem('topAlertMessage', $scope.textConstants.CAMPAIGN_CREATED_SUCCESS);
                        }
                    });
                }
            }
        };

        $scope.repushCampaign = function () {
            $scope.repushCampaignEdit = false;
            workflowService.updateCampaign($scope.repushData, $routeParams.campaignId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.sucessHandler(result);
                    localStorage.setItem('topAlertMessage', $scope.textConstants.CAMPAIGN_UPDATED_SUCCESS);
                    localStorage.setItem('campaignData', '');
                    $scope.repushCampaignEdit = false;
                } else {
                    console.log(result);
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
            if ($scope.mode == 'edit') {
                var startDateElem = $('#startDateInput');
                var endDateElem = $('#endDateInput');
                var today = new Date();
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
                var startDateElem = $('#startDateInput');
                var endDateElem = $('#endDateInput');
                var today = momentService.utcToLocalTime();
                startDateElem.datepicker("setStartDate", today);
                endDateElem.datepicker("setStartDate", today);
                startDateElem.datepicker("update", today);
                $scope.selectedCampaign.startTime = today;
                $scope.selectedCampaign.endTime = today;
            }
        };

        $scope.showKeywords = function (keyword) {
            if (keyword.length > 0)
                $scope.dropdownCss.display = 'block';
            else
                $scope.dropdownCss.display = 'none';

        };

        $scope.convertPreferredPlatformToArr = function (platformsObj) {
            $scope.platFormArr = [];
            for (var i = 0; i < platformsObj.length; i++) {
                $scope.platFormArr.push(platformsObj[i].id);
            }
        };

        $scope.selectKeyword = function (keyword) {
            $scope.dropdownCss.display = 'none';
            $scope.selectedKeywords.push(keyword);
            var index = _.findIndex($scope.platformKeywords, function (item) {
                return item.id == keyword.id
            });
            $scope.platformKeywords.splice(index, 1);
            $('.keyword-txt').val('');
            $scope.convertPreferredPlatformToArr($scope.selectedKeywords);
            console.log("selectedKeywords", $scope.selectedKeywords);
        };

        $scope.removeKeyword = function (keyword) {
            $scope.platformKeywords.push(keyword);
            var index = _.findIndex($scope.selectedKeywords, function (item) {
                return item.id == keyword.id
            });
            $scope.selectedKeywords.splice(index, 1);
            $('.keyword-txt').val('');
        };
        $scope.highlightLeftNav=function(pageno){
            $(".eachStepCompLabel").removeClass('active')
            $(".eachStepCompLabel")[pageno].classList.add("active");
        }

        $(function () {
            $(".main_navigation_holder").find('.active_tab').removeClass('active_tab') ;
            $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
            $("html").css('background', '#fff');
            $scope.locale = $locale;
            // This sets dynamic width to line to take 100% height
            function colResize() {
                var winHeight = $(window).height() - 50;
                $("#campaignCreate .settingWrap").css('min-height', winHeight + 'px');
            }

            colResize();
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
            if ($scope.client.name) {
                $scope.isClientDropDownDisable = true;
                $scope.clientName = $scope.client.name;
                ($scope.mode == 'create') && $scope.selectHandler('client', $scope.client, null);
            }

            $('.input-daterange').datepicker({
                //format: "mm/dd/yyyy",
                format: "mm/dd/yyyy",
                orientation: "auto",
                autoclose: true,
                todayHighlight: true
            });
            createCampaign.Kpi();
            createCampaign.platforms();

            // createCampaign.vendor();/*from costcategory*/
            createCampaign.costCategories();
            createCampaign.calculation();
            if ($scope.mode == 'edit') {
                $scope.processEditCampaignData();
            } else {
                createCampaign.objectives();
                $scope.initiateDatePicker();

            }
        })
    });
})();