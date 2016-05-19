define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service', 'common/services/zip_code', 'lrInfiniteScroll', 'common/directives/checklist_model'], function (angularAMD) {
    angularAMD.controller('GeoTargettingController', function ($scope, $rootScope, $timeout, constants, workflowService, zipCode) {

        var DATA_MAX_SIZE = 200,
            defaultParams = {
                'platformId': '',
                'sortOrder': 'asc',
                'sortBy' : 'name',
                'pageSize': DATA_MAX_SIZE,
                'pageNo': 1,
                'query': '',
                'countryCodes' : '',
                'regionIds' : ''
            };

        $scope.textconstants = constants;
        //Geo Data Variables
        $scope.geoData = {};
        $scope.geoData.countries = {};
        $scope.geoData.regions = {};
        $scope.geoData.cities = {};
        $scope.geoData.dmas = {};

        //Selected Geo Data
        $scope.geoData.countries.selected = [];
        $scope.geoData.regions.selected = [];
        $scope.geoData.cities.selected = [];
        $scope.geoData.dmas.selected = [];

        //include switch button flag
        $scope.geoData.countries.included = true;

        //Tab Related Variables.
        $scope.selectedMainTab = 'geo';
        $scope.selectedSubTab = 'countries';

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
                        callback && callback(result.data.data);
                    }, function (error) {
                        console.log('error');
                    }, flag);
                } else {
                    workflowService
                        .getDMAs(platformId, query)
                        .then(function (result) {
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

        //show country/region and city container
        $scope.showRespectiveTabContent = function (event , tabType) {
            $(".geo-tab-content").hide();
            $("#" + tabType + "-geo-tab-content" ).show();
            var elem = $(event.target) ;
            elem.closest(".btn-group").find(".active").removeClass("active");
            elem.addClass("active") ;

            //reseting search value
            geoTargeting.resetSearchValue();

            $scope.selectedSubTab = tabType;
            geoTargeting[tabType].init();

            // In relative to btn-group div, the tooltip offset is calculated
            var tooltip_left = elem.offset().left - elem.closest(".btn-group").offset().left ;
            var tooltip_width = elem.closest(".btn-group").find(".common_tooltip").width() ;
            var elem_width = elem.width() ;
            $(".common_tooltip").show().css("left",tooltip_left - tooltip_width/2 + elem_width/2 ) ;
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
                geoTargeting[$scope.selectedSubTab].init();
            }

            if(tabType ==='dmas') {
                $scope.selectedMainTab = $scope.selectedSubTab = 'dmas';
                geoTargeting['dmas'].init();
            }


        };

        $scope.showHideToggleSwitch = function() {
            return $scope.geoData[$scope.selectedSubTab].included;
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
            $('.toggle-event').bootstrapToggle();

            //binding chnage event on switch
            $('.toggle-event').change(function() {
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
