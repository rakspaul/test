define(['angularAMD', 'common/services/constants_service', 'common/moment_utils',
    'workflow/directives/ng_upload_hidden', 'workflow/directives/custom_date_picker'], function (angularAMD) {
    angularAMD.controller('BudgetDeliveryController', function ($scope, constants, momentService, workflowService) {
        var unallocatedAmount = 0,
            adMaximumRevenue = 0;

        $scope.adData.primaryKpi = 'Impressions';
        $scope.adData.budgetExceeded = false;
        $scope.adData.adBudgetExceedUnallocated = false;
        $scope.isChecked = true;
        $scope.adData.unitType.name = 'CPM';
        $scope.unitName = 'CPM';
        $scope.adData.targetValue = '';
        $scope.adData.unitCost = '';
        $scope.adData.totalAdBudget = '';
        $scope.adData.budgetAmount = '';
        /*Kpi Types in an array of objects, sorted alphabetically*/
        $scope.adData.primaryKpiList=[{kpiType:'ACTION RATE', displayName:'Action Rate'},
                                       {kpiType:'CPA', displayName:'CPA'},
                                       {kpiType:'CPC', displayName:'CPC'},
                                       {kpiType:'CPM', displayName:'CPM'},
                                       {kpiType:'CTR', displayName:'CTR'},
                                       {kpiType:'IMPRESSIONS', displayName:'Impressions'},
                                       {kpiType:'VTC', displayName:'VTC'}];

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

            if ($('#targetUnitCost_squaredFour').prop('checked') &&
                ($scope.adData.primaryKpi).toUpperCase() === 'IMPRESSIONS' && $scope.unitName === 'CPM') {
                if ($scope.adData.targetValue >= 0 && $scope.adData.unitCost >= 0) {
                    $scope.adData.totalAdBudget =
                        Number((Number($scope.adData.targetValue) * Number($scope.adData.unitCost)) / 1000);
                }
            }

            campaignData = $scope.workflowData.campaignData;
            if($scope.mode=='edit'){
                unallocatedAmount = Number(localStorage.getItem('unallocatedAmount')) + Number($scope.workflowData.adsData.totalBudget);

            }else{
                unallocatedAmount = Number(localStorage.getItem('unallocatedAmount'));

            }
            //var unallocatedAmount = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));

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
            if (($scope.adData.budgetType).toUpperCase() === 'COST' &&
                ($scope.adData.totalAdBudget >= 0 && $scope.adData.budgetAmount >= 0)) {
                if (Number($scope.adData.totalAdBudget) < Number($scope.adData.budgetAmount)) {
                    $scope.adData.budgetExceeded = true;
                } else {
                    $scope.adData.budgetExceeded = false;
                }
            } else {
                $scope.adData.budgetExceeded = false;
            }
        };

        $scope.checkForPastDate = function (startDate, endDate) {
            endDate = moment(endDate).format(constants.DATE_US_FORMAT);

            return moment().isAfter(endDate, 'day');
        };

        $scope.handleEndFlightDate = function (data) {
            var endDateElem = $('#endDateInput'),
                startDateElem = $('#startDateInput'),
                startDate = data.startTime,
                endDate = data.endTime,
                adsDate = JSON.parse(localStorage.getItem('adsDates')),
                changeDate;

            // if End Date is in Past
            if (!endDate && adsDate) {
                endDate = adsDate.adEndDate;
                changeDate = endDate;
                $scope.adData.endTime = changeDate;
                if (moment().isAfter(endDate)) {
                    endDateElem.datepicker('setStartDate', moment().format(constants.DATE_US_FORMAT));
                }
            }
        };

        $scope.handleStartFlightDate = function (data) {
            var endDateElem = $('#endDateInput'),
                startDateElem = $('#startDateInput'),
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
                        endDateElem.datepicker('setEndDate', momentService.utcToLocalTime(localStorage.getItem('edTime')));
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
                        endDateElem.datepicker('setStartDate', moment().format(constants.DATE_US_FORMAT));
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

        $scope.resetBudgetField = function (bookingType) {
            $scope.adData.budgetAmount = '';
            $scope.budgetErrorObj.mediaCostValidator = '';
            $scope.budgetErrorObj.availableRevenueValidator = '';
            $scope.budgetErrorObj.availableMaximumAdRevenueValidator = '';
        };

        $scope.enable_budget_input = function (event) {
            var elem = $(event.target);

            if (elem.is(':checked')) {
                $('.totalBudgetInputClass').attr('disabled', true).addClass('disabled-field');
                $scope.calculateTotalAdBudget();
            } else {
                $('.totalBudgetInputClass').attr('disabled', false).removeClass('disabled-field');
            }
        };

        $scope.select_kpi = function (event, type) {
            var elem = $(event.target),
                impressionsHolder = $('.impressions_holder');

            $scope.adData.primaryKpi = type;
            $scope.adData.targetValue = '';
            $scope.adData.totalAdBudget = '';

            elem.closest('.symbolAbs').find('.KPI_symbol').show();
            elem.closest('.symbolAbs').find('.VTC_per').hide();
            elem.closest('.symbolAbs').find('.target_val_input').removeClass('target_val_input_vtc');

            if (type !== 'IMPRESSIONS') {
                $('#targetUnitCost_squaredFour').prop('checked', false);

                impressionsHolder
                    .find('input[type="checkbox"]')
                    .attr('disabled', true);

                elem.closest('.symbolAbs')
                    .find('.KPI_symbol')
                    .html('$');

                $('.budget_holder_input')
                    .find('input[type="text"]')
                    .attr('disabled', false)
                    .removeClass('disabled-field');

                impressionsHolder
                    .find('.external_chkbox')
                    .addClass('disabled');

                $('.external_chkbox').hide();

                if (type === 'VTC' || type === 'CTR' || type=='ACTION RATE') {
                    elem.closest('.symbolAbs')
                        .find('.KPI_symbol')
                        .html('%');
                    //elem.closest('.symbolAbs').find('.KPI_symbol').hide();
                    //elem.closest('.symbolAbs').find('.VTC_per').show();
                    //elem.closest('.symbolAbs').find('.target_val_input').addClass('target_val_input_vtc');
                }
            } else {
                elem.closest('.symbolAbs').find('.KPI_symbol').html('#');

                if (($scope.adData.unitType.name).toUpperCase() === 'CPM') {
                    $('.external_chkbox').show();
                    impressionsHolder.find('input[type="checkbox"]').attr('disabled', false);
                    $('#targetUnitCost_squaredFour').prop('checked', true);
                    $('.budget_holder_input').find('input[type="text"]').attr('disabled', true);//.addClass('disabled-field') ;
                    impressionsHolder.find('.external_chkbox').removeClass('disabled');
                }
            }
        };

        $scope.select_unitType = function (event, type) {
            var impressionsHolder = $('.impressions_holder');

            //  $scope.adData.unitType.name = type;
            $scope.unitName=type;
            $scope.adData.unitCost = '';
            $scope.adData.totalAdBudget = '';

            if (type !== 'CPM') {
                $('.external_chkbox').hide();
                $('#targetUnitCost_squaredFour').prop('checked', false);
                impressionsHolder.find('input[type="checkbox"]').attr('disabled', true);
                $('.budget_holder_input').find('input[type="text"]').attr('disabled', false).removeClass('disabled-field');
                impressionsHolder.find('.external_chkbox').addClass('disabled');
            } else {
                if (($scope.adData.primaryKpi).toUpperCase() === 'IMPRESSIONS') {
                    $('.external_chkbox').show();
                    impressionsHolder.find('input[type="checkbox"]').attr('disabled', false);
                    $('#targetUnitCost_squaredFour').prop('checked', true);
                    $('.budget_holder_input').find('input[type="text"]').attr('disabled', true);//.addClass('disabled-field') ;
                    impressionsHolder.find('.external_chkbox').removeClass('disabled');
                }
            }
        };

        $scope.$parent.initiateDatePicker = function () {
            var endDateElem = $('#endDateInput'),
                startDateElem = $('#startDateInput'),
                campaignData = $scope.workflowData.campaignData,
                campaignStartTime = momentService.utcToLocalTime(campaignData.startTime),
                campaignEndTime = momentService.utcToLocalTime(campaignData.endTime),
                adGroupStartDate,
                adGroupEndDate,
                currentDate = moment().format(constants.DATE_US_FORMAT);

            if (moment().isAfter(campaignStartTime, 'day')) {
                campaignStartTime = moment().format(constants.DATE_US_FORMAT);
            }

            $scope.mode === 'edit' && endDateElem.removeAttr('disabled').css({'background': 'transparent'});

            // If we are handling an ad of an Adgroup
            if (location.href.indexOf('adGroup') > -1) {
                if ($scope.mode === 'edit') {
                    if (momentService.isDateBefore($scope.workflowData.adGroupData.startDate, currentDate)) {
                        adGroupStartDate = currentDate;
                    } else {
                        adGroupStartDate = $scope.workflowData.adGroupData.startDate;
                    }

                    adGroupEndDate = $scope.workflowData.adGroupData.endDate;
                    startDateElem.datepicker('setStartDate', adGroupStartDate);
                    startDateElem.datepicker('setEndDate', adGroupEndDate);
                    $scope.setDateInEditMode(adGroupStartDate, adGroupEndDate);
                } else {
                    // When creating a new Adgroup ad, if Adgroup start date is:
                    // 1) before currrent date (in the past), default start & end dates will be current date
                    // 2) else (in the future)m default current date will be Adgroup start date.
                    adGroupStartDate = momentService.utcToLocalTime(localStorage.getItem('stTime'));
                    adGroupEndDate = momentService.utcToLocalTime(localStorage.getItem('edTime'));

                    if (momentService.isDateBefore(adGroupStartDate, currentDate)) {
                        startDateElem.datepicker('setStartDate', currentDate);
                        startDateElem.datepicker('update', currentDate);
                    } else {
                        startDateElem.datepicker('setStartDate', adGroupStartDate);
                        startDateElem.datepicker('update', adGroupStartDate);
                    }

                    startDateElem.datepicker('setEndDate', adGroupEndDate);
                }
            } else {
                // Normal ad (non-Adgroup)
                startDateElem.datepicker('setStartDate', campaignStartTime);
                endDateElem.datepicker('setEndDate', campaignEndTime);

                if ($scope.mode === 'edit') {
                    $scope.setDateInEditMode(campaignStartTime, campaignEndTime);
                } else {
                    startDateElem.datepicker('setEndDate', campaignEndTime);
                    startDateElem.datepicker('update', campaignStartTime);
                }
            }
        };

        $scope.$parent.budgetErrorObj = {};

        $scope.$watch('adData.budgetType', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.budgetErrorObj.availableRevenueValidator = false;
                $scope.budgetErrorObj.mediaCostValidator = false;
            }
            //  $scope.adBudgetValidator();
        });
    });
});
