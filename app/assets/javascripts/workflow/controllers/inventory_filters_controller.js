var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('InventoryFiltersController', function ($scope,workflowService, Upload) {
        var InventoryFiltersView = {
            getAdvertisersDomainList: function (clientId, advertiserId) {
                workflowService
                    .getAdvertisersDomainList(clientId, advertiserId)
                    .then(function (result) {
                        var selectedLists;

                        $scope.workflowData.inventoryData = result.data.data;
                        if ($scope.mode === 'edit') {
                            $scope.savedDomainListIds =
                                $scope.getAd_result.targets.domainTargets.inheritedList.ADVERTISER;
                            $scope.savedDomainAction = $scope.getAd_result.domainAction;

                            if ($scope.savedDomainListIds && $scope.savedDomainListIds.length) {
                                selectedLists = _.map($scope.workflowData.inventoryData, function (value) {
                                    return _.contains($scope.savedDomainListIds, value.domainListId) ? value : null;
                                });
                                selectedLists = _.filter(selectedLists, function (value) {
                                   return value;
                                });
                                $scope.workflowData.selectedLists = selectedLists.sort(function (a, b) {
                                    return a.domainListId > b.domainListId;
                                });

                                $scope.adData.inventory = $scope.workflowData.selectedLists[0];
                                if ($scope.savedDomainAction === 'INCLUDE') {
                                    $scope.workflowData.whiteListsSelected = true;
                                    $scope.workflowData.selectedWhiteLists = $scope.workflowData.selectedLists;
                                } else {
                                    $scope.workflowData.blackListsSelected = true;
                                    $scope.workflowData.selectedBlackLists = $scope.workflowData.selectedLists;
                                }
                            }

                            $scope.$broadcast('updateInventory');
                        }
                    });
            }
        };

        function uploadProgressCallback(/*evt*/) {
            $scope.domainUploadInProgress = true;
        }

        function uploadSuccessCallback (response/*, status, headers, config*/) {
            var inventoryData = $scope.workflowData.inventoryData,
                selectedLists = $scope.workflowData.selectedLists;

            if ($scope.inventoryCreate) {
                inventoryData.push(response.data);
                _.each(selectedLists, function (val) {
                    if ($scope.workflowData.whiteListsSelected) {
                        val.domainAction = 'INCLUDE';
                    } else {
                        val.domainAction = 'EXCLUDE';
                    }
                });
                // Reset the flag variable
                $scope.inventoryCreate = false;
            } else {
                _.each(inventoryData, function (obj, idx) {
                    if (obj.id === response.data.id) {
                        inventoryData[idx] = response.data;
                    }
                });
                _.each(selectedLists, function (obj, idx) {
                    if (obj.id === response.data.id) {
                        selectedLists[idx] = response.data;
                    }
                });
                if (response.data.domainAction === 'INCLUDE') {
                    $scope.workflowData.selectedWhiteLists = selectedLists;
                } else {
                    $scope.workflowData.selectedBlackLists = selectedLists;
                }
                $scope.adData.inventory = response.data;
            }

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

                        setTimeout(function(){
                            $('#listName').focus();
                        }, 1);

                    } else if (action === 'INVENTORY_UPDATE') {
                        // If called from Inventory Update (Replace) button click, reset flag to false
                        $scope.inventoryCreate = false;
                    }

                    if (!$scope.adData.inventory.domainAction) {
                        $scope.adData.inventory.domainAction = 'INCLUDE';
                    }
                }
            }
        };

        //Show Inventory Modal
        $scope.showInventoryModal = function () {
console.log('$scope.showInventoryModal, $scope.showDomainListPopup = ', $scope.showDomainListPopup);
            $scope.workflowData.showDomainListPopup = true;
console.log('$scope.showInventoryModal, $scope.showDomainListPopup = ', $scope.showDomainListPopup);
        };

        $scope.uploadDomain = function () {
            var domainId = $scope.adData.inventory && $scope.adData.inventory.id || null,
                files = $scope.files,
                i,
                file;

            // If called from Inventory Create New button click, pass without domain Id
            if ($scope.inventoryCreate) {
                domainId = null;
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
                // Make the first item of SelectedLists if at least 1 item has been selected,
                // else the first item of the Advertiser domain list is the default
                $scope.adData.inventory = $scope.workflowData.selectedLists[0] || $scope.workflowData.inventoryData[0];
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

        // To determine if a domain list contains a given domain list name
        $scope.workflowData.isListSelected = function (listName, masterList) {
            return _.find(masterList, function (obj) {
               return obj.name === listName;
            });
        };

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
                $scope.adData.inventory = {};
                $scope.hideDomainListDropdown();
            }
        };

        $scope.selectDomainList = function (event) {
            var element = $(event.currentTarget),
                selectedLists;

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
                var currentDomainList,
                    totalSelected;

                // Select / Unselect the current domain list
                if (element.attr('checked') !== 'checked') {
                    element.attr('checked', 'checked');
                    // Add the selected Domain list
                    currentDomainList = _.filter($scope.workflowData.inventoryData, function (domainList) {
                        return domainList.name === event.currentTarget.value;
                    });
                    selectedLists[selectedLists.length] = currentDomainList[0];
                    $scope.adData.inventory = currentDomainList[0];
                } else {
                    element.removeAttr('checked');
                    totalSelected = $('#domain-list-dropdown').find('input[type="checkbox"][checked="checked"]').length;
                    if (totalSelected) {
                        // Remove the current domain list
                        selectedLists = _.filter(selectedLists, function (domainList) {
                            return domainList.name !== event.currentTarget.value;
                        });
                        $scope.adData.inventory = selectedLists.length ? selectedLists[0] : {};
                    } else {
                        $scope.adData.inventory = {};
                        selectedLists = [];
                    }
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

                // Update selected Inventory / Domain List name
                // NOTE: When multiple are selected, the first is the default.
                $scope.adData.inventory = selectedLists.length ? selectedLists[0] : {};
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
            var totalSelected = $('#domain-list-dropdown').find('input[type="checkbox"][checked="checked"]').length;

            if (totalSelected) {
                // Process selected domain lists
                $scope.adData.inventory = $scope.workflowData.selectedLists[0];
            } else {
                // No Domain List selected
                $scope.adData.inventory = {};
                $scope.workflowData.selectedLists = [];
            }

            $scope.hideDomainListDropdown();
        };

        $scope.displaySelectedDomainList = function (event) {
            var temp;

            $scope.toggleBtn(event);

            // Update value of $scope.adData.inventory.domainList
            temp = _.filter($scope.workflowData.selectedLists, function (domainList) {
                return domainList.name === event.currentTarget.value;
            });
            $scope.adData.listName = temp[0].name;
            $scope.adData.inventory = temp[0];
        };

        // Close domain list dropdown on clicking outside it.
        $(window).on('click', function (e) {
            if (e.target !== $('#domain-list-dropdown')) {
                $scope.hideDomainListDropdown();
            }
        });
    });
})();
