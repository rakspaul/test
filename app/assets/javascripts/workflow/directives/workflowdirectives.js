(function () {
    'use strict';
    angObj.directive('creativeDropDown', function (utils, constants) {
        return {
            controller: function($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location){
                $scope.creativeFilterData = {};
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
                                $scope.$parent.prarentHandler(clientId, $scope.defaultAdvertiser.id);
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

                $scope.clientsDropdown = function () {
                    $("#clientsList").toggle();
                };

                $scope.advertisersDropdown = function () {
                    $("#advertisersList").toggle();
                };

                $scope.selectClient = function(client) {
                    $("#client_name_selected").text(client.name);
                    $scope.clientId = client.id;
                    creativeFilter.fetchAdvertisers(client.id);
                };


                $scope.selectAdvertisers = function(advertiser) {
                    $("#advertiser_name_selected").text(advertiser.name);
                    $scope.$parent.prarentHandler($scope.clientId, advertiser.id);
                };
            },
            scope: {},
            restrict:'EAC',
            templateUrl: assets.html_creative_drop_down,
            link: function($scope, element, attrs) {
            }
        };
    });
}());
