define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service', 'common/moment_utils'], function (angularAMD) {
    angularAMD.controller('BudgetController', function ($scope, $rootScope, $routeParams, $locale, $location, $timeout, constants, workflowService, loginModel, momentService) {


        $scope.selectedCampaign.additionalCosts = [];

        $scope.selectedCampaign.selectedCostAttr = [];

        $scope.selectedCampaign.addAdditionalCost = function() {
            $scope.selectedCampaign.additionalCosts.push({
                key: "",
                name: "",
                value: "",
                hide: true
            });
        }

        $scope.removeCostDimension = function(event) {
            var elem = $(event.target),
                index;

            elem.closest(".each-cost-dimension").hide();
            index = Number($(event.target).closest('.each-cost-dimension').attr('data-index'));
            if($scope.selectedCampaign.selectedCostAttr && $scope.selectedCampaign.selectedCostAttr[index]) {
                $scope.selectedCampaign.selectedCostAttr.splice(index, 1);
            }
        }

        $scope.costAttributesSelected = function(costObj, attr , $event, type) {
            var selectedCostObj = {},
                index = Number($(event.target).closest('.each-cost-dimension').attr('data-index'));

            if(!$scope.selectedCampaign.selectedCostAttr || !$scope.selectedCampaign.selectedCostAttr[index] || $scope.selectedCampaign.selectedCostAttr[index].length ===0) {
                $scope.selectedCampaign.selectedCostAttr[index] = {};
            }

            $scope.selectedCampaign.selectedCostAttr[index].clientVendorConfigId = costObj.clientVendorConfigurationId;

            if(type === 'category') {
                $scope.selectedCampaign.selectedCostAttr[index].costCategoryId = attr.id;
            }

            if(type === 'vendor') {
                $scope.selectedCampaign.selectedCostAttr[index].vendorId = attr.id;
            }

            if(type === 'offer') {
                $scope.selectedCampaign.selectedCostAttr[index].name = attr.name;
            }

            if(type === 'rateValue') {
                $scope.selectedCampaign.selectedCostAttr[index]['rateValue'] = Number(attr.rateValue);
                $scope.selectedCampaign.selectedCostAttr[index]['rateTypeId'] = costObj.rateTypeId;
                $scope.selectedCampaign.selectedCostAttr[index]['costType'] = 'MANUAL'
            }
        }

        $scope.$parent.ComputeCost = function () {
            var intermediate = (parseFloat($scope.Campaign.totalBudget) * (100 - parseFloat($scope.Campaign.marginPercent)) / 100);
            $scope.Campaign.deliveryBudget = parseFloat(intermediate) - parseFloat($scope.Campaign.nonInventoryCost);
            $scope.Campaign.effectiveCPM = $scope.calculateEffective();

        }

    });
});
