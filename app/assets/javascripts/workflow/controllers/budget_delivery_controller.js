angObj.controller('BudgetDeliveryController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location, $filter, momentService) {



    $scope.ImpressionPerUserValidator = function() {
        $scope.budgetErrorObj.impressionPerUserValidator = false;
        var impressionPerUser = Number($scope.adData.quantity);
        if ($scope.adData.budgetType.toLowerCase() == 'impressions' && impressionPerUser >=0) {
            var totalImpression = Number($scope.adData.budgetAmount);
            if(impressionPerUser > totalImpression) {
                $scope.budgetErrorObj.impressionPerUserValidator = true;
            }
        }
    };


    $scope.adBudgetValidator = function() {
        if(!$scope.workflowData.campaignData) return false;
        $scope.budgetErrorObj.mediaCostValidator = false;
        $scope.budgetErrorObj.availableRevenueValidator = false;
        $scope.budgetErrorObj.availableMaximumAdRevenueValidator = false;

        var campaignData = $scope.workflowData.campaignData;
        var campaignBuget = Number(campaignData.deliveryBudget || 0);
        var adAvailableRevenue;
        var adsData;
        var adMaximumRevenue = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));
        var budgetAmount = Number($scope.adData.budgetAmount);

        if($scope.workflowData.adsData && $scope.mode =='edit') {
            adsData = $scope.workflowData.adsData;
            adAvailableRevenue = Number(adsData.availableRevenue);
        }
        if(budgetAmount >0) {
            $scope.ImpressionPerUserValidator();
            if ($scope.adData.budgetType.toLowerCase() == 'cost') {

                if(adAvailableRevenue) {
                    if (budgetAmount > adAvailableRevenue) {
                        $scope.budgetErrorObj.availableRevenueValidator = true;
                        $scope.budgetErrorObj.mediaCostValidator = false;
                    }
                } else if (budgetAmount > campaignBuget) {
                    $scope.budgetErrorObj.availableRevenueValidator = false;
                    $scope.budgetErrorObj.mediaCostValidator = true;
                } else if(budgetAmount > adMaximumRevenue) { //in case of create ad total budget is greater then adMaximumRevene
                    $scope.budgetErrorObj.availableMaximumAdRevenueValidator = true;
                    $scope.adMaximumRevenue = Math.round(adMaximumRevenue);
                }
            } else {
                var unitType = $scope.adData.unitType;
                var unitCost = Number($scope.adData.unitCost);
                var totalBudget;
                if (unitType.name === 'CPM') {
                    totalBudget = unitCost * (budgetAmount / 1000);
                } else if (unitType.name === 'CPC' || unitType.name === 'CPA') {
                    totalBudget = unitCost * budgetAmount;
                }
                if ($scope.mode === 'edit' && totalBudget > adAvailableRevenue) {
                    $scope.budgetErrorObj.availableRevenueValidator = true;
                }

                if($scope.mode === 'create' && totalBudget > adMaximumRevenue) { //in case of create ad total budget is greater then adMaximumRevene
                    $scope.budgetErrorObj.availableMaximumAdRevenueValidator = true;
                }



            }
        }
    }

    $scope.$watch('adData.budgetType', function(newValue, oldValue) {
        if(newValue !== oldValue) {
            $scope.budgetErrorObj.availableRevenueValidator = false;
            $scope.budgetErrorObj.mediaCostValidator = false;
        }
        $scope.adBudgetValidator();
    })

    $scope.checkForPastDate = function (startDate, endDate) {
        var endDate = moment(endDate).format(constants.DATE_US_FORMAT);
        return moment().isAfter(endDate, 'day')
    };

    $scope.handleEndFlightDate = function (data) {
        var endDateElem = $('#endDateInput');
        var startDateElem = $('#startDateInput');

        var startDate = data.startTime;
        var endDate = data.endTime;
        var adsDate = JSON.parse(localStorage.getItem('adsDates'));
        if (!endDate && adsDate) { // if End Date is in Past
            var changeDate = endDate = adsDate.adEndDate;
            $scope.adData.endTime = changeDate;
            if (moment().isAfter(endDate)) {
                endDateElem.datepicker("setStartDate", moment().format(constants.DATE_US_FORMAT));
            }
        }
    };

    $scope.handleStartFlightDate = function (data) {
        var endDateElem = $('#endDateInput');
        var startDateElem = $('#startDateInput');

        var startDate = data.startTime;
        var endDate = data.endTime;

        var campaignEndTime = momentService.utcToLocalTime($scope.workflowData['campaignData'].endTime);
        var changeDate;
        if ($scope.mode !== 'edit') {
            endDateElem.attr("disabled", "disabled").css({'background': '#eee'});
            if (startDate) {
                endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                changeDate = moment(startDate).format(constants.DATE_US_FORMAT)
                endDateElem.datepicker("setStartDate", changeDate);
                if (window.location.href.indexOf("adGroup") > -1) {
                    endDateElem.datepicker("setEndDate", momentService.utcToLocalTime(localStorage.getItem("edTime")));
                } else {
                    endDateElem.datepicker("setEndDate", campaignEndTime);
                }
                endDateElem.datepicker("update", changeDate);
            }
        } else {
            changeDate = moment(startDate).format(constants.DATE_US_FORMAT);
            var adsDate = JSON.parse(localStorage.getItem('adsDates'));
            if (!startDate && adsDate) { // if start Date is in Past
                changeDate = startDate = adsDate.adStartDate;
                $scope.adData.startTime = changeDate;
                if (moment().isAfter(endDate, 'day')) {
                    endDateElem.datepicker("setStartDate", moment().format(constants.DATE_US_FORMAT));
                }
            } else {
                endDateElem.datepicker("setStartDate", changeDate);
            }

            if (moment(startDate).isAfter(endDate, 'day')) {
                endDateElem.datepicker("update", changeDate);
            }
        }
    }

    $scope.setDateInEditMode = function (campaignStartTime, campaignEndTime) {
        var endDateElem = $('#endDateInput');
        var startDateElem = $('#startDateInput');
        var adsDate = JSON.parse(localStorage.getItem('adsDates'));
        var startDate, endDate;

console.log('campaignStartTime = ', campaignStartTime, 'campaignEndTime = ', campaignEndTime)
console.log('adsDate = ', adsDate)

        if (adsDate) {
            startDate = adsDate.adStartDate;
            endDate = adsDate.adEndDate;
        }
console.log('startDate = ', startDate, 'endDate = ', endDate)
        if (campaignStartTime > startDate) {// ads start Date in Past
            startDateElem.datepicker("setStartDate", campaignStartTime);
        }
        if (startDate > campaignStartTime) {
            startDateElem.datepicker("update", startDate);
        }
        if (campaignEndTime >= endDate) {
            startDateElem.datepicker("setEndDate", campaignEndTime);
        }
        if (moment(endDate).isAfter(campaignEndTime, 'day')) {// ads start Date in Past
console.log('TRue')
            endDateElem.datepicker("setEndDate", endDate);
            endDateElem.datepicker("setStartDate", endDate);
            endDateElem.datepicker("update", endDate);
        } else {
console.log('FALse')
            endDateElem.datepicker("setStartDate", startDate);
            endDateElem.datepicker("setEndDate", campaignEndTime);
            endDateElem.datepicker("update", endDate);
        }
    };

    $scope.resetBudgetField = function() {
        $scope.adData.budgetAmount = '';
        $scope.budgetErrorObj.mediaCostValidator = '';
        $scope.budgetErrorObj.availableRevenueValidator = '';
        $scope.budgetErrorObj.availableMaximumAdRevenueValidator = '';
    };

    $scope.$parent.initiateDatePicker = function () {
        var endDateElem = $('#endDateInput');
        var startDateElem = $('#startDateInput');

        var startDateElem = $('#startDateInput');
        var endDateElem = $('#endDateInput');
        var campaignData = $scope.workflowData['campaignData'];
        var campaignStartTime = momentService.utcToLocalTime(campaignData.startTime);
        var campaignEndTime = momentService.utcToLocalTime(campaignData.endTime);

console.dir(campaignData);

        if (moment().isAfter(campaignStartTime, 'day')) {
            campaignStartTime = moment().format(constants.DATE_US_FORMAT);
        }
        $scope.mode == 'edit' && endDateElem.removeAttr("disabled").css({'background': 'transparent'});
        if (window.location.href.indexOf("adGroup") > -1) {
            var adGroupStartDate = momentService.utcToLocalTime(localStorage.getItem("stTime"));
            var adGroupEndDate = momentService.utcToLocalTime(localStorage.getItem("edTime"));

console.log('LOCALSTORAGE');
console.dir(localStorage);
console.log('adGroupStartDate = ', adGroupStartDate, 'adGroupEndDate = ', adGroupEndDate)

            startDateElem.datepicker("setStartDate", adGroupStartDate);
            startDateElem.datepicker("setEndDate", adGroupEndDate);
            if ($scope.mode == 'edit') {
                $scope.setDateInEditMode(adGroupStartDate, adGroupEndDate);
console.log('EDIT MODE IN ADGROUP')
            } else {
                startDateElem.datepicker("update", adGroupStartDate);
            }
        } else {
            startDateElem.datepicker("setStartDate", campaignStartTime);
            endDateElem.datepicker("setEndDate", campaignEndTime);
            if ($scope.mode == 'edit') {
                $scope.setDateInEditMode(campaignStartTime, campaignEndTime);
            } else {
                startDateElem.datepicker("setEndDate", campaignEndTime);
                startDateElem.datepicker("update", campaignStartTime);
            }
        }
    };


});