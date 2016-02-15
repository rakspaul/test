var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('GeoTargettingController', function ($scope, $rootScope, $window, $routeParams, constants, workflowService,
                                                           $timeout, utils, $location, zipCode, audienceService) {

        $scope.showTargettingForm = false;
        $scope.geoTargetingData = {};
        $scope.storedResponse = {};
        $scope.isRegionSelected = true;
        $scope.citiesIncluded = true;
        $scope.dmasIncluded = true;
        $scope.zipCodeTabSelected = false;
        $scope.selectedTab = 'regions';
        $scope.adData.isGeographySelected = false;
        $scope.adData.isAudienceSelected = false;
        $scope.adData.isDaypartSelected = false;

        $scope.geoTargetArr = [
            {'name': 'Geography', 'enable': true},
            {'name': 'Behavior', 'enable': false},
            {'name': 'Demographics', 'enable': false},
            {'name': 'Interests', 'enable': false},
            {'name': 'Technology', 'enable': false},
            {'name': 'Content', 'enable': false},
            {'name': 'Other', 'enable': false}
        ];

        var citiesListArray = [],
            regionsListArray = [],
            dmasListArray = [],
            regionListSortOrder = 'asc',
            cityListSortOrder = 'asc',
            dmaListSortOrder = 'asc',
            regionInitialLoad = false,
            cityInitialLoad = false,
            dmasInitialLoad = false,
            zipInitialLoad = false;


        var geoTargetingView = {
                buildUrlParams: function (params) {
                    var queryString = '';

                    if (params.pageNo) {
                        queryString = '&pageNo=' + params.pageNo;
                    }
                    if (params.pageSize) {
                        queryString += '&pageSize=' + params.pageSize;
                    }
                    if (params.sortOrder) {
                        queryString += '&sortOrder=' + params.sortOrder;
                    }
                    if (params.regions) {
                        queryString += '&regions=' + params.regions;
                    }
                    if (params.query) {
                        queryString += '&query=' + params.query;
                    }
                    return queryString;
                },

                getRegionsList: function (parmas, callback, flag) {
                    var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);

                    if ($scope.locale.id === 'en-gb') {
                        qryStr += '&countries=GB';
                    }
                    if (flag === 'cancellable') {
                        workflowService.getRegionsList(parmas.platformId, qryStr, function (result) {
                            callback && callback(result.data.data);
                        }, function (error) {
                            console.log('error');
                        }, flag);
                    } else {
                        workflowService
                            .getRegionsList(parmas.platformId, qryStr, null, null, flag)
                            .then(function (result) {
                                callback && callback(result.data.data);
                            }, function (error) {
                                console.log('error');
                            });
                    }
                },

                getCitiesList: function (parmas, callback, flag) {
                    var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);

                    if ($scope.locale.id === 'en-gb') {
                        qryStr += '&countries=GB';
                    }
                    if (flag === 'cancellable') {
                        workflowService.getCitiesList(parmas.platformId, qryStr, function (result) {
                            callback && callback(result.data.data);
                        }, function (error) {
                            console.log('error');
                        }, flag);
                    } else {
                        workflowService
                            .getCitiesList(parmas.platformId, qryStr, null, null, flag)
                            .then(function (result) {
                                callback && callback(result.data.data);
                            }, function (error) {
                                console.log('error');
                            });
                    }
                },

                getDMAsList: function (parmas, callback, flag) {
                    var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);

                    if (flag === 'cancellable') {
                        workflowService.getDMAsList(parmas.platformId, qryStr, function (result) {
                            var responseData = result.data.data;

                            _.each(responseData, function (data) {
                                data.region = $.trim(data.name.substring(data.name.lastIndexOf(' ')));
                                data.dmaName = $.trim(data.name.substring(0, data.name.lastIndexOf(' ')));
                            });
                            callback && callback(responseData);
                        }, function (error) {
                            console.log('error');
                        }, flag);
                    } else {
                        workflowService
                            .getDMAsList(parmas.platformId, qryStr, null, null, flag)
                            .then(function (result) {
                                var responseData = result.data.data;

                                _.each(responseData, function (data) {
                                    data.region = $.trim(data.name.substring(data.name.lastIndexOf(' ')));
                                    data.dmaName = $.trim(data.name.substring(0, data.name.lastIndexOf(' ')));
                                });
                                callback && callback(responseData);
                            }, function (error) {
                                console.log('error');
                            });
                    }
                },
                hideGeoTargetingBox: function () {
                    $('#geographyTargeting').delay(300).animate({
                        left: '100%',
                        marginLeft: '0',
                        opacity: '0'
                    }, function () {
                        $(this).hide();
                    });
                },
                showGeoTargetingBox: function () {
                    $('#geographyTargeting')
                        .show()
                        .delay(300)
                        .animate({
                            left: '50%',
                            marginLeft: '-461px',
                            opacity: '1.0'
                        }, 'slow');
                }
            },
            getSwitchElem = function (type) {
                var el = $('.switchWrap').find('.regions');

                if ($scope.selectedTab === 'dmas') {
                    el = $('.switchWrap').find('.dmas');
                    if (type === 'on') {
                        $scope.dmasIncluded = true;
                    } else {
                        $scope.dmasIncluded = false;
                    }
                } else if ($scope.selectedTab === 'regions') {
                    if (type === 'on') {
                        $scope.regionsIncluded = true;
                        $scope.citiesIncludeSwitchLabel = true;
                    } else {
                        $scope.regionsIncluded = false;
                        $scope.citiesIncludeSwitchLabel = false;
                    }
                } else {
                    if (type === 'on') {
                        $scope.citiesIncludeSwitchLabel = true;
                    } else {
                        $scope.citiesIncludeSwitchLabel = false;
                    }
                }
                return el;
            },
            getAllAddedZipCode = function (zipCodeList) {
                var addedZipCodes = [];

                _.each(zipCodeList, function (zipCodeObj) {
                    _.each(zipCodeObj.added, function (val) {
                        addedZipCodes.push(val);
                    });
                });
                return addedZipCodes;
            };


        function geoTargetSummaryCardStr(geoTargetingData) {
            var includeStr = '';
            var excludeStr = '';
            if (geoTargetingData.selected.previewData.include) {
                if (geoTargetingData.selected.previewData.include.regions && geoTargetingData.selected.previewData.include.regions.length > 0) {
                    includeStr += (geoTargetingData.selected.previewData.include.regions.length == 1) ? geoTargetingData.selected.previewData.include.regions.length + ' Region ' : geoTargetingData.selected.previewData.include.regions.length + ' Regions ';
                }
                if (geoTargetingData.selected.previewData.include.cities && geoTargetingData.selected.previewData.include.cities.length > 0) {
                    includeStr += (geoTargetingData.selected.previewData.include.cities.length == 1) ? geoTargetingData.selected.previewData.include.cities.length + ' city ' : geoTargetingData.selected.previewData.include.cities.length + ' cities ';
                }
                if (geoTargetingData.selected.previewData.include.zipCodes && geoTargetingData.selected.previewData.include.zipCodes.length > 0 && geoTargetingData.selected.previewData.include.zipCodes[0].values.length > 0) {
                    includeStr += (geoTargetingData.selected.previewData.include.zipCodes[0].values.length == 1) ? geoTargetingData.selected.previewData.include.zipCodes[0].values.length + ' Postal code ' : geoTargetingData.selected.previewData.include.zipCodes[0].values.length + ' Postal codes ';
                }
                if (geoTargetingData.selected.previewData.include.dmas && geoTargetingData.selected.previewData.include.dmas.length > 0) {
                    includeStr += (geoTargetingData.selected.previewData.include.dmas.length == 1) ? geoTargetingData.selected.previewData.include.dmas.length + ' Metro ' : geoTargetingData.selected.previewData.include.dmas.length + ' Metros ';
                }
                geoTargetingData.selected.previewData.includeStr = includeStr;
            }

            if (geoTargetingData.selected.previewData.exclude) {
                if (geoTargetingData.selected.previewData.exclude.regions && geoTargetingData.selected.previewData.exclude.regions.length > 0) {
                    excludeStr += (geoTargetingData.selected.previewData.exclude.regions.length == 1) ? geoTargetingData.selected.previewData.exclude.regions.length + ' Region ' : geoTargetingData.selected.previewData.exclude.regions.length + ' Regions ';
                }
                if (geoTargetingData.selected.previewData.exclude.cities && geoTargetingData.selected.previewData.exclude.cities.length > 0) {
                    excludeStr += (geoTargetingData.selected.previewData.exclude.cities.length == 1) ? geoTargetingData.selected.previewData.exclude.cities.length + ' city ' : geoTargetingData.selected.previewData.exclude.cities.length + ' cities ';
                }
                if (geoTargetingData.selected.previewData.exclude.zipCodes && geoTargetingData.selected.previewData.exclude.zipCodes.length > 0 && geoTargetingData.selected.previewData.exclude.zipCodes[0].values.length > 0) {
                    excludeStr += (geoTargetingData.selected.previewData.exclude.zipCodes[0].values.length == 1) ? geoTargetingData.selected.previewData.exclude.zipCodes[0].values.length + ' Postal code ' : geoTargetingData.selected.previewData.exclude.zipCodes[0].values.length + ' Postal codes ';
                }
                if (geoTargetingData.selected.previewData.exclude.dmas && geoTargetingData.selected.previewData.exclude.dmas.length > 0) {
                    excludeStr += (geoTargetingData.selected.previewData.exclude.dmas.length == 1) ? geoTargetingData.selected.previewData.exclude.dmas.length + ' Metro ' : geoTargetingData.selected.previewData.exclude.dmas.length + ' Metros ';
                }
                geoTargetingData.selected.previewData.excludeStr = excludeStr;
            }
        };

        $scope.regionEdit = function (flatArr) {
            var regionsEditable;
            var geoTargets = $scope.storedResponse.targets.geoTargets;
            if (geoTargets && _.size(geoTargets) > 0 && geoTargets.REGION) {
                regionsEditable = angular.copy(geoTargets.REGION.geoTargetList);
                $scope.regionsIncluded = geoTargets.REGION.isIncluded;
                _.each(regionsEditable, function (item) {
                    $scope.sync(true, item, 'regions');
                });

                // toggle switch based on region settings
                if (geoTargets.REGION.isIncluded) {
                    $scope.includeSelectedItems();
                } else {
                    $scope.excludeSelectedItems();
                }
            }

            regionInitialLoad = true;
            $scope.listCities();

        };

        $scope.cityEdit = function (flatArr) {
            var citiesEditable;
            var geoTargets = $scope.storedResponse.targets.geoTargets;
            if (geoTargets && _.size(geoTargets) > 0 && geoTargets.CITY) {
                citiesEditable = angular.copy(geoTargets.CITY.geoTargetList);
                $scope.citiesIncluded = geoTargets.CITY.isIncluded;
                _.each(citiesEditable, function (item) {
                    $scope.sync(true, item, 'cities');
                });
                cityInitialLoad = true;
                $scope.saveGeography(1);
            }
        };

        $scope.dmasEdit = function (flatArr) {
            var dmasEditable;
            var geoTargets = $scope.storedResponse.targets.geoTargets;
            if (geoTargets && _.size(geoTargets) > 0 && geoTargets.DMA) {
                dmasEditable = angular.copy(geoTargets.DMA.geoTargetList);
                $scope.dmasIncluded = geoTargets.DMA.isIncluded;
                _.each(dmasEditable, function (item) {
                    $scope.sync(true, item, 'dmas');
                });

                dmasInitialLoad = true;
                $scope.saveGeography(1);

            }
        };

        $scope.zipEdit = function (flatArr) {
            var zipEditableObj,
                zipEditable,
                i;
            var geoTargets = $scope.storedResponse.targets.geoTargets;
            if (geoTargets && _.size(geoTargets) > 0 && geoTargets.ZIP_CODE) {
                zipEditableObj = angular.copy(geoTargets.ZIP_CODE.geoTargetList);
                zipEditable = [];
                for (i = 0; i < zipEditableObj.length; i++) {
                    zipEditable[i] = zipEditableObj[i].code;
                }
                $scope.adData.zipCodes = zipEditable.toString();
                $scope.addZipCode();
            }
        };

        $scope.isChecked = function (id, type) {
            var match = false,
                i;

            for (i = 0; i < $scope.geoTargetingData.selected[type].length; i++) {
                if ($scope.geoTargetingData.selected[type][i].id === id) {
                    match = true;
                }
            }
            return match;
        };

        $scope.sync = function (bool, item, type) {
            var index,
                i;

            if (bool) {
                item[type + 'Included'] = $scope[type + 'Included'];
                index = _.findIndex($scope.geoTargetingData.selected[type], function (obj) {
                    return item.id === obj.id;
                });
                if (index === -1) {
                    $scope.geoTargetingData.selected[type].push(item);
                }
            } else {
                for (i = 0; i < $scope.geoTargetingData.selected[type].length; i++) {
                    if ($scope.geoTargetingData.selected[type][i].id === item.id) {
                        $scope.geoTargetingData.selected[type].splice(i, 1);
                    }
                }
            }
            $scope.includeorExcludeCityOnly(type);
        };

        $scope.resetGeoTargetingVariables = function ($event) {
            if ($event && $scope.mode === 'edit') {
                // do nothing just wait and watch
            } else {
                $scope.geoTargetingData.selected = {};
                $scope.geoTargetingData.selected.regions = [];
                $scope.geoTargetingData.selected.cities = [];
                $scope.geoTargetingData.selected.dmas = [];
                $scope.geoTargetingData.selected.zip = [];
                $scope.dmasIncluded = true;
                $scope.isRegionSelected = true;
                $scope.citiesIncluded = true;
                $scope.dmasIncluded = true;
                $scope.adData.targetName = null;
                citiesListArray.length = 0;
                regionsListArray.length = 0;
                dmasListArray.length = 0;
                getSwitchElem('on');
            }
        };

        $scope.addZipCode = function () {
            var values = $scope.adData.zipCodes,
                zipCodeList = $scope.geoTargetingData.selected.zip,
                addedZipCodes = getAllAddedZipCode(zipCodeList),
                zipCodesObj = zipCode.checkZipCodes(values, addedZipCodes);

            _.each(zipCodesObj.duplicate, function (removeval) {
                _.each(zipCodeList, function (obj, idx) {
                    if (obj) {
                        _.each(obj.added, function (val) {
                            if (removeval === val) {
                                zipCodeList.splice(idx, 1);
                            }
                        });
                    }
                });
            });
            $scope.zipCodesObj = zipCodesObj;
            $scope.geoTargetingData.selected.zip.push(zipCodesObj);
            $scope.adData.zipCodes = '';
        };

        $scope.includeorExcludeCityOnly = function (type, isIncluded) {
            if (type === 'cities') {
                var selectedRegions = $scope.geoTargetingData.selected.regions,
                    selectedCities = $scope.geoTargetingData.selected.cities,
                    regionTab;

                $scope.showCitiesOnly = true;
                //when only cities are selected
                if (selectedRegions.length === 0 && selectedCities.length > 0) {
                    $scope.isRegionSelected = false;
                } else {
                    //when region is selected first and then we are selecting cities
                    _.each(selectedRegions, function (regionsObj) {
                        var tmpArr = [];
                        if (selectedCities.length > 0) {
                            _.each(selectedCities, function (citiesObj, idx) {
                                if (citiesObj.parent.id === regionsObj.id) {
                                    $scope.showCitiesOnly = false;
                                    citiesObj.citiesIncluded = $scope.citiesIncluded
                                    tmpArr.push(citiesObj);
                                    regionsObj.cities = tmpArr;
                                }
                            });
                        } else {
                            regionsObj.cities = [];
                        }
                    });
                    $scope.isRegionSelected = true;
                    regionTab = $('#tab_region').parent();
                    regionTab.removeClass('show_tooltip');
                    regionTab.find('.common_tooltip').hide();
                }
            } else if (type === 'regions' &&
                $scope.geoTargetingData.selected.regions.length === 0 &&
                $scope.geoTargetingData.selected.cities.length > 0) {
                $scope.showCitiesOnly = true;
                $scope.geoTargetingData.selected.cities = [];
            }
        };

        $scope.removeItem = function (item, type) {
            var selectedItem = $scope.geoTargetingData.selected[type],
                i,
                j,
                k,
                removeFromSelectedCityArr;

            for (i = 0; i < selectedItem.length; i++) {
                if (selectedItem[i].id === item.id) {
                    selectedItem.splice(i, 1);
                }
            }
            if ($scope.geoTargetingData.selected[type].length === 0) {
                $scope.includeorExcludeCityOnly(type);
            }
            if (type === 'regions' && $scope.showCitiesTab) {
                $scope.citiesIncludeSwitchLabel = true;
                removeFromSelectedCityArr = function (cityObj) {
                    var selectedCities = $scope.geoTargetingData.selected.cities,
                        pos = _.findIndex(selectedCities, cityObj);

                    selectedCities.splice(pos, 1);
                };
                for (j = 0; j < selectedItem.length; j++) {
                    if (selectedItem[j].cities && selectedItem[j].cities.length > 0) {
                        for (k = 0; k < selectedItem[j].cities.length > 0; k++) {
                            if (selectedItem[j].cities[k].id === item.id) {
                                removeFromSelectedCityArr(selectedItem[j].cities[k]);
                                selectedItem[j].cities.splice(k, 1);
                            }
                        }
                    }
                }
                if (selectedItem.length > 0) {
                    var arr = [];
                    _.each(selectedItem, function (obj) {
                        _.each(obj.cities, function (cityObj) {
                            arr.push(cityObj);
                        })
                    })
                    $scope.geoTargetingData.selected['cities'] = arr;
                }

                //reload city
                $scope.geoTargetingData.cities = [];
                citiesListArray = [];
                $scope.listCities();
            }
            if(type === 'dmas') {
                $scope.dmasIncluded = true;
            }

            if (type === 'zip') {
                if ($scope.zipCodesObj)  $scope.zipCodesObj = [];
            }
        };

        $scope.showRemoveConfirmBox = function (event, type, subtype) {
            var target = $(event.target),
                position = target.offset(),
                elem = $('#confirmBox').find('.msgPopup'),
                parentPos = $('.targettingFormWrap').offset(),
                left_pos = position.left - parentPos.left - target.width() - 46,
                top_pos = position.top - parentPos.top - target.height() + 4;

            $scope.boxType = type;
            $scope.boxsubType = subtype;
            $scope.showConfirmBox = true;
            elem.css({
                position: 'absolute',
                top: top_pos,
                left: left_pos,
                width: '242px'
            });
        };

        $scope.resetSwitch = function () {
            $scope.showSwitch = true;
            $scope.citiesIncludeSwitchLabel = true;
            $scope.regionsIncluded = true;
        };

        $scope.show_more_less_list = function (event) {
            var elem = $(event.target),
                list_number = elem.closest('.total_data_holder').find('.data_list').length - 2;

            if (elem.closest('.total_data_holder').find('.data_list_holder').hasClass('less_data')) {
                elem.closest('.total_data_holder').find('.data_list_holder').removeClass('less_data');
                elem.text('Show Less');
            } else {
                elem.closest('.total_data_holder').find('.data_list_holder').addClass('less_data');
                elem.text('+ ' + list_number + ' more');
            }
        };

        $scope.removeSelectedList = function (type, subtype) {
            $scope.hideConfirmBox();

            if (type === 'regions' && subtype === 'cities') {
                $scope.geoTargetingData.selected[type] = [];
                $scope.geoTargetingData.selected[subtype] = [];
                $scope.resetSwitch();
                $scope.includeorExcludeCityOnly(subtype);
                $scope.geoTargetingData.cities = [];
                $scope.showCitiesOnly = false;
                citiesListArray = [];
                if($scope.selectedTab !== 'dmas' && $scope.selectedTab !== 'zip') {
                    var elem = $(".regionCityTab");
                    elem.find("li").removeClass("active");
                    var regionCityElem;
                    if($scope.selectedTab == 'cities') {
                        regionCityElem = elem.find("#cityTab")
                    } else {
                        regionCityElem = elem.find(".tab_region_holder")
                    }
                    $timeout(function () {
                        regionCityElem.addClass("active")
                        regionCityElem.find("a").triggerHandler('click');
                    }, 50);
                }
            } else {
                $scope.geoTargetingData.selected[type] = [];
                $scope.includeorExcludeCityOnly(type);
            }
            if ($scope.selectedTab === 'dmas') {
                $scope.listDmas();
            }
        };

        $scope.listDmas = function (defaults, flag) {
            if (flag !== 'cancellable') {
                flag = 'normal';
            }
            $scope.dmasListObj = {
                platformId: $scope.isPlatformId,
                sortOrder: dmaListSortOrder,
                pageNo: 1,
                pageSize: 200
            };
            _.extend($scope.dmasListObj, defaults);
            geoTargetingView.getDMAsList($scope.dmasListObj, function (responseData) {
                var flatArr;

                $scope.dmasFetching = false;
                dmasListArray.push(responseData);
                flatArr = _.flatten(dmasListArray);
                $scope.geoTargetingData['dmas'] = _.uniq(flatArr, function (item, key, id) {
                    return item.id;
                });
                if ($scope.mode === 'edit' && !dmasInitialLoad) {
                    $scope.dmasEdit(flatArr);
                }
            }, flag);
        };

        $scope.loadMoreDmas = function () {
            if ($scope.dmasListObj) {
                $scope.dmasFetching = true;
                $scope.dmasListObj.pageNo = $scope.dmasListObj.pageNo + 1;
                $scope.listDmas($scope.dmasListObj);
            }
        };

        $scope.selectedCitiesCount = function () {
            return $scope.geoTargetingData.selected.cities.length;
        };

        //display the cities
        $scope.listCities = function (event, defaults, flag) {
            var searchVal = $('.searchBox').val(),
                regions;

            if (flag !== 'cancellable') {
                flag = 'normal';
            }
            if (event) {
                $scope.selectedTab = 'cities';
                citiesListArray = [];
            }

            if ($scope.citiesIncludeSwitchLabel === true) {
                $scope.includeSelectedItems();
            } else {
                $scope.excludeSelectedItems();
            }
            regionsListArray.length = 0;
            regions = $scope.geoTargetingData.selected.regions;

            $scope.citiesListObj = {
                platformId: $scope.isPlatformId,
                sortOrder: cityListSortOrder,
                pageSize: 200,
                pageNo: 1
            };
            if (searchVal !== undefined && searchVal.length > 0) {
                $scope.citiesListObj = {
                    platformId: $scope.isPlatformId,
                    sortOrder: cityListSortOrder,
                    pageSize: 200,
                    pageNo: 1,
                    query: searchVal
                };
            }
            _.extend($scope.citiesListObj, defaults);
            if (regions.length > 0) {
                var regionIds = _.pluck(regions, 'id');
                $scope.citiesListObj.regions = regionIds.join(',');
            }
            $scope.logic();

            geoTargetingView.getCitiesList($scope.citiesListObj, function (responseData) {
                var flatArr = [];
                $scope.cityFetching = false;
                citiesListArray.push(responseData);
                flatArr = _.flatten(citiesListArray);
                $scope.geoTargetingData.cities = _.uniq(flatArr, function (item, key, id) {
                    return item.id;
                });
                if ($scope.mode === 'edit' && !cityInitialLoad) {
                    $scope.cityEdit(flatArr);
                }
            }, flag);
        };

        $scope.loadMoreCities = function () {
            if ($scope.citiesListObj) {
                $scope.cityFetching = true;
                $scope.citiesListObj.pageNo = $scope.citiesListObj.pageNo + 1;
                $scope.listCities(null, $scope.citiesListObj);
            }
        };

        $scope.listRegions = function (defaults, event, flag) {
            var searchVal = $('.searchBox').val(),
                regionTab = $('#tab_region').parent();

            citiesListArray.length = 0;

            if (flag !== 'cancellable') {
                flag = 'normal';
            }
            if (!$scope.isRegionSelected && event) {
                regionTab.addClass('show_tooltip');
                regionTab.find('.common_tooltip').show();
                event.preventDefault();
                event.stopPropagation();
                return false;
            }

            //this flag should be below to isRegionSelecled condition.
            $scope.selectedTab = 'regions';
            $scope.showSwitch = true;

            if ($scope.regionsIncluded === true) {
                $scope.includeSelectedItems();
            } else {
                $scope.excludeSelectedItems();
            }

            $scope.regionListObj = {
                platformId: $scope.isPlatformId,
                sortOrder: regionListSortOrder,
                pageSize: 200,
                pageNo: 1
            };
            if (searchVal !== undefined && searchVal.length > 0) {
                $scope.regionListObj = {
                    platformId: $scope.isPlatformId,
                    sortOrder: regionListSortOrder,
                    pageSize: 200,
                    pageNo: 1,
                    query: searchVal
                };
            }
            _.extend($scope.regionListObj, defaults);
            geoTargetingView.getRegionsList($scope.regionListObj, function (responseData) {
                var flatArr;

                $scope.regionFetching = false;
                regionsListArray.push(responseData);
                flatArr = _.flatten(regionsListArray);
                $scope.geoTargetingData.regions = _.uniq(flatArr, function (item, key, code) {
                    return item.code;
                });
                if ($scope.mode === 'edit' && !regionInitialLoad) {
                    $scope.regionEdit(flatArr);
                }
            }, flag);
        };

        $scope.loadMoreRegions = function () {
            if ($scope.regionListObj) {
                $scope.regionFetching = true;
                $scope.regionListObj.pageNo = $scope.regionListObj.pageNo + 1;

                //lazy loading
                if ($scope.geoTargetingData.regions) {
                    regionsListArray = $scope.geoTargetingData.regions;
                }
                $scope.listRegions($scope.regionListObj);
            }
        };

        $scope.search = function (ev) {
            var target = $(ev.target),
                searchType = target.attr('data-searchfield'),
                searchVal = target.val();

            if (searchType === 'regions') {
                regionsListArray.length = 0;
                $scope.regionListObj.query = '';
                $scope.regionListObj.pageNo = '';
                $scope.regionListObj.pageSize = '';
                if (searchVal.length > 0) {
                    $scope.regionListObj.query = searchVal;
                }
                $scope.listRegions($scope.regionListObj, null, 'cancellable');
            }
            if (searchType === 'cities') {
                citiesListArray.length = 0;
                $scope.citiesListObj.query = '';
                $scope.citiesListObj.pageNo = '';
                $scope.citiesListObj.pageSize = '';
                if (searchVal.length > 0) {
                    $scope.citiesListObj.query = searchVal;
                }
                $scope.listCities(null, $scope.citiesListObj, 'cancellable');
            }
            if (searchType === 'dmas') {
                dmasListArray.length = 0;
                $scope.dmasListObj.query = '';
                $scope.dmasListObj.pageNo = '';
                $scope.dmasListObj.pageSize = '';
                if (searchVal.length > 0) {
                    $scope.dmasListObj.query = searchVal;
                }
                $scope.listDmas($scope.dmasListObj, 'cancellable');
            }
        };

        $scope.hideConfirmBox = function () {
            $scope.showConfirmBox = false;
        };

        $scope.hidezipCodeTooltip = function () {
            $scope.enableZipCodePopUp = false;
        };

        $scope.showGeographyTabsBox = function (event, tabType, showPopup) {
            var target,
                tabElems,
                tabContentElem;

            target = event ? $(event.target) : $('#zipCodeTab');
            tabElems = target.parents('.nav-tabs');
            tabElems.find('li').removeClass('active');
            target.parent().addClass('active');
            tabContentElem = tabElems.siblings('.tab-content');
            tabContentElem.find('.contentBox').hide();
            tabContentElem.find('#' + tabType).show();

            $('.searchBox').val('');
            if (tabType === 'zip') {
                if (showPopup && !$scope.zipCodeTabSelected) {
                    $scope.enableZipCodePopUp = true;
                    return false;
                } else {
                    $scope.zipCodeTabSelected = false;
                }
            }
            $scope.enableZipCodePopUp = false;
            $scope.selectedTab = tabType;

            if (tabType === 'zip') {
                $('.searchInput').hide();
            } else {
                $('.searchInput').show();
            }

            if (tabType === 'dmas') {
                $scope.listDmas();
            }

            $timeout(function () {
                if(tabType !== 'dmas' && tabType !== 'zip') {
                    var regionCityElem = $(".regionCityTab");
                    regionCityElem.find("li").removeClass("active");
                    regionCityElem.find(".tab_region_holder").addClass("active")
                    angular.element('#tab_region').triggerHandler('click');
                }
            }, 100);

            /*if (tabType === 'regions' && $('.tab_region_holder').hasClass('active')) {
                $scope.listRegions();
            }
            if (tabType === 'regions' && $('#cityTab').hasClass('active')) {
                $scope.listCities();
            }*/
        };

        function modifyDataForPreview() {
            var selectedTargtingData = _.extend({}, $scope.geoTargetingData.selected),
                obj = {};

            selectedTargtingData.zip = getAllAddedZipCode(selectedTargtingData.zip);
            if (selectedTargtingData.regions && selectedTargtingData.regions.length > 0) {
                selectedTargtingData['REGION'] = {};
                selectedTargtingData['REGION']['geoTargetList'] = [];
                selectedTargtingData['REGION']['geoTargetList'] = selectedTargtingData.regions;
                selectedTargtingData['REGION']['isIncluded'] = _.uniq(_.pluck(selectedTargtingData.regions, 'regionsIncluded'))[0];
                delete selectedTargtingData.regions;
            }

            if (selectedTargtingData.cities && selectedTargtingData.cities.length > 0) {
                selectedTargtingData['CITY'] = {};
                selectedTargtingData['CITY']['geoTargetList'] = [];
                selectedTargtingData['CITY']['geoTargetList'] = selectedTargtingData.cities;
                selectedTargtingData['CITY']['isIncluded'] = _.uniq(_.pluck(selectedTargtingData.cities, 'citiesIncluded'))[0];
                delete selectedTargtingData.cities;
            }

            if (selectedTargtingData.dmas && selectedTargtingData.dmas.length > 0) {
                selectedTargtingData['DMA'] = {};
                selectedTargtingData['DMA']['geoTargetList'] = [];
                selectedTargtingData['DMA']['geoTargetList'] = selectedTargtingData.dmas;
                selectedTargtingData['DMA']['isIncluded'] = _.uniq(_.pluck(selectedTargtingData.dmas, 'dmasIncluded'))[0];
                delete selectedTargtingData.dmas;
            }

            if (selectedTargtingData.zip && selectedTargtingData.zip.length > 0) {
                selectedTargtingData['ZIP_CODE'] = {};
                selectedTargtingData['ZIP_CODE']['geoTargetList'] = [];
                selectedTargtingData['ZIP_CODE']['geoTargetList'] = selectedTargtingData.zip;
                selectedTargtingData['ZIP_CODE']['isIncluded'] = selectedTargtingData.zip.length > 0 ? true : false;
                delete selectedTargtingData.zip;
            }
            return selectedTargtingData;
        }

        function geoTargetsDataForListing() {
            var selectedTargtingData = _.extend({}, $scope.geoTargetingData.selected),
                obj = {};

            selectedTargtingData.zip = getAllAddedZipCode(selectedTargtingData.zip);
            if (selectedTargtingData.zip.length > 0) {
                selectedTargtingData.zipCodes = [{'values': selectedTargtingData.zip}];
            }
            delete selectedTargtingData.zip;
            obj.include = {};
            obj.exclude = {};
            _.each(selectedTargtingData, function (data, idx) {
                if (data.length > 0) {
                    obj.include[idx] = [];
                    if (idx !== 'zip') {
                        obj.exclude[idx] = [];
                    }
                    _.each(data, function (d) {
                        if (d.regionsIncluded || d.citiesIncluded || d.dmasIncluded || d.values) {
                            obj.include[idx].push(d);
                        } else {
                            obj.exclude[idx].push(d);
                        }
                    });
                }
            });
            if (angular.equals({}, obj.include)) {
                obj.include = null;
            }
            if (angular.equals({}, obj.exclude)) {
                obj.exclude = null;
            }
            $scope.geoTargetingData.selected.previewData = obj;
        }

        $scope.saveGeography = function (doNotRedirectFlag) {
            if ($scope.zipCodesObj) {
                $scope.zipCodesObj = [];
            }
            $scope.adData.zipCodes = '';
            geoTargetsDataForListing();

            var modifedGeoTargetObj = modifyDataForPreview();
            workflowService.setSavedGeo(angular.copy({
                'modify': modifedGeoTargetObj,
                'original': $scope.geoTargetingData.selected
            }));

            if (!doNotRedirectFlag) {
                $scope.redirectTargettingMain();
            }
            $scope.$parent.showGeoTargetingForPreview();
        };

        $scope.editGeography = function () {
            $('.targettingFormWrap').slideDown();
            $('.targettingSelected').hide();
        };

        $scope.deleteGeography = function () {
            $('.targettingSelected').hide();
            $('.targettingFormWrap').slideDown();
            $scope.resetGeoTargetingVariables();
            $scope.resetSwitch();
        };

        $scope.includeorExcludeSelectedItems = function () {
            var type = $scope.selectedTab,
                item = $scope.geoTargetingData.selected[type],
                len = item.length,
                i,
                j;

            for (i = 0; i < len; i++) {
                item[i][type + 'Included'] = $scope[type + 'Included'];
                if (item[i].hasOwnProperty('cities')) {
                    for (j = 0; j < item[i].cities.length; j++) {
                        item[i].cities[j].citiesIncluded = ($scope[type + 'Included']) ? false : true;
                    }
                }
            }
        };

        $scope.logic = function () {
            var regions = $scope.geoTargetingData.selected.regions;

            if ($scope.selectedTab === 'cities') {
                $scope.citiesIncluded = true;
                if (regions.length > 0) {
                    $scope.showSwitch = false;
                    if ($scope.regionsIncluded) {
                        $scope.citiesIncluded = false;
                    }
                }
            }
        };

        $scope.includeSelectedItems = function () {
            var elem = getSwitchElem('on');
            elem.find('.btn').animate({left: '22px'});
            elem.find('.togBtnBg').css({background: '#0978c9'});
            $scope[$scope.selectedTab + 'Included'] = true;
        };

        $scope.excludeSelectedItems = function () {
            var elem = getSwitchElem('off');
            elem.find('.btn').animate({left: '-2px'});
            elem.find('.togBtnBg').css({background: '#ccd2da'});
            $scope[$scope.selectedTab + 'Included'] = false;
        };

        $scope.switchInclude = function () {
            this.tog = !this.tog;
            this.tog ? $scope.excludeSelectedItems() : $scope.includeSelectedItems();
            $scope.includeorExcludeSelectedItems();
        };

        $scope.resetTargeting = function () {
            $scope.adData.targetName = null;
        };

        $scope.changeSortingOrder = function (section) {
            if ($('.common-sort-icon').hasClass('ascending')) {
                $('.common-sort-icon')
                    .removeClass('ascending')
                    .addClass('descending');
                if (section === 'regions') {
                    regionsListArray = [];
                    regionListSortOrder = 'desc';
                    $scope.listRegions();
                } else if (section === 'cities') {
                    citiesListArray = [];
                    cityListSortOrder = 'desc';
                    $scope.listCities();
                } else if (section === 'dmas') {
                    dmasListArray = [];
                    dmaListSortOrder = 'desc';
                    $scope.listDmas();
                }
            } else {
                $('.common-sort-icon')
                    .removeClass('descending')
                    .addClass('ascending');
                if (section === 'regions') {
                    regionsListArray = [];
                    regionListSortOrder = 'asc';
                    $scope.listRegions();
                } else if (section === 'cities') {
                    citiesListArray = [];
                    cityListSortOrder = 'asc';
                    $scope.listCities();
                } else if (section === 'dmas') {
                    dmasListArray = [];
                    dmaListSortOrder = 'asc';
                    $scope.listDmas();
                }
            }
        };

        //this is temp redirect to targetting screen
        $scope.redirectTargettingMain = function (cancelClicked) {
            if (!$scope.geoTargetingData.selected.previewData ||
                (!$scope.geoTargetingData.selected.previewData.include &&
                !$scope.geoTargetingData.selected.previewData.exclude)) {
                $scope.adData.isGeographySelected = false;
                $scope.adData.targetName = null;
                $scope.resetGeoTargetingVariables();
            }

            if (cancelClicked && workflowService.getSavedGeo()) {
                var presavedGeo = angular.copy(workflowService.getSavedGeo()).original;
                if (presavedGeo && presavedGeo) {
                    $timeout(function () {
                        $scope.geoTargetingData.selected = presavedGeo;
                        if($scope.selectedTab !== 'dmas' && $scope.selectedTab !== 'zip') {
                            var regionCityElem = $(".regionCityTab");
                            regionCityElem.find("li").removeClass("active");
                            regionCityElem.find(".tab_region_holder").addClass("active")
                            angular.element('#tab_region').triggerHandler('click');
                        }
                    }, 100);
                }
            }
            geoTargetingView.hideGeoTargetingBox();
        };

        $scope.$on('deleteGeoTarget', function () {
            $scope.deleteGeography();
            workflowService.resetSavedGeo();
            $scope.adData.isGeographySelected = null;
        })

        $scope.$on('triggerGeography', function () {
            $scope.storedResponse = angular.copy(workflowService.getAdsDetails());
            var moduleDeleted = workflowService.getDeleteModule();
            if(_.indexOf(moduleDeleted, 'Geography') !== -1) {
                if($scope.storedResponse) {
                    $scope.storedResponse.targets.geoTargets = null;
                }
                $scope.resetGeoTargetingVariables();
                workflowService.resetDeleteModule();
                workflowService.setSavedGeo(null);
            }

            if ($scope.selectedTab === 'regions') {
                $scope.listRegions();
            }
            if ($scope.selectedTab === 'cities') {
                $scope.listCities();
            }
            if ($scope.selectedTab === 'dmas') {
                $scope.listDmas();
            }

            if ($scope.mode === 'edit') {
                $scope.listDmas();
                $scope.zipEdit();
            }

            geoTargetingView.showGeoTargetingBox();
        });

        $scope.resetGeoTargetingVariables();

        $(function () {
            $('#slider-range').slider({
                range: true,
                min: 0,
                max: 500,
                values: [75, 300],
                slide: function (event, ui) {
                    $('#amount').val('$' + ui.values[0] + ' - $' + ui.values[1]);
                }
            });
            $('#amount')
                .val('$' + $('#slider-range')
                        .slider('values', 0) + ' - $' + $('#slider-range')
                        .slider('values', 1));
        });


        if ($('.btn-ani-toggle .active')[0]) {
            $scope.excludeSelectedItems();
        } else {
            $scope.includeSelectedItems();
        }
    });
})();
