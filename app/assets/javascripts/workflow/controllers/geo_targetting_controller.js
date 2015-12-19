var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('GeoTargettingController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location, zipCode) {
        $scope.showTargettingForm = false;
        $scope.geoTargetArr = [{'name' : 'Geography', 'enable' : true}, {'name' : 'Behavior', 'enable' : false}, {'name' : 'Demographics', 'enable' : false}, {'name' : 'Interests', 'enable' : false}, {'name' : 'Technology', 'enable' : false}, {'name' : 'Content', 'enable' : false}, {'name' : 'Other', 'enable' : false}]
        $scope.geoTargetingData = {};
        var citiesListArray= [];
        var regionsListArray= [];
        var dmasListArray = [];
        var regionListSortOrder = 'asc';
        var cityListSortOrder = 'asc';
        var dmaListSortOrder = 'asc'
        var regionInitialLoad = false;
        var cityInitialLoad = false;
        var dmasInitialLoad = false;
        $scope.storedResponse = {};
        $scope.isRegionSelected = true;
        $scope.citiesIncluded = true;
        $scope.dmasIncluded = true;
        $scope.selectedTab = 'regions';

        $scope.regionEdit = function(flatArr){
            $scope.storedResponse = angular.copy(workflowService.getAdsDetails());
            if($scope.storedResponse.targets.geoTargets && _.size($scope.storedResponse.targets.geoTargets) > 0 && $scope.storedResponse.targets.geoTargets.REGION) {
                var regionsEditable = angular.copy($scope.storedResponse.targets.geoTargets.REGION.geoTargetList);
                $scope.regionsIncluded = $scope.storedResponse.targets.geoTargets.REGION.isIncluded;

                _.each(regionsEditable, function (item) {
                    var index = _.findIndex(flatArr, function(region) {
                        return item.id ==  region.id});

                    if(index != -1)
                        $scope.sync(true, flatArr[index], 'regions')
                })
                // toggle switch based on region settings
                if($scope.storedResponse.targets.geoTargets.REGION.isIncluded)
                    $scope.includeSelectedItems();
                else
                    $scope.excludeSelectedItems();

                $scope.adData.geoTargetingData = $scope.geoTargetingData.selected;
                $scope.listCities();

            }
            regionInitialLoad = true;
        }

        $scope.cityEdit = function(flatArr) {
            //storedResponse = angular.copy(workflowService.getAdsDetails());
            //edit mode
            if ($scope.storedResponse.targets.geoTargets && _.size($scope.storedResponse.targets.geoTargets) > 0 && $scope.storedResponse.targets.geoTargets.CITY) {
                var citiesEditable = angular.copy($scope.storedResponse.targets.geoTargets.CITY.geoTargetList);
                $scope.citiesIncluded = $scope.storedResponse.targets.geoTargets.CITY.isIncluded;

                _.each(citiesEditable, function (item) {
                    var index = _.findIndex(flatArr, function (region) {
                        return item.id == region.id
                    });

                    if (index != -1)
                        $scope.sync(true, flatArr[index], 'cities')
                })

                //// toggle switch based on region settings
                if (!$scope.storedResponse.targets.geoTargets.CITY.isIncluded)
                    $scope.includeSelectedItems();
                else
                    $scope.excludeSelectedItems();
            }

            $scope.selectedTab = 'regions';
            $scope.showSwitch = true;
            cityInitialLoad = true;


        }

        $scope.dmasEdit = function(flatArr){
            //storedResponse = angular.copy(workflowService.getAdsDetails());
            //edit mode
            if($scope.storedResponse.targets.geoTargets && _.size($scope.storedResponse.targets.geoTargets) > 0 && $scope.storedResponse.targets.geoTargets.DMA) {
                var dmasEditable = angular.copy($scope.storedResponse.targets.geoTargets.DMA.geoTargetList);
                $scope.dmasIncluded = $scope.storedResponse.targets.geoTargets.DMA.isIncluded;

                _.each(dmasEditable, function (item) {
                    var index = _.findIndex(flatArr, function(region) {
                        return item.id ==  region.id});
                    if(index != -1)
                        $scope.sync(true, flatArr[index], 'dmas')
                })

            }
            dmasInitialLoad = true;
            createPreviewData();

        }

        $scope.$on('updateGeoTagName',function(){
            $scope.setTargeting('Geography');
            $scope.storedResponse = angular.copy(workflowService.getAdsDetails());
            $scope.showRegionsTab = true;
            $scope.selectedTab = 'regions';
            $scope.listRegions();
        });

        $scope.updateGeoTargets =  function() {
          $("#geographyTargeting").show().delay( 300 ).animate({left: "50%" , marginLeft: "-461px", opacity: "1.0"}, 'slow');
        };

        // geo Targeting Trigger
        $scope.selectGeoTarget = function() {
            $("#geographyTargeting").show().delay( 300 ).animate({left: "50%" , marginLeft: "-461px", opacity: "1.0"}, 'slow');
            if(!$scope.adData.geoTargetingData){
                $scope.resetGeoTargetingVariables();
            }
            $scope.setTargeting('Geography');

            if($scope.selectedTab === 'regions')
                $scope.listRegions();
            if($scope.selectedTab === 'cities')
                $scope.listCities();
            if($scope.selectedTab === 'dmas')
                $scope.listDmas();
        }

        // Audience Targeting Trigger
        $scope.selectAudTarget = function(){
            $scope.setTargeting('Audience');
            //$scope.resetGeoTargetingVariables();
            $("#audienceTargeting").show().delay( 300 ).animate({left: "50%" , marginLeft: "-461px", opacity: "1.0"}, 'slow');
        }
        
        // Day Targeting Trigger
        $scope.selectDayTarget = function(){
            $scope.setTargeting('Daypart');
            //$scope.resetGeoTargetingVariables();
            $("#dayTargeting").show().delay( 300 ).animate({left: "50%" , marginLeft: "-461px", opacity: "1.0"}, 'slow');
        }

        $scope.setTargeting = function(name) {
            $scope.selectedTargeting = {};
            $scope.adData.targetName = name;
            $scope.selectedTargeting[name.toLowerCase()] = true;
        };

        $scope.$on('resetGeoTags',function(){
            $scope.resetGeoTargetingVariables();
        })

        $scope.$on('renderTargetingUI', function(event, platformId) {
            $scope.isPlatformId = platformId;
            $scope.isPlatformSelected = platformId ? true : false;
            $scope.resetGeoTargetingVariables();
            $scope.showRegionsTab = true;
            $scope.showCitiesTab = true;
            if($scope.isPlatformId === 1) {
                $scope.showCitiesTab = false;
            }
        });


        var geoTargetingView = {
            buildUrlParams: function (params) {
                var queryString ='';
                if (params.pageNo) {
                    queryString = '&pageNo='+params.pageNo;
                }

                if (params.pageSize) {
                    queryString += '&pageSize='+params.pageSize;
                }

                if (params.sortOrder) {
                    queryString += '&sortOrder='+params.sortOrder;
                }

                if(params.regions) {
                    queryString += '&regions='+params.regions;
                }

                if (params.query) {
                    queryString += '&query='+params.query;
                }

                return queryString;
            },

            getRegionsList : function(parmas, callback,flag) {
                var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);
                if(flag == 'cancellable') {
                    workflowService.getRegionsList(parmas.platformId, qryStr, function (result) {
                        var responseData = result.data.data;
                        callback && callback(responseData);
                    }, function (error) {
                        console.log("error");
                    },flag);
                }else{
                     workflowService.getRegionsList(parmas.platformId, qryStr,null,null,flag).then(function (result) {
                         var responseData = result.data.data;
                         callback && callback(responseData);
                     }, function (error) {
                         console.log("error");
                     });
                }
            },

            getCitiesList : function(parmas, callback, flag) {
                var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);
                if(flag == 'cancellable') {
                    workflowService.getCitiesList(parmas.platformId, qryStr, function (result) {
                        var responseData = result.data.data;
                        callback && callback(responseData);
                    }, function (error) {
                        console.log("error")
                    },flag);
                }else{
                    workflowService.getCitiesList(parmas.platformId, qryStr,null,null,flag).then(function (result) {
                        var responseData = result.data.data;
                        callback && callback(responseData);
                    }, function (error) {
                        console.log("error");
                    });
                }
            },

            getDMAsList : function(parmas, callback,flag) {
                var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);
                if(flag == 'cancellable') {
                    workflowService.getDMAsList(parmas.platformId, qryStr, function (result) {
                        var responseData = result.data.data;
                        _.each(responseData, function (data) {
                            data.region = $.trim(data.name.substring(data.name.lastIndexOf(" ")))
                            data.dmaName = $.trim(data.name.substring(0, data.name.lastIndexOf(" ")))
                        })
                        callback && callback(responseData);
                    }, function (error) {
                        console.log("error")
                    },flag);
                }
                else{
                    workflowService.getDMAsList(parmas.platformId, qryStr,null,null,flag).then(function (result) {
                        var responseData = result.data.data;
                        _.each(responseData, function (data) {
                            data.region = $.trim(data.name.substring(data.name.lastIndexOf(" ")))
                            data.dmaName = $.trim(data.name.substring(0, data.name.lastIndexOf(" ")))
                        })
                        callback && callback(responseData);
                    }, function (error) {
                        console.log("error")
                    });
                }
            },

        }

        var getSwitchElem = function(type) {
            var el = $(".switchWrap").find(".regions");
            if($scope.selectedTab === 'dmas') {
                el = $(".switchWrap").find(".dmas");
                if(type == 'on') {
                    $scope.dmasIncludeSwitchLabel =  true;
                } else {
                    $scope.dmasIncludeSwitchLabel =  false;
                }
            } else if($scope.selectedTab === 'regions'){
                if(type == 'on') {
                    $scope.regionsIncludeSwitchLabel=  true;
                    $scope.citiesIncludeSwitchLabel =  true;
                } else {
                    $scope.regionsIncludeSwitchLabel=  false;
                    $scope.citiesIncludeSwitchLabel =  false;

                }
            }
            else{
                if(type == 'on') {
                    $scope.citiesIncludeSwitchLabel=  true;
                } else {
                     $scope.citiesIncludeSwitchLabel =  false;

                }
            }

            return el;
        }

        $scope.isChecked = function(id, type){
            var match = false;
            for(var i=0 ; i < $scope.geoTargetingData.selected[type].length; i++) {
                if($scope.geoTargetingData.selected[type][i].id == id){
                    match = true;
                }
            }
            return match;
        };

        $scope.sync = function(bool, item, type){
            if(bool){
                item[type+'Included'] = $scope[type+'Included'];
                var index = _.findIndex($scope.geoTargetingData.selected[type], function(obj) {
                    return item.id ==  obj.id});
                if(index == -1)
                    $scope.geoTargetingData.selected[type].push(item);

            } else {
                for(var i=0 ; i < $scope.geoTargetingData.selected[type].length; i++) {
                    if($scope.geoTargetingData.selected[type][i].id == item.id){
                        $scope.geoTargetingData.selected[type].splice(i,1);
                    }
                }
            }
            $scope.includeorExcludeCityOnly(type);
        };

        $scope.resetGeoTargetingVariables = function($event) {
            //$("#geographyTargeting").delay( 300 ).animate({left: "100%" , marginLeft: "0px", opacity: "0"}, function() {
                if($event && $scope.mode =='edit') {
                    //do nothing just wait and watch
                } else {
                  $scope.geoTargetingData['selected'] = {};
                  $scope.geoTargetingData['selected']['regions']=[];
                  $scope.geoTargetingData['selected']['cities']=[];
                  $scope.geoTargetingData['selected']['dmas']=[];
                  $scope.geoTargetingData['selected']['zip'] = [];
                  $scope.dmasIncludeSwitchLabel =  true;
                  $scope.isRegionSelected = true;
                  $scope.citiesIncluded = true;
                  $scope.dmasIncluded = true;
                  $scope.adData.targetName = null;
                  citiesListArray.length = 0;
                  regionsListArray.length = 0;
                  dmasListArray.length =0;
                  getSwitchElem('on');
                }
                //$(this).hide();
            //});
        }

        // Closes Audience Targeting View
        $scope.resetAudienceTargetingVariables = function() {
          $("#audienceTargeting").delay( 300 ).animate({left: "100%" , marginLeft: "0px", opacity: "0.0"}, function() {
            $(this).hide();
          });
        }
        
        // Closes Daypart Targeting View
        $scope.resetDayTargetingVariables = function() {
          $("#dayTargeting").delay( 300 ).animate({left: "100%" , marginLeft: "0px", opacity: "0.0"}, function() {
            $(this).hide();
          });
        }
        
        // Daypart Save Trigger
        $scope.saveCampaignWithDay = function(){
            console.log('Daypart Save Not Set');
            $scope.resetDayTargetingVariables();
        }

        $scope.resetGeoTargetingVariables();
        $scope.resetAudienceTargetingVariables();
        $scope.resetDayTargetingVariables();

        var getAllAddedZipCode =  function(zipCodeList) {
            var addedZipCodes = [];
            _.each(zipCodeList, function(zipCodeObj){
                _.each(zipCodeObj.added, function(val) {
                    addedZipCodes.push(val);
                })
            })
            return addedZipCodes;
        }

        //add zip code
        $scope.addZipCode =  function() {
            var values = $scope.adData.zipCodes;
            var zipCodeList = $scope.geoTargetingData['selected']['zip'];
            var addedZipCodes = getAllAddedZipCode(zipCodeList);

            var zipCodesObj = zipCode.checkZipCodes(values, addedZipCodes);
            _.each(zipCodesObj.removed, function(removeval) {
                _.each(zipCodeList, function(obj, idx){
                    if(obj) {
                        _.each(obj.added, function (val) {
                            if (removeval === val) {
                                zipCodeList.splice(idx, 1)
                            }
                        });
                    }
                });
            });

            $scope.zipCodesObj = zipCodesObj;
            $scope.geoTargetingData['selected']['zip'].push(zipCodesObj);
            $scope.adData.zipCodes = '';
        };

        $scope.includeorExcludeCityOnly = function(type) {
            if(type === 'cities') {
                var selectedRegions = $scope.geoTargetingData.selected['regions'];
                var selectedCities = $scope.geoTargetingData.selected['cities'];
                $scope.showCitiesOnly = true;
                //when only cities are selected
                if(selectedRegions.length === 0  && selectedCities.length > 0) {
                    $scope.isRegionSelected =  false;
                } else { //when region is selected first and then we are selecting cities
                    _.each(selectedRegions, function(regionsObj) {
                        var tmpArr= [];
                        if(selectedCities.length > 0){
                            _.each(selectedCities, function(citiesObj, idx) {
                                if(citiesObj.parent.id === regionsObj.id) {
                                    $scope.showCitiesOnly = false;

                                    citiesObj.citiesIncluded = $scope.citiesIncludeSwitchLabel;
                                    tmpArr.push(citiesObj);
                                    regionsObj.cities = tmpArr;
                                }
                            })
                        }
                        else{
                            regionsObj.cities = [];
                        }

                    })
                    $scope.isRegionSelected =  true;
                    var regionTab = $("#tab_region").parent();
                    regionTab.removeClass('show_tooltip');
                    regionTab.find('.common_tooltip').hide();
                }


            }
            else if(type === 'regions' && $scope.geoTargetingData.selected['regions'].length == 0 && $scope.geoTargetingData.selected['cities'].length > 0){
                $scope.showCitiesOnly = true;
                $scope.geoTargetingData.selected['cities'] = []
            }
        }


        $scope.removeItem =  function(item, type) {
            var selectedItem = $scope.geoTargetingData['selected'][type];
            for (var i = 0; i < selectedItem.length; i++) {
                if (selectedItem[i].id == item.id) {
                    selectedItem.splice(i, 1);
                }
            }

            if ($scope.geoTargetingData['selected'][type].length === 0) {
                $scope.includeorExcludeCityOnly(type);
            }

            if (type === 'regions' && $scope.showCitiesTab) {
                var removeFromSelectedCityArr =  function(cityObj) {
                    var selectedCities = $scope.geoTargetingData['selected']['cities'];
                    var pos = _.findIndex(selectedCities, cityObj);
                    selectedCities.splice(pos, 1);
                }

                for (var j = 0; j < selectedItem.length; j++) {
                    if(selectedItem[j].cities && selectedItem[j].cities.length >0) {
                        for(var k=0; k < selectedItem[j].cities.length>0; k++) {
                            if (selectedItem[j].cities[k].id == item.id) {
                                removeFromSelectedCityArr(selectedItem[j].cities[k]);
                                selectedItem[j].cities.splice(k, 1);
                            }
                        }
                    }
                }
            }

            if(type ==='zip') {
                if($scope.zipCodesObj)  $scope.zipCodesObj = [];
            }
            //create preview data
            createPreviewData();
        };

        $scope.showRemoveConfirmBox = function(event, type, subtype) {
            $scope.boxType = type;
            $scope.boxsubType = subtype
            $scope.showConfirmBox = true;
            var target = $(event.target);
            var position = target.offset();

            var elem =  $("#confirmBox").find(".msgPopup");
            var parentPos = $(".targettingFormWrap").offset();
            var left_pos =  position.left - parentPos.left - target.width() -50 ;
            var top_pos =  position.top - parentPos.top - target.height() + 14;

            //elem.css( {position:"absolute", top:top_pos, left: left_pos});
            elem.css( {position:"absolute", top:"17px", left:"689px", width:"242px"});
        }

        $scope.resetSwitch = function() {
            $scope.showSwitch = true;
            $scope.citiesIncludeSwitchLabel =  true;
            $scope.regionsIncludeSwitchLabel = true;
        }
        $scope.show_more_less_list = function(event) {
            var elem = $(event.target);
            var list_number =  elem.closest(".total_data_holder").find(".data_list").length - 2  ;

            if( elem.closest(".total_data_holder").find(".data_list_holder").hasClass("less_data")  ) {
                elem.closest(".total_data_holder").find(".data_list_holder").removeClass("less_data") ;
                elem.text("Show Less") ;
            } else {
                elem.closest(".total_data_holder").find(".data_list_holder").addClass("less_data") ;
                elem.text("+ " + list_number + " more") ;
            }
        }

        $scope.removeSelectedList = function(type, subtype) {
            $scope.hideConfirmBox();

            if(type === 'regions' && subtype === 'cities') {
                $scope.geoTargetingData.selected[type]=[];
                $scope.geoTargetingData.selected[subtype]=[];
                $scope.resetSwitch();
                $scope.includeorExcludeCityOnly(subtype);
            } else {
                $scope.geoTargetingData.selected[type]=[];
                $scope.includeorExcludeCityOnly(type);
            }

            if($scope.selectedTab === 'regions') {
                $scope.listRegions();
            }

            if($scope.selectedTab === 'cities') {
                $scope.listCities();
            }

            if($scope.selectedTab === 'dmas') {
                $scope.listDmas();
            }

            //create preview data
            createPreviewData();
        };

        $scope.listDmas = function(defaults,flag) {
            if(flag != 'cancellable')
                flag = "normal";

            $scope.dmasListObj = {
                 platformId : $scope.isPlatformId,
                 sortOrder : dmaListSortOrder,
                 pageNo :1,
                 pageSize : 200
             }

            _.extend($scope.dmasListObj, defaults)

            //$scope.geoTargetingData['dmas'] = [];

            geoTargetingView.getDMAsList($scope.dmasListObj, function(responseData) {
                 $scope.dmasFetching = false;
                 //dmasListArray = [];
                 dmasListArray.push(responseData);
                 var flatArr = _.flatten(dmasListArray);
                 $scope.geoTargetingData['dmas'] = _.uniq(flatArr, function(item, key, id) {
                     return item.id;
                 });

                if($scope.mode === 'edit' && !dmasInitialLoad){
                    $scope.dmasEdit(flatArr);
                }

             },flag);
        }

        $scope.loadMoreDmas = function() {
            if($scope.dmasListObj) {
                $scope.dmasFetching = true;
                $scope.dmasListObj['pageNo'] = $scope.dmasListObj['pageNo'] + 1;
                $scope.listDmas($scope.dmasListObj);
            }
        }

        $scope.selectedCitiesCount =  function() {
            return $scope.geoTargetingData['selected']['cities'].length;
        }
        //display the cities
        $scope.listCities = function(event, defaults,flag) {
            if(flag != 'cancellable')
                flag = "normal";
            var searchVal = $('.searchBox').val();
            $scope.selectedTab = 'cities';
            if($scope.citiesIncludeSwitchLabel == true){
                $scope.includeSelectedItems();
            }
            else{
                $scope.excludeSelectedItems();
            }
            regionsListArray.length =0;
            var regions = $scope.geoTargetingData['selected']['regions'];

            $scope.citiesListObj = {
                platformId : $scope.isPlatformId,
                sortOrder :cityListSortOrder,
                pageSize :200,
                pageNo : 1
            }

            if(searchVal != undefined && searchVal.length > 0) {
                $scope.citiesListObj = {
                    platformId : $scope.isPlatformId,
                    sortOrder :cityListSortOrder,
                    pageSize :200,
                    pageNo : 1,
                    query: searchVal
                }
            }



            _.extend($scope.citiesListObj, defaults)

            if(regions.length >0) {
                var regionIds = _.pluck(regions, 'id');
                $scope.citiesListObj['regions'] = regionIds.join(',');
            }

            $scope.logic();

            //$scope.geoTargetingData['cities'] = [];

            geoTargetingView.getCitiesList($scope.citiesListObj, function (responseData) {
                $scope.cityFetching = false;
                // citiesListArray = [];
                flatArr = [];
                citiesListArray.push(responseData);
                var flatArr = _.flatten(citiesListArray);
                $scope.geoTargetingData['cities'] = _.uniq(flatArr, function(item, key, id) {
                    return item.id;
                });

                if($scope.mode === 'edit' && !cityInitialLoad){
                    $scope.cityEdit(flatArr);
                    $scope.listDmas();
                }

            },flag);
        }

        $scope.loadMoreCities = function() {
            if($scope.citiesListObj) {
                $scope.cityFetching = true;
                $scope.citiesListObj['pageNo'] = $scope.citiesListObj['pageNo'] + 1;
                $scope.listCities(null, $scope.citiesListObj);
            }
        }

        $scope.listRegions = function(defaults, event,flag) {
            if(flag != 'cancellable')
                flag = "normal";
            var searchVal = $('.searchBox').val();

            $scope.showSwitch = true;
            var regionTab = $("#tab_region").parent();
            if(!$scope.isRegionSelected && event) {
                regionTab.addClass('show_tooltip');
                regionTab.find('.common_tooltip').show();
                 event.preventDefault();
                event.stopPropagation();
                return false;
            }
            $scope.selectedTab = 'regions';

            if($scope.regionsIncludeSwitchLabel == true){
                $scope.includeSelectedItems();
            }
            else{
                $scope.excludeSelectedItems();
            }


            citiesListArray.length = 0;

            $scope.regionListObj = {
                platformId : $scope.isPlatformId,
                sortOrder : regionListSortOrder,
                pageSize : 200,
                pageNo : 1
            }

            if(searchVal != undefined && searchVal.length > 0) {
                $scope.regionListObj = {
                    platformId : $scope.isPlatformId,
                    sortOrder :regionListSortOrder,
                    pageSize : 200,
                    pageNo : 1,
                    query: searchVal
                }
            }

            //$scope.geoTargetingData['regions'] = [];

            _.extend($scope.regionListObj, defaults);

            geoTargetingView.getRegionsList($scope.regionListObj, function(responseData) {
                $scope.regionFetching = false;
                //regionsListArray = [];

                regionsListArray.push(responseData);
                var flatArr = _.flatten(regionsListArray);
                $scope.geoTargetingData['regions'] = _.uniq(flatArr, function(item, key, code) {
                    return item.code;
                });
                if($scope.mode === 'edit' && !regionInitialLoad){
                    $scope.regionEdit(flatArr);
                    //$scope.listCities();
                }


            },flag);
        }

        $scope.loadMoreRegions = function() {
            if($scope.regionListObj) {
                $scope.regionFetching = true;
                $scope.regionListObj['pageNo'] = $scope.regionListObj['pageNo'] + 1;
                //lazy loading
                if($scope.geoTargetingData['regions'])
                    regionsListArray = $scope.geoTargetingData['regions']  ;
                $scope.listRegions($scope.regionListObj);
            }
        }


        $(function() {
            $( "#slider-range" ).slider({
                range: true,
                min: 0,
                max: 500,
                values: [ 75, 300 ],
                slide: function( event, ui ) {
                    $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
                }
            });
            $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
            " - $" + $( "#slider-range" ).slider( "values", 1 ) );
        });





        $scope.search = function(ev) {
            var target =  $(ev.target);
            var searchType = target.attr('data-searchfield');
            var searchVal = target.val();

            if(searchType === 'regions') {
                regionsListArray.length = 0;
                $scope.regionListObj['query'] = '';
                $scope.regionListObj['pageNo'] = '';
                $scope.regionListObj['pageSize'] = '';

                if(searchVal.length > 0) {
                    $scope.regionListObj['query'] = searchVal;
                }
                $scope.listRegions($scope.regionListObj,null,"cancellable");
            }

            if(searchType === 'cities') {
                citiesListArray.length =0;
                $scope.citiesListObj['query'] = '';
                $scope.citiesListObj['pageNo'] = '';
                $scope.citiesListObj['pageSize'] = '';
                if(searchVal.length > 0) {
                    $scope.citiesListObj['query'] = searchVal;
                }
                $scope.listCities(null, $scope.citiesListObj,"cancellable");
            }

            if(searchType === 'dmas') {
                dmasListArray.length = 0;
                $scope.dmasListObj['query'] = '';
                $scope.dmasListObj['pageNo'] = '';
                $scope.dmasListObj['pageSize'] = '';
                if(searchVal.length > 0) {
                    $scope.dmasListObj['query'] = searchVal;
                }
                $scope.listDmas($scope.dmasListObj,"cancellable");
            }
        }



        $scope.hideConfirmBox = function() {
            $scope.showConfirmBox = false;
        };

        $scope.showGeographyTabsBox = function(event, tabType, showPopup) {
            $('.searchBox').val('');
            if(tabType === 'zip' && showPopup) {
                $scope.enableZipCode = true;
                return false;
            }
            $scope.enableZipCode = false;
            $scope.selectedTab  = tabType;

            var target = event ? $(event.target) : $("#zipCodeTab");
            var tabElems = target.parents('.nav-tabs');
            tabElems.find("li").removeClass("active");
            target.parent().addClass('active');



            var tabContentElem = tabElems.siblings('.tab-content');
            tabContentElem.find('.contentBox').hide();
            tabContentElem.find("#"+tabType).show();


            if(tabType == 'zip') {
                $(".searchInput").hide();
            } else {
                $(".searchInput").show();
            }

            if(tabType == 'dmas') {
                $scope.listDmas();
            }


            if(tabType == 'regions' && $(".tab_region_holder").hasClass('active')) {
                $scope.listRegions();
            }

            if(tabType == 'regions' && $("#cityTab").hasClass('active')) {
                $scope.listCities();
            }
        };

        $scope.saveGeography =  function() {
            if($scope.zipCodesObj) {
                $scope.zipCodesObj = [];
            }
            $scope.adData.zipCodes = '';

            createPreviewData();
            $scope.adData.geoTargetingData = $scope.geoTargetingData.selected;
            $scope.redirectTargettingMain();
            //$(".targettingFormWrap").slideUp();
            //$(".targettingSelected").show();

        };

        function createPreviewData (){
            var selectedTargtingData = _.extend({},$scope.geoTargetingData.selected);
            selectedTargtingData.zip = getAllAddedZipCode(selectedTargtingData.zip);

            if(selectedTargtingData.zip.length >0) {
                selectedTargtingData.zipCodes = [{'values': selectedTargtingData.zip}]
            }
            delete selectedTargtingData.zip;

            var obj = {};
            obj['include'] = {}
            obj['exclude'] = {}
            _.each(selectedTargtingData, function(data, idx){
                if(data.length >0) {
                    obj['include'][idx] =[];
                    if(idx !== 'zip') {
                        obj['exclude'][idx] = [];
                    }
                    _.each(data, function(d){
                        if(d.regionsIncluded || d.citiesIncluded || d.dmasIncluded || d.values) {
                            obj['include'][idx].push(d);
                        } else {
                            obj['exclude'][idx].push(d);
                        }
                    })
                }
            });

            if(angular.equals({},obj['include'])){
                obj['include'] = null;
            }
            if(angular.equals({},obj['exclude'])){
                obj['exclude'] = null;
            }
            $scope.geoTargetingData.selected['previewData'] = obj;
        }

        $scope.editGeography =  function() {
            $(".targettingFormWrap").slideDown();
            $(".targettingSelected").hide();
        };

        $scope.deleteGeography = function() {
            $(".targettingSelected").hide();
            $(".targettingFormWrap").slideDown();
            $scope.resetGeoTargetingVariables();
            $scope.resetSwitch();
        };

        $scope.includeorExcludeSelectedItems = function() {
            var type =  $scope.selectedTab;
            var item = $scope.geoTargetingData.selected[type];
            var len = item.length;
            for(var i=0 ; i < len; i++) {
                item[i][type+'Included'] = $scope[type+'Included'];
                if(item[i].hasOwnProperty('cities')){
                    for(var j = 0 ; j < item[i]['cities'].length ; j++){
                        item[i]['cities'][j]['citiesIncluded'] = ($scope[type+'Included'])?false:true;
                    }
                }
            }

        };

        $scope.logic = function() {
            var regions = $scope.geoTargetingData['selected']['regions'];
            if($scope.selectedTab === 'cities') {
                $scope.citiesIncludeSwitchLabel =  true;
                if(regions.length >0) {
                    $scope.showSwitch = false;
                    if($scope.regionsIncludeSwitchLabel) {
                        $scope.citiesIncludeSwitchLabel = false;
                    }
                }
            }
        };


        $scope.dmasIncludeSwitchLabel =  true;
        $scope.includeSelectedItems = function () {
            var elem = getSwitchElem('on');
            elem.find(".btn").animate({left: "22px"});
            elem.find(".togBtnBg").css({background: "#0978c9"});
            $scope[$scope.selectedTab+'Included'] = true;

        }

        $scope.excludeSelectedItems = function() {
            var elem = getSwitchElem('off');
            elem.find(".btn").animate({left: "-2px"});
            elem.find(".togBtnBg").css({background: "#ccd2da"});
            $scope[$scope.selectedTab+'Included'] = false;

        }

        if ($(".btn-ani-toggle .active")[0]){
            $scope.excludeSelectedItems();
        } else {
            $scope.includeSelectedItems();
        }

        $scope.switchInclude=function(){
            this.tog = !this.tog;
            (this.tog) ? $scope.excludeSelectedItems() : $scope.includeSelectedItems();
            $scope.includeorExcludeSelectedItems();
        }

        $scope.resetTargeting = function() {
            $scope.adData.targetName = null;
        }

        $scope.changeSortingOrder = function(section){

            if($(".common-sort-icon").hasClass('ascending')){
                $(".common-sort-icon").removeClass('ascending');
                $(".common-sort-icon").addClass('descending');

                if(section == 'regions'){
                    regionsListArray = [];
                    regionListSortOrder = 'desc';
                    $scope.listRegions();
                }
                else if(section == 'cities'){
                    citiesListArray = [];
                    cityListSortOrder = 'desc';
                    $scope.listCities();
                }
                else if(section == 'dmas'){
                    dmasListArray = [];
                    dmaListSortOrder = 'desc';
                    $scope.listDmas();
                }
            }
            else{
                $(".common-sort-icon").removeClass('descending');
                $(".common-sort-icon").addClass('ascending');
                if(section == 'regions'){
                    regionsListArray = [];
                    regionListSortOrder = 'asc';
                    $scope.listRegions();
                }
                else if(section == 'cities'){
                    citiesListArray = [];
                    cityListSortOrder = 'asc';
                    $scope.listCities();
                }
                else if(section == 'dmas'){
                    dmasListArray = [];
                    dmaListSortOrder = 'asc';
                    $scope.listDmas();
                }
            }
        }

        //this is temp redirect to targetting screen
        $scope.redirectTargettingMain = function(){
            $("#geographyTargeting").delay( 300 ).animate({left: "100%" , marginLeft: "0px", opacity: "0"}, function() {
                $(this).hide();
            });
        }

    });
  })();
