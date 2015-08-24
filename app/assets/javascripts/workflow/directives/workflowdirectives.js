(function () {
    'use strict';
    angObj.directive('creativeDropDown', function ($compile) {
        return {
            controller: function($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location){
                $scope.creativeFilterData = {};
                $scope.defaultClient  = {};
                $scope.defaultAdvertiser = {};
                $scope.defaultClient.name = 'Loading..';
                $scope.defaultAdvertiser.name = 'Loading..';

                var creativeFilter = {
                    clients :  function() {
                        workflowService.getClients().then(function (result) {
                            if (result.status === "OK" || result.status === "success") {
                                var responseData = result.data.data;
                                $scope.creativeFilterData['clients'] =  _.sortBy(responseData, 'name');
                                $scope.defaultClient  = $scope.creativeFilterData['clients'][0];
                                creativeFilter.fetchAdvertisers($scope.defaultClient.id)
                            }
                            else{
                                creativeFilter.errorHandler(result);
                            }
                        }, creativeFilter.errorHandler);
                    },

                    fetchAdvertisers :  function(clientId) {
                        workflowService.getAdvertisers(clientId).then(function (result) {
                            if (result.status === "OK" || result.status === "success") {
                                var responseData = result.data.data;
                                $scope.creativeFilterData['advertisers'] =  _.sortBy(responseData, 'name');
                                $scope.defaultAdvertiser = $scope.creativeFilterData['advertisers'][0];
                                $scope.$parent.prarentHandler(clientId, $scope.defaultAdvertiser ? $scope.defaultAdvertiser.id : null);
                            }
                            else{
                                creativeFilter.errorHandler(result);
                            }
                        }, creativeFilter.errorHandler);
                    },

                    errorHandler : function(errData) {
                        console.log(errData);
                    }

                }

                creativeFilter.clients();


                $scope.selectClient = function(client) {
                    $("#client_name_selected").text(client.name);
                    $scope.defaultAdvertiser.name = 'Loading..';
                    $scope.clientId = client.id;
                    creativeFilter.fetchAdvertisers(client.id);
                };


                $scope.selectAdvertisers = function(advertiser) {
                    $("#advertiser_name_selected").text(advertiser.name);
                    $scope.$parent.prarentHandler($scope.clientId, advertiser.id);
                };
            },
            restrict:'EAC',
            scope : {},
            templateUrl: assets.html_creative_drop_down,
            link: function($scope, element, attrs) {
            }
        };
    });

    angObj.directive('mediaCostCheck', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ctrl) {
                ctrl.$setValidity('mediaCostValidator', true);
                function customValidator(ngModelValue) {
                    var campaignData = scope.workflowData.campaignData;
                    var campaignBuget = campaignData.bookedRevenue || 0;

                    if(scope.adData.budgetType.toLowerCase() === 'cost') {
                        var mediaCoat = Number(ngModelValue);
                        if(campaignBuget >=  mediaCoat) {
                            ctrl.$setValidity('mediaCostValidator', true);
                        } else {
                            ctrl.$setValidity('mediaCostValidator', false);
                        }
                    } else {
                        ctrl.$setValidity('mediaCostValidator', true);
                    }
                    return ngModelValue;
                }

                ctrl.$parsers.push(customValidator);
            }
        };
    });
}());
