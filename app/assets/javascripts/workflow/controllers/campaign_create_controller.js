var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CreateCampaignController', function ($scope, $window, constants, workflowService) {
        $scope.textConstants = constants;
        $scope.workflowData = {};
        var createCampaign = {
            clients :  function() {
                workflowService.getClients().then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['clients'] =  _.sortBy(responseData, 'name');
                        console.log($scope.workflowData);
                    }
                    else{
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchAdvertisers :  function(clientId) {
                workflowService.getAdvertisers(clientId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['advertisers'] =  _.sortBy(responseData, 'name');
                    }
                    else{
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchBrands : function(advertiserId) {
                workflowService.getBrands(advertiserId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['brands'] =  _.sortBy(responseData, 'name');
                    }
                    else{
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchGoals :  function() {
                $scope.workflowData['goals'] = [{id : 1, name : 'Brand'} ,{id : 1, name : 'Performance'}]
            },


            errorHandler : function(errData) {
                console.log(errData);
            }
        }


        $scope.workflowData['post_value'] = {};
        $scope.selectHandler =  function(type, data) {
            if(type === 'client') {
                createCampaign.fetchAdvertisers(data.clientId);
                $scope.workflowData['post_value']['clientId'] = data.clientId;
            }
            else if(type == 'advertiser') {
                createCampaign.fetchBrands(data.advertiserId);
                $scope.workflowData['post_value']['advertiserId'] = data.advertiserId;
            }

            else if(type === 'brand') {
                $scope.workflowData['post_value']['brandId'] = data.brandId;

            }
        }

        $scope.handleFlightDate = function(data) {
            $("input[data-provide = 'datepicker']").attr("disabled","disabled").css({'background':'#eee'})
            if(data.startTime) {
                $("input[data-provide = 'datepicker']").removeAttr("disabled").css({'background':'transparent'});
            }
        }

        $scope.saveCampaign = function() {
            $scope.$broadcast('show-errors-check-validity');
            console.log($scope.workflowData['post_value'])
        };

        createCampaign.clients();
        createCampaign.fetchGoals();

        console.log($scope.workflowData);
    });
})();

