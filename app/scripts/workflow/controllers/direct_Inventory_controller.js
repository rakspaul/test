define(['angularAMD'],function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.controller('directInventoryController', function ($scope, $rootScope, $timeout, $routeParams,
                                                                 $location, vistoconfig, workflowService) {
        var DATA_MAX_SIZE = 200,
            defaultParams = {
                sortOrder: 'asc',
                sortBy: 'name',
                pageSize: DATA_MAX_SIZE,
                pageNo: 1,
                query: ''
            },

            directInventory = {
                buildQueryString: function (params) {
                    var queryString = '?';

                    if (params.pageNo) {
                        queryString += 'pageNo=' + params.pageNo;
                    }

                    if (params.pageSize) {
                        queryString += '&pageSize=' + params.pageSize;
                    }

                    if (params.sortBy) {
                        queryString += '&sortBy=' + params.sortBy;
                    }

                    if (params.sortOrder) {
                        queryString += '&sortOrder=' + params.sortOrder;
                    }

                    if (params.search) {
                        queryString += '&search=' + params.search;
                    }

                    if (params.publishers) {
                        queryString += '&publishers=' + params.publishers;
                    }

                    return queryString;
                },

                publisher : function (params) {
                    workflowService
                        .getPublisher(params)
                        .then(function (result) {
                            $scope.adData.directInvenotryData.publishers =
                                $scope.adData.directInvenotryData.publishers.concat(result.data.data);
                        }, function () {});
                },

                unitSize : function (params) {
                    workflowService
                        .getUnitSize(params)
                        .then(function (result) {
                            $scope.adData.directInvenotryData.unitSize =
                                $scope.adData.directInvenotryData.unitSize.concat(result.data.data);
                        }, function () {});
                },

                placement : function (urlData, params) {
                    var query = directInventory.buildQueryString(params);

                    workflowService
                        .getPlacement(urlData, query)
                        .then(function (result) {
                            var responseData = result.data.data,
                                placementList,
                                placementIds,
                                placementsData;

                            $scope.adData.directInvenotryData.placements.fetching = false;
                            $scope.adData.directInvenotryData.placements.load_more_data = false;

                            if (responseData.length > 0) {
                                if (!$scope.adData.directInvenotryData.placements.data ||
                                    $scope.adData.directInvenotryData.placements.data.length === 0) {
                                    $scope.adData.directInvenotryData.placements.data = responseData;
                                } else {
                                    $scope.adData.directInvenotryData.placements.data =
                                        $scope.adData.directInvenotryData.placements.data.concat(responseData);
                                }
                            } else {
                                if ($scope.adData.directInvenotryData.placements.data.length > 0) {
                                    $scope.adData.directInvenotryData.placements.no_more_data = true;
                                } else {
                                    $scope.adData.directInvenotryData.placements.data_not_found = true;
                                }
                            }

                            if($scope.adData.directInvenotryData.placements.selected.length >0) {
                                placementIds = _.pluck($scope.adData.directInvenotryData.placements.selected, 'sourceId');
                                placementIds = placementIds.map(function (item) {
                                    return parseInt(item, 10);
                                });

                                _.each($scope.adData.directInvenotryData.placements.data, // jshint ignore:line
                                    function (data, idx) {
                                        if (_.contains(placementIds, Number(data.sourceId))) { // jshint ignore:line
                                            $scope.adData.directInvenotryData.placements.data[idx].isChecked = true;
                                            $scope.adData.directInvenotryData.placements.data[idx].isIncluded = true;
                                        }
                                    });

                            }
                        }, function () {});
                },

                resetPlacementData: function () {
                    var i;

                    for (i = 0; i < $scope.adData.directInvenotryData.placements.data.length; i++) {
                        $scope.adData.directInvenotryData.placements.data[i].isChecked = false;
                        $scope.adData.directInvenotryData.placements.data[i].isIncluded = null;
                    }
                },

                resetPublisherDropDown : function() {
                    $("#publisher_drop_down").find("button").html('<span class="text" data-ng-bind="textConstants.SELECT_TYPE">Select Type</span><span class="icon-arrow-down"></span>')
                },

                //get search box value
                searchGeo: function (filterValue, type) {
                    //reset geoData array
                    $scope.adData.directInvenotryData.placements.data = [];
                    this.resetPlacementData();
                    $scope.adData.directInvenotryData.placements.params[type ? type : 'search'] = filterValue;
                    $scope.adData.directInvenotryData.placements.fetching = true;
                    $scope.adData.directInvenotryData.placements.data_not_found = false;
                    $scope.adData.directInvenotryData.placements.no_more_data = true;
                    $scope.adData.directInvenotryData.placements.params.pageNo = 1;
                    directInventory.placement($scope.urlData, $scope.adData.directInvenotryData.placements.params);
                }
            };

        $scope.adData.directInvenotryData = {};
        $scope.adData.directInvenotryData.placements = {};
        $scope.adData.directInvenotryData.placements.fetching = false;
        $scope.adData.directInvenotryData.placements.selected = [];
        $scope.selectAllPlacement = false;
        $scope.adData.directInvenotryData.placements.data_not_found = false;

        $scope.adData.directInvenotryData.publishers = [{
            name: 'All',
            id: -1
        }];

        $scope.adData.directInvenotryData.unitSize = [{
            name: 'All',
            id: -1
        }];

        //select or unselect indiviual audience
        $scope.selectPlacement = function (placement) {
            console.log("selectPlacement", placement);
            var index,
                placementIndex =
                _.findIndex($scope.adData.directInvenotryData.placements.selected, // jshint ignore:line
                    function (item) {
                        return item.id === placement.id;
                    });

            if (placementIndex === -1) {
                $scope.adData.directInvenotryData.placements.selected.push(placement);
                placement.isChecked = true;
                placement.isIncluded = true;
            } else {
                $scope.adData.directInvenotryData.placements.selected.splice(placementIndex, 1);

                index =
                    _.findIndex($scope.adData.directInvenotryData.placements.data, // jshint ignore:line
                        function (list) {
                            return placement.id === list.id;
                        });

                $scope.adData.directInvenotryData.placements.data[index].isChecked = false;
                $scope.adData.directInvenotryData.placements.data[index].isIncluded = null;
            }
        };

        $scope.selectAllPlacements = function (event) {
            var i;

            $scope.adData.directInvenotryData.placements.selected = [];
            $scope.selectAllPlacement = event.target.checked;

            if ($scope.selectAllPlacement) {
                for (i = 0; i < $scope.adData.directInvenotryData.placements.data.length; i++) {
                    $scope.adData.directInvenotryData.placements.selected.push(
                        $scope.adData.directInvenotryData.placements.data[i]
                    );

                    $scope.adData.directInvenotryData.placements.data[i].isChecked = true;
                    $scope.adData.directInvenotryData.placements.data[i].isIncluded = true;
                }
            } else {
                directInventory.resetPlacementData();
            }
        };

        $scope.adData.clearAllSelectedPlacements = function () {
            if ($scope.adData.directInvenotryData.placements.selected &&
                $scope.adData.directInvenotryData.placements.selected.length > 0) {

                $scope.adData.directInvenotryData.placements.params =
                    _.extend({}, defaultParams); // jshint ignore:line

                $scope.adData.directInvenotryData.placements.fetching = true;
                $scope.adData.directInvenotryData.placements.data = [];
                $scope.adData.directInvenotryData.placements.selected = [];

                $scope.selectAllPlacement = false;
                $scope.searchKeyword = null;

                directInventory.resetPublisherDropDown();

                directInventory.placement($scope.urlData, $scope.adData.directInvenotryData.placements.params);
            }
        };

        $scope.loadMorePlacements = function () {
            var placementData = $scope.adData.directInvenotryData.placements.data,
                isMoreDataAvailable = $scope.adData.directInvenotryData.placements.no_more_data;

            if (placementData && !isMoreDataAvailable) {
                $scope.adData.directInvenotryData.placements.load_more_data = true;
                $scope.adData.directInvenotryData.placements.params.pageNo += 1;
                directInventory.placement($scope.urlData, $scope.adData.directInvenotryData.placements.params);
            }
        };

        //reset search countries/regions/cities
        $scope.resetGeoSearch = function (event) {
            var target = $(event.target),
                parentElem = target.parents().find('.searchBox');

            target.hide();
            parentElem.val('');
            $scope.searchKeyword = null;

            //clear the searchbox value
            directInventory.searchGeo();
        };

        //search countries/regions/cities
        $scope.search = function (event, searchtxt) {
            var searchType,
                target = $(event.currentTarget);

            event.stopImmediatePropagation();
            event.preventDefault();

            if ($(target).attr('type') === 'button') {
                searchType = target.closest('.searchInput').find('.searchBox').attr('data-searchfield');
                directInventory.searchGeo(searchtxt);
            } else {
                searchType = target.attr('data-searchfield');

                if (event.which === 13) {
                    directInventory.searchGeo(searchtxt);
                }
            }
        };

        $scope.adData.resetInventroy = function () {
            var placementList,
                placementIds;

            if (!$scope.$parent.postPlatformDataObj) {

                $scope.adData.clearAllSelectedPlacements();
                $timeout(function () {
                    $('.buying_strategy').trigger('click');
                }, 100);

            } else { //click on back to platform when selected placement list is not empty
                if($scope.adData.directInvenotryData.placements.selected.length >0) {
                    placementList =
                        _.filter($scope.$parent.postPlatformDataObj, // jshint ignore:line
                            function (obj) {
                                return obj.platformCustomInputId === 80;
                            });

                    if (placementList.length > 0) {
                        placementIds = placementList[0].value.split(',').map(function (item) {
                            return parseInt(item, 10);
                        });

                        var newUnsavedItemFound  = _.filter($scope.adData.directInvenotryData.placements.selected, function(item) {
                            return _.contains(placementIds, Number(item.sourceId))
                        });

                        if(newUnsavedItemFound.length >0) {
                            $scope.adData.directInvenotryData.placements.selected = newUnsavedItemFound;
                        }

                        var placementIds = _.pluck($scope.adData.directInvenotryData.placements.selected, 'sourceId');
                        placementIds = placementIds.map(function (item) {
                            return parseInt(item, 10);
                        });

                        _.each($scope.adData.directInvenotryData.placements.data, // jshint ignore:line
                            function (data, idx) {
                                if (!_.contains(placementIds, Number(data.sourceId))) { // jshint ignore:line
                                    $scope.adData.directInvenotryData.placements.data[idx].isChecked = false;
                                    $scope.adData.directInvenotryData.placements.data[idx].isIncluded = false;
                                }
                            });
                    }
                }
            }

            $('.appnexus_direct_div.staticMarkup').hide();
        };

        $scope.filterPlacements = function (filterType, filterValue) {
            if (filterValue === -1) {
                directInventory.searchGeo('', filterType);
            } else {
                directInventory.searchGeo(filterValue, filterType);
            }
        };

        $rootScope.$on('directInvenotry', function (event, args) {
            $scope.urlData = {
                vendorId: args.platformId,
                seatId: args.platformSeatId
            };

            var placementList,
                placementsData,
                placementIds;

            directInventory.publisher($scope.urlData);

            $scope.adData.directInvenotryData.placements.params =
                _.extend({}, defaultParams); // jshint ignore:line

            $scope.adData.directInvenotryData.placements.fetching = true;
            $scope.adData.directInvenotryData.placements.data = [];
            $scope.adData.directInvenotryData.placements.selected = [];
            directInventory.resetPublisherDropDown();

            if ($scope.$parent.postPlatformDataObj && $scope.$parent.postPlatformDataObj.length >0) {
                placementList =
                    _.filter($scope.$parent.postPlatformDataObj, // jshint ignore:line
                        function (obj) {
                            return obj.platformCustomInputId === 99;
                        });

                if (placementList.length > 0) {
                    placementsData = JSON.parse(placementList[0].value);
                    $scope.adData.directInvenotryData.placements.selected = placementsData;
                }
            }
            directInventory.placement($scope.urlData, $scope.adData.directInvenotryData.placements.params);
        });
    });
});
