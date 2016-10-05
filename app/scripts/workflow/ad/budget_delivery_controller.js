define(['angularAMD', 'ng-upload-hidden', 'custom-date-picker'], function (angularAMD) {
    'use strict';

    angularAMD.controller('BudgetDeliveryController', ['$scope', 'constants', 'momentService',
        'vistoconfig', 'workflowService', function ($scope, constants, momentService, vistoconfig, workflowService) {
        var unallocatedAmount = 0,
            adMaximumRevenue = 0;

        $scope.adData.selectedSetting = {name: constants.VERIFICATION_DEFAULT, id: -1}; // vendor config setting
        $scope.adData.primaryKpi = 'CPM';
        $scope.adData.budgetExceeded = false;
        $scope.adData.adBudgetExceedUnallocated = false;
        $scope.isChecked = true;
        $scope.adData.unitType.name = 'CPM';
        $scope.unitName = 'CPM';
        $scope.adData.targetValue = '';
        $scope.adData.unitCost = '';
        $scope.adData.totalAdBudget = '';
        $scope.adData.existingAdBudget = 0;
        $scope.adData.budgetAmount = '';
        $scope.adData.targetImpressions = '';
        $scope.adData.targetClicks = '';
        $scope.adData.targetActions = '';
        $scope.adData.autoCompute = true;
        $scope.adData.fetchValue = false;
        $scope.adData.budgetType = 'Impressions';
        $scope.adData.isOverbooked = true;
        // Kpi Types in an array of objects, sorted alphabetically
        $scope.adData.primaryKpiList = vistoconfig.kpiList;

        $scope.ImpressionPerUserValidator = function () {
            var impressionPerUser = Number($scope.adData.quantity),
                totalImpression;

            $scope.budgetErrorObj.impressionPerUserValidator = false;

            if ($scope.adData.budgetType.toUpperCase() === 'IMPRESSIONS' && impressionPerUser >= 0) {
                totalImpression = Number($scope.adData.budgetAmount);

                if (impressionPerUser > totalImpression) {
                    $scope.budgetErrorObj.impressionPerUserValidator = true;
                }
            }
        };

        $scope.calculateTotalAdBudget = function () {
            var campaignData;

            if (($scope.adData.primaryKpi.toUpperCase() === 'CTR' ||
                    $scope.adData.primaryKpi.toUpperCase() ===' VTC' ||
                    $scope.adData.primaryKpi.toUpperCase() === 'ACTION RATE'
                ) &&
                Number($scope.adData.targetValue)>100) {
                $scope.adData.targetValue=100;
            }

            if ($scope.adData.primaryKpi.toUpperCase() === 'IMPRESSIONS') {
                $scope.adData.targetValue = Math.round($scope.adData.targetValue);
            }

            if ($('#targetUnitCost_squaredFour').prop('checked') &&
                ($scope.adData.primaryKpi).toUpperCase() === 'IMPRESSIONS' && $scope.unitName === 'CPM') {
                if ($scope.adData.targetValue >= 0 && $scope.adData.unitCost >= 0) {
                    $scope.adData.totalAdBudget =
                        Number((Number($scope.adData.targetValue) * Number($scope.adData.unitCost)) / 1000);
                }
            }

            campaignData = $scope.workflowData.campaignData;

            if ($scope.mode === 'edit') {
                unallocatedAmount = Number(localStorage.getItem('unallocatedAmount')) +
                    Number($scope.workflowData.adsData.totalBudget);
            } else {
                unallocatedAmount = Number(localStorage.getItem('unallocatedAmount'));
            }

            // new budget calculation
            if (workflowService.getIsAdGroup() === false) {
                unallocatedAmount = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));
            } else {
                if (unallocatedAmount > 0) {
                    adMaximumRevenue = Number(unallocatedAmount);
                } else {
                    if (Number(localStorage.getItem('groupBudget')) > 0) {
                        adMaximumRevenue = 0;
                    } else {
                        adMaximumRevenue = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));
                    }
                }
            }

            if ($scope.adData.totalAdBudget > unallocatedAmount || $scope.adData.totalAdBudget > adMaximumRevenue) {
                $scope.adData.adBudgetExceedUnallocated = true;
            } else {
                $scope.adData.adBudgetExceedUnallocated = false;
            }
        };

        $scope.checkBudgetExceed = function () {
            var totalBudget = Number($scope.adData.totalAdBudget);
            var availableBudget = Number($scope.workflowData.adGroupData.deliveryBudget - $scope.workflowData.adGroupData.bookedSpend) + Number($scope.adData.existingAdBudget);
            var mediaCost = Number($scope.adData.budgetAmount);
            //validate adgroup budget with ad budget
            if (totalBudget >= 0 && (totalBudget>availableBudget)) {
                $scope.adData.adBudgetExceedUnallocated = true;
            } else {
                $scope.adData.adBudgetExceedUnallocated = false;
            }

            //validate ad budget with booking cost
            if (($scope.adData.budgetType).toLowerCase() === 'cost' && totalBudget >=0 && mediaCost >=0 && (totalBudget<mediaCost)) {
                $scope.adData.budgetExceeded = true;
            } else {
                $scope.adData.budgetExceeded = false;
            }

            /*if (($scope.adData.budgetType).toUpperCase() === 'COST' &&
                ($scope.adData.totalAdBudget >= 0 && $scope.adData.budgetAmount >= 0)) {
                if (Number($scope.adData.totalAdBudget) < Number($scope.adData.budgetAmount)) {
                    $scope.adData.budgetExceeded = true;
                } else {
                    $scope.adData.budgetExceeded = false;
                }
            } else {
                $scope.adData.budgetExceeded = false;
            }*/
        };

        $scope.checkImpsValue = function() {
            if(!$scope.adData.targetImpressions) {
                $scope.budgetErrorObj.targetImpressionValidator = true;
            }
            else {
                $scope.budgetErrorObj.targetImpressionValidator = false;
            }
        };

        $scope.checkForPastDate = function (startDate, endDate) {
            endDate = moment(endDate).format(constants.DATE_US_FORMAT);

            return moment().isAfter(endDate, 'day');
        };

        $scope.handleEndFlightDate = function (data) {
            var endDateElem = $('#endDateInput'),
                endDate = data.endTime,
                adsDate = JSON.parse(localStorage.getItem('adsDates')),
                changeDate;

            // if End Date is in Past
            if (!endDate && adsDate) {
                endDate = adsDate.adEndDate;
                changeDate = endDate;
                $scope.adData.endTime = changeDate;

                if (moment().isAfter(endDate)) {
                    endDateElem.datepicker('setStartDate',
                        moment().format(constants.DATE_US_FORMAT));
                }
            }
        };

        $scope.handleStartFlightDate = function (data) {
            var endDateElem = $('#endDateInput'),
                startDate = data.startTime,
                endDate = data.endTime,
                campaignEndTime,
                changeDate,
                adsDate;

            if (!$scope.workflowData.campaignData) {
                return;
            }

            campaignEndTime = momentService.utcToLocalTime($scope.workflowData.campaignData.endTime);

            if ($scope.mode !== 'edit') {
                endDateElem
                    .attr('disabled', 'disabled')
                    .css({'background': '#eee'});

                if (startDate) {
                    endDateElem
                        .removeAttr('disabled')
                        .css({'background': 'transparent'});

                    changeDate = moment(startDate).format(constants.DATE_US_FORMAT);
                    endDateElem.datepicker('setStartDate', changeDate);

                    if (location.href.indexOf('adGroup') > -1) {
                        endDateElem.datepicker('setEndDate',
                            momentService.utcToLocalTime(localStorage.getItem('edTime')));
                    } else {
                        endDateElem.datepicker('setEndDate', campaignEndTime);
                    }

                    endDateElem.datepicker('update', changeDate);
                }
            } else {
                changeDate = moment(startDate).format(constants.DATE_US_FORMAT);
                adsDate = JSON.parse(localStorage.getItem('adsDates'));

                // if start Date is in Past
                if (!startDate && adsDate) {
                    changeDate = startDate = adsDate.adStartDate;
                    $scope.adData.startTime = changeDate;

                    if (moment().isAfter(endDate, 'day')) {
                        endDateElem
                            .datepicker('setStartDate',
                            moment().format(constants.DATE_US_FORMAT));
                    }
                } else {
                    endDateElem.datepicker('setStartDate', changeDate);
                }

                if (moment(startDate).isAfter(endDate, 'day')) {
                    endDateElem.datepicker('update', changeDate);
                }
            }
        };

        $scope.setDateInEditMode = function (campaignStartTime, campaignEndTime) {
            var endDateElem = $('#endDateInput'),
                startDateElem = $('#startDateInput'),
                adsDate = JSON.parse(localStorage.getItem('adsDates')),
                startDate,
                endDate,
                currentDate;

            if (adsDate) {
                startDate = adsDate.adStartDate;
                endDate = adsDate.adEndDate;
            }

            // ads start Date in Past
            if (campaignStartTime > startDate) {
                startDateElem.datepicker('setStartDate', campaignStartTime);
            }

            if (startDate > campaignStartTime) {
                startDateElem.datepicker('update', startDate);
            }

            if (campaignEndTime >= endDate) {
                startDateElem.datepicker('setEndDate', campaignEndTime);
            }

            // ads start Date in Past
            if (moment(endDate).isAfter(campaignEndTime, 'day')) {
                endDateElem.datepicker('setEndDate', endDate);
                endDateElem.datepicker('setStartDate', endDate);
                endDateElem.datepicker('update', endDate);
            } else {
                endDateElem.datepicker('setStartDate', startDate);
                endDateElem.datepicker('setEndDate', campaignEndTime);
                endDateElem.datepicker('update', endDate);
            }

            // this is to disable the enddate before today
            currentDate = moment().format(constants.DATE_US_FORMAT);

            if (startDate < currentDate) {
                endDateElem.datepicker('setStartDate', currentDate);
            }
        };

        $scope.resetBudgetField = function (budgetType) {
            $scope.adData.budgetAmount = '';
            $scope.adData.budgetExceeded = false;
            $scope.adData.budgetType = budgetType;
            $scope.adData.fetchValue = false;
            $scope.adData.overbookPercent = '';
            $scope.adData.isOverbooked = false;
            $scope.budgetErrorObj.mediaCostValidator = '';
            $scope.budgetErrorObj.availableRevenueValidator = '';
            $scope.budgetErrorObj.availableMaximumAdRevenueValidator = '';
        };

        $scope.fetch_existing_target_value = function (event) {
            var elem = $(event.target);
            if (elem.is(':checked')) {
                $scope.adData.fetchValue = true;
                elem.closest('.budgetFields').find('#budgetAmount').attr('disabled', true).addClass('disabled-field');
                if($scope.adData.budgetType && $scope.adData.budgetType.toLowerCase() === 'impressions') {
                    $scope.adData.budgetAmount =  $scope.adData.targetImpressions;
                } else {
                    $scope.adData.budgetAmount =  $scope.adData.totalAdBudget;
                }
            } else {
                $scope.adData.fetchValue = false;
                elem.closest('.budgetFields').find('#budgetAmount').attr('disabled', false).removeClass('disabled-field');
                $scope.adData.budgetAmount = '';
            }
        };

        $scope.enable_budget_input = function (event) {
            var elem = $(event.target);

            if (elem.is(':checked')) {
                $('#autoComputeDiv').prev().find('input[type="text"]').attr('disabled', true).addClass('disabled-field');
                $scope.computeTargetValue();
            } else {
                $('#autoComputeDiv').prev().find('input[type="text"]').attr('disabled', false).removeClass('disabled-field');
            }
        };

            $scope.percentageValueCheck = function (event,type) {
                var elem = $(event.target),
                    rateArray = vistoconfig.kpiTypeSymbolMap['%'];
                var value = elem.val();
                if ((($.inArray(type.toUpperCase(),rateArray) !== -1) ||
                    type.toUpperCase() === 'OVERBOOK') &&
                    Number(value) > 100) {
                    elem.val(100);
                }
            };

            $scope.computeTargetValue = function() {
                var type = $scope.adData.primaryKpi.toUpperCase()!=='CPM'?$scope.adData.primaryKpi:'CPM';
                if($scope.adData.autoCompute){
                    switch (type) {
                        case 'CPM' : {
                                        if($scope.adData.totalAdBudget && $scope.adData.targetValue) {
                                            $scope.adData.targetImpressions = Math.round(Number(($scope.adData.totalAdBudget *1000) / $scope.adData.targetValue));
                                            $scope.checkImpsValue();
                                        }
                                        break;
                        }

                        case 'CPC' : {
                                        if($scope.adData.totalAdBudget && $scope.adData.targetValue) {
                                            $scope.adData.targetClicks = Math.round(Number($scope.adData.totalAdBudget / $scope.adData.targetValue));
                                        }
                                        break;
                        }

                        case 'CPA':
                        case 'POST CLICK CPA' : {
                                                    if($scope.adData.totalAdBudget && $scope.adData.targetValue) {
                                                        $scope.adData.targetActions = Math.round(Number(($scope.adData.totalAdBudget / $scope.adData.targetValue)));
                                                    }
                                                    break;
                        }

                        case 'CTR': {
                                        if($scope.adData.targetImpressions && $scope.adData.targetValue){
                                            $scope.adData.targetClicks = Math.round(Number($scope.adData.targetImpressions * $scope.adData.targetValue)/ 100);
                                        }
                                        break;
                        }

                    }
                }


                if(type.toUpperCase() === 'IMPRESSIONS') {
                    $scope.adData.targetImpressions = $scope.adData.targetValue;
                }

                if($scope.adData.fetchValue){
                    if($scope.adData.budgetType && $scope.adData.budgetType.toLowerCase() === 'impressions') {
                        $scope.adData.budgetAmount =  $scope.adData.targetImpressions;
                    } else {
                        $scope.adData.budgetAmount =  $scope.adData.totalAdBudget;
                    }
                }

            };

            $scope.isKpiFieldOptional = function(fieldName) {
                var res = true;
                var type = $scope.adData.primaryKpi.toUpperCase()!=='CPM'?$scope.adData.primaryKpi:'CPM';
                var kpiOptionalFieldMap = {
                    'actions':['CPA', 'POST CLICK CPA'],
                    'clicks':['CPC', 'CTR']
                };

                for (var i in kpiOptionalFieldMap) {
                    if (($.inArray(type, kpiOptionalFieldMap[i]) !== -1) && (i===fieldName)) {
                        res = false;
                        break;
                    }
                }
                return res;
            };



            $scope.select_kpi = function (event, type) {
                var elem = $(event.target),
                    kpiTypeSymbolMap = vistoconfig.kpiTypeSymbolMap,
                    autoComputeKpiTypeMap = {
                        '.targetActions':['CPA', 'POST CLICK CPA'],
                        '.targetImpressions':['CPM'],
                        '.targetClicks':['CPC', 'CTR']
                    };

                $scope.adData.primaryKpi = type;
                $scope.adData.targetValue = '';
                $scope.adData.targetImpressions = '';
                $scope.adData.targetActions = '';
                $scope.adData.targetClicks = '';
                //$scope.adData.totalAdBudget = '';

                if($scope.adData.fetchValue && $scope.adData.budgetType.toLowerCase() !== 'cost') {
                    $scope.adData.budgetAmount = '';
                }

                var symbol = '';

                for (var j in kpiTypeSymbolMap) {
                    if ($.inArray(type, kpiTypeSymbolMap[j]) !== -1) {
                        symbol = j;
                        break;
                    }
                }

                if (symbol === '') {
                    symbol = constants.currencySymbol;
                }

                elem.closest('.symbolAbs')
                    .find('#primaryKpiDiv')
                    .find('.KPI_symbol')
                    .html(symbol);

                var flag = false;
                $('#kpiFieldsDiv').find('.targetInputHolder').find('.targetImpressions').find('input[type="text"]').attr('disabled', false).removeClass('disabled-field');
                for (var i in autoComputeKpiTypeMap) {
                    if ($.inArray(type, autoComputeKpiTypeMap[i]) !== -1) {
                        var autoCompute = $('#autoComputeDiv');
                        autoCompute.closest('.targetInputHolder').find('.targetInputs').find('input[type="text"]').attr('disabled', false).removeClass('disabled-field');
                        autoCompute.detach();
                        var kpiFieldsDiv = $('#kpiFieldsDiv').find(i);
                        if(autoCompute.find('input[type="checkbox"]').is(':checked')){
                            kpiFieldsDiv.find('input[type="text"]').attr('disabled', true).addClass('disabled-field');
                        }
                        kpiFieldsDiv.after(autoCompute);
                        autoCompute.show();
                        flag = true;
                        break;
                    }
                }

                if (!flag) {
                    var autoComputeOld = $('#autoComputeDiv');
                    autoComputeOld.closest('.targetInputHolder').find('.targetInputs').find('input[type="text"]').attr('disabled', false).removeClass('disabled-field');
                    autoComputeOld.hide();
                    if (type.toLowerCase() === 'impressions') {
                        $('#kpiFieldsDiv').find('.targetInputHolder').find('.targetImpressions').find('input[type="text"]').attr('disabled', true).addClass('disabled-field');
                    }
                }

            };

            $scope.enableChkBox = function(event) {
                var elem = $(event.target);
                if (elem.is(':checked')) {
                    $scope.adData.autoCompute = true;
                    $scope.enableFreqCap = true;
                    $scope.adData.setCap = true;
                } else {
                    $scope.adData.autoCompute = false;
                    $scope.enableFreqCap = false;
                    $scope.adData.setCap = false;
                }

            };

        $scope.select_unitType = function (event, type) {
            var impressionsHolder = $('.impressions_holder');

            $scope.unitName=type;
            $scope.adData.unitCost = '';
            $scope.adData.totalAdBudget = '';

            if (type !== 'CPM') {
                $('.external_chkbox').hide();
                $('#targetUnitCost_squaredFour').prop('checked', false);
                impressionsHolder.find('input[type="checkbox"]').attr('disabled', true);

                $('.budget_holder_input')
                    .find('input[type="text"]')
                    .attr('disabled', false)
                    .removeClass('disabled-field');

                impressionsHolder.find('.external_chkbox').addClass('disabled');
            } else {
                if (($scope.adData.primaryKpi).toUpperCase() === 'IMPRESSIONS') {
                    $('.external_chkbox').show();
                    impressionsHolder.find('input[type="checkbox"]').attr('disabled', false);
                    $('#targetUnitCost_squaredFour').prop('checked', true);
                    $('.budget_holder_input').find('input[type="text"]').attr('disabled', true);
                    impressionsHolder.find('.external_chkbox').removeClass('disabled');
                }
            }
        };

        $scope.$parent.budgetErrorObj = {};

        $scope.$watch('adData.budgetType', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.budgetErrorObj.availableRevenueValidator = false;
                $scope.budgetErrorObj.mediaCostValidator = false;
            }
        });


        $scope.selectVerificationSetting = function(setting) {
            $scope.adData.selectedSetting.name = setting.name;
            $scope.adData.selectedSetting.id = setting.id;
        };

    }]);
});
