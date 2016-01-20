var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('InventoryFiltersController', function ($scope, $window, $routeParams, constants, workflowService, Upload, 
        $timeout, utils, $location) {
        var InventoryFiltersView = {
            getAdvertisersDomainList: function (clientId, advertiserId) {
                workflowService
                    .getAdvertisersDomainList(clientId, advertiserId)
                    .then(function (result) {
                        $scope.workflowData.inventoryData = result.data.data;
                        if ($scope.mode === 'edit') {
                            $scope.$broadcast('updateInventory');
                        }
                    });
            },
        };

        $scope.prarentHandler = function (clientId, clientName, advertiserId, advertiserName) {
            $scope.clientId = clientId;
            $scope.advertiserId = advertiserId;
            InventoryFiltersView.getAdvertisersDomainList(clientId, advertiserId)
        };

        $scope.selectFiles = function (files) {
            if (files) {
                if (files.length > 0) {
                    $scope.showDomainListPopup = true;
                    $scope.adData.listName = $scope.adData.inventory && $scope.adData.inventory.name;
                    $scope.files = files;
                    if (!$scope.adData.inventory) {
                        $scope.adData.inventory = {};
                        $scope.adData.inventory.domainAction = 'INCLUDE';
                    }
                }
            }
        };

        $scope.uploadDomain = function () {
            var domainId = $scope.adData.inventory && $scope.adData.inventory.id || null,
                files = $scope.files,
                i,
                file;

            if (files && files.length) {
                for (i = 0; i < files.length; i++) {
                    file = files[i];
                    if (!file.$error) {
                        Upload.upload({
                            url: workflowService.createAdvertiseDomainList($scope.clientId, $scope.advertiserId, domainId),
                            fields: {
                                'name': $scope.adData.listName,
                                'domainAction': $scope.adData.inventory.domainAction,
                                'updatedAt': $scope.adData.inventory ? $scope.adData.inventory.updatedAt : ''
                            },
                            fileFormDataName: 'domainList',
                            file: file,
                            method: domainId ? 'PUT' : 'POST'
                        }).progress(function (evt) {
                            $scope.domainUploadInProgress = true;
                        }).success(function (response, status, headers, config) {
                            var inventoryData = $scope.workflowData.inventoryData;

                            _.each(inventoryData, function (obj, idx) {
                                if (obj.id === response.data.id) {
                                    inventoryData[idx] = response.data;
                                }
                            });
                            $scope.workflowData.inventoryData = inventoryData;
                            $scope.adData.inventory = response.data;
                            $scope.domainUploadInProgress = false;
                            $scope.showDomainListPopup = false;
                        });
                    }
                }
            }
        };

        $scope.sort = function () {
            $scope.sortDomain = !$scope.sortDomain;
            if ($('.common-sort-icon').hasClass('ascending')) {
                $('.common-sort-icon')
                    .removeClass('ascending')
                    .addClass('descending');
            }
            else {
                $('.common-sort-icon')
                    .removeClass('descending')
                    .addClass('ascending');
            }
        };

        $scope.closeDomainListPop = function () {
            $scope.showDomainListPopup = false;
        };

        $scope.showDomainListPopup = false;
        $scope.inventoryAdsData = {};
        $scope.adData.inventoryName = '';

        $scope.$on('updateInventory', function () {
            var responseData = workflowService.getAdsDetails();

            if (responseData && 
                responseData.targets && 
                responseData.targets.domainTargets && 
                responseData.targets.domainTargets.inheritedList.ADVERTISER) {
                $scope.adData.inventory = $scope.workflowData.inventoryData[0];
            }
        });
    });
})();
