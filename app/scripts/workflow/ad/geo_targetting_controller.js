define(['angularAMD', '../../common/services/constants_service', 'workflow/services/workflow_service',
    'common/services/zip_code_service', 'lrInfiniteScroll'], function (angularAMD) {
    'use strict';

    angularAMD.controller('GeoTargettingController', function ($scope, $rootScope, $timeout, $filter, constants,
                                                               workflowService, zipCode) {
        var DATA_MAX_SIZE = 200,

            defaultParams = {
                platformId: '',
                sortOrder: 'asc',
                sortBy: 'name',
                pageSize: DATA_MAX_SIZE,
                pageNo: 1,
                query: '',
                countryCodes: '',
                regionIds: '',
                excludeCountries: '',
                excludeRegions: ''
            },

            geoMapper =  {
                countries: 'COUNTRY',
                regions: 'REGION',
                cities: 'CITY'
            },

            geoTargeting = {
                // get ads data
                getAdsDetails: function () {
                    return workflowService.getAdsDetails();
                },

                // reset all geoData
                resetGeoData: function () {
                    $scope.geoData.countries.data = [];
                    $scope.geoData.regions.data = [];
                    $scope.geoData.cities.data = [];
                    $scope.geoData.dmas.data = [];
                },

                // reset selected geoData
                resetSelectedGeoData: function () {
                    $scope.geoData.countries.selected = [];
                    $scope.geoData.regions.selected = [];
                    $scope.geoData.cities.selected = [];
                    $scope.geoData.dmas.selected = [];
                },

                resetSearchValue: function () {
                    $('.searchBox').val('');
                },

                // update query params
                updateParams: function (params, type) {
                    if (type) {
                        _.extend($scope.geoData[type].queryParams, params);
                    } else {
                        _.extend(defaultParams, params);
                    }
                },

                // get search box value
                searchGeo: function (searchtxt, type) {
                    // reset geoData array
                    this.resetGeoData();
                    $scope.geoData[type].queryParams = _.extend({}, defaultParams);
                    this.updateParams({'query': searchtxt}, type);
                    $scope.geoData[type].fetching = true;
                    $scope.geoData[type].data_not_found = false;
                    geoTargeting[type].list('cancellable');
                },

                // build query string for $http
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

                    if (params.query) {
                        queryString += '&query=' + params.query;
                    }

                    if (params.countryCodes) {
                        queryString += '&countries=' + params.countryCodes;
                    }

                    if (params.regionIds) {
                        queryString += '&regions=' + params.regionIds;
                    }

                    if (params.excludeCountries) {
                        queryString += '&excludeCountries=' + params.excludeCountries;
                    }

                    if (params.excludeRegions) {
                        queryString += '&excludeRegions=' + params.excludeRegions;
                    }

                    return queryString;
                },

                setIncludeExcludeGeo: function () {
                    // case 5 : Country --> Not selected, Region --> Include, City --> Excluded
                    if ($scope.geoData.countries.selected.length === 0 &&
                        $scope.geoData.regions.selected.length === 0) {
                        $scope.geoData.regions.included = true;
                    }

                    // case 1 : Country --> Included, Region --> Excluded, City --> Excluded
                    if ($scope.geoData.countries.selected.length > 0 && $scope.geoData.countries.included) {
                        $scope.geoData.regions.included = false;
                        $scope.geoData.cities.included = false;
                    }

                    // case 2 : Country --> Excluded, Region --> Excluded, City --> Excluded
                    if ($scope.geoData.countries.selected.length > 0 && !$scope.geoData.countries.included) {
                        $scope.geoData.regions.included = false;
                        $scope.geoData.cities.included = false;
                    }

                    // case 3 : Country --> Included, Region --> Not selected, City --> Excluded
                    if ($scope.geoData.countries.selected.length > 0 &&
                        $scope.geoData.regions.selected.length === 0 &&
                        $scope.geoData.countries.included) {
                        $scope.geoData.cities.included = false;
                    }

                    // case 4 : Country --> Excluded, Region --> Not selected, City --> Excluded
                    if ($scope.geoData.countries.selected.length > 0 &&
                        $scope.geoData.regions.selected.length === 0 &&
                        !$scope.geoData.countries.included) {
                        $scope.geoData.cities.included = false;
                    }

                    // case 5 : Country --> Not selected, Region --> Include, City --> Excluded
                    if ($scope.geoData.countries.selected.length === 0 &&
                        $scope.geoData.regions.selected.length > 0 &&
                        $scope.geoData.regions.included) {
                        $scope.geoData.cities.included = false;
                    }

                    // case 6 : Country --> Not selected, Region --> Excluded, City --> Excluded
                    if ($scope.geoData.countries.selected.length === 0 &&
                        $scope.geoData.regions.selected.length > 0 &&
                        !$scope.geoData.regions.included) {
                        $scope.geoData.cities.included = false;
                    }

                    // case 6 : Country --> Not selected, Region --> Excluded, City --> Excluded
                    if ($scope.geoData.countries.selected.length === 0 &&
                        $scope.geoData.regions.selected.length === 0 &&
                        $scope.geoData.cities.selected.length === 0) {
                        $scope.geoData.cities.included = true;
                    }

                    // case 5 : Country --> Not selected, Region --> Include, City --> Excluded
                    if ($scope.geoData.dmas.selected.length === 0) {
                        $scope.geoData.dmas.included = true;
                    }
                },

                showHideExcAndIncSwitch: function () {
                    // if selected tab is country, switch -  on for country
                    if ($scope.selectedSubTab === 'countries') {
                        $scope.geoData.countries.switch = true;
                    }

                    // if selected tab is region and country is selected, switch -  off for country
                    if ($scope.selectedSubTab === 'regions' && $scope.geoData.countries.selected.length > 0) {
                        $scope.geoData.regions.switch = false;
                    }

                    // if selected tab is region and country is not selected, switch -  on for region
                    if ($scope.selectedSubTab === 'regions' && $scope.geoData.countries.selected.length === 0) {
                        $scope.geoData.regions.switch = true;
                    } else {
                        $scope.geoData.regions.switch = false;
                    }

                    // if selected tab is region and country is not selected, switch -  on for region
                    if ($scope.selectedSubTab === 'regions' && $scope.geoData.countries.selected.length === 0) {
                        $scope.geoData.regions.switch = true;
                    } else {
                        $scope.geoData.regions.switch = false;
                    }

                    // if selected tab is city and country and region is not selected, switch -  on for city
                    if ($scope.selectedSubTab === 'cities' &&
                        $scope.geoData.countries.selected.length === 0 &&
                        $scope.geoData.regions.selected.length === 0) {
                        $scope.geoData.cities.switch = true;
                    } else {
                        $scope.geoData.cities.switch = false;
                    }

                    // if selected tab is country, switch -  on for country
                    if ($scope.selectedSubTab === 'dmas') {
                        $scope.geoData.dmas.switch = true;
                    }

                },

                // START : remove selected countries/regions/cities/dmas/zip
                removeSelectedItem : function (selectedItem, item) {
                    var i;

                    for (i = 0; i < selectedItem.length; i++) {
                        if (selectedItem[i].id === item.id) {
                            selectedItem.splice(i, 1);
                        }
                    }
                },

                geoTargetingDataForPreview : function () {
                    var geoData = _.extend({}, $scope.geoData);

                    geoData.zip = zipWrapper.getAllAddedZipCode(geoData.zip.selected);

                    if (geoData.countries && geoData.countries.selected.length > 0) {
                        geoData.COUNTRY = {};
                        geoData.COUNTRY.geoTargetList = [];
                        geoData.COUNTRY.geoTargetList = geoData.countries.selected;
                        geoData.COUNTRY.isIncluded = _.uniq(_.pluck(geoData.countries.selected, 'included'))[0];
                        delete geoData.countries;
                    }

                    if (geoData.regions && geoData.regions.selected.length > 0) {
                        geoData.REGION = {};
                        geoData.REGION.geoTargetList = [];
                        geoData.REGION.geoTargetList = geoData.regions.selected;
                        geoData.REGION.isIncluded = _.uniq(_.pluck(geoData.regions.selected, 'included'))[0];
                        delete geoData.regions;
                    }

                    if (geoData.cities && geoData.cities.selected.length > 0) {
                        geoData.CITY = {};
                        geoData.CITY.geoTargetList = [];
                        geoData.CITY.geoTargetList = geoData.cities.selected;
                        geoData.CITY.isIncluded = _.uniq(_.pluck(geoData.cities.selected, 'included'))[0];
                        delete geoData.cities;
                    }

                    if (geoData.dmas && geoData.dmas.selected.length > 0) {
                        geoData.DMA = {};
                        geoData.DMA.geoTargetList = [];
                        geoData.DMA.geoTargetList = geoData.dmas.selected;
                        geoData.DMA.isIncluded = _.uniq(_.pluck(geoData.dmas.selected, 'included'))[0];
                        delete geoData.dmas;
                    }

                    if (geoData.zip && geoData.zip.length > 0) {
                        geoData.ZIP_CODE = {};
                        geoData.ZIP_CODE.geoTargetList = [];
                        geoData.ZIP_CODE.geoTargetList = geoData.zip;
                        geoData.ZIP_CODE.isIncluded = geoData.zip.length > 0 ? true : false;
                        delete geoData.zip;
                    }
                    return geoData;
                },


                getGeoTypes: function (geoItem) {
                    var arr = [];

                    _.each(geoItem.data, function (obj) {
                        arr.push(obj.geoType);
                    });

                    return _.uniq(arr);
                },

                countryWrapper: function (geoItem, idx) {
                    _.each(geoItem.data, function (item) {
                        if (!$scope.geoSelectedItems[idx].countries) {
                            $scope.geoSelectedItems[idx].countries = [];
                        }

                        $scope.geoSelectedItems[idx].countries.push(item);
                    });
                },

                regionWrapper: function (geoItem, idx) {
                    _.each(geoItem.data, function (item) {
                        // check if geoItem country is there in countries selected array
                        var countryLen,

                            pos = _.findIndex($scope.geoSelectedItems[idx].countries,
                                function (obj) {
                                    return item.countryCode === obj.countryCode && item.parent.id === obj.id;
                                }),

                            pos1;

                        if (!$scope.geoSelectedItems[idx].countries) {
                            $scope.geoSelectedItems[idx].countries = [];
                        }

                        if (pos < 0) {
                            $scope.geoSelectedItems[idx].countries.push(item.country);
                            delete item.country;
                        }

                        countryLen = $scope.geoSelectedItems[idx].countries.length - 1;

                        if (!$scope.geoSelectedItems[idx].countries[countryLen].regions) {
                            $scope.geoSelectedItems[idx].countries[countryLen].regions = [];
                        }

                        pos1 = _.findIndex(
                            $scope.geoSelectedItems[idx].countries[countryLen].regions,
                            function (obj) {
                                return item.countryCode === obj.countryCode && obj.id === item.id;
                            }
                        );

                        if (pos1 >= 0) {
                            countryLen = pos1;
                        }

                        $scope.geoSelectedItems[idx].countries[countryLen].regions.push(item);
                    });
                },

                cityWrapper: function (geoItem, idx) {
                    _.each(geoItem.data, function (item) {
                        var pos,
                            pos1,
                            countryLen,
                            regionLen;

                        if (!$scope.geoSelectedItems[idx].countries) {
                            $scope.geoSelectedItems[idx].countries = [];
                        }

                        // check if geoItem country is there in countries selected array
                        pos = _.findIndex($scope.geoSelectedItems[idx].countries,
                            function (obj) {
                                return item.countryCode === obj.countryCode;
                            });

                        if (pos < 0) {
                            $scope.geoSelectedItems[idx].countries.push(item.country);
                            delete item.country;
                        }

                        countryLen = $scope.geoSelectedItems[idx].countries.length - 1;

                        if (!$scope.geoSelectedItems[idx].countries[countryLen].regions) {
                            $scope.geoSelectedItems[idx].countries[countryLen].regions = [];
                        }

                        pos1 = _.findIndex(
                            $scope.geoSelectedItems[idx].countries[countryLen].regions,
                            function (obj) {
                                return item.countryCode === obj.countryCode;
                            }
                        );

                        if (pos1 >= 0) {
                            countryLen = pos1;
                        }

                        $scope.geoSelectedItems[idx].countries[countryLen].regions.push(item.parent);
                        delete item.parent;

                        regionLen = $scope.geoSelectedItems[idx].countries[countryLen].regions.length - 1;

                        if (!$scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities) {
                            $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities = [];
                        }

                        pos1 = _.findIndex(
                            $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities,
                            function (obj) {
                                return item.countryCode === obj.countryCode;
                            }
                        );

                        if (pos1 >= 0) {
                            regionLen = pos1;
                        }

                        $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities.push(item);
                    });
                },

                countryRegionWrapper: function (geoItem, idx) {
                    var pos;

                    _.each(geoItem.data, function (item) {
                        if (item.geoType === 'COUNTRY') {
                            if (!$scope.geoSelectedItems[idx].countries) {
                                $scope.geoSelectedItems[idx].countries = [];
                            }

                            $scope.geoSelectedItems[idx].countries.push(item);
                        }

                        if (item.geoType === 'REGION') {
                            pos = _.findIndex($scope.geoSelectedItems[idx].countries,
                                function (obj) {
                                    return item.parent.id === obj.id;
                                });

                            if (pos >= 0) {
                                if (!$scope.geoSelectedItems[idx].countries[pos].regions) {
                                    $scope.geoSelectedItems[idx].countries[pos].regions = [];
                                }
                                $scope.geoSelectedItems[idx].countries[pos].regions.push(item);
                            }
                        }
                    });
                },

                countryRegionCityWrapper: function (geoItem, idx) {
                    _.each(geoItem.data, function (item) {
                        var pos,
                            pos1,
                            pos2,
                            regionLen,
                            countryLen;

                        if (item.geoType === 'COUNTRY') {
                            if (!$scope.geoSelectedItems[idx].countries) {
                                $scope.geoSelectedItems[idx].countries = [];
                            }

                            $scope.geoSelectedItems[idx].countries.push(item);
                        }

                        if (item.geoType === 'REGION') {
                            pos = _.findIndex($scope.geoSelectedItems[idx].countries,
                                function (obj) {
                                    return item.countryCode === obj.countryCode;
                                });

                            if (pos < 0) {
                                $scope.geoSelectedItems[idx].countries.push(item.country);
                                delete item.country;
                            }

                            countryLen = $scope.geoSelectedItems[idx].countries.length - 1;

                            if (!$scope.geoSelectedItems[idx].countries[countryLen].regions) {
                                $scope.geoSelectedItems[idx].countries[countryLen].regions = [];
                            }

                            pos1 = _.findIndex(
                                $scope.geoSelectedItems[idx].countries[countryLen].regions,
                                function (obj) {
                                    return item.countryCode === obj.countryCode;
                                });

                            if (pos1 >= 0) {
                                countryLen = pos1;
                            }

                            $scope.geoSelectedItems[idx].countries[countryLen].regions.push(item);
                        }

                        if (item.geoType === 'CITY') {
                            pos = _.findIndex($scope.geoSelectedItems[idx].countries,
                                function (obj) {
                                    return item.countryCode === obj.countryCode;
                                });

                            if (pos < 0) {
                                $scope.geoSelectedItems[idx].countries.push(item.country);
                                delete item.country;
                            }

                            countryLen = $scope.geoSelectedItems[idx].countries.length - 1;

                            if (!$scope.geoSelectedItems[idx].countries[countryLen].regions) {
                                $scope.geoSelectedItems[idx].countries[countryLen].regions = [];
                            }

                            pos1 = _.findIndex(
                                $scope.geoSelectedItems[idx].countries[countryLen].regions,
                                function (obj) {
                                    return item.countryCode === obj.countryCode && item.parent.id === obj.id;
                                });

                            if (pos1 < 0) {
                                regionLen = pos1;
                                $scope.geoSelectedItems[idx].countries[countryLen].regions.push(item.parent);
                                delete item.parent;
                            }

                            regionLen = $scope.geoSelectedItems[idx].countries[countryLen].regions.length - 1;

                            if (!$scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities) {
                                $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities = [];
                            }

                            pos2 = _.findIndex(
                                $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities,
                                function (obj) {
                                    return item.countryCode === obj.countryCode && item.id === obj.id;
                                });

                            if (pos2 >= 0) {
                                regionLen = pos1;
                            }

                            $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities.push(item);
                        }
                    });
                },

                regionCityWrapper: function (geoItem, idx) {
                    _.each(geoItem.data, function (item) {
                        var pos,
                            pos1,
                            pos2,
                            regionLen,
                            countryLen;

                        if (item.geoType === 'REGION') {
                            if (!$scope.geoSelectedItems[idx].countries) {
                                $scope.geoSelectedItems[idx].countries = [];
                            }

                            pos = _.findIndex($scope.geoSelectedItems[idx].countries,
                                function (obj) {
                                    return item.countryCode === obj.countryCode;
                                });

                            if (pos < 0) {
                                $scope.geoSelectedItems[idx].countries.push(item.country);
                                delete item.country;
                            }

                            countryLen = $scope.geoSelectedItems[idx].countries.length - 1;

                            if (!$scope.geoSelectedItems[idx].countries[countryLen].regions) {
                                $scope.geoSelectedItems[idx].countries[countryLen].regions = [];
                            }

                            pos1 = _.findIndex(
                                $scope.geoSelectedItems[idx].countries[countryLen].regions,
                                function (obj) {
                                    return item.countryCode === obj.countryCode;
                                });

                            if (pos1 >= 0) {
                                countryLen = pos1;
                            }

                            $scope.geoSelectedItems[idx].countries[countryLen].regions.push(item);
                        }

                        if (item.geoType === 'CITY') {
                            pos = _.findIndex($scope.geoSelectedItems[idx].countries,
                                function (obj) {
                                    return item.countryCode === obj.countryCode;
                                });

                            if (pos < 0) {
                                $scope.geoSelectedItems[idx].countries.push(item.country);
                                delete item.country;
                            }

                            countryLen = $scope.geoSelectedItems[idx].countries.length - 1;

                            if (!$scope.geoSelectedItems[idx].countries[countryLen].regions) {
                                $scope.geoSelectedItems[idx].countries[countryLen].regions = [];
                            }

                            pos1 = _.findIndex(
                                $scope.geoSelectedItems[idx].countries[countryLen].regions,
                                function (obj) {
                                    return item.parent.id === obj.id;
                                });

                            if (pos1 < 0) {
                                // countryLen = pos1;
                                // TODO: commented for now : because i think its not require array element
                                // cannot be negative.
                                $scope.geoSelectedItems[idx].countries[countryLen].regions.push(item.parent);
                                delete item.parent;
                            }

                            regionLen = $scope.geoSelectedItems[idx].countries[countryLen].regions.length - 1;

                            if (!$scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities) {
                                $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities = [];
                            }

                            pos2 = _.findIndex(
                                $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities,
                                function (obj) {
                                    return item.id === obj.id;
                                });

                            if (pos2 >= 0) {
                                regionLen = pos1;
                            }

                            $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities.push(item);
                        }
                    });
                },

                countryCityWrapper : function (geoItem, idx) {
                    _.each(geoItem.data, function (item) {
                        var pos,
                            pos1,
                            pos2,
                            regionLen,
                            countryLen;

                        if (item.geoType === 'COUNTRY') {
                            if (!$scope.geoSelectedItems[idx].countries) {
                                $scope.geoSelectedItems[idx].countries = [];
                            }

                            $scope.geoSelectedItems[idx].countries.push(item);
                        }

                        if (item.geoType === 'CITY') {
                            pos = _.findIndex($scope.geoSelectedItems[idx].countries,
                                function (obj) {
                                    return item.countryCode === obj.countryCode;
                                });

                            if (pos < 0) {
                                $scope.geoSelectedItems[idx].countries.push(item.country);
                                delete item.country;
                            }

                            countryLen = $scope.geoSelectedItems[idx].countries.length - 1;

                            if (!$scope.geoSelectedItems[idx].countries[countryLen].regions) {
                                $scope.geoSelectedItems[idx].countries[countryLen].regions = [];
                            }

                            pos1 = _.findIndex(
                                $scope.geoSelectedItems[idx].countries[countryLen].regions,
                                function (obj) {
                                    return item.parent.id === obj.id;
                                });

                            if (pos1 < 0) {
                                $scope.geoSelectedItems[idx].countries[countryLen].regions.push(item.parent);
                                delete item.parent;
                            }

                            regionLen = $scope.geoSelectedItems[idx].countries[countryLen].regions.length - 1;

                            if (!$scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities) {
                                $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities = [];
                            }

                            pos2 = _.findIndex(
                                $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities,
                                function (obj) {
                                    return item.id === obj.id;
                                });

                            if (pos2 >= 0) {
                                regionLen = pos1;
                            }

                            $scope.geoSelectedItems[idx].countries[countryLen].regions[regionLen].cities.push(item);
                        }
                    });
                },

                sideBarPreviewData: function (selectedGeoData) {
                    var cloneSelectedGeoData = $.extend(true, [], selectedGeoData);

                    _.each(cloneSelectedGeoData, function (geoItem, idx) {
                        var geoType = geoTargeting.getGeoTypes(geoItem);

                        if (!$scope.geoSelectedItems[idx]) {
                            $scope.geoSelectedItems[idx] = [];
                        }

                        if ((geoType[0] === 'COUNTRY' &&
                            geoType[1] === 'REGION' &&
                            geoType[2] === 'CITY') ||
                            geoType[0] === 'COUNTRY' &&
                            geoType[1] === 'CITY' &&
                            geoType[2] === 'REGION') {
                            geoTargeting.countryRegionCityWrapper(geoItem, idx);
                        } else if (geoType[0] === 'COUNTRY' && geoType[1] === 'REGION') {
                            geoTargeting.countryRegionWrapper(geoItem, idx);
                        } else if (geoType[0] === 'REGION' && geoType[1] === 'CITY') {
                            geoTargeting.regionCityWrapper(geoItem, idx);
                        }  else if (geoType[0] === 'COUNTRY' && geoType[1] === 'CITY') {
                            geoTargeting.countryCityWrapper(geoItem, idx);
                        } else if (geoType[0] === 'COUNTRY') {
                            geoTargeting.countryWrapper(geoItem, idx);
                        } else if (geoType[0] === 'REGION') {
                            geoTargeting.regionWrapper(geoItem, idx);
                        } else if (geoType[0] === 'CITY') {
                            geoTargeting.cityWrapper(geoItem, idx);
                        }
                    });
                },

                modifySelectedGeoData: function (data) {
                    var selectedGeo = [],
                        cloneData,
                        groupData,
                        country;

                    $scope.geoSelectedItems = {};
                    cloneData = $.extend(true, [], data);

                    if (cloneData.length > 0) {
                        groupData = _.groupBy(cloneData, function (obj) {
                            if (obj.country) {
                                return obj.country.name;
                            } else {
                                return obj.name;
                            }
                        });

                        if (groupData) {
                            for (country in groupData) {
                                selectedGeo.push({
                                    country: country,
                                    data: groupData[country]
                                });
                            }
                        }

                        this.sideBarPreviewData(selectedGeo);
                    }
                },

                showToolTip: function (elem) {
                    // In relative to btn-group div, the tooltip offset is calculated
                    var tooltipLeft = elem.offset().left - elem.closest('.btn-group').offset().left,
                        tooltipWidth = elem.closest('.btn-group').find('.common_tooltip').width(),
                        elemWidth = elem.width();

                    $('.common_tooltip').show().css('left', tooltipLeft - tooltipWidth / 2 + elemWidth / 2);
                },

                updateSelectedGeoList : function (isChecked, type) {
                    var selectedCountries,
                        selectedRegions,
                        selectedGeoType;

                    if ($scope.geoData[type].selected.length > 0 && isChecked !== null) {
                        _.each($scope.geoData[type].selected, function (data) {
                            data.included = isChecked;
                        });
                    }

                    if (geoTargeting.selectedGeoItemArr.length > 0 && isChecked !== null) {
                        _.each(geoTargeting.selectedGeoItemArr, function (obj) {
                            if (obj.geoType === geoMapper[type]) {
                                obj.included = isChecked;
                            }
                        });
                    }

                    selectedCountries = $scope.geoData.countries.selected;
                    selectedRegions = $scope.geoData.regions.selected;

                    if (type === 'countries'  || type === 'regions'  || type === 'cities' ) {
                        selectedGeoType = $.extend(true, [], $scope.geoData[type].selected);

                        // if selected tab is country and we change the include/exclude toggle
                        if (type === 'countries') {
                            _.each(selectedCountries, function (country) {
                                country.regions = null;
                            });

                            $scope.geoData.regions.selected = [];
                            $scope.geoData.regions.data = [];
                            $scope.geoData.cities.selected = [];
                            $scope.geoData.cities.data = [];

                            // filter all cities from the geoTargeting.selectedGeoItemArr
                            geoTargeting.selectedGeoItemArr =
                                _.filter(geoTargeting.selectedGeoItemArr, function (obj) {
                                    return obj.geoType === 'COUNTRY';
                                });
                        }

                        // if selected tab is regions and country is not selected and we change the
                        // include/exclude toggle
                        if (selectedCountries.length === 0 && type === 'regions') {
                            _.each(selectedRegions, function (country) {
                                country.cities = null;
                            });

                            $scope.geoData.cities.selected = [];
                            $scope.geoData.cities.data = [];

                            // filter all cities from the geoTargeting.selectedGeoItemArr
                            geoTargeting.selectedGeoItemArr = _.filter(
                                geoTargeting.selectedGeoItemArr,
                                function (obj) {
                                    return obj.geoType !== 'CITY';
                                }
                            );
                        }

                        if (isChecked !== null) {
                            geoTargeting.modifySelectedGeoData(selectedGeoType);
                        }
                    }

                    $timeout(function () {
                        $scope.$apply();
                    }, 100);
                },

                validateZipCodes :  function (zipCodes, callback) {
                    var zipCodeArr = rangeValue(zipCodes),
                        params;

                    params = {
                        vendorId: $scope.adData.platformId,
                        data:  {
                            country_code: 'US',
                            zip_codes: zipCodeArr.join(',')
                        }
                    };

                    workflowService
                        .validateZipCodes(params)
                        .then(function (result) {
                            var responseData = result.data.data;

                            callback && callback(responseData);
                            console.log('responseData = ', responseData);
                        }, function (error) {
                            console.log('error = ', error);
                        });
                },

                addZipCode : function (zipCodes) {
                    var addedZipCodeList = $scope.geoData.zip.selected,
                        addedZipCodes = zipWrapper.getAllAddedZipCode(addedZipCodeList),
                        zipCodesObj = zipCode.checkZipCodes(zipCodes, addedZipCodes);

                    _.each(zipCodesObj.duplicate, function (removeval) {
                        _.each(addedZipCodeList, function (obj, idx) {
                            if (obj) {
                                _.each(obj.added, function (val) {
                                    if (removeval === val) {
                                        addedZipCodeList.splice(idx, 1);
                                    }
                                });
                            }
                        });
                    });

                    _.each(zipCodesObj.removed, function (removeval) {
                        _.each(addedZipCodeList, function (obj, idx) {
                            if (obj) {
                                _.each(obj.added, function (val) {
                                    if (removeval === val) {
                                        addedZipCodeList.splice(idx, 1);
                                    }
                                });
                            }
                        });
                    });

                    $scope.zipCodesObj = zipCodesObj;
                    $scope.adData.zipCodes = '';

                    if ($scope.zipCodesObj.added && $scope.zipCodesObj.added.length > 0) {
                        $scope.geoData.zip.selected.push(zipCodesObj);
                    }
                },

                toggleSwitch : function (flag, mainTab) {
                    var toggleElem = $('.' + mainTab + '-toggle');

                    toggleElem.bootstrapToggle(flag ? 'on' : 'off');
                },

                triggerGeoSubNavTab : function (type) {
                    $timeout(function () {
                        $('.targetting-tab-header').find('#' + type + 'Tab').trigger('click');
                    }, 100);
                },

                triggerGeoNavTab : function (type) {
                    $timeout(function () {
                        $('.targettingFormWrap').find('.nav-tabs').find('#' + type + 'Tab').triggerHandler('click');
                    }, 100);
                },

                hide: function () {
                    $('#geographyTargeting').delay(300).animate({
                        left: '100%',
                        marginLeft: '0',
                        opacity: '0'
                    }, function () {
                        $(this).hide();
                    });
                },

                show: function () {
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

            // For GEO - Countries related methods
            countriesWrapper = {
                setData : function (bool, data,  isIncluded) {
                    var countryData = $.extend(true, [], data);

                    $scope.geoData.countries.included = isIncluded;

                    _.each(countryData, function (item) {
                        $scope.check(bool, item, 'countries');
                    });
                },

                fetch: function (requestType, callback) {
                    var params = $scope.geoData.countries.queryParams,
                        query = geoTargeting.buildQueryString(params),
                        platformId = params.platformId;

                    if (requestType === 'cancellable') {
                        workflowService
                            .getCountries(platformId, query, requestType, function (result) {
                                callback && callback(result.data.data);
                            }, function (error) {
                                console.log('error = ', error);
                            });
                    } else {
                        workflowService
                            .getCountries(platformId, query)
                            .then(function (result) {
                                callback && callback(result.data.data);
                            }, function (error) {
                                console.log('error = ', error);
                            });
                    }
                },

                list: function (requestType) {
                    this.fetch(requestType, function (response) {
                        $scope.geoData.countries.fetching = false;
                        $scope.geoData.countries.load_more_data = false;

                        if (response.length > 0) {
                            if (!$scope.geoData.countries.data || $scope.geoData.countries.data.length === 0) {
                                $scope.geoData.countries.data = response;
                            } else {
                                $scope.geoData.countries.data = $scope.geoData.countries.data.concat(response);
                            }
                        } else {
                            if ($scope.geoData.countries.data.length > 0) {
                                $scope.geoData.countries.no_more_data = true;
                            } else {
                                $scope.geoData.countries.data_not_found = true;
                            }
                        }
                    });
                },

                init: function () {
                    $scope.geoData.countries.data_not_found = false;
                    $scope.geoData.countries.fetching = true;
                    $scope.geoData.countries.queryParams = _.extend({}, defaultParams);
                    this.list();
                }
            },

            // For GEO - Regions related methods
            regionsWrapper = {
                setData : function (bool, data, isIncluded) {
                    var regionData = $.extend(true, [], data);

                    $scope.geoData.regions.included = isIncluded;

                    _.each(regionData, function (item) {
                        $scope.check(bool, item, 'regions');
                    });
                },

                fetch: function (requestType, callback) {
                    var params = $scope.geoData.regions.queryParams,
                        query = geoTargeting.buildQueryString(params),
                        platformId = params.platformId;

                    if (requestType === 'cancellable') {
                        workflowService
                            .getRegions(platformId, query, requestType, function (result) {
                                callback && callback(result.data.data);
                            }, function (error) {
                                console.log('error = ', error);
                            });
                    } else {
                        workflowService
                            .getRegions(platformId, query)
                            .then(function (result) {
                                callback && callback(result.data.data);
                            }, function (error) {
                                console.log('error = ', error);
                            });
                    }
                },

                list: function (requestType) {
                     var selectedCountries = $scope.geoData.countries.selected,
                         countryCodes;

                    // if countries are selected pick the ids of selected countries
                    // fetch regions fot those countries
                    if (selectedCountries.length > 0) {
                        countryCodes = _.pluck(selectedCountries, 'code').join(',');
                        geoTargeting.updateParams({countryCodes: countryCodes}, 'regions');

                        // if country is exculded need to pass excludeCountries = true in regions call
                        if ($scope.geoData.countries.included === false) {
                            geoTargeting.updateParams({excludeCountries: true}, 'regions');
                        }
                    }

                    this.fetch(requestType, function (response) {
                        $scope.geoData.regions.load_more_data = false;
                        $scope.geoData.regions.fetching = false;

                        if (response.length > 0) {
                            if (!$scope.geoData.regions.data || $scope.geoData.regions.data.length === 0) {
                                $scope.geoData.regions.data = response;
                            } else {
                                $scope.geoData.regions.data = $scope.geoData.regions.data.concat(response);
                            }
                        } else {
                            if ($scope.geoData.regions.data.length > 0) {
                                $scope.geoData.regions.no_more_data = true;
                            } else {
                                $scope.geoData.regions.data_not_found = true;
                            }
                        }
                    });
                },

                init: function () {
                    $scope.geoData.regions.fetching = true;
                    $scope.geoData.regions.data_not_found = false;
                    $scope.geoData.regions.queryParams = _.extend({}, defaultParams);
                    this.list();
                }
            },

            rangeValue = function (list) {
                var start,
                    end,
                    i,
                    tmpArr= [];

                _.each(list , function (item) {
                    item = item.split('-');

                    if (item.length > 1) {
                        start = Number(item[0]);
                        end = Number(item[1]);
                        for (i = start; i <= end; i++) {
                            tmpArr.push(String(i));
                        }
                    } else {
                        tmpArr.push(item[0]);
                    }
                });

                return tmpArr;
            },

            // For GEO - Cities related methods
            citiesWrapper = {
                setData : function (bool, data, isIncluded) {
                    var cityData = $.extend(true, [], data);

                    $scope.geoData.cities.included = isIncluded;

                    _.each(cityData, function (item) {
                        $scope.check(bool, item, 'cities');
                    });
                },

                fetch: function (requestType, callback) {
                    var params = $scope.geoData.cities.queryParams,
                        query = geoTargeting.buildQueryString(params),
                        platformId = params.platformId;

                    if (requestType === 'cancellable') {
                        workflowService
                            .getCities(platformId, query, requestType, function (result) {
                                callback && callback(result.data.data);
                            }, function (error) {
                                console.log('error = ', error);
                            });
                    } else {
                        workflowService
                            .getCities(platformId, query)
                            .then(function (result) {
                                callback && callback(result.data.data);
                            }, function (error) {
                                console.log('error = ', error);
                            });
                    }
                },

                list: function (requestType) {
                    var selectedRegions,
                        selectedCountries,
                        countryCodes,
                        regionIds;

                    // if regions are selected pick the ids of selected regions
                    // fetch cities fot those regions
                    selectedRegions = $scope.geoData.regions.selected;

                    if (selectedRegions.length > 0) {
                        regionIds = _.pluck(selectedRegions, 'id').join(',');
                        geoTargeting.updateParams({'regionIds': regionIds}, 'cities');

                        // if country is exculded need to pass excludeCountries = true in regions call
                        selectedCountries = $scope.geoData.countries.selected;
                        if (selectedCountries.length > 0) {
                            countryCodes = _.pluck(selectedCountries, 'code').join(',');
                            geoTargeting.updateParams({'countryCodes': countryCodes}, 'cities');

                            // if country is exculded need to pass excludeCountries = true in regions call
                            if ($scope.geoData.countries.included === false) {
                                geoTargeting.updateParams({'excludeCountries': true}, 'cities');
                            }
                        }

                        // if region is exculded need to pass excludeRegions = true in regions call
                        if ($scope.geoData.regions.included === false) {
                            geoTargeting.updateParams({'excludeRegions': true}, 'cities');
                        }
                    } else {
                        // if countries are selected and regions is not selected pick the country codes of selected
                        // countries, fetch cities for those countries
                        selectedCountries = $scope.geoData.countries.selected;

                        if (selectedCountries.length > 0) {
                            countryCodes = _.pluck(selectedCountries, 'code').join(',');
                            geoTargeting.updateParams({'countryCodes': countryCodes}, 'cities');
                        }

                        // if country is excluded need to pass excludeCountries = true in cities call
                        if ($scope.geoData.countries.included === false) {
                            selectedCountries = $scope.geoData.countries.selected;

                            if (selectedCountries.length > 0) {
                                countryCodes = _.pluck(selectedCountries, 'code').join(',');
                                geoTargeting.updateParams({'countryCodes': countryCodes}, 'cities');

                                // if country is exculded need to pass excludeCountries = true in regions call
                                if ($scope.geoData.countries.included === false) {
                                    geoTargeting.updateParams({'excludeCountries': true}, 'cities');
                                }
                            }
                        }
                    }

                    this.fetch(requestType, function (response) {
                        $scope.geoData.cities.load_more_data = false;
                        $scope.geoData.cities.fetching = false;

                        if (response.length > 0) {
                            if (!$scope.geoData.cities.data || $scope.geoData.cities.data.length === 0) {
                                $scope.geoData.cities.data = response;
                            } else {
                                $scope.geoData.cities.data = $scope.geoData.cities.data.concat(response);
                            }
                        } else {
                            if ($scope.geoData.cities.data.length > 0) {
                                $scope.geoData.cities.no_more_data = true;
                            } else {
                                $scope.geoData.cities.data_not_found = true;
                            }
                        }
                    });
                },

                init: function () {
                    $scope.geoData.cities.fetching = true;
                    $scope.geoData.cities.data_not_found = false;
                    $scope.geoData.cities.queryParams = _.extend({}, defaultParams);
                    this.list();
                }
            },

            // For DMAs - related methods
            dmasWrapper = {
                setData : function (bool, data, isIncluded) {
                    var dmaData = $.extend(true, [], data);

                    $scope.geoData.dmas.included = isIncluded;

                    _.each(dmaData, function (item) {
                        $scope.check(bool, item, 'dmas');
                    });
                },

                fetch: function (requestType, callback) {
                    var params = $scope.geoData.dmas.queryParams,
                        query = geoTargeting.buildQueryString(params),
                        platformId = params.platformId;

                    if (requestType === 'cancellable') {
                        workflowService
                            .getDMAs(platformId, query, requestType, function (result) {
                                var responseData = result.data.data;

                                _.each(responseData, function (data) {
                                    data.region = $.trim(data.name.substring(data.name.lastIndexOf(' ')));
                                    data.dmaName = $.trim(data.name.substring(0, data.name.lastIndexOf(' ')));
                                });

                                callback && callback(responseData);
                            }, function (error) {
                                console.log('error = ', error);
                            });
                    } else {
                        workflowService
                            .getDMAs(platformId, query)
                            .then(function (result) {
                                var responseData = result.data.data;

                                _.each(responseData, function (data) {
                                    data.region = $.trim(data.name.substring(data.name.lastIndexOf(' ')));
                                    data.dmaName = $.trim(data.name.substring(0, data.name.lastIndexOf(' ')));
                                });

                                callback && callback(result.data.data);
                            }, function (error) {
                                console.log('error = ', error);
                            });
                    }

                },

                list: function (requestType) {
                    this.fetch(requestType, function (response) {
                        $scope.geoData.dmas.fetching = false;
                        $scope.geoData.dmas.load_more_data = false;

                        if (response.length > 0) {
                            if (!$scope.geoData.dmas.data || $scope.geoData.dmas.data.length === 0) {
                                $scope.geoData.dmas.data = response;
                            } else {
                                $scope.geoData.dmas.data = $scope.geoData.dmas.data.concat(response);
                            }
                        } else {
                            if ($scope.geoData.dmas.data.length > 0) {
                                $scope.geoData.dmas.no_more_data = true;
                            } else {
                                $scope.geoData.dmas.data_not_found = true;
                            }
                        }
                    });
                },

                init: function () {
                    $scope.geoData.dmas.fetching = true;
                    $scope.geoData.dmas.data_not_found = false;
                    $scope.geoData.dmas.queryParams = _.extend({}, defaultParams);
                    this.list();
                }
            },

            // For DMAs - related methods
            zipWrapper = {
                setData : function (data) {
                    var zipEditableObj,
                        zipEditable,
                        i;

                    zipEditableObj = $scope.geoData.zip.selected = angular.copy(data);
                    zipEditable = [];

                    for (i = 0; i < zipEditableObj.length; i++) {
                        zipEditable[i] = zipEditableObj[i].code;
                    }

                    $scope.adData.zipCodes = zipEditable.toString();

                    geoTargeting.addZipCode($scope.adData.zipCodes, {zipEditInit : true});
                },

                resetZipCode: function () {

                    if ($scope.zipCodesObj) {
                        $scope.zipCodesObj = [];
                    }

                    $scope.adData.zipCodes = '';
                },

                getAllAddedZipCode : function (zipCodeList) {
                    var addedZipCodes = [];

                    _.each(zipCodeList, function (zipCodeObj) {
                        _.each(zipCodeObj.added, function (val) {
                            addedZipCodes.push(val);
                        });
                    });

                    return addedZipCodes;
                },

                getSelectedZipCodes: function (zipList) {
                    var zipCodes = [];

                    _.each(zipList, function (obj) {
                        _.each(obj.added, function (val) {
                            zipCodes.push(val);
                        });
                    });

                    return zipCodes;
                }
            };

        $scope.textconstants = constants;
        $scope.zipCodeTabSelected = false;
        $scope.zipCodeLoader = false;

        $(window).resize(function () {
            $scope.divHeightCalculation();
        });

        // Geo
        geoTargeting.countries = countriesWrapper;
        geoTargeting.regions = regionsWrapper;
        geoTargeting.cities = citiesWrapper;

        // DMAs
        geoTargeting.dmas = dmasWrapper;

        // this is temp redirect to targetting screen
        $scope.showTargettingScreen = function () {
            if ($scope.zipCodesObj) {
                $scope.zipCodesObj.info = [];
                $scope.zipCodesObj.error = [];
            }

            geoTargeting.hide();
        };

        $scope.saveGeography = function (cancelClicked) {
            var geoTargetsData = workflowService.getAdsDetails(),
                modifedGeoTargetObj = geoTargeting.geoTargetingDataForPreview();

            zipWrapper.resetZipCode();

            if ($scope.geoData.zip.selected.length === 0 &&
                geoTargetsData &&
                geoTargetsData.targets &&
                geoTargetsData.targets.geoTargets &&
                geoTargetsData.targets.geoTargets.ZIP_CODE) {
                geoTargetsData.targets.geoTargets.ZIP_CODE = null;
                workflowService.setAdsDetails(geoTargetsData);
            }

            workflowService.setSavedGeo({
                modify: modifedGeoTargetObj,
                original: $.extend(true, [], $scope.geoData)
            });

            if (!cancelClicked) {
                $scope.showTargettingScreen(cancelClicked);
            }

            $scope.$parent.showGeoTargetingForPreview();
        };

        $scope.getTargetingType = function () {
            var targetingType;

            if ($scope.geoData.countries.selected.length > 0) {
                targetingType = 'Countries';
            } else if ($scope.geoData.regions.selected.length > 0) {
                targetingType = 'Regions';
            } else if ($scope.geoData.cities.selected.length > 0) {
                targetingType = 'Cities';
            }

            return targetingType;
        };

        $scope.isChecked = function (id, type) {
            var match = false,
                i;

            for (i = 0; i < $scope.geoData[type].selected.length; i++) {
                if ($scope.geoData[type].selected[i].id === id) {
                    match = true;
                }
            }
            return match;
        };

        $scope.updateSelection = function ($event, item, type) {
            var checkbox = $event.target,
                action = (checkbox.checked ? true : false);

            $scope.check(action, item, type);
        };

        $scope.check = function (checked, item,  type) {
            var idx,
                newItem;

            idx = _.findIndex($scope.geoData[type].selected, function (obj) {
                return item.id === obj.id;
            });

            if (idx >= 0 && !checked) {
                $scope.geoData[type].selected.splice(idx, 1);
            }

            if (idx < 0 && checked) {
                item.included = $scope.geoData[type].included;
                $scope.geoData[type].selected.push(item);
            }

            if (checked !== null && type === 'countries') {
                if ($scope.geoData.countries.selected.length === 0) {
                    geoTargeting.updateSelectedGeoList(null, type);
                }
            }

            if (checked !== null && type === 'regions') {
                if ($scope.geoData.regions.selected.length === 0) {
                    geoTargeting.updateSelectedGeoList(null, type);
                }
            }

            // if we uncheck country, region and city belongs too country uncheck
            if (!checked && type === 'countries') {
                $scope.geoData.regions.selected =
                    _.filter($scope.geoData.regions.selected , function (obj) {
                        return obj.countryCode !== item.countryCode;
                    });

                $scope.geoData.cities.selected =
                    _.filter($scope.geoData.cities.selected , function (obj) {
                        return obj.countryCode !== item.countryCode;
                    });

                geoTargeting.selectedGeoItemArr =
                    _.filter(geoTargeting.selectedGeoItemArr, function (obj) {
                        return obj.countryCode !== item.countryCode;
                    });
            }

            // if we uncheck regions, city belongs to regions should uncheck
            if (!checked && type === 'regions') {
                $scope.geoData.cities.selected = _.filter(
                    $scope.geoData.cities.selected,
                    function (obj) {
                        return obj.parent.id !== item.id;
                    });

                geoTargeting.selectedGeoItemArr = _.filter(
                    geoTargeting.selectedGeoItemArr,
                    function (obj) {
                        return  obj.parent.id !== item.id;
                    });
            }

            // if country is selected and city is selected and if we are selecting region for which city
            // is already selected, we have to remove the cities for those regions and only show regions.
            if ($scope.geoData.countries.selected.length > 0 &&
                $scope.geoData.cities.selected.length > 0 &&
                $scope.selectedSubTab === 'regions') {
                _.each($scope.geoData.cities.selected, function (obj, idx) {
                    if (obj.parent.id === item.id) {
                        $scope.geoData.cities.selected.splice(1, idx);
                    }
                });

                geoTargeting.selectedGeoItemArr = _.filter(
                    geoTargeting.selectedGeoItemArr, function (obj) {
                        return obj.parent.id !== item.id;
                    }
                );
            }

            if (type ===  'countries' || type ===  'regions' || type ===  'cities') {
                newItem = $.extend(true, {}, item);

                idx = _.findIndex(geoTargeting.selectedGeoItemArr, function (obj) {
                    return obj.id === newItem.id;
                });

                if (idx >= 0 && !checked) {
                    geoTargeting.selectedGeoItemArr.splice(idx, 1);
                }

                if (idx < 0 && checked) {
                    geoTargeting.selectedGeoItemArr.push(newItem);
                }

                geoTargeting.modifySelectedGeoData(geoTargeting.selectedGeoItemArr);
            }
        };

        // reset search countries/regions/cities
        $scope.resetGeoSearch = function (event) {
            var target = $(event.target),
                parentElem = target.parents().find('.searchBox'),

                // search type can be countries/regions/cities
                searchType = parentElem.attr('data-searchfield');

            target.hide();
            parentElem.val('');
            $scope.searchKeyword = null;

            // clear the searchbox value
            geoTargeting.searchGeo('', searchType);
        };

        // search countries/regions/cities
        $scope.search = function (event, searchtxt) {
            var target = $(event.currentTarget),
                searchType;

            event.stopImmediatePropagation();
            event.preventDefault();

            if ($(target).attr('type') === 'button') {
                searchType = target.closest('.searchInput').find('.searchBox').attr('data-searchfield');
                geoTargeting.searchGeo(searchtxt, searchType);
            } else {
                searchType = target.attr('data-searchfield');
                if (event.which === 13) {
                    geoTargeting.searchGeo(searchtxt, searchType);
                }
            }
        };

        // On scroll dynamically loading more countries/regions/cities.
        $scope.loadMoreGeoData = function () {
            var type = $scope.selectedSubTab,
                geoData = $scope.geoData[type].data,
                isMoreDataAvailable = $scope.geoData[type].no_more_data;

            if (geoData && !isMoreDataAvailable) {
                $scope.geoData[type].queryParams.pageNo += 1;
                $scope.geoData[type].load_more_data = true;
                geoTargeting[type].list();
            }
        };

        // show country/region and city container
        $scope.showRespectiveTabContent = function (event, tabType) {
            /*
             * show tooltip in two cases
             * 1. if you have selected region without selecting countries
             * 2. if you have selected city without selecting regions
             * 3. if you have selected country or region without selecting regions or cities
             */

            var elem = $(event.target),
                selectedCountries = $scope.geoData.countries.selected.length,
                selectedRegions = $scope.geoData.regions.selected.length,
                selectedCities = $scope.geoData.cities.selected.length;

            $('.targetting-tab-header .showToolTip').hide();

            if (tabType === 'countries' &&
                selectedCountries === 0 &&
                selectedRegions > 0) {
                $scope.geoNote = $scope.textConstants.NOT_SELECTED_COUNTRY_NOTE;
                geoTargeting.showToolTip(elem);

                return false;
            }

            if ((tabType === 'countries' || tabType === 'regions') &&
                selectedCities > 0 &&
                selectedCountries === 0 &&
                selectedRegions === 0) {
                $scope.geoNote = $scope.textConstants.NOT_SELECTED_COUNTRY_REGION_NOTE;
                geoTargeting.showToolTip(elem);

                return false;
            }

            $('.geo-tab-content').hide();
            $('#' + tabType + '-geo-tab-content').show();

            elem.closest('.btn-group').find('.active').removeClass('active');
            elem.addClass('active');

            // reseting search value
            geoTargeting.resetSearchValue();

            // reseting geo targeting data
            geoTargeting.resetGeoData();

            $scope.selectedSubTab = tabType;
            geoTargeting.showHideExcAndIncSwitch();
            geoTargeting.setIncludeExcludeGeo();
            geoTargeting[tabType].init();
        };

        $scope.divHeightCalculation = function () {
            // TODO: (Comment by Lalding on 4th July 2016) Why are these lines commented out?
            // var winHeight = $(window).height();
            // $('.targetting-tab-body').height();
        };

        $scope.divHeightCalculation();

        $scope.hidezipCodeTooltip = function () {
            $scope.enableZipCodePopUp = false;
        };

        // show geo, dmas, zip container
        $scope.showGeographyTabsBox = function (event, tabType, showPopup) {
            var elem;

            // resetting search value
            geoTargeting.resetSearchValue();

            $scope.enableZipCodePopUp = false;
            // if clicked main tab is geo
            if (tabType === 'geo') {
                geoTargeting.showHideExcAndIncSwitch();
                $scope.selectedMainTab = 'geo';

                if ($scope.selectedSubTab !== 'countries') {
                    $scope.selectedSubTab = 'countries';

                    if ($scope.geoData.countries.selected.length === 0 &&
                        $scope.geoData.regions.selected.length > 0) {
                        $scope.selectedSubTab = 'regions';
                    }

                    if ($scope.geoData.countries.selected.length === 0 &&
                        $scope.geoData.regions.selected.length === 0 &&
                        $scope.geoData.cities.selected.length > 0) {
                        $scope.selectedSubTab = 'cities';
                    }

                    geoTargeting.triggerGeoSubNavTab(geoMapper[$scope.selectedSubTab].toLowerCase());
                } else {
                    geoTargeting.triggerGeoSubNavTab('country');
                }
            }

            if (tabType === 'dmas') {
                $scope.selectedMainTab = $scope.selectedSubTab = 'dmas';
                geoTargeting.showHideExcAndIncSwitch();
                geoTargeting.setIncludeExcludeGeo();
                geoTargeting.dmas.init();

                if ($scope.geoData.dmas.selected.length  === 0) {
                    geoTargeting.toggleSwitch(true, 'dmas');
                }
            }

            if (tabType === 'zip') {
                if (showPopup && !$scope.zipCodeTabSelected) {
                    $scope.enableZipCodePopUp = true;
                    return false;
                } else {
                    $scope.zipCodeTabSelected = false;
                }

                $('.targetting-container .searchInput').hide();
            } else {
                $('.targetting-container .searchInput').show();
            }

            elem = event ? $(event.target) : $('#zipCodeTab');
            elem.closest('.nav-tabs').find('.active').removeClass('active');
            elem.closest('li').addClass('active');

            $('.targetting-each-content').hide();
            $('#' + tabType).show();
        };

        // sorting geo data
        $scope.sortGeoData = function (event) {
            var type = $scope.selectedSubTab,
                parentElem = $(event.target).parent(),
                sortIconElem = parentElem.find('.common-sort-icon'),
                sortOrder;

            if (sortIconElem.hasClass('ascending')) {
                sortIconElem.removeClass('ascending').addClass('descending');
                sortOrder = 'desc';
            } else {
                sortIconElem.removeClass('descending').addClass('ascending');
                sortOrder = 'asc';
            }

            geoTargeting.resetGeoData();
            geoTargeting.updateParams({'sortOrder': sortOrder, 'pageNo': 1}, type);
            geoTargeting[type].list();
        };

        $scope.removeItem = function (item, type) {
            var selectedItem = $scope.geoData[type].selected;

            if (type === 'zip') {
                _.each(selectedItem, function (obj) {
                    if (obj.added) {
                        _.each(obj.added, function (zip, idx) {
                            if (zip === item) {
                                obj.added.splice(idx, 1);
                            }
                        });
                    }
                });
            } else {
                if (type === 'countries') {
                    geoTargeting.selectedGeoItemArr = _.filter(
                        geoTargeting.selectedGeoItemArr,
                        function (obj) {
                            return obj.countryCode !== item.countryCode;
                        }
                    );

                    _.each($scope.geoSelectedItems, function (obj) {
                        obj.countries = _.filter(obj.countries, function (obj) {
                            return obj.code !== item.code;
                        });
                    });

                    if ($scope.selectedSubTab === 'regions') {
                        $timeout(function () {
                            $('.targetting-tab-header').find('#regionTab').trigger('click');
                        }, 100);
                    }

                    if ($scope.selectedSubTab === 'cities') {
                        $timeout(function () {
                            $('.targetting-tab-header').find('#cityTab').trigger('click');
                        }, 100);
                    }
                }

                if (type === 'regions') {
                    // filter all regions
                    geoTargeting.selectedGeoItemArr = _.filter(
                        geoTargeting.selectedGeoItemArr,
                        function (obj) {
                            return obj.id !== item.id;
                        });

                    // filter all cities within the region
                    geoTargeting.selectedGeoItemArr = _.filter(
                        geoTargeting.selectedGeoItemArr,
                        function (obj) {
                            return obj.parent.id !== item.id;
                        }
                    );

                    _.each($scope.geoSelectedItems, function (obj) {
                        _.each(obj.countries, function (country) {
                            country.regions = _.filter(
                                country.regions,
                                function (obj) {
                                    return obj.id !== item.id;
                                }
                            );
                        });
                    });

                    if (item.geoType === 'cities') {
                        $scope.geoData.cities.selected = _.filter(
                            $scope.geoData.cities.selected,
                            function (obj) {
                                return obj.parent.id === item.id;
                            }
                        );
                    }

                    if ($scope.selectedSubTab === 'cities') {
                        $timeout(function () {
                            $('.targetting-tab-header').find('#cityTab').trigger('click');
                        }, 100);
                    }
                }

                if (type === 'cities') {
                    geoTargeting.selectedGeoItemArr = _.filter(
                        geoTargeting.selectedGeoItemArr,
                        function (obj) {
                            return obj.id !== item.id;
                        }
                    );

                    _.each($scope.geoSelectedItems, function (obj) {
                        _.each(obj.countries, function (country) {
                            _.each(country.regions, function (region) {
                                _.each(region.cities, function (city, idx) {
                                    region.cities[idx] = _.filter(
                                        city,
                                        function (obj) {
                                            return obj.id !== item.id;
                                        }
                                    );
                                });
                            });
                        });
                    });
                }

                $scope.check(false, item, type);
            }
        };

        $scope.checkZipCodes =  function () {
            var zipCodes = $scope.adData.zipCodes,
                validZipCodes,
                zipCodesRange;

            $scope.zipCodeLoader = true;
            zipCodes = zipCodes.split(/[ ,]+/);

            geoTargeting.validateZipCodes(zipCodes , function (data) {
                $scope.zipCodeLoader = false;

                if (data && data.length > 0) {
                    $rootScope.setErrAlertMessage(data + ' zip code' + (data.length > 1 ? 's are' : ' is') +
                        ' not valid.');

                    validZipCodes = data.map(function (item) {
                        return parseInt(item, 10);
                    });

                    zipCodesRange = rangeValue(zipCodes).map(function (item) {
                        return parseInt(item, 10);
                    });

                    zipCodes = _.difference(zipCodesRange, validZipCodes);
                }

                geoTargeting.addZipCode(zipCodes.join(','));
            });
        };

        $scope.hideConfirmBox = function () {
            $scope.showConfirmBox = false;
        };

        $scope.removeSelectedList = function (type) {
            var navTabsTargetElem = $('.targettingFormWrap').find('.nav-tabs'),
                navTabChildElems = $(navTabsTargetElem[0]).find('li a');

            $scope.hideConfirmBox();
            $scope.geoData[type].selected.length = 0;

            if (type === 'countries' || type === 'regions' || type === 'cities') {
                geoTargeting.selectedGeoItemArr = [];
                $scope.selectedSubTab = 'countries';
                $scope.geoData.countries.included = true;

                if ($scope.geoData[type].data) {
                    $scope.geoData[type].data.length = 0;
                }

                $scope.geoData.regions.selected.length = 0;
                if ($scope.geoData.cities.selected) {
                    $scope.geoData.cities.selected.length = 0;
                }

                if ($scope.geoData.regions.data) {
                    $scope.geoData.regions.data.length = 0;
                }

                if ($scope.geoData.cities.data) {
                    $scope.geoData.cities.data.length = 0;
                }

                $timeout(function () {
                    $(navTabChildElems[0]).triggerHandler('click');
                }, 50);

                $timeout(function () {
                    $('.targetting-tab-header').find('#countryTab').trigger('click');
                }, 100);
            }

            if (type === 'dmas' && $scope.selectedSubTab === 'dmas') {
                $('.toggle-event').bootstrapToggle('on');

                $timeout(function () {
                    $(navTabChildElems[1]).triggerHandler('click');
                }, 50);
            }
        };

        $scope.showRemoveConfirmBox = function (event, type) {
            var target = $(event.target),
                position = target.offset(),
                elem = $('#confirmBox').find('.msgPopup'),
                parentPos = $('.targettingFormWrap').offset(),
                leftPos = position.left - parentPos.left - target.width() - 46,
                topPos = position.top - parentPos.top - target.height() - 6;

            $scope.boxType = type;
            $scope.showConfirmBox = true;
            elem.css({
                position: 'absolute',
                top: topPos,
                left: leftPos,
                width: '242px'
            });
        };

        // END: remove selected countries/regions/cities/dmas/zip
        $scope.resetGeoTargeting = function ($event) {
            if ($event && $scope.mode === 'edit') {
                // do nothing just wait and watch
                console.log('Do nothing, just wait and watch...');
            } else {
                // Geo Data Variables
                $scope.geoData = {};
                $scope.geoData.countries = {};
                $scope.geoData.regions = {};
                $scope.geoData.cities = {};

                // Dma Data Variables
                $scope.geoData.dmas = {};

                // Zip Data Variables
                $scope.geoData.zip = {};

                // Selected Geo Data
                $scope.geoData.countries.selected = [];
                $scope.geoData.regions.selected = [];
                $scope.geoData.cities.selected = [];

                // selected DMA Data
                $scope.geoData.dmas.selected = [];

                // selected Zip Code
                $scope.geoData.zip.selected = [];

                // include switch button flag
                $scope.geoData.countries.included = true;

                // Tab Related Variables.
                $scope.selectedMainTab = 'geo';
                $scope.selectedSubTab = 'countries';

                $scope.selectedRegions = [];
                $scope.geoSelectedItems = {};

                geoTargeting.selectedGeoItemArr = [];
                geoTargeting.showHideExcAndIncSwitch();
            }
        };

        // broadcast from targeting_controller.js,  when user click on geo targeting card.
        $scope.$on('trigger.Geo', function () {
            var saveGeoData,
                geoTargets,
                countryIncluded,
                regionIncluded,
                citiesIncluded,
                dmasIncluded;

            geoTargeting.updateParams({'platformId': $scope.adData.platformId});
            $scope.storedResponse = angular.copy(workflowService.getAdsDetails());
            geoTargets = $scope.storedResponse && $scope.storedResponse.targets.geoTargets;
            geoTargeting.toggleSwitch('on', 'geo');

            // get save data form service
            saveGeoData = workflowService.getSavedGeo() && workflowService.getSavedGeo().original;

            if (saveGeoData &&
                (saveGeoData.countries.selected.length > 0 ||
                    saveGeoData.regions.selected.length > 0 ||
                    saveGeoData.cities.selected.length > 0 ||
                    saveGeoData.dmas.selected.length > 0 ||
                    saveGeoData.zip.selected.length > 0
                )
            ) {
                if (saveGeoData.countries.selected.length > 0) {
                    $scope.geoData.countries.selected = [];
                    $scope.selectedSubTab = 'countries';
                    countryIncluded = saveGeoData.countries.included;
                    countriesWrapper.setData(true, saveGeoData.countries.selected, saveGeoData.countries.included);
                    geoTargeting.triggerGeoNavTab('geo');
                    geoTargeting.toggleSwitch(countryIncluded, 'geo');
                }

                if (saveGeoData.regions.selected.length > 0) {
                    $scope.geoData.regions.selected = [];
                    regionsWrapper.setData(true, saveGeoData.regions.selected, saveGeoData.regions.included);
                    regionIncluded = saveGeoData.regions.included;

                    if (saveGeoData.countries.selected.length === 0) {
                        $scope.selectedSubTab = 'regions';
                        geoTargeting.triggerGeoNavTab('geo');
                        geoTargeting.triggerGeoSubNavTab('region');
                        geoTargeting.toggleSwitch(regionIncluded, 'geo');
                    }
                }

                if (saveGeoData.cities.selected.length > 0) {
                    $scope.geoData.cities.selected = [];
                    citiesWrapper.setData(true, saveGeoData.cities.selected, saveGeoData.cities.included);
                    citiesIncluded = saveGeoData.cities.included;

                    if (saveGeoData.countries.selected.length === 0 && saveGeoData.regions.selected.length === 0) {
                        $scope.selectedSubTab = 'cities';
                        geoTargeting.triggerGeoNavTab('geo');
                        geoTargeting.triggerGeoSubNavTab('city');
                        geoTargeting.toggleSwitch(citiesIncluded, 'geo');
                    }
                }

                if (saveGeoData.dmas.selected.length > 0) {
                    $scope.geoData.dmas.selected = [];
                    dmasIncluded = saveGeoData.dmas.included;
                    $scope.selectedSubTab = 'dmas';

                    if (saveGeoData.countries.selected.length  === 0 &&
                        saveGeoData.regions.selected.length  === 0 &&
                        saveGeoData.cities.selected.length === 0) {
                        geoTargeting.triggerGeoNavTab('dmas');
                    }

                    geoTargeting.toggleSwitch(dmasIncluded, 'dmas');
                    dmasWrapper.setData(true, saveGeoData.dmas.selected, saveGeoData.dmas.included);
                }

                if (saveGeoData.zip.selected.length > 0) {
                    $scope.geoData.zip.selected = [];
                    zipWrapper.setData(saveGeoData.zip.selected);
                }
            } else if (geoTargets && _.size(geoTargets) > 0) {
                // get geo Data form ads Data
                if (geoTargets && geoTargets.COUNTRY) {
                    $scope.geoData.countries.selected = [];
                    countryIncluded = geoTargets.COUNTRY.isIncluded;
                    geoTargeting.toggleSwitch(countryIncluded, 'geo');
                    countriesWrapper.setData(true, geoTargets.COUNTRY.geoTargetList, geoTargets.COUNTRY.isIncluded);
                    geoTargeting.triggerGeoNavTab('geo');
                }

                if (geoTargets && geoTargets.REGION) {
                    $scope.geoData.regions.selected = [];
                    regionsWrapper.setData(true, geoTargets.REGION.geoTargetList, geoTargets.REGION.isIncluded);
                    regionIncluded = geoTargets.REGION.isIncluded;

                    if (!geoTargets.COUNTRY) {
                        $scope.selectedSubTab = 'regions';
                        geoTargeting.triggerGeoNavTab('geo');
                        geoTargeting.triggerGeoSubNavTab('region');
                        geoTargeting.toggleSwitch(regionIncluded, 'geo');
                    }
                }

                if (geoTargets && geoTargets.CITY) {
                    $scope.geoData.cities.selected = [];
                    citiesWrapper.setData(true, geoTargets.CITY.geoTargetList, geoTargets.CITY.isIncluded);
                    citiesIncluded = geoTargets.CITY.isIncluded;

                    if (!geoTargets.COUNTRY && !geoTargets.REGION) {
                        $scope.selectedSubTab = 'cities';
                        geoTargeting.triggerGeoNavTab('geo');
                        geoTargeting.triggerGeoSubNavTab('city');
                        geoTargeting.toggleSwitch(citiesIncluded, 'geo');
                    }
                }

                if (geoTargets && geoTargets.DMA) {
                    $scope.geoData.dmas.selected = [];
                    dmasIncluded = geoTargets.DMA.isIncluded;
                    $scope.selectedSubTab = 'dmas';

                    if (!(geoTargets && geoTargets.COUNTRY) &&
                        !(geoTargets && geoTargets.REGION) &&
                        !(geoTargets && geoTargets.CITY)) {
                        geoTargeting.triggerGeoNavTab('dmas');
                    }

                    geoTargeting.toggleSwitch(dmasIncluded, 'dmas');
                    dmasWrapper.setData(true, geoTargets.DMA.geoTargetList, geoTargets.DMA.isIncluded);
                }

                if (geoTargets && geoTargets.ZIP_CODE) {
                    $scope.geoData.zip.selected = [];
                    zipWrapper.setData(geoTargets.ZIP_CODE.geoTargetList);
                }
            } else {
                // on load reset geo targeting variables.
                $scope.resetGeoTargeting();
                geoTargeting.triggerGeoNavTab('geo');
                geoTargeting.toggleSwitch('on', 'geo');
            }

            // binding chnage event on switch
            $('.toggle-event').change(function (event) {
                var isChecked,
                    target,
                    includeLabelElem;

                event.stopImmediatePropagation();
                isChecked = $(this).prop('checked');
                $scope.geoData[$scope.selectedSubTab].included = isChecked;
                geoTargeting.updateSelectedGeoList(isChecked, $scope.selectedSubTab);
                target = $(event.target);
                includeLabelElem  = target.parents('.include-label');

                if (isChecked) {
                    includeLabelElem.find('.toggle-switch-text').text('Include');
                } else {
                    includeLabelElem.find('.toggle-switch-text').text('Exclude');
                }
            });

            // show geoTargeting Container
            geoTargeting.show();
        });

        // on load reset geo targeting variables.
        workflowService.resetSavedGeo();
        $scope.resetGeoTargeting();

        // reset geo targeting variables.
        $scope.$on('reset.Geo', function () {
            $scope.resetGeoTargeting();
        });
    });
});
