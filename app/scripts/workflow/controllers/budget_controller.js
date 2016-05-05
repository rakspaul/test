define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service', 'common/moment_utils'], function (angularAMD) {
    angularAMD.controller('BudgetController', function ($scope, $rootScope, $routeParams, $locale, $location, $timeout, constants, workflowService, loginModel, momentService) {

        $scope.selectedCampaign.additionalCosts = [];
        $scope.selectedCampaign.addAdditionalCost = function() {
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

        $scope.costAttributesSelected = function(costObj, attr , $event, type) {
            var selectedCostObj = {},
                index = Number($(event.target).closest('.each-cost-dimension').attr('data-index'));

            if(!$scope.selectedCampaign.selectedCostAttr[index] || $scope.selectedCampaign.selectedCostAttr[index].length ===0) {
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
    });
});