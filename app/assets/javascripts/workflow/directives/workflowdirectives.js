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

                    setDefaultValues : function(obj, type) {
                         var campaignData = JSON.parse(localStorage.getItem('campaignData'));
                         if(type === 'clients') {
                             $scope.defaultClientName = (campaignData && campaignData.clientName) ? campaignData.clientName : obj[0].name;
                             $scope.defaultClientId = (campaignData && campaignData.clientId) ? campaignData.clientId : obj[0].id;
                             $scope.defaultAdvertiserName = 'Loading..';
                         }
                         if(type === 'advertisers') {
                             $scope.defaultAdvertiserName = (campaignData && campaignData.advertiserName) ? campaignData.advertiserName : obj[0].name;
                             $scope.defaultAdvertiserId = (campaignData && campaignData.advertiserId) ? campaignData.advertiserId : obj[0].id;
                         }
                     },

                    clients :  function() {
                        workflowService.getClients().then(function (result) {
                            if (result.status === "OK" || result.status === "success") {
                                var responseData = result.data.data;
                                $scope.creativeFilterData['clients'] =  _.sortBy(responseData, 'name');
                                creativeFilter.setDefaultValues($scope.creativeFilterData['clients'], 'clients');
                                var defaultClientId = $scope.creativeFilterData['clients'][0].id;
                                var defaultClientName = $scope.creativeFilterData['clients'][0].name;
                                creativeFilter.fetchAdvertisers(defaultClientId, defaultClientName)
                            }
                            else{
                                creativeFilter.errorHandler(result);
                            }
                        }, creativeFilter.errorHandler);
                    },

                    fetchAdvertisers :  function() {
                        workflowService.getAdvertisers($scope.defaultClientId).then(function (result) {
                            if (result.status === "OK" || result.status === "success") {
                                var responseData = result.data.data;
                                $scope.creativeFilterData['advertisers'] =  _.sortBy(responseData, 'name');
                                creativeFilter.setDefaultValues($scope.creativeFilterData['advertisers'], 'advertisers')
                                $scope.$parent.prarentHandler($scope.defaultClientId, $scope.defaultClientName, $scope.defaultAdvertiserId, $scope.defaultAdvertiserName);
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
                //delete localstorage

                //localStorage.removeItem('campaignData');

                $scope.selectClient = function(client) {
                    $("#client_name_selected").text(client.name);
                    $scope.defaultClientId = client.id;
                    $scope.defaultClientName = client.name;
                    localStorage.removeItem('campaignData');
                    $scope.defaultAdvertiserName = 'Loading..';
                    creativeFilter.fetchAdvertisers();
                };


                $scope.selectAdvertisers = function(advertiser) {
                    localStorage.removeItem('campaignData');
                    $scope.defaultAdvertiserName = advertiser.name;
                    $scope.$parent.prarentHandler($scope.defaultClientId, $scope.defaultClientName, advertiser.id, advertiser.name);
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
