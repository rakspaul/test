define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service', 'common/services/zip_code', 'lrInfiniteScroll', 'common/directives/checklist_model'], function (angularAMD) {
    angularAMD.controller('GeoTargettingController', function ($scope, $rootScope, $timeout, $filter, constants, workflowService, zipCode) {

        var DATA_MAX_SIZE = 200,
            defaultParams = {
                'platformId': '',
                'sortOrder': 'asc',
                'sortBy' : 'name',
                'pageSize': DATA_MAX_SIZE,
                'pageNo': 1,
                'query': '',
                'countryCodes' : '',
                'regionIds' : '',
                'excludeCountries' : '',
                'excludeRegions' : ''
            };

        $scope.textconstants = constants;
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
        showHideSwitch();

        $( window ).resize(function() {
            $scope.divHeightCalculation() ;
        });

        var geoTargeting = {

            //get ads data
            getAdsDetails: function () {
                return workflowService.getAdsDetails()
            },

            //reset all geoData
            resetGeoData : function() {
                $scope.geoData.countries.data = [];
                $scope.geoData.regions.data = [];
                $scope.geoData.cities.data = [];
            },

            //reset selected geoData
            resetSelectedGeoData : function() {
                $scope.geoData.countries.selected = [];
                $scope.geoData.regions.selected = [];
                $scope.geoData.cities.selected = [];
            },

            resetSearchValue  : function() {
                $('.searchBox').val('');
            },

            //update query params
            updateParams: function (params, type) {
                if(type) {
                    _.extend($scope.geoData[type].queryParams, params);
                } else {
                    _.extend(defaultParams, params);
                }
            },

            //get search box value
            getSearchGeo :  function(type) {
                var searchVal = $('.searchBox').val();
                if(searchVal && searchVal.length >0) {
                    //reset geoData array
                    this.resetGeoData();
                    $scope.geoData[type].queryParams = _.extend({}, defaultParams);
                    this.updateParams({'query' : searchVal}, type);
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
        };

        //For GEO - Countries related methods
        var countriesWrapper = {
            fetch: function (requestType, callback) {
                var params = $scope.geoData.countries.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                if(requestType === 'cancellable') {
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
                    if(response.length >0 ) {
                        if (!$scope.geoData.countries.data || $scope.geoData.countries.data.length === 0) {
                            $scope.geoData.countries.data = response;
                        } else {
                            $scope.geoData.countries.data = $scope.geoData.countries.data.concat(response);
                        }
                    } else {
                        if($scope.geoData.countries.data.length > 0) {
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
        };

        //For GEO - Regions related methods
        var regionsWrapper = {
            fetch: function (requestType, callback) {
                var params = $scope.geoData.regions.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                if(requestType === 'cancellable') {
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
                if(selectedCountries.length >0){
                    countryCodes = _.pluck(selectedCountries, 'code').join(',');
                    geoTargeting.updateParams({'countryCodes' : countryCodes}, 'regions')

                    /**
                     * if country is exculded need to pass excludeCountries = true in regions call
                     */

                    if($scope.geoData.countries.included === false) {
                        geoTargeting.updateParams({'excludeCountries' : true}, 'regions')
                    }
                }



                this.fetch(requestType, function (response) {
                    $scope.geoData.regions.load_more_data = false;
                    $scope.geoData.regions.fetching = false;
                    if(response.length >0 ) {
                        if (!$scope.geoData.regions.data || $scope.geoData.regions.data.length === 0) {
                            $scope.geoData.regions.data = response;
                        } else {
                            $scope.geoData.regions.data = $scope.geoData.regions.data.concat(response);
                        }
                    } else {
                        if($scope.geoData.regions.data.length > 0) {
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
                $scope.geoData.regions.queryParams = _.extend({},defaultParams);
                this.list();
            }
        };

        //For GEO - Cities related methods
        var citiesWrapper = {
            fetch: function (requestType, callback) {
                var params = $scope.geoData.cities.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                if(requestType === 'cancellable') {
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
                if(selectedRegions.length >0){
                    regionIds = _.pluck(selectedRegions, 'id').join(',');
                    geoTargeting.updateParams({'regionIds' : regionIds}, 'cities');

                    /**
                     * if country is exculded need to pass excludeCountries = true in regions call
                     */

                    if($scope.geoData.countries.included === false) {
                        selectedCountries = $scope.geoData.countries.selected;
                        if(selectedCountries.length >0){
                            countryCodes = _.pluck(selectedCountries, 'code').join(',');
                            geoTargeting.updateParams({'countryCodes' : countryCodes}, 'cities')

                            /**
                             * if country is exculded need to pass excludeCountries = true in regions call
                             */

                            if($scope.geoData.countries.included === false) {
                                geoTargeting.updateParams({'excludeCountries' : true}, 'cities')
                            }
                        }
                    }

                    /**
                     * if region is exculded need to pass excludeRegions = true in regions call
                     */

                    if($scope.geoData.regions.included === false) {
                        geoTargeting.updateParams({'excludeRegions' : true}, 'cities')
                    }

                } else {
                    /**
                     * if countries are selected and regions is not selected
                     * pick the country codes of selected countries
                     * fetch cities fot those countries
                     */

                    selectedCountries = $scope.geoData.countries.selected;
                    if(selectedCountries.length >0){
                        countryCodes = _.pluck(selectedCountries, 'code').join(',');
                        geoTargeting.updateParams({'countryCodes' : countryCodes}, 'cities')
                    }

                    /**
                     * if country is exculded need to pass excludeCountries = true in cities call
                     */

                    if($scope.geoData.countries.included === false) {
                        selectedCountries = $scope.geoData.countries.selected;
                        if(selectedCountries.length >0){
                            countryCodes = _.pluck(selectedCountries, 'code').join(',');
                            geoTargeting.updateParams({'countryCodes' : countryCodes}, 'cities')

                            /**
                             * if country is exculded need to pass excludeCountries = true in regions call
                             */

                            if($scope.geoData.countries.included === false) {
                                geoTargeting.updateParams({'excludeCountries' : true}, 'cities')
                            }
                        }
                    }
                }

                this.fetch(requestType, function (response) {

                    $scope.geoData.cities.load_more_data = false;
                    $scope.geoData.cities.fetching = false;
                    if(response.length >0 ) {
                        if (!$scope.geoData.cities.data || $scope.geoData.cities.data.length === 0) {
                            $scope.geoData.cities.data = response;
                        } else {
                            $scope.geoData.cities.data = $scope.geoData.cities.data.concat(response);
                        }
                    } else {
                        if($scope.geoData.cities.data.length > 0) {
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
        };


        //For DMAs - related methods
        var dmasWrapper = {
            fetch: function (requestType, callback) {
                var params = $scope.geoData.dmas.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                if(requestType === 'cancellable') {
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

                    if(response.length >0) {
                        if (!$scope.geoData.dmas.data || $scope.geoData.dmas.data.length === 0) {
                            $scope.geoData.dmas.data = response;
                        } else {
                            $scope.geoData.dmas.data = $scope.geoData.dmas.data.concat(response);
                        }
                    } else {
                        if($scope.geoData.dmas.data.length > 0) {
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
        };


        //For DMAs - related methods
        var zipWrapper = {
            resetZipCode : function() {

                if ($scope.zipCodesObj) {
                    $scope.zipCodesObj = [];
                }

                $scope.adData.zipCodes = '';
            }
        };

        //Geo
        geoTargeting.countries = countriesWrapper;
        geoTargeting.regions = regionsWrapper;
        geoTargeting.cities = citiesWrapper;

        //DMAs
        geoTargeting.dmas = dmasWrapper;

        var getSelectedZipCodes = function (zipList) {

            var zipCodes = [];

            _.each(zipList, function (obj) {
                _.each(obj.added, function (val) {
                    zipCodes.push(val);
                });
            });
            return zipCodes;
        };


        var geoTargetsDataForListing = function() {
            var geoData = _.extend({}, $scope.geoData),
                obj = {};

            /**
             * zip Code
             */
            var zipCodes = getSelectedZipCodes(geoData.zip.selected);
            if (zipCodes.length > 0) {
                geoData.zipCodes = [{'values': zipCodes}];
            }

            delete geoData.zip;
            obj.include = {};
            obj.exclude = {};

            _.each(geoData, function (data, idx) {
                if (data.selected) {
                    obj.include[idx] = [];
                    if (idx !== 'zipCodes') {
                        obj.exclude[idx] = [];
                    }
                    _.each(data.selected, function (d) {
                        if(d) {
                            if (d.included || d.values) {
                                obj.include[idx].push(d);
                            } else {
                                console.log("idx", idx)
                                obj.exclude[idx].push(d);
                            }
                        }
                    });
                }
            })

            if (angular.equals({}, obj.include)) {
                obj.include = null;
            }
            if (angular.equals({}, obj.exclude)) {
                obj.exclude = null;
            }

            return obj;
        };

        function modifyGeoTargetingDataForPreview() {
            var geoData = _.extend({}, $scope.geoData),
                obj = {};

            geoData.zip = getAllAddedZipCode(geoData.zip.selected);
            if (geoData.countries && geoData.countries.selected.length > 0) {
                geoData['COUNTRY'] = {};
                geoData['COUNTRY']['list'] = [];
                geoData['COUNTRY']['list'] = geoData.countries.selected;
                geoData['COUNTRY']['included'] = _.uniq(_.pluck(geoData.countries.selected, 'included'))[0];
                delete geoData.countries;
            }

            if (geoData.regions && geoData.regions.selected.length > 0) {
                geoData['REGION'] = {};
                geoData['REGION']['list'] = [];
                geoData['REGION']['list'] = geoData.regions.selected;
                geoData['REGION']['included'] = _.uniq(_.pluck(geoData.regions.selected, 'included'))[0];
                delete geoData.regions;
            }

            if (geoData.cities && geoData.cities.selected.length > 0) {
                geoData['CITY'] = {};
                geoData['CITY']['list'] = [];
                geoData['CITY']['list'] = geoData.cities.selected;
                geoData['CITY']['included'] = _.uniq(_.pluck(geoData.cities.selected, 'included'))[0];
                delete geoData.cities;
            }

            if (geoData.dmas && geoData.dmas.selected.length > 0) {
                geoData['DMA'] = {};
                geoData['DMA']['list'] = [];
                geoData['DMA']['list'] = geoData.dmas.selected;
                geoData['DMA']['included'] = _.uniq(_.pluck(geoData.dmas.selected, 'included'))[0];
                delete geoData.dmas;
            }

            if (geoData.zip && geoData.zip.length > 0) {
                geoData['ZIP_CODE'] = {};
                geoData['ZIP_CODE']['list'] = [];
                geoData['ZIP_CODE']['list'] = geoData.zip;
                geoData['ZIP_CODE']['included'] = geoData.zip.length > 0 ? true : false;
                delete geoData.zip;
            }
            return geoData;
        };

        var hideGeoTargetingBox =  function () {
            $('#geographyTargeting').delay(300).animate({
                left: '100%',
                marginLeft: '0',
                opacity: '0'
            }, function () {
                $(this).hide();
            });
        }

        var showGeoTargetingBox = function () {
            $('#geographyTargeting')
                .show()
                .delay(300)
                .animate({
                    left: '50%',
                    marginLeft: '-461px',
                    opacity: '1.0'
                }, 'slow');
        }

        //this is temp redirect to targetting screen
        $scope.showTargettingScreen = function (cancelClicked) {

            if($scope.zipCodesObj) {
                $scope.zipCodesObj.info = [];
                $scope.zipCodesObj.error = [];
            }

            if (cancelClicked && workflowService.getSavedGeo()) {
            }
            hideGeoTargetingBox();
        };

        $scope.saveGeography = function (cancelClicked) {

            var geoTargetsData = workflowService.getAdsDetails();
            zipWrapper.resetZipCode();
            $scope.geoData.previewData = geoTargetsDataForListing();

            if($scope.geoData.zip.selected.length === 0 && geoTargetsData && geoTargetsData.targets && geoTargetsData.targets.geoTargets && geoTargetsData.targets.geoTargets.ZIP_CODE) {
                geoTargetsData.targets.geoTargets.ZIP_CODE = null;
                workflowService.setAdsDetails(geoTargetsData);
            }

            var modifedGeoTargetObj = modifyGeoTargetingDataForPreview();

            workflowService.setSavedGeo({
                'modify': modifedGeoTargetObj,
                'original': $scope.geoData.previewData
            });

            if(!cancelClicked) {
                $scope.showTargettingScreen(cancelClicked);
            }

            $scope.$parent.showGeoTargetingForPreview();
        };

        $scope.getTargetingType = function() {
            var targetingType;
            if($scope.geoData.countries.selected.length >0) {
                targetingType = 'Countries';
            } else if($scope.geoData.regions.selected.length >0) {
                targetingType = 'Regions';
            } else if($scope.geoData.cities.selected.length >0) {
                targetingType = 'Cities';
            }
            return targetingType;
        }



        var parentChildWrapper = function(parentData, childData) {
            var parentId;
            var tmpArr = [];
            if (childData.length > 0) {
                _.each(childData, function (cdata, idx) {
                    parentId = cdata.parent.id;

                    if($scope.selectedSubTab === 'cities' && $scope.geoData.regions.selected.length === 0) {
                        parentId = cdata.country.id;
                    }

                    if (parentId === parentData.id) {
                        tmpArr.push(cdata);
                        parentData[$scope.selectedSubTab] = tmpArr;
                    }
                });
            } else {
                parentData[$scope.selectedSubTab] = [];
            }
        }

        var geoWrapper = function(type) {
            if(type === 'regions' && $scope.geoData.countries.selected.length >0) {
                parentData = $scope.geoData.countries.selected;
                childData =  $scope.geoData.regions.selected;
                _.each(parentData, function(countrydata) {
                    parentChildWrapper(countrydata, childData);
                });
            }

            if(type === 'cities') {
                if($scope.geoData.countries.selected.length >0) {
                    if( $scope.geoData.regions.selected.length >0) {
                        childData =  $scope.geoData.cities.selected;
                        parentData = $scope.geoData.countries.selected;
                        _.each(parentData, function(countrydata) {
                            _.each(countrydata.regions, function(region) {
                                newChildData = _.filter(childData , function(data) { return data.parent.id ===  region.id})
                                if(newChildData.length >0) {
                                    parentChildWrapper(region, newChildData);
                                }
                            })
                        })
                    } else {
                        parentData = $scope.geoData.countries.selected;
                        childData =  $scope.geoData.cities.selected;
                        _.each(parentData, function(countrydata) {
                            parentChildWrapper(countrydata, childData);
                        });
                    }
                } else {
                    if($scope.geoData.regions.selected.length  > 0) {
                        parentData = $scope.geoData.regions.selected;
                        childData =  $scope.geoData.cities.selected;
                        _.each(parentData, function(regionData) {
                            parentChildWrapper(regionData, childData);
                        });
                    }
                }
            }
        }


        $scope.getTargetingValues = function(type) {
            return $scope.geoData[type].selected;
        };

        $scope.selectedCountries = [];
        $scope.selectedRegions = [];
        $scope.selectedCities = [];

        $scope.check = function(item, checked, type) {
            var idx,
                previousSelectedData,
                pos;

            previousSelectedData = _.extend({}, $scope.geoData[type].selected);
            idx  = _.findIndex($scope.geoData[type].selected, function (obj) {
                return item.id === obj.id;
            });

            if (idx >= 0 && !checked) {
                $scope.geoData[type].selected.splice(idx, 1);
            }
            if (idx < 0 && checked) {
                item['included'] = $scope.geoData[type].included;
                $scope.geoData[type].selected.push(item);
            }


            if(type === 'countries') {
                if(_.difference(previousSelectedData, $scope.geoData.countries.selected).length >0) {
                    $scope.geoData.regions.selected = [];
                    $scope.geoData.cities.selected = [];
                }
            }

            if(type === 'regions') {
                if(_.difference(previousSelectedData, $scope.geoData.regions.selected).length >0) {
                    $scope.geoData.cities.selected = [];
                }
            }

            if(type === 'countries') {
                $scope.selectedCountries.push(item);
            }

            if(type === 'regions') { //current tab is regions
                if($scope.selectedCountries.length >0) { //countries is selected
                    if($scope.geoData.countries.included) { // countries are included
                        var pos = _.findIndex( $scope.selectedCountries, function(obj) {
                            return item.parent.id === obj.id;
                        })
                        if(pos >= 0) {
                            if(!$scope.selectedCountries[pos].regions) {
                                $scope.selectedCountries[pos].regions = [];
                            }
                            $scope.selectedCountries[pos].regions.push(item);
                        } else {
                            $scope.selectedRegions.push(item);
                        }
                    } else { //countries are excluded

                    }
                }
            }

            if(type === 'cities') {
                var index3 = _.findIndex( $scope.selectedRegions, function(obj) {
                    return item.parent.id === obj.id;
                })
                if(index3 >=0) {
                    if(!$scope.selectedRegions[index3].cities) {
                        $scope.selectedRegions[index3].cities = [];
                    }
                    $scope.selectedRegions[index3].cities.push(item);

                } else {
                    var index4 = _.findIndex( $scope.selectedCountries, function(obj) {
                        return item.country.id === obj.id;
                    })

                    if(index4 >=0) {
                        if(!$scope.selectedCountries[index4].cities) {
                            $scope.selectedCountries[index4].cities = [];
                        }
                        $scope.selectedCountries[index4].cities.push(item);
                    } else {
                        var newItem = _.extend({}, item);
                        $scope.selectedCountries.push(newItem.country);
                        delete newItem.country;
                        if(!$scope.selectedCountries[$scope.selectedCountries.length - 1].regions) {
                            $scope.selectedCountries[$scope.selectedCountries.length - 1].regions = [];
                        }
                        $scope.selectedCountries[$scope.selectedCountries.length - 1].regions.push(newItem.parent);
                        delete newItem.parent;

                        var index5 = _.findIndex( $scope.selectedCountries[$scope.selectedCountries.length - 1].regions, function(obj) {
                            return newItem.id === obj.id;
                        })
                        if(index5 < 0 && newItem) {
                            if(!$scope.selectedCountries[$scope.selectedCountries.length - 1].regions[0].cities) {
                                $scope.selectedCountries[$scope.selectedCountries.length - 1].regions[0].cities = [];
                            }
                            $scope.selectedCountries[$scope.selectedCountries.length - 1].regions[0].cities.push(newItem);
                        }
                    }

                }
            }
            console.log("$scope.selectedCountries", $scope.selectedCountries);
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
                $scope.geoData[type].load_more_data =  true
                geoTargeting[type].list();
            }
        };

        var showToolTip = function(elem) {
            // In relative to btn-group div, the tooltip offset is calculated
            var tooltip_left = elem.offset().left - elem.closest(".btn-group").offset().left ;
            var tooltip_width = elem.closest(".btn-group").find(".common_tooltip").width() ;
            var elem_width = elem.width() ;
            $(".common_tooltip").show().css("left",tooltip_left - tooltip_width/2 + elem_width/2 ) ;
        };

        //show country/region and city container
        $scope.showRespectiveTabContent = function (event , tabType) {
            /*
             show tooltip in two cases
             1. if you have selected region without selecting countries
             2- if you have selected city without selecting regions
             3- if you have selected country or region without selecting regions or cities
             */

            var elem = $(event.target) ;
            var selectedCountries = $scope.geoData.countries.selected.length;
            var selectedRegions = $scope.geoData.regions.selected.length;
            var selectedCities = $scope.geoData.cities.selected.length;


            if(tabType === 'countries'
                && selectedCountries === 0
                && selectedRegions > 0) {
                $scope.geoNote = $scope.textConstants.NOT_SELECTED_COUNTRY_NOTE;
                showToolTip(elem);
                return false;
            }

            if(tabType === 'regions'
                && selectedRegions === 0
                && selectedCities > 0) {
                $scope.geoNote = $scope.textConstants.NOT_SELECTED_REGION_NOTE;
                showToolTip(elem);
                return false;
            }

            if((tabType === 'countries' || tabType === 'regions')
                && selectedCities > 0
                && selectedCountries === 0
                && selectedRegions ===0) {
                $scope.geoNote = $scope.textConstants.NOT_SELECTED_COUNTRY_REGION_NOTE;
                showToolTip(elem);
                return false;
            }


            $(".geo-tab-content").hide();
            $("#" + tabType + "-geo-tab-content" ).show();

            elem.closest(".btn-group").find(".active").removeClass("active");
            elem.addClass("active") ;

            //reseting search value
            geoTargeting.resetSearchValue();

            $scope.selectedSubTab = tabType;
            showHideSwitch();
            setIncludeExcludeGeo();
            geoTargeting[tabType].init();
        };

        $scope.divHeightCalculation = function() {
            // var winHeight = $(window).height() ;
            // $(".targetting-tab-body").height() ;
        };
        $scope.divHeightCalculation() ;


        $scope.divHeightCalculation() ;

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
            if(tabType === 'geo') {
                $scope.selectedMainTab = 'geo';
                $scope.selectedSubTab = 'countries';
                geoTargeting[$scope.selectedSubTab].init();
            }

            if(tabType ==='dmas') {
                $scope.selectedMainTab = $scope.selectedSubTab = 'dmas';
                showHideSwitch();
                setIncludeExcludeGeo();
                geoTargeting['dmas'].init();
            }
        };


        //sorting geo data
        $scope.sortGeoData = function(event) {
            var type = $scope.selectedSubTab,
                target = $(event.target),
                parentElem  = $(event.target).parent(),
                sortIconElem = parentElem.find(".common-sort-icon"),
                sortOrder;

            if(sortIconElem.hasClass('ascending')) {
                sortIconElem.removeClass('ascending')
                    .addClass('descending');
                sortOrder = 'desc';
            } else {
                sortIconElem.removeClass('descending')
                    .addClass('ascending');
                sortOrder = 'asc';
            }

            geoTargeting.resetGeoData();
            geoTargeting.updateParams({'sortOrder' : sortOrder, 'pageNo': 1}, type);
            geoTargeting[type].list();
        };

        var updateSelectedGeoList = function(isChecked) {
            var selectedGeoType = $scope.geoData[$scope.selectedSubTab].selected;
            if(selectedGeoType.length >0) {
                _.each(selectedGeoType, function (data) {
                    data['included'] = isChecked;
                })

            }

            //if selected tab is country and we change the include/exclude toggle
            if($scope.selectedSubTab == 'countries') {
                _.each($scope.selectedCountries, function(country) {
                    country.regions = null;
                })
                $scope.geoData.regions.selected = [];
                $scope.geoData.regions.data = [];

            }

            //if selected tab is regions and country is not selected and we change the include/exclude toggle
            if($scope.selectedCountries.length === 0 && $scope.selectedSubTab == 'regions') {
                _.each($scope.selectedRegions, function(country) {
                    country.cities = null;
                })
                $scope.geoData.cities.selected = [];
                $scope.geoData.cities.data = [];

            }


            $scope.$apply();
        }

        var setIncludeExcludeGeo = function() {


            /*
             case 5 : Country --> Not selected, Region --> Include, City --> Excluded
             */

            if($scope.geoData.countries.selected.length === 0 && $scope.geoData.regions.selected.length  === 0) {
                $scope.geoData.regions.included =  true;
            }


            /*
             case 1 : Country --> Included, Region --> Excluded, City --> Excluded
             */

            if($scope.geoData.countries.selected.length > 0 && $scope.geoData.countries.included) {
                $scope.geoData.regions.included =  false;
                $scope.geoData.cities.included =  false;
            }

            /*
             case 2 : Country --> Excluded, Region --> Excluded, City --> Excluded
             */

            if($scope.geoData.countries.selected.length > 0  && !$scope.geoData.countries.included) {
                $scope.geoData.regions.included =  false;
                $scope.geoData.cities.included =  false;
            }

            /*
             case 3 : Country --> Included, Region --> Not selected, City --> Excluded
             */

            if($scope.geoData.countries.selected.length >0 && $scope.geoData.regions.selected.length  === 0 && $scope.geoData.countries.included) {
                $scope.geoData.cities.included =  false;
            }

            /*
             case 4 : Country --> Excluded, Region --> Not selected, City --> Excluded
             */

            if($scope.geoData.countries.selected.length >0 && $scope.geoData.regions.selected.length  === 0 && !$scope.geoData.countries.included) {
                $scope.geoData.cities.included =  false;
            }

            /*
             case 5 : Country --> Not selected, Region --> Include, City --> Excluded
             */

            if($scope.geoData.countries.selected.length === 0 && $scope.geoData.regions.selected.length  > 0 && $scope.geoData.regions.included) {
                $scope.geoData.cities.included =  false;
            }

            /*
             case 6 : Country --> Not selected, Region --> Excluded, City --> Excluded
             */

            if($scope.geoData.countries.selected.length === 0 && $scope.geoData.regions.selected.length  > 0 && !$scope.geoData.regions.included) {
                $scope.geoData.cities.included =  false;
            }

            /*
             case 5 : Country --> Not selected, Region --> Include, City --> Excluded
             */

            if($scope.geoData.dmas.selected.length === 0) {
                $scope.geoData.dmas.included =  true;
            }

        };

        function  showHideSwitch() {
            /*
                if selected tab is country, switch -  on for country
             */

            if($scope.selectedSubTab === 'countries') {
                $scope.geoData.countries.switch = true;
            }

            /*
                if selected tab is region and country is selected, switch -  off for country
             */

            if($scope.selectedSubTab === 'regions' && $scope.geoData.countries.selected.length >0) {
                $scope.geoData.regions.switch = false;
            }

            /*
             if selected tab is region and country is not selected, switch -  on for region
             */

            if($scope.selectedSubTab === 'regions' && $scope.geoData.countries.selected.length  === 0) {
                $scope.geoData.regions.switch = true;
            } else {
                $scope.geoData.regions.switch = false;
            }


            /*
             if selected tab is region and country is not selected, switch -  on for region
             */

            if($scope.selectedSubTab === 'regions' && $scope.geoData.countries.selected.length  === 0) {
                $scope.geoData.regions.switch = true;
            } else {
                $scope.geoData.regions.switch = false;
            }

            /*
             if selected tab is city and country and region is not selected, switch -  on for city
             */

            if($scope.selectedSubTab === 'cities' && $scope.geoData.countries.selected.length  === 0 && $scope.geoData.regions.selected.length  === 0) {
                $scope.geoData.cities.switch = true;
            } else {
                $scope.geoData.cities.switch = false;
            }

            /*
             if selected tab is country, switch -  on for country
             */

            if($scope.selectedSubTab === 'dmas') {
                $scope.geoData.dmas.switch = true;
            }

        }

        /*
            START : remove selected countries/regions/cities/dmas/zip
         */

        function removeSelectedItem(selectedItem , item) {
            for (var i = 0; i < selectedItem.length; i++) {
                if (selectedItem[i].id === item.id) {
                    selectedItem.splice(i, 1);
                }
            }
        }

        $scope.removeItem = function (item, type) {
            var selectedItem = $scope.geoData[type].selected,
                j,
                k,
                l;

            if (type !== 'zip') {
                removeSelectedItem(selectedItem, item);
            }

            if (type === 'zip') {
                var zipObj = $scope.geoData.zip.selected;
                _.each(zipObj, function(obj) {
                    if(obj.added) {
                        _.each(obj.added, function(zip, idx) {
                            if(zip === item) {
                                obj.added.splice(idx, 1);
                            }
                        })
                    }
                })
            }
        };

        var getAllAddedZipCode = function (zipCodeList) {
            var addedZipCodes = [];

            _.each(zipCodeList, function (zipCodeObj) {
                _.each(zipCodeObj.added, function (val) {
                    addedZipCodes.push(val);
                });
            });
            return addedZipCodes;
        };


        $scope.addZipCode = function (obj) {
            var values = $scope.adData.zipCodes,
                zipCodeList = $scope.geoData.zip.selected,
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
            if(obj && obj.zipEditInit) {
                //dont show any error and info messages.
            } else {
                if ($scope.zipCodesObj.info && $scope.zipCodesObj.info.length > 0) {
                    $rootScope.setErrAlertMessage(zipCodesObj.info[0], 0, 0, 'info');
                }

                if ($scope.zipCodesObj.error && $scope.zipCodesObj.error.length > 0) {
                    $rootScope.setErrAlertMessage(zipCodesObj.error[0]);

                }
            }
            if($scope.zipCodesObj.added && $scope.zipCodesObj.added.length > 0) {
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

            if(type === 'countries') {
                $scope.geoData.regions.selected.length = 0;
                $scope.geoData.cities.selected.length = 0;
            }

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
                top_pos = position.top - parentPos.top - target.height() + 4;

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


        //broadcast from targeting_controller.js,  when user click on geo targeting card.
        $scope.$on('trigger.Geo', function () {
            geoTargeting.updateParams({'platformId': $scope.adData.platformId});

            //show Countries
            $('.toggle-event').bootstrapToggle();

            //binding chnage event on switch
            $('.toggle-event').change(function() {
                var isChecked = $(this).prop('checked');
                $scope.geoData[$scope.selectedSubTab].included = isChecked;
                setIncludeExcludeGeo();
                updateSelectedGeoList(isChecked);


            });

            geoTargeting.countries.init();

            //show geoTargeting Container
            geoTargeting.show();
        });

        //reset geo targeting variables.
        $scope.$on('reset.Geo.Variables', function() {

        });
    });
})
;
