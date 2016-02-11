var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('InventoryFiltersController', function ($scope, $window, $routeParams, constants,
                                                              workflowService, Upload) {
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
            }
        };

        function uploadProgressCallback(evt) {
            $scope.domainUploadInProgress = true;
        }

        function uploadSuccessCallback (response, status, headers, config) {
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
        }

        $scope.prarentHandler = function (clientId, clientName, advertiserId, advertiserName) {
            $scope.clientId = clientId;
            $scope.advertiserId = advertiserId;
            InventoryFiltersView.getAdvertisersDomainList(clientId, advertiserId);
        };

        $scope.selectFiles = function (files, action) {
            if (files) {
                if (files.length > 0) {
                    $scope.showDomainListPopup = true;
                    $scope.files = files;
                    $scope.adData.listName = $scope.adData.inventory && $scope.adData.inventory.name;

                    // If called from Inventory Create New button click,
                    if (action === 'INVENTORY_CREATE') {
                        // set flag to true
                        $scope.inventoryCreate = true;
                        // Reset list name to blank
                        $scope.adData.listName = '';
                    } else if (action === 'INVENTORY_UPDATE') {
                        // If called from Inventory Update (Replace) button click, reset flag to false
                        $scope.inventoryCreate = false;
                    }

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

            // If called from Inventory Create New button click, pass without domain Id
            if ($scope.inventoryCreate) {
                domainId = null;
                // Reset the flag variable
                $scope.inventoryCreate = false;
            }

            if (files && files.length) {
                for (i = 0; i < files.length; i++) {
                    file = files[i];

                    if (!file.$error) {
                        Upload
                            .upload({
                                url: workflowService
                                    .createAdvertisersDomainList($scope.clientId, $scope.advertiserId, domainId),
                                fields: {
                                    'name': $scope.adData.listName,
                                    'domainAction': $scope.adData.inventory.domainAction,
                                    'updatedAt': $scope.adData.inventory ? $scope.adData.inventory.updatedAt : ''
                                },
                                fileFormDataName: 'domainList',
                                file: file,
                                method: domainId ? 'PUT' : 'POST'
                            })
                            .progress(uploadProgressCallback)
                            .success(uploadSuccessCallback);
                    }
                }
            }
        };

        $scope.sort = function () {
            var commonSortIcon = $('.common-sort-icon');

            $scope.sortDomain = !$scope.sortDomain;
            if (commonSortIcon.hasClass('ascending')) {
                commonSortIcon
                    .removeClass('ascending')
                    .addClass('descending');
            } else {
                commonSortIcon
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
console.log('$scope.workflowData.inventoryData = ', $scope.workflowData.inventoryData);
                $scope.adData.inventory = $scope.workflowData.inventoryData[0];
            }
        });

        // Inventory Domain Lists feature addition section
        // Story: CW-2518 - Allow multiple Inventory domain lists
        $scope.adData.inventory = {};

        $scope.workflowData.selectedWhiteLists = [];
        $scope.workflowData.selectedBlackLists = [];
        $scope.workflowData.selectedLists = [];
        $scope.workflowData.whiteListsSelected = false;
        $scope.workflowData.blackListsSelected = false;

        $scope.showDomainListDropdown = function () {
            $('#domain-list-dropdown').css('display', 'block');
        };

        $scope.hideDomainListDropdown = function () {
            $('#domain-list-dropdown').css('display', 'none');
        };

        $scope.unselectAllDomainLists = function (list) {
            if (list === 'Whitelist') {
                $('#domain-list-dropdown').find('.domain-whitelist-wrapper .checkboxcls').removeAttr('checked');
            } else if (list === 'Blacklist') {
                $('#domain-list-dropdown').find('.domain-blacklist-wrapper .checkboxcls').removeAttr('checked');
            } else {
                // If no list param is passed, it means clear all lists (both Black & White Lists)
                $('#domain-list-dropdown').find('.checkboxcls').removeAttr('checked');
                $scope.workflowData.selectedWhiteLists = [];
                $scope.workflowData.selectedBlackLists = [];
                $scope.workflowData.selectedLists = [];
                $scope.hideDomainListDropdown();
            }

            $scope.adData.inventory.name = '';
        };

        $scope.selectDomainList = function (event) {
            var element = $(event.currentTarget),
                selectedLists;
console.log('element.parentsUntil() domain-blacklist-wrapper = ', element.parentsUntil().hasClass('domain-blacklist-wrapper'));
            // Force to keep the domain list dropdown open
            $scope.showDomainListDropdown();

            if (element.parentsUntil().hasClass('domain-whitelist-wrapper')) {
                // Whitelist selected
                $scope.workflowData.whiteListsSelected = true;
                $scope.workflowData.blackListsSelected = false;
                $scope.workflowData.selectedBlackLists = [];
                $scope.unselectAllDomainLists('Blacklist');
                selectedLists = $scope.workflowData.selectedWhiteLists;
            } else if (element.parentsUntil().hasClass('domain-blacklist-wrapper')) {
                // Blacklist selected
                $scope.workflowData.whiteListsSelected = false;
                $scope.workflowData.blackListsSelected = true;
                $scope.workflowData.selectedWhiteLists = [];
                $scope.unselectAllDomainLists('Whitelist');
                selectedLists = $scope.workflowData.selectedBlackLists;
            }

            process(selectedLists);

            function process(selectedLists) {
                var currentDomainList;

                // Select / Unselect the current domain list
                if (element.attr('checked') !== 'checked') {
                    element.attr('checked', 'checked');
                    // Add the selected Domain list
                    currentDomainList = _.filter($scope.workflowData.inventoryData, function (domainList) {
                        return domainList.name === event.currentTarget.value;
                    });
                    selectedLists[selectedLists.length] = currentDomainList[0];
                    $scope.adData.inventory.domainList = currentDomainList[0].domainList;
                    console.log('selectedLists = ', selectedLists);
                    console.log('$scope.adData.inventory.domainList = ', $scope.adData.inventory.domainList);
                    console.log('$scope.workflowData.selectedWhiteLists = ', $scope.workflowData.selectedWhiteLists);
                    console.log('$scope.workflowData.selectedBlackLists = ', $scope.workflowData.selectedBlackLists);
                } else {
                    element.removeAttr('checked');
                    // Remove the current domain list
                    selectedLists = _.filter(selectedLists, function (domainList) {
                        return domainList.name !== event.currentTarget.value;
                    });
                    $scope.adData.inventory.domainList = selectedLists.length ? selectedLists[0].domainList : [];
                }

                // Sort selected Domain Lists in alphabetical order
                selectedLists.sort(function (a, b) {
                    return a.name > b.name;
                });
                if ($scope.workflowData.whiteListsSelected) {
                    $scope.workflowData.selectedWhiteLists = selectedLists;
                } else if ($scope.workflowData.blackListsSelected) {
                    $scope.workflowData.selectedBlackLists = selectedLists;
                }

                $scope.workflowData.selectedLists = selectedLists;
                console.log('selectedLists = ', selectedLists);
                console.log('$scope.workflowData.selectedWhiteLists = ', $scope.workflowData.selectedWhiteLists);
                console.log('$scope.workflowData.selectedBlackLists = ', $scope.workflowData.selectedBlackLists);
                console.log('$scope.workflowData.selectedLists = ', $scope.workflowData.selectedLists);

                // Update selected Inventory / Domain List name
                // NOTE: When multiple are selected, the first is the default.
                $scope.adData.inventory.name = selectedLists.length > 0 ? selectedLists[0].name : '';
                console.log('$scope.adData.inventory.name = ', $scope.adData.inventory.name);

                console.log('After sorting...');
                selectedLists = _.each(selectedLists, function (el) {
                    console.log(el.name);
                });
            }
        };

        $scope.toggleDomainListDropdown = function () {
            if ($('#domain-list-dropdown').css('display') === 'block') {
                $scope.hideDomainListDropdown();
            } else {
                $scope.showDomainListDropdown();
            }
        };

        $scope.doneDomainListsSelection = function () {
            if ($scope.workflowData.selectedLists.length) {
                // Process selected domain lists
                $scope.adData.inventory.domainList = $scope.workflowData.selectedLists[0].domainList;
                console.log($scope.workflowData.selectedLists.length + ' lists selected');
            } else {
                // No Domain List selected
                console.log('No list selected');
                //$scope.adData.inventory.domainList = [];
            }
console.log('$scope.adData.inventory.domainList = ', $scope.adData.inventory.domainList);
            // TODO: Why is this guy not working???!!!
            // $scope.dropBoxItemSelected($scope.workflowData.selectedLists, 'inventory');
            $scope.hideDomainListDropdown();
        };

        $scope.displaySelectedDomainList = function (event) {
            var temp;

            $scope.toggleBtn(event);
            console.log('Inside displaySelectedDomainList(), = event = ', event);//$scope.adData.inventory.domainList);
            console.log('event.currentTarget.value = ', event.currentTarget.value);
            console.log('$scope.adData.inventory.domainList = ', $scope.adData.inventory.domainList);
            console.log('$scope.workflowData.selectedLists = ', $scope.workflowData.selectedLists);
            // TODO: Update value of $scope.adData.inventory.domainList
            temp = _.filter($scope.workflowData.selectedLists, function (domainList) {
                return domainList.name === event.currentTarget.value;
            });
            $scope.adData.inventory.domainList = temp[0].domainList;
            console.log('temp = ', temp);
            console.log('temp.domainList = ', temp[0].domainList);
        };
    });
})();
