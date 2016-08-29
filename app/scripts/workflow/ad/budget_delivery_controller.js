define(['angularAMD', 'ng-upload-hidden', 'custom-date-picker'], function (angularAMD) {
    'use strict';

    angularAMD.controller('BudgetDeliveryController', ['$scope', 'constants', 'momentService',
        'vistoconfig', 'workflowService', function ($scope, constants, momentService, vistoconfig, workflowService) {
        var unallocatedAmount = 0,
            adMaximumRevenue = 0;

        $scope.adData.primaryKpi = 'Impressions';
        $scope.adData.selectedSetting = {name: constants.VERIFICATION_DEFAULT, id: -1}; // vendor config setting
        $scope.adData.budgetExceeded = false;
        $scope.adData.adBudgetExceedUnallocated = false;
        $scope.isChecked = true;
        $scope.adData.unitType.name = 'CPM';
        $scope.unitName = 'CPM';
        $scope.adData.targetValue = '';
        $scope.adData.unitCost = '';
        $scope.adData.totalAdBudget = '';
        $scope.adData.budgetAmount = '';

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

        $scope.resetBudgetField = function () {
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
                impressionsHolder = $('.impressions_holder'),
                percentageSymbolArr = ['VTC', 'CTR', 'ACTION RATE', 'SUSPICIOUS ACTIVITY RATE', 'VIEWABLE RATE'];

            $scope.adData.primaryKpi = type;
            $scope.adData.targetValue = '';
            $scope.adData.totalAdBudget = '';

            elem.closest('.symbolAbs').find('.KPI_symbol').show();
            elem.closest('.symbolAbs').find('.VTC_per').hide();
            elem.closest('.symbolAbs').find('.target_val_input').removeClass('target_val_input_vtc');
            elem.closest('.symbolAbs').find('.KPI_symbol').removeClass('perSymbol');

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

                if($.inArray(type, percentageSymbolArr) !== -1){
                    elem.closest('.symbolAbs')
                        .find('.KPI_symbol')
                        .addClass('perSymbol')
                        .html('%');
                }else if(type === 'VIEWABLE IMPRESSIONS'){
                    elem.closest('.symbolAbs').find('.KPI_symbol').html('#');
                }
            } else {
                elem.closest('.symbolAbs').find('.KPI_symbol').html('#');

                if (($scope.adData.unitType.name).toUpperCase() === 'CPM') {
                    $('.external_chkbox').show();
                    impressionsHolder.find('input[type="checkbox"]').attr('disabled', false);
                    $('#targetUnitCost_squaredFour').prop('checked', true);
                    $('.budget_holder_input').find('input[type="text"]').attr('disabled', true);
                    impressionsHolder.find('.external_chkbox').removeClass('disabled');
                }

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
