angObj.controller('BudgetDeliveryController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, 
    utils, $location, $filter, momentService) {
    $scope.ImpressionPerUserValidator = function () {
        var impressionPerUser = Number($scope.adData.quantity),
            totalImpression;

        $scope.budgetErrorObj.impressionPerUserValidator = false;
        if ($scope.adData.budgetType.toLowerCase() === 'impressions' && impressionPerUser >= 0) {
            totalImpression = Number($scope.adData.budgetAmount);
            if (impressionPerUser > totalImpression) {
                $scope.budgetErrorObj.impressionPerUserValidator = true;
            }
        }
    };

    $scope.adBudgetValidator = function () {
        var campaignData,
            campaignBuget,
            adAvailableRevenue,
            adsData,
            adMaximumRevenue,
            budgetAmount,
            unitType,
            unitCost,
            totalBudget;

        if (!$scope.workflowData.campaignData) {
            return false;
        }
        $scope.budgetErrorObj.mediaCostValidator = false;
        $scope.budgetErrorObj.availableRevenueValidator = false;
        $scope.budgetErrorObj.availableMaximumAdRevenueValidator = false;

        campaignData = $scope.workflowData.campaignData;
        campaignBuget = Number(campaignData.deliveryBudget || 0);
        adMaximumRevenue = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));
        budgetAmount = Number($scope.adData.budgetAmount);

        if ($scope.workflowData.adsData && $scope.mode === 'edit') {
            adsData = $scope.workflowData.adsData;
            adAvailableRevenue = Number(adsData.availableRevenue);
        }
        if (budgetAmount > 0) {
            $scope.ImpressionPerUserValidator();
            if ($scope.adData.budgetType.toLowerCase() === 'cost') {
                if (adAvailableRevenue) {
                    if (budgetAmount > adAvailableRevenue) {
                        $scope.budgetErrorObj.availableRevenueValidator = true;
                        $scope.budgetErrorObj.mediaCostValidator = false;
                    }
                } else if (budgetAmount > campaignBuget) {
                    $scope.budgetErrorObj.availableRevenueValidator = false;
                    $scope.budgetErrorObj.mediaCostValidator = true;
                } else if (budgetAmount > adMaximumRevenue) { 
                    //in case of create ad total budget is greater then adMaximumRevene
                    $scope.budgetErrorObj.availableMaximumAdRevenueValidator = true;
                    $scope.adMaximumRevenue = Math.round(adMaximumRevenue);
                }
            } else {
                unitType = $scope.adData.unitType;
                unitCost = Number($scope.adData.unitCost);
                totalBudget;
                if (unitType.name === 'CPM') {
                    totalBudget = unitCost * (budgetAmount / 1000);
                } else if (unitType.name === 'CPC' || unitType.name === 'CPA') {
                    totalBudget = unitCost * budgetAmount;
                }
                if ($scope.mode === 'edit' && totalBudget > adAvailableRevenue) {
                    $scope.budgetErrorObj.availableRevenueValidator = true;
                }
                if ($scope.mode === 'create' && totalBudget > adMaximumRevenue) { 
                    //in case of create ad total budget is greater then adMaximumRevene
                    $scope.budgetErrorObj.availableMaximumAdRevenueValidator = true;
                }
            }
        }
    };

    $scope.checkForPastDate = function (startDate, endDate) {
        var endDate = moment(endDate).format(constants.DATE_US_FORMAT);

        return moment().isAfter(endDate, 'day')
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
            campaignEndTime = momentService.utcToLocalTime($scope.workflowData.campaignData.endTime),
            changeDate,
            adsDate;

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
            endDate;

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
    };

    $scope.resetBudgetField = function () {
        $scope.adData.budgetAmount = '';
        $scope.budgetErrorObj.mediaCostValidator = '';
        $scope.budgetErrorObj.availableRevenueValidator = '';
        $scope.budgetErrorObj.availableMaximumAdRevenueValidator = '';
    };

    $scope.$parent.initiateDatePicker = function () {
        var endDateElem = $('#endDateInput'),
            startDateElem = $('#startDateInput'),
            startDateElem = $('#startDateInput'),
            endDateElem = $('#endDateInput'),
            campaignData = $scope.workflowData.campaignData,
            campaignStartTime = momentService.utcToLocalTime(campaignData.startTime),
            campaignEndTime = momentService.utcToLocalTime(campaignData.endTime),
            adGroupStartDate,
            adGroupEndDate;

        if (moment().isAfter(campaignStartTime, 'day')) {
            campaignStartTime = moment().format(constants.DATE_US_FORMAT);
        }
        $scope.mode === 'edit' && endDateElem.removeAttr('disabled').css({'background': 'transparent'});
        if (location.href.indexOf('adGroup') > -1) {
            adGroupStartDate = momentService.utcToLocalTime(localStorage.getItem('stTime'));
            adGroupEndDate = momentService.utcToLocalTime(localStorage.getItem('edTime'));
            startDateElem.datepicker('setStartDate', adGroupStartDate);
            startDateElem.datepicker('setEndDate', adGroupEndDate);
            if ($scope.mode === 'edit') {
                $scope.setDateInEditMode(adGroupStartDate, adGroupEndDate);
            } else {
                startDateElem.datepicker('update', adGroupStartDate);
            }
        } else {
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
        $scope.adBudgetValidator();
    });
});