define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service', 'common/services/zip_code', 'lrInfiniteScroll', 'common/directives/checklist_model'], function (angularAMD) {
    angularAMD.controller('GeoTargettingController', function ($scope, $rootScope, $timeout, $filter, constants, workflowService, zipCode) {

        var DATA_MAX_SIZE = 200,
            defaultParams = {
                'platformId': '',
                'sortOrder': 'asc',
                'sortBy': 'name',
                'pageSize': DATA_MAX_SIZE,
                'pageNo': 1,
                'query': '',
                'countryCodes': '',
                'regionIds': '',
                'excludeCountries': '',
                'excludeRegions': ''
            };

        $scope.textconstants = constants;

        $(window).resize(function () {
            $scope.divHeightCalculation();
        });

        var self = this;

        var geoTargeting = {

            //get ads data
            getAdsDetails: function () {
                return workflowService.getAdsDetails()
            },

            //reset all geoData
            resetGeoData: function () {
                $scope.geoData.countries.data = [];
                $scope.geoData.regions.data = [];
                $scope.geoData.cities.data = [];
            },

            //reset selected geoData
            resetSelectedGeoData: function () {
                $scope.geoData.countries.selected = [];
                $scope.geoData.regions.selected = [];
                $scope.geoData.cities.selected = [];
            },

            resetSearchValue: function () {
                $('.searchBox').val('');
            },

            //update query params
            updateParams: function (params, type) {
                if (type) {
                    _.extend($scope.geoData[type].queryParams, params);
                } else {
                    _.extend(defaultParams, params);
                }
            },

            //get search box value
            getSearchGeo: function (type) {
                var searchVal = $('.searchBox').val();
                if (searchVal && searchVal.length > 0) {
                    //reset geoData array
                    this.resetGeoData();
                    $scope.geoData[type].queryParams = _.extend({}, defaultParams);
                    this.updateParams({'query': searchVal}, type);
                }
                $scope.geoData[type].fetching = true;
                geoTargeting[type].list('cancellable');
            },

            //build query string for $http
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

                /*
                 case 5 : Country --> Not selected, Region --> Include, City --> Excluded
                 */

                if ($scope.geoData.countries.selected.length === 0 && $scope.geoData.regions.selected.length === 0) {
                    $scope.geoData.regions.included = true;
                }


                /*
                 case 1 : Country --> Included, Region --> Excluded, City --> Excluded
                 */

                if ($scope.geoData.countries.selected.length > 0 && $scope.geoData.countries.included) {
                    $scope.geoData.regions.included = false;
                    $scope.geoData.cities.included = false;
                }

                /*
                 case 2 : Country --> Excluded, Region --> Excluded, City --> Excluded
                 */

                if ($scope.geoData.countries.selected.length > 0 && !$scope.geoData.countries.included) {
                    $scope.geoData.regions.included = false;
                    $scope.geoData.cities.included = false;
                }

                /*
                 case 3 : Country --> Included, Region --> Not selected, City --> Excluded
                 */

                if ($scope.geoData.countries.selected.length > 0 && $scope.geoData.regions.selected.length === 0 && $scope.geoData.countries.included) {
                    $scope.geoData.cities.included = false;
                }

                /*
                 case 4 : Country --> Excluded, Region --> Not selected, City --> Excluded
                 */

                if ($scope.geoData.countries.selected.length > 0 && $scope.geoData.regions.selected.length === 0 && !$scope.geoData.countries.included) {
                    $scope.geoData.cities.included = false;
                }

                /*
                 case 5 : Country --> Not selected, Region --> Include, City --> Excluded
                 */

                if ($scope.geoData.countries.selected.length === 0 && $scope.geoData.regions.selected.length > 0 && $scope.geoData.regions.included) {
                    $scope.geoData.cities.included = false;
                }

                /*
                 case 6 : Country --> Not selected, Region --> Excluded, City --> Excluded
                 */

                if ($scope.geoData.countries.selected.length === 0 && $scope.geoData.regions.selected.length > 0 && !$scope.geoData.regions.included) {
                    $scope.geoData.cities.included = false;
                }

                /*
                 case 6 : Country --> Not selected, Region --> Excluded, City --> Excluded
                 */

                if ($scope.geoData.countries.selected.length === 0 && $scope.geoData.regions.selected.length === 0) {
                    $scope.geoData.cities.included = true;
                }


                /*
                 case 5 : Country --> Not selected, Region --> Include, City --> Excluded
                 */

                if ($scope.geoData.dmas.selected.length === 0) {
                    $scope.geoData.dmas.included = true;
                }
            },

            showHideExcAndIncSwitch: function () {
                /*
                 if selected tab is country, switch -  on for country
                 */

                if ($scope.selectedSubTab === 'countries') {
                    $scope.geoData.countries.switch = true;
                }

                /*
                 if selected tab is region and country is selected, switch -  off for country
                 */

                if ($scope.selectedSubTab === 'regions' && $scope.geoData.countries.selected.length > 0) {
                    $scope.geoData.regions.switch = false;
                }

                /*
                 if selected tab is region and country is not selected, switch -  on for region
                 */

                if ($scope.selectedSubTab === 'regions' && $scope.geoData.countries.selected.length === 0) {
                    $scope.geoData.regions.switch = true;
                } else {
                    $scope.geoData.regions.switch = false;
                }


                /*
                 if selected tab is region and country is not selected, switch -  on for region
                 */

                if ($scope.selectedSubTab === 'regions' && $scope.geoData.countries.selected.length === 0) {
                    $scope.geoData.regions.switch = true;
                } else {
                    $scope.geoData.regions.switch = false;
                }

                /*
                 if selected tab is city and country and region is not selected, switch -  on for city
                 */

                if ($scope.selectedSubTab === 'cities' && $scope.geoData.countries.selected.length === 0 && $scope.geoData.regions.selected.length === 0) {
                    $scope.geoData.cities.switch = true;
                } else {
                    $scope.geoData.cities.switch = false;
                }

                /*
                 if selected tab is country, switch -  on for country
                 */

                if ($scope.selectedSubTab === 'dmas') {
                    $scope.geoData.dmas.switch = true;
                }

            },
            /*
             START : remove selected countries/regions/cities/dmas/zip
             */

            removeSelectedItem : function (selectedItem, item) {
                for (var i = 0; i < selectedItem.length; i++) {
                    if (selectedItem[i].id === item.id) {
                        selectedItem.splice(i, 1);
                    }
                }
            },

            geoTargetingDataForPreview : function () {
                var geoData = _.extend({}, $scope.geoData),
                    obj = {};

                geoData.zip = zipWrapper.getAllAddedZipCode(geoData.zip.selected);
                if (geoData.countries && geoData.countries.selected.length > 0) {
                    geoData['COUNTRY'] = {};
                    geoData['COUNTRY']['geoTargetList'] = [];
                    geoData['COUNTRY']['geoTargetList'] = geoData.countries.selected;
                    geoData['COUNTRY']['isIncluded'] = _.uniq(_.pluck(geoData.countries.selected, 'included'))[0];
                    delete geoData.countries;
                }

                if (geoData.regions && geoData.regions.selected.length > 0) {
                    geoData['REGION'] = {};
                    geoData['REGION']['geoTargetList'] = [];
                    geoData['REGION']['geoTargetList'] = geoData.regions.selected;
                    geoData['REGION']['isIncluded'] = _.uniq(_.pluck(geoData.regions.selected, 'included'))[0];
                    delete geoData.regions;
                }

                if (geoData.cities && geoData.cities.selected.length > 0) {
                    geoData['CITY'] = {};
                    geoData['CITY']['geoTargetList'] = [];
                    geoData['CITY']['geoTargetList'] = geoData.cities.selected;
                    geoData['CITY']['isIncluded'] = _.uniq(_.pluck(geoData.cities.selected, 'included'))[0];
                    delete geoData.cities;
                }

                if (geoData.dmas && geoData.dmas.selected.length > 0) {
                    geoData['DMA'] = {};
                    geoData['DMA']['geoTargetList'] = [];
                    geoData['DMA']['geoTargetList'] = geoData.dmas.selected;
                    geoData['DMA']['isIncluded'] = _.uniq(_.pluck(geoData.dmas.selected, 'included'))[0];
                    delete geoData.dmas;
                }

                if (geoData.zip && geoData.zip.length > 0) {
                    geoData['ZIP_CODE'] = {};
                    geoData['ZIP_CODE']['geoTargetList'] = [];
                    geoData['ZIP_CODE']['geoTargetList'] = geoData.zip;
                    geoData['ZIP_CODE']['isIncluded'] = geoData.zip.length > 0 ? true : false;
                    delete geoData.zip;
                }
                return geoData;
            },


            getGeoTypes: function (geoItem) {
                var arr = [];
                _.each(geoItem.data, function (obj) {
                    arr.push(obj.geoType);
                })
                return _.uniq(arr);
            },

            countryWrapper: function (geoItem, idx) {
                _.each(geoItem.data, function (item, index) {
                    if (!$scope.geoSelectedItems[idx]['countries']) {
                        $scope.geoSelectedItems[idx]['countries'] = [];
                    }
                    $scope.geoSelectedItems[idx]['countries'].push(item)
                });
            },

            regionWrapper: function (geoItem, idx) {
                _.each(geoItem.data, function (item, index) {

                    if (!$scope.geoSelectedItems[idx]['countries']) {
                        $scope.geoSelectedItems[idx]['countries'] = [];
                    }

                    //check if geoItem country is there in countries selected array
                    var pos = _.findIndex($scope.geoSelectedItems[idx]['countries'], function (obj) {
                        return item.countryCode === obj.countryCode;
                    })

                    if (pos < 0) {
                        $scope.geoSelectedItems[idx]['countries'].push(item.country);
                    }

                    delete item.country;

                    var countryLen = $scope.geoSelectedItems[idx]['countries'].length - 1;
                    if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions']) {
                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'] = [];
                    }

                    if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions']) {
                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'] = [];
                    }

                    var pos1 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'], function (obj) {
                        return item.countryCode === obj.countryCode;
                    })
                    if (pos1 >= 0) {
                        countryLen = pos1;
                    }

                    $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].push(item);
                });
            },

            cityWrapper: function (geoItem, idx) {
                _.each(geoItem.data, function (item, index) {
                    if (!$scope.geoSelectedItems[idx]['countries']) {
                        $scope.geoSelectedItems[idx]['countries'] = [];
                    }

                    //check if geoItem country is there in countries selected array
                    var pos = _.findIndex($scope.geoSelectedItems[idx]['countries'], function (obj) {
                        return item.countryCode === obj.countryCode;
                    })

                    if (pos < 0) {
                        $scope.geoSelectedItems[idx]['countries'].push(item.country);
                    }

                    delete item.country;

                    var countryLen = $scope.geoSelectedItems[idx]['countries'].length - 1;

                    if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions']) {
                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'] = [];
                    }

                    var pos1 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'], function (obj) {
                        return item.countryCode === obj.countryCode;
                    })
                    if (pos1 >= 0) {
                        countryLen = pos1;
                    }


                    $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].push(item.parent);
                    delete item.parent;

                    var regionLen = $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].length - 1;

                    if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities']) {
                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'] = [];
                    }

                    var pos1 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'], function (obj) {
                        return item.countryCode === obj.countryCode;
                    })
                    if (pos1 >= 0) {
                        regionLen = pos1;
                    }

                    $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'].push(item);
                });
            },

            countryRegionWrapper: function (geoItem, idx) {
                _.each(geoItem.data, function (item, index) {
                    if (item.geoType === 'COUNTRY') {
                        if (!$scope.geoSelectedItems[idx]['countries']) {
                            $scope.geoSelectedItems[idx]['countries'] = [];
                        }
                        $scope.geoSelectedItems[idx]['countries'].push(item)
                    }

                    if (item.geoType === 'REGION') {
                        var pos = _.findIndex($scope.geoSelectedItems[idx]['countries'], function (obj) {
                            return item.parent.id === obj.id;
                        })
                        if (pos >= 0) {
                            if (!$scope.geoSelectedItems[idx]['countries'][pos]['regions']) {
                                $scope.geoSelectedItems[idx]['countries'][pos]['regions'] = [];
                            }
                            $scope.geoSelectedItems[idx]['countries'][pos]['regions'].push(item);
                        }
                    }
                })
            },

            countryRegionCityWrapper: function (geoItem, idx) {
                console.log("countryRegionCityWrapper ", "geoItem ", geoItem, "idx ", idx)
                _.each(geoItem.data, function (item, index) {

                    if (item.geoType === 'COUNTRY') {
                        if (!$scope.geoSelectedItems[idx]['countries']) {
                            $scope.geoSelectedItems[idx]['countries'] = [];
                        }
                        $scope.geoSelectedItems[idx]['countries'].push(item)
                    }

                    if (item.geoType === 'REGION') {

                        console.log("1111", $scope.geoSelectedItems[idx]['countries']);
                        var pos = _.findIndex($scope.geoSelectedItems[idx]['countries'], function (obj) {
                            return item.countryCode === obj.countryCode;
                        })

                        console.log("pos", pos);

                        if (pos < 0) {
                            $scope.geoSelectedItems[idx]['countries'].push(item.country);
                            delete item.country;
                        }

                        console.log("2222", $scope.geoSelectedItems[idx]['countries']);

                        var countryLen = $scope.geoSelectedItems[idx]['countries'].length - 1;
                        if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions']) {
                            $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'] = [];
                        }

                        var pos1 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'], function (obj) {
                            return item.countryCode === obj.countryCode;
                        })

                        if (pos1 >= 0) {
                            countryLen = pos1;
                        }

                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].push(item);
                    }

                    if (item.geoType === 'CITY') {
                        console.log("3333", $scope.geoSelectedItems[idx]['countries']);
                        var pos = _.findIndex($scope.geoSelectedItems[idx]['countries'], function (obj) {
                            return item.countryCode === obj.countryCode;
                        })

                        console.log("pos", pos);

                        if (pos < 0) {
                            $scope.geoSelectedItems[idx]['countries'].push(item.country);
                            delete item.country;
                        }

                        console.log("3333", $scope.geoSelectedItems[idx]['countries']);


                        var countryLen = $scope.geoSelectedItems[idx]['countries'].length - 1;

                        if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions']) {
                            $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'] = [];
                        }

                        var pos1 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'], function (obj) {
                            return item.countryCode === obj.countryCode && item.parent.id === obj.id;
                        })

                        if (pos1 >= 0) {
                            countryLen = pos1;
                        }

                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].push(item.parent);
                        delete item.parent;


                        var regionLen = $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].length - 1;

                        if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities']) {
                            $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'] = [];
                        }

                        var pos2 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'], function (obj) {
                            return item.countryCode === obj.countryCode && item.id === obj.id;
                        })

                        if (pos2 >= 0) {
                            regionLen = pos1;
                        }

                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'].push(item);
                    }
                });
            },

            regionCityWrapper: function (geoItem, idx) {
                _.each(geoItem.data, function (item, index) {

                    if (item.geoType === 'REGION') {

                        if (!$scope.geoSelectedItems[idx]['countries']) {
                            $scope.geoSelectedItems[idx]['countries'] = [];
                        }
                        var pos = _.findIndex($scope.geoSelectedItems[idx]['countries'], function (obj) {
                            return item.countryCode === obj.countryCode;
                        })
                        if (pos < 0) {
                            $scope.geoSelectedItems[idx]['countries'].push(item.country);
                        }

                        delete item.country;

                        var countryLen = $scope.geoSelectedItems[idx]['countries'].length - 1;

                        if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions']) {
                            $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'] = [];
                        }

                        var pos1 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'], function (obj) {
                            return item.countryCode === obj.countryCode;
                        })

                        if (pos1 >= 0) {
                            countryLen = pos1;
                        }

                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].push(item);
                    }

                    if (item.geoType === 'CITY') {

                        var pos = _.findIndex($scope.geoSelectedItems[idx]['countries'], function (obj) {
                            return item.countryCode === obj.countryCode;
                        })

                        if (pos < 0) {
                            $scope.geoSelectedItems[idx]['countries'].push(item.country);
                        }

                        delete item.country;
                        var countryLen = $scope.geoSelectedItems[idx]['countries'].length - 1;

                        if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions']) {
                            $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'] = [];
                        }

                        var pos1 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'], function (obj) {
                            return item.parent.id === obj.id;
                        })

                        if (pos1 < 0) {
                            countryLen = pos1;
                            $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].push(item.parent);
                            delete item.parent;
                        }


                        var regionLen = $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].length - 1;

                        if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities']) {
                            $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'] = [];
                        }
                        var pos2 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'], function (obj) {
                            return item.id === obj.id;
                        })
                        if (pos2 >= 0) {
                            regionLen = pos1;
                        }
                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'].push(item);
                    }
                })
            },

            countryCityWrapper : function(geoItem, idx) {
                _.each(geoItem.data, function (item, index) {

                    if (item.geoType === 'COUNTRY') {
                        if (!$scope.geoSelectedItems[idx]['countries']) {
                            $scope.geoSelectedItems[idx]['countries'] = [];
                        }
                        $scope.geoSelectedItems[idx]['countries'].push(item)
                    }

                    if (item.geoType === 'CITY') {

                        var pos = _.findIndex($scope.geoSelectedItems[idx]['countries'], function (obj) {
                            return item.countryCode === obj.countryCode;
                        })

                        if (pos < 0) {
                            $scope.geoSelectedItems[idx]['countries'].push(item.country);
                            delete item.country;
                        }

                        var countryLen = $scope.geoSelectedItems[idx]['countries'].length - 1;

                        if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions']) {
                            $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'] = [];
                        }

                        var pos1 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'], function (obj) {
                            return item.parent.id === obj.id;
                        })

                        if (pos1 >= 0) {
                            countryLen = pos1;
                        }

                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].push(item.parent);
                        delete item.parent;


                        var regionLen = $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'].length - 1;

                        if (!$scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities']) {
                            $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'] = [];
                        }
                        var pos2 = _.findIndex($scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'], function (obj) {
                            return item.id === obj.id;
                        })
                        if (pos2 >= 0) {
                            regionLen = pos1;
                        }
                        $scope.geoSelectedItems[idx]['countries'][countryLen]['regions'][regionLen]['cities'].push(item);
                    }
                })
            },


            sideBarPreviewData: function (selectedGeoData) {
                var geoType,
                    cloneSelectedGeoData = $.extend(true, [], selectedGeoData);

                _.each(cloneSelectedGeoData, function (geoItem, idx) {
                    var geoType = geoTargeting.getGeoTypes(geoItem)

                    if (!$scope.geoSelectedItems[idx]) {
                        $scope.geoSelectedItems[idx] = [];
                    }

                    console.log("geoType", geoType);

                    if (geoType[0] === 'COUNTRY' && geoType[1] === 'REGION' && geoType[2] === 'CITY') {
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
                })
            },


            modifySelectedGeoData: function (data) {

                var selectedGeo = [],
                    cloneData,
                    groupData;

                $scope.geoSelectedItems = {};

                cloneData = $.extend(true, [], data);

                if (cloneData.length > 0) {
                    var groupData = _.groupBy(cloneData, function (obj) {
                        if (obj.country) {
                            return obj.country.name
                        } else {
                            return obj.name
                        }
                    });

                    if (groupData) {
                        for (var country in groupData) {
                            selectedGeo.push({'country': country, 'data': groupData[country]});
                        }
                    }
                    this.sideBarPreviewData(selectedGeo)
                }
            },

            showToolTip: function (elem) {
                // In relative to btn-group div, the tooltip offset is calculated
                var tooltip_left = elem.offset().left - elem.closest(".btn-group").offset().left;
                var tooltip_width = elem.closest(".btn-group").find(".common_tooltip").width();
                var elem_width = elem.width();
                $(".common_tooltip").show().css("left", tooltip_left - tooltip_width / 2 + elem_width / 2);
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

        }

        //For GEO - Countries related methods
        var countriesWrapper = {
            fetch: function (requestType, callback) {
                var params = $scope.geoData.countries.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                if (requestType === 'cancellable') {
                    workflowService
                        .getCountries(platformId, query, requestType, function (result) {
                            callback && callback(result.data.data);
                        }, function (error) {
                            console.log('error');
                        });
                } else {
                    workflowService
                        .getCountries(platformId, query)
                        .then(function (result) {
                            callback && callback(result.data.data);
                        }, function (error) {
                            console.log("error", error);
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

                    if ($scope.mode === 'edit') {
                        var geoTargets = $scope.storedResponse.targets.geoTargets;
                        if (geoTargets && _.size(geoTargets) > 0 && geoTargets.COUNTRY) {
                            $scope.geoData.countries.selected = angular.copy(geoTargets.COUNTRY.geoTargetList);
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
        };

        //For GEO - Regions related methods
        var regionsWrapper = {
            fetch: function (requestType, callback) {
                var params = $scope.geoData.regions.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                if (requestType === 'cancellable') {
                    workflowService
                        .getRegions(platformId, query, requestType, function (result) {
                            callback && callback(result.data.data);
                        }, function (error) {
                            console.log('error');
                        });
                } else {
                    workflowService
                        .getRegions(platformId, query)
                        .then(function (result) {
                            callback && callback(result.data.data);
                        }, function (error) {
                            console.log('error');
                        });
                }
            },

            list: function (requestType) {
                var selectedCountries,
                    countryIds;

                /**
                 * if countries are selected
                 * pick the ids of selected countries
                 * fetch regions fot those countries
                 */

                selectedCountries = $scope.geoData.countries.selected;
                if (selectedCountries.length > 0) {
                    countryCodes = _.pluck(selectedCountries, 'code').join(',');
                    geoTargeting.updateParams({'countryCodes': countryCodes}, 'regions')

                    /**
                     * if country is exculded need to pass excludeCountries = true in regions call
                     */

                    if ($scope.geoData.countries.included === false) {
                        geoTargeting.updateParams({'excludeCountries': true}, 'regions')
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

                    if ($scope.mode === 'edit') {
                        var geoTargets = $scope.storedResponse.targets.geoTargets;
                        if (geoTargets && _.size(geoTargets) > 0 && geoTargets.REGION) {
                            $scope.geoData.regions.selected = angular.copy(geoTargets.REGION.geoTargetList);
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
        };

        //For GEO - Cities related methods
        var citiesWrapper = {
            fetch: function (requestType, callback) {
                var params = $scope.geoData.cities.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                if (requestType === 'cancellable') {
                    workflowService
                        .getCities(platformId, query, requestType, function (result) {
                            callback && callback(result.data.data);
                        }, function (error) {
                            console.log('error');
                        });
                } else {
                    workflowService
                        .getCities(platformId, query)
                        .then(function (result) {
                            callback && callback(result.data.data);
                        }, function (error) {
                            console.log('error');
                        });
                }
            },

            list: function (requestType) {
                var selectedRegions,
                    selectedCountries,
                    countryCodes,
                    regionIds;


                /**
                 * if regions are selected
                 * pick the ids of selected regions
                 * fetch cities fot those regions
                 */


                selectedRegions = $scope.geoData.regions.selected;
                if (selectedRegions.length > 0) {
                    regionIds = _.pluck(selectedRegions, 'id').join(',');
                    geoTargeting.updateParams({'regionIds': regionIds}, 'cities');

                    /**
                     * if country is exculded need to pass excludeCountries = true in regions call
                     */

                    selectedCountries = $scope.geoData.countries.selected;
                    if (selectedCountries.length > 0) {
                        countryCodes = _.pluck(selectedCountries, 'code').join(',');
                        geoTargeting.updateParams({'countryCodes': countryCodes}, 'cities')

                        /**
                         * if country is exculded need to pass excludeCountries = true in regions call
                         */

                        if ($scope.geoData.countries.included === false) {
                            geoTargeting.updateParams({'excludeCountries': true}, 'cities')
                        }
                    }

                    /**
                     * if region is exculded need to pass excludeRegions = true in regions call
                     */

                    if ($scope.geoData.regions.included === false) {
                        geoTargeting.updateParams({'excludeRegions': true}, 'cities')
                    }

                } else {
                    /**
                     * if countries are selected and regions is not selected
                     * pick the country codes of selected countries
                     * fetch cities fot those countries
                     */

                    selectedCountries = $scope.geoData.countries.selected;
                    if (selectedCountries.length > 0) {
                        countryCodes = _.pluck(selectedCountries, 'code').join(',');
                        geoTargeting.updateParams({'countryCodes': countryCodes}, 'cities')
                    }

                    /**
                     * if country is exculded need to pass excludeCountries = true in cities call
                     */

                    if ($scope.geoData.countries.included === false) {
                        selectedCountries = $scope.geoData.countries.selected;
                        if (selectedCountries.length > 0) {
                            countryCodes = _.pluck(selectedCountries, 'code').join(',');
                            geoTargeting.updateParams({'countryCodes': countryCodes}, 'cities')

                            /**
                             * if country is exculded need to pass excludeCountries = true in regions call
                             */

                            if ($scope.geoData.countries.included === false) {
                                geoTargeting.updateParams({'excludeCountries': true}, 'cities')
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

                    if ($scope.mode === 'edit') {
                        var geoTargets = $scope.storedResponse.targets.geoTargets;
                        if (geoTargets && _.size(geoTargets) > 0 && geoTargets.CITY) {
                            $scope.geoData.cities.selected = angular.copy(geoTargets.CITY.geoTargetList);
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
        };


        //For DMAs - related methods
        var dmasWrapper = {
            fetch: function (requestType, callback) {
                var params = $scope.geoData.dmas.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                if (requestType === 'cancellable') {
                    workflowService.getDMAs(platformId, query, requestType, function (result) {
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
                        .getDMAs(platformId, query)
                        .then(function (result) {

                            var responseData = result.data.data;
                            _.each(responseData, function (data) {
                                data.region = $.trim(data.name.substring(data.name.lastIndexOf(' ')));
                                data.dmaName = $.trim(data.name.substring(0, data.name.lastIndexOf(' ')));
                            });

                            callback && callback(result.data.data);
                        }, function (error) {
                            console.log('error');
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

                    if ($scope.mode === 'edit') {
                        var geoTargets = $scope.storedResponse.targets.geoTargets;
                        if (geoTargets && _.size(geoTargets) > 0 && geoTargets.DMA) {
                            $scope.geoData.dmas.selected = angular.copy(geoTargets.DMA.geoTargetList);
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
        };


        //For DMAs - related methods
        var zipWrapper = {
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

        //Geo
        geoTargeting.countries = countriesWrapper;
        geoTargeting.regions = regionsWrapper;
        geoTargeting.cities = citiesWrapper;

        //DMAs
        geoTargeting.dmas = dmasWrapper;

        //this is temp redirect to targetting screen
        $scope.showTargettingScreen = function (cancelClicked) {

            if ($scope.zipCodesObj) {
                $scope.zipCodesObj.info = [];
                $scope.zipCodesObj.error = [];
            }

            if (cancelClicked && workflowService.getSavedGeo()) {
            }
            geoTargeting.hide();
        };

        $scope.saveGeography = function (cancelClicked) {

            var geoTargetsData = workflowService.getAdsDetails();
            zipWrapper.resetZipCode();

            if ($scope.geoData.zip.selected.length === 0 && geoTargetsData && geoTargetsData.targets && geoTargetsData.targets.geoTargets && geoTargetsData.targets.geoTargets.ZIP_CODE) {
                geoTargetsData.targets.geoTargets.ZIP_CODE = null;
                workflowService.setAdsDetails(geoTargetsData);
            }

            var modifedGeoTargetObj = geoTargeting.geoTargetingDataForPreview();

            workflowService.setSavedGeo({
                'modify': modifedGeoTargetObj,
                'original': $scope.geoData
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
        }


        $scope.getTargetingValues = function (type) {
            return $scope.geoData[type].selected;
        };


        $scope.check = function (item, checked, type) {

            var idx,
                previousSelectedData,
                pos,
                newItem;

            previousSelectedData = _.extend({}, $scope.geoData[type].selected);

            idx = _.findIndex($scope.geoData[type].selected, function (obj) {
                return item.id === obj.id;
            });

            if (idx >= 0 && !checked) {
                $scope.geoData[type].selected.splice(idx, 1);
            }
            if (idx < 0 && checked) {
                item['included'] = $scope.geoData[type].included;
                $scope.geoData[type].selected.push(item);
            }


            if (type === 'countries') {
                if (_.difference(previousSelectedData, $scope.geoData.countries.selected).length > 0) {
                    $scope.geoData.regions.selected = [];
                    $scope.geoData.cities.selected = [];
                }
            }

            if (type === 'regions') {
                if (_.difference(previousSelectedData, $scope.geoData.regions.selected).length > 0) {
                    $scope.geoData.cities.selected = [];
                }
            }

            newItem = $.extend(true, {}, item);

            idx = _.findIndex(tmpSelectedGeoItemArr, function (obj) {
                return newItem.id === obj.id;
            });

            if (idx >= 0 && !checked) {
                tmpSelectedGeoItemArr.splice(idx, 1);
            }
            if (idx < 0 && checked) {
                tmpSelectedGeoItemArr.push(newItem);
            }

            geoTargeting.modifySelectedGeoData(tmpSelectedGeoItemArr);
        };


        //search countries/regions/cities
        $scope.search = function (event) {
            var target = $(event.target),
                searchType = target.attr('data-searchfield'); //search type can be countries/regions/cities
            geoTargeting.getSearchGeo(searchType);

        };

        //On scroll dynamically loading more countries/regions/cities.
        $scope.loadMoreGeoData = function () {
            var type = $scope.selectedSubTab;
            var geoData = $scope.geoData[type].data;
            var isMoreDataAvailable = $scope.geoData[type].no_more_data;
            if (geoData && !isMoreDataAvailable) {
                $scope.geoData[type].queryParams.pageNo += 1;
                $scope.geoData[type].load_more_data = true
                geoTargeting[type].list();
            }
        };

        //show country/region and city container
        $scope.showRespectiveTabContent = function (event, tabType) {
            /*
             show tooltip in two cases
             1. if you have selected region without selecting countries
             2- if you have selected city without selecting regions
             3- if you have selected country or region without selecting regions or cities
             */

            var elem = $(event.target);
            var selectedCountries = $scope.geoData.countries.selected.length;
            var selectedRegions = $scope.geoData.regions.selected.length;
            var selectedCities = $scope.geoData.cities.selected.length;

            $(".targetting-tab-header .showToolTip").hide();
            if (tabType === 'countries'
                && selectedCountries === 0
                && selectedRegions > 0) {
                $scope.geoNote = $scope.textConstants.NOT_SELECTED_COUNTRY_NOTE;
                geoTargeting.showToolTip(elem);
                return false;
            }

            if (tabType === 'regions'
                && selectedRegions === 0
                && selectedCities > 0) {
                $scope.geoNote = $scope.textConstants.NOT_SELECTED_REGION_NOTE;
                geoTargeting.showToolTip(elem);
                return false;
            }

            if ((tabType === 'countries' || tabType === 'regions')
                && selectedCities > 0
                && selectedCountries === 0
                && selectedRegions === 0) {
                $scope.geoNote = $scope.textConstants.NOT_SELECTED_COUNTRY_REGION_NOTE;
                geoTargeting.showToolTip(elem);
                return false;
            }


            $(".geo-tab-content").hide();
            $("#" + tabType + "-geo-tab-content").show();

            elem.closest(".btn-group").find(".active").removeClass("active");
            elem.addClass("active");

            //reseting search value
            geoTargeting.resetSearchValue();

            $scope.selectedSubTab = tabType;
            geoTargeting.showHideExcAndIncSwitch();
            geoTargeting.setIncludeExcludeGeo();
            geoTargeting[tabType].init();
        };

        $scope.divHeightCalculation = function () {
            // var winHeight = $(window).height() ;
            // $(".targetting-tab-body").height() ;
        };
        $scope.divHeightCalculation();


        $scope.divHeightCalculation();

        // show geo, dmas, zip container
        $scope.showGeographyTabsBox = function (event, tabType, showPopup) {
            $('.toggle-event').bootstrapToggle();
            var elem = $(event.target);
            elem.closest(".nav-tabs").find(".active").removeClass("active");
            elem.closest("li").addClass("active");
            $(".targetting-each-content").hide();
            $("#" + tabType).show();
            if (tabType == "zip") {
                $(".targetting-container .searchInput").hide();
            } else {
                $(".targetting-container .searchInput").show();
            }

            //reseting search value
            geoTargeting.resetSearchValue();

            // if clicked main tab is geo
            if (tabType === 'geo') {
                $scope.selectedMainTab = 'geo';
                $scope.selectedSubTab = 'countries';
                geoTargeting[$scope.selectedSubTab].init();
            }

            if (tabType === 'dmas') {
                $scope.selectedMainTab = $scope.selectedSubTab = 'dmas';
                geoTargeting.showHideExcAndIncSwitch();
                geoTargeting.setIncludeExcludeGeo();
                geoTargeting['dmas'].init();
            }
        };


        //sorting geo data
        $scope.sortGeoData = function (event) {
            var type = $scope.selectedSubTab,
                target = $(event.target),
                parentElem = $(event.target).parent(),
                sortIconElem = parentElem.find(".common-sort-icon"),
                sortOrder;

            if (sortIconElem.hasClass('ascending')) {
                sortIconElem.removeClass('ascending')
                    .addClass('descending');
                sortOrder = 'desc';
            } else {
                sortIconElem.removeClass('descending')
                    .addClass('ascending');
                sortOrder = 'asc';
            }

            geoTargeting.resetGeoData();
            geoTargeting.updateParams({'sortOrder': sortOrder, 'pageNo': 1}, type);
            geoTargeting[type].list();
        };

        var updateSelectedGeoList = function (isChecked) {
            var selectedGeoType = $scope.geoData[$scope.selectedSubTab].selected;
            if (selectedGeoType.length > 0) {
                _.each(selectedGeoType, function (data) {
                    data['included'] = isChecked;
                })

            }

            //if selected tab is country and we change the include/exclude toggle
            if ($scope.selectedSubTab == 'countries') {
                _.each($scope.selectedCountries, function (country) {
                    country.regions = null;
                })
                $scope.geoData.regions.selected = [];
                $scope.geoData.regions.data = [];
                $scope.selectedRegions = [];

                $scope.geoData.cities.selected = [];
                $scope.geoData.cities.data = [];
                $scope.selectedCities = [];

            }

            //if selected tab is regions and country is not selected and we change the include/exclude toggle
            if ($scope.selectedCountries.length === 0 && $scope.selectedSubTab == 'regions') {
                _.each($scope.selectedRegions, function (country) {
                    country.cities = null;
                })
                $scope.geoData.cities.selected = [];
                $scope.geoData.cities.data = [];
                $scope.selectedCities = [];
            }

            tmpSelectedGeoItemArr = selectedGeoType;

            geoTargeting.modifySelectedGeoData(selectedGeoType);

            $timeout(function() {
                $scope.$apply();
            }, 100)
        }


        $scope.removeItem = function (item, type, id) {

            $('.toggle-event').bootstrapToggle();

            var selectedItem = $scope.geoData[type].selected,
                j,
                k,
                l;

            if (type !== 'zip') {
                $timeout(function() {
                    $("#"+id).trigger('click');
                }, 100)
            }

            if (type === 'zip') {
                var zipObj = $scope.geoData.zip.selected;
                _.each(zipObj, function (obj) {
                    if (obj.added) {
                        _.each(obj.added, function (zip, idx) {
                            if (zip === item) {
                                obj.added.splice(idx, 1);
                            }
                        })
                    }
                })
            }

        };

        $scope.addZipCode = function (obj) {
            var values = $scope.adData.zipCodes,
                zipCodeList = $scope.geoData.zip.selected,
                addedZipCodes = zipWrapper.getAllAddedZipCode(zipCodeList),
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


            _.each(zipCodesObj.removed, function (removeval) {
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
            $scope.adData.zipCodes = '';
            if (obj && obj.zipEditInit) {
                //dont show any error and info messages.
            } else {
                if ($scope.zipCodesObj.info && $scope.zipCodesObj.info.length > 0) {
                    $rootScope.setErrAlertMessage(zipCodesObj.info[0], 0, 0, 'info');
                }

                if ($scope.zipCodesObj.error && $scope.zipCodesObj.error.length > 0) {
                    $rootScope.setErrAlertMessage(zipCodesObj.error[0]);

                }
            }
            if ($scope.zipCodesObj.added && $scope.zipCodesObj.added.length > 0) {
                $scope.geoData.zip.selected.push(zipCodesObj);
            }
        };


        $scope.hideConfirmBox = function () {
            $scope.showConfirmBox = false;
        };

        $scope.removeSelectedList = function (type) {
            $scope.geoData[type].selected.length = 0;
            $scope.selectedSubTab = 'countries';
            $scope.geoData.countries.included = true;
            $scope.geoData[type].data.length = 0;
            if (type === 'countries') {
                $scope.geoData.regions.selected.length = 0;
                if($scope.geoData.cities.selected) {
                    $scope.geoData.cities.selected.length = 0;
                }

                $scope.selectedCountries.length = 0;

                if($scope.geoData.regions.data) {
                    $scope.geoData.regions.data.length = 0;
                }

                $scope.selectedRegions.length = 0;

                if($scope.geoData.cities.data) {
                    $scope.geoData.cities.data.length = 0;
                }
                $scope.selectedCities.length = 0;
            }
            $('.toggle-event').bootstrapToggle('on');

            var navTabsTargetElem = $(".targettingFormWrap").find(".nav-tabs");
            $timeout(function () {
                $(navTabsTargetElem[0]).find("li a").triggerHandler('click');
            }, 50);

            $timeout(function() {
                $(".targetting-tab-header").find("#countryTab").trigger('click');
            }, 100)

            $scope.hideConfirmBox();
        };

        $scope.showRemoveConfirmBox = function (event, type) {
            var target = $(event.target),
                position = target.offset(),
                elem = $('#confirmBox').find('.msgPopup'),
                parentPos = $('.targettingFormWrap').offset(),
                left_pos = position.left - parentPos.left - target.width() - 46,
                top_pos = position.top - parentPos.top - target.height() - 6;

            $scope.boxType = type;
            $scope.showConfirmBox = true;
            elem.css({
                position: 'absolute',
                top: top_pos,
                left: left_pos,
                width: '242px'
            });
        };

        /*
         END : remove selected countries/regions/cities/dmas/zip
         */

        $scope.resetGeoTargeting = function ($event) {
            if ($event && $scope.mode === 'edit') {
                // do nothing just wait and watch
            } else {
                //Geo Data Variables
                $scope.geoData = {};
                $scope.geoData.countries = {};
                $scope.geoData.regions = {};
                $scope.geoData.cities = {};

                //Dma Data Variables
                $scope.geoData.dmas = {};

                //Zip Data Variables
                $scope.geoData.zip = {};

                //Selected Geo Data
                $scope.geoData.countries.selected = [];
                $scope.geoData.regions.selected = [];
                $scope.geoData.cities.selected = [];

                //selected DMA Data
                $scope.geoData.dmas.selected = [];

                //selected Zip Code
                $scope.geoData.zip.selected = [];

                //include switch button flag
                $scope.geoData.countries.included = true;

                //Tab Related Variables.
                $scope.selectedMainTab = 'geo';
                $scope.selectedSubTab = 'countries';

                $scope.selectedCountries = [];
                $scope.selectedRegions = [];
                $scope.selectedCities = [];

                $scope.geoSelectedItems = {}
                tmpSelectedGeoItemArr = [];

                geoTargeting.showHideExcAndIncSwitch();
            }
        };

        //broadcast from targeting_controller.js,  when user click on geo targeting card.
        $scope.$on('trigger.Geo', function () {
            geoTargeting.updateParams({'platformId': $scope.adData.platformId});
            var moduleDeleted = workflowService.getDeleteModule();
            console.log("moduleDeleted", moduleDeleted);
            if (_.indexOf(moduleDeleted, 'Geography') !== -1) {
                if ($scope.storedResponse) {
                    $scope.storedResponse.targets.geoTargets = null;
                }
                workflowService.resetDeleteModule();
                workflowService.setSavedGeo(null);
            }


            //get save data form service
            var presavedGeo = workflowService.getSavedGeo() && workflowService.getSavedGeo().original;

            if (presavedGeo) {

            } else { //get geo Data form ads Data
                $scope.storedResponse = angular.copy(workflowService.getAdsDetails());
                var geoTargets = $scope.storedResponse && $scope.storedResponse.targets.geoTargets;
                if (geoTargets && geoTargets.DMA) {
                    $scope.geoData.dmas.switch = true;
                    if (geoTargets.DMA.isIncluded) {
                        $scope.dmasIncluded = true;
                    } else {
                        $scope.dmasIncluded = false;
                    }
                }
            }

            //show Countries
            $('.toggle-event').bootstrapToggle();

            //binding chnage event on switch
            $('.toggle-event').change(function () {
                var isChecked = $(this).prop('checked');
                $scope.geoData[$scope.selectedSubTab].included = isChecked;
                geoTargeting.setIncludeExcludeGeo();
                updateSelectedGeoList(isChecked);
                if (isChecked) {
                    $(".include-label").find(".toggle-switch-text").text("Include");
                } else {
                    $(".include-label").find(".toggle-switch-text").text("Exclude");
                }
            });

            if ($scope.selectedMainTab !== 'geo') {
                var navTabsTargetElem = $(".targettingFormWrap").find(".nav-tabs");
                $timeout(function () {
                    $(navTabsTargetElem[0]).find("li a").triggerHandler('click');
                }, 50);
            }

            geoTargeting.countries.init();
            //show geoTargeting Container
            geoTargeting.show();
        });


        //on load reset geo targeting variables.
        $scope.resetGeoTargeting();

        //reset geo targeting variables.
        $scope.$on('reset.Geo', function () {
            $scope.resetGeoTargeting();
        });
    });
})
;
