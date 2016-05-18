define(['angularAMD', 'workflow/services/workflow_service', 'common/services/zip_code', 'lrInfiniteScroll', 'common/directives/checklist_model'], function (angularAMD) {
    angularAMD.controller('GeoTargettingController', function ($scope, $rootScope, $timeout, workflowService, zipCode) {

        var DATA_MAX_SIZE = 200,
            defaultParams = {
                'platformId': '',
                'sortOrder': 'asc',
                'pageSize': DATA_MAX_SIZE,
                'pageNo': 1,
                'query': '',
                'countryCodes' : '',
                'regionIds' : ''
            };

        //Geo Data Variables
        $scope.geoData = {};
        $scope.geoData.countries = {};
        $scope.geoData.regions = {};
        $scope.geoData.cities = {};

        //Selected Geo Data
        $scope.geoData.countries.selected = [];
        $scope.geoData.regions.selected = [];
        $scope.geoData.cities.selected = [];

        //include switch button flag
        $scope.geoData.countries.included = true;

        //Tab Related Variables.
        $scope.selectedMainTab = 'geo';
        $scope.selectedSubTab = 'countries'

        var geoTargeting = {

            //get ads data
            getAdsDetails: function () {
                return workflowService.getAdsDetails()
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
            appendSearchValue :  function(type) {
                var searchVal = $('.searchBox').val();
                if(searchVal && searchVal.length >0) {
                    this.updateParams({'query' : searchVal}, type);
                }
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
            fetch: function (callback) {
                var params = $scope.geoData.countries.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                workflowService
                    .getCountries(platformId, query)
                    .then(function (result) {
                        callback && callback(result.data.data);
                    }, function (error) {
                        console.log('error');
                    });
            },

            list: function () {
                $scope.geoData.countries.fetching = true;
                this.fetch(function (response) {
                    if (!$scope.geoData.countries.data) {
                        $scope.geoData.countries.data = response;
                    } else {
                        $scope.geoData.countries.data.concat(response);
                    }
                    $scope.geoData.countries.fetching = false;
                });
            },
            init: function () {
                $scope.geoData.countries.queryParams = _.extend(defaultParams, {});
                this.list();
            }
        };

        //For GEO - Regions related methods
        var regionsWrapper = {
            fetch: function (callback) {
                var params = $scope.geoData.regions.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                workflowService
                    .getRegions(platformId, query)
                    .then(function (result) {
                        callback && callback(result.data.data);
                    }, function (error) {
                        console.log('error');
                    });
            },

            list: function () {
                $scope.geoData.regions.fetching = true;
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
                }

                this.fetch(function (response) {
                    if (!$scope.geoData.regions.data) {
                        $scope.geoData.regions.data = response;
                    } else {
                        $scope.geoData.regions.data.concat(response);
                    }
                    $scope.geoData.regions.fetching = false;
                });
            },
            init: function () {
                $scope.geoData.regions.queryParams = _.extend(defaultParams, {});
                this.list();
            }

        };

        //For GEO - Cities related methods
        var citiesWrapper = {
            fetch: function (callback) {
                var params = $scope.geoData.cities.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                workflowService
                    .getCities(platformId, query)
                    .then(function (result) {
                        callback && callback(result.data.data);
                    }, function (error) {
                        console.log('error');
                    });
            },

            list: function () {
                $scope.geoData.cities.fetching = true;
                var selectedRegions,
                    regionIds;
                /**
                 * if regions are selected
                 * pick the ids of selected regions
                 * fetch cities fot those regions
                 */

                selectedRegions = $scope.geoData.regions.selected;
                if(selectedRegions.length >0){
                    regionIds = _.pluck(selectedRegions, 'id').join(',');
                    geoTargeting.updateParams({'regionIds' : regionIds}, 'cities')
                }

                this.fetch(function (response) {
                    if (!$scope.geoData.cities.data) {
                        $scope.geoData.cities.data = response;
                    } else {
                        $scope.geoData.cities.data.concat(response);
                    }
                    $scope.geoData.cities.fetching = false;
                });
            },
            init: function () {
                $scope.geoData.cities.queryParams = _.extend(defaultParams, {});
                this.list();
            }
        };


        //For DMAs - related methods
        var dmasWrapper = {
            fetch: function (callback) {
                var params = $scope.geoData.dmas.queryParams;
                var query = geoTargeting.buildQueryString(params),
                    platformId = params.platformId;

                workflowService
                    .getCountries(platformId, query)
                    .then(function (result) {
                        callback && callback(result.data.data);
                    }, function (error) {
                        console.log('error');
                    });
            },

            list: function () {
                $scope.geoData.dmas.fetching = true;
                this.fetch(function (response) {
                    if (!$scope.geoData.dmas.data) {
                        $scope.geoData.dmas.data = response;
                    } else {
                        $scope.geoData.dmas.data.concat(response);
                    }
                    $scope.geoData.dmas.fetching = false;
                });
            },
            init: function () {
                $scope.geoData.dmas.queryParams = _.extend(defaultParams, {});
                this.list();
            }
        };


        //Geo
        geoTargeting.countries = countriesWrapper;
        geoTargeting.regions = regionsWrapper;
        geoTargeting.cities = citiesWrapper;

        //DMAs
        geoTargeting.dmas = dmasWrapper;

        var insertChildNodeToParentNode =  function(parentGeo) {
            var parentData = $scope.geoData[parentGeo].selected;
            var childData =  $scope.geoData[$scope.selectedSubTab].selected;
            _.each(parentData, function (pdata) {
                var tmpArr = [];
                if (childData.length > 0) {
                    _.each(childData, function (cdata, idx) {
                        if (cdata.parent.id === pdata.id) {
                            tmpArr.push(cdata);
                            pdata[$scope.selectedSubTab] = tmpArr;
                        }
                    });
                } else {
                    pdata[$scope.selectedSubTab] = [];
                }
            });
        }

        $scope.check = function(value, checked, type) {
            var idx = $scope.geoData[type].selected.indexOf(value);
            if (idx >= 0 && !checked) {
                $scope.geoData[type].selected.splice(idx, 1);
            }
            if (idx < 0 && checked) {
                value['included'] = $scope.geoData[$scope.selectedSubTab].included;
                $scope.geoData[type].selected.push(value);
            }

            if(type == 'regions') {
                insertChildNodeToParentNode('countries')
            }
        };

        //On scroll dynamically loading more countries/regions/cities.
        $scope.loadMoreGeoData = function (type) {
            var geoData = $scope.geoData[type].data;
            if (geoData) {
                $scope.geoData[type].queryParams.pageNo += 1;
                geoTargeting.countries.list();
            }
        };
       
        //show country/region and city container
        $scope.showRespectiveTabContent = function (event , tabType) {
            $(".geo-tab-content").hide();
            $("#" + tabType + "-geo-tab-content" ).show();
            var elem = $(event.target) ;
            elem.closest(".btn-group").find(".active").removeClass("active");
            elem.addClass("active") ;
            $scope.selectedSubTab = tabType;
            geoTargeting[tabType].init();
        };

        // show geo, dmas, zip container
        $scope.showGeographyTabsBox = function (event, tabType, showPopup) {
            $('#toggle-event').bootstrapToggle();
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

            // if clicked main tab is geo
            if(tabType === 'geo') {
                $scope.selectedMainTab = 'geo';
                geoTargeting['countires'].init();
            }
        };

        $scope.showHideToggleSwitch = function() {
            return $scope.geoData[$scope.selectedSubTab].included;
        }

        var includeOrExcludeSelectedGeoList = function() {
            var selectedGeoType = $scope.geoData[$scope.selectedSubTab].selected;
            if(selectedGeoType.length >0) {
                _.each(selectedGeoType, function (data) {
                    data['included'] = isChecked;
                })
                $scope.geoData[$scope.selectedSubTab].included = isChecked;
            }
            $scope.$apply();
        }

        //broadcast from targeting_controller.js,  when user click on geo targeting card.
        $scope.$on('trigger.Geo', function () {
            geoTargeting.updateParams({'platformId': $scope.adData.platformId});

            //show Countries
            $('#toggle-event').bootstrapToggle();

            //binding chnage event on switch
            $('#toggle-event').change(function() {
                var isChecked = $(this).prop('checked');
                
                if($scope.selectedMainTab === 'geo') {
                    includeOrExcludeSelectedGeoList();
                }
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
