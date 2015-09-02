var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignAdsCreateController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData = {}
        $scope.adData.screenTypes = [];
        $scope.creativeData = {};
        $scope.creativesLibraryData = {};
        $scope.emptyCreativesFlag = true;
        $scope.showHidePopup = false;
        $scope.campaignId = $routeParams.campaignId;
        $scope.selectedArr = [];
        $scope.dataFromCreativeLibraryNotFound = false;
        $scope.enableSaveBtn=true;
        $scope.isAddCreativePopup = false;
        $scope.IsVisible = false;//To show hide view tag in creatives listing
        $scope.currentTimeStamp = moment.utc().valueOf();

        $scope.ShowHide = function (obj) {
            $scope.IsVisible = $scope.IsVisible ? false : true;
            $scope.creativeObj=obj;
        }
        $scope.getAdFormatIconName = function (adFormat) {
            var adFormatMapper = {'display': 'display', 'video': 'video', 'rich media': 'mixedmedia', 'social': 'audience'}
            return adFormatMapper[adFormat.toLowerCase()];
        }

        $scope.getScreenTypeIconName = function (screenType) {
            var screenTypeMapper = {'desktop': 'phone', 'mobile': 'phone', 'tablet': 'phone'}
            return screenTypeMapper[screenType.toLowerCase()];
        }

        $scope.getGoalIconName = function (goal) {
            var goalMapper = {'performance': 'signal', 'brand': 'record'}
            return goalMapper[goal.toLowerCase()];
        }

        $scope.getPlatformIconName = function (platform) {
            var platformMapper = {'collective bidder': 'logo_C_bidder', 'appnexus': 'logo_C_appnexus'}
            return platformMapper[platform.toLowerCase()];
        }

        var saveDataInLocalStorage = function(data) {
            localStorage.removeItem('campaignData');
            var campaignData = {'advertiserId' : data.advertiserId,'advertiserName' : data.advertiserName, 'clientId' : data.clientId, 'clientName' : data.clientName};
            localStorage.setItem('campaignData',JSON.stringify(campaignData))
        };

        $scope.checkForPastDate = function(date) {
            return moment().isAfter(date, 'day');
        };

        var campaignOverView = {
            getCampaignData: function (campaignId) {
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;
                        saveDataInLocalStorage(responseData);
                        var startDateElem = $('#startDateInput');
                        var campaignStartTime = moment($scope.workflowData['campaignData'].startTime).format("MM/DD/YYYY");
                        var campaignEndTime = moment($scope.workflowData['campaignData'].endTime).format("MM/DD/YYYY");
                        startDateElem.datepicker("setStartDate", campaignStartTime);
                        startDateElem.datepicker("setEndDate", campaignEndTime);
                        $scope.campaignEndTime = campaignEndTime;
                        //campaignOverView.getTaggedCreatives(campaignId, responseData.id);
                    }
                    else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            fetchGoals: function () {
                $scope.workflowData['goals'] = [{id: 1, name: 'Performance', active: true}, {id: 2, name: 'Brand', active: false}]
                $scope.adData.goal = 'Performance'; //default value
            },

            fetchAdFormats: function () {
                $scope.workflowData['adFormats'] = [{id: 1, name: 'Display', active: true}, {id: 2,name: 'Video',active: false}, {id: 3, name: 'Rich Media', active: false}, {id: 4, name: 'Social', active: false}]
                $scope.adData.adFormat = 'Display'; //default value
            },

            fetchScreenType: function () {
                $scope.workflowData['screenTypes'] = [{id: 1, name: 'Desktop', active: true}, {id: 2, name: 'Mobile', active: false}, {id: 3,name: 'Tablet', active: false}]
                $scope.adData.screenTypes = [{id: 1, name: 'Desktop', active: true}] //default value
            },

            fetchUnitTypes: function () {
                $scope.workflowData['unitTypes'] = [{id: 1, name: 'CPM'}, {id: 2, name: 'CPC'}, {id: 3, name: 'CPA'}];
            },

            fetchPlatforms: function () {
                $scope.workflowData['platforms'] = [{id: 1, name: 'Collective Bidder'}, {id: 2, name: 'Appnexus'}];
            },

            saveAds: function (postDataObj) {
                if ($scope.adId) {
                    postDataObj['adId'] = $scope.adId;
                    postDataObj['updatedAt'] = $scope.updatedAt;

                }
                postDataObj['adId'] = $scope.adId ? $scope.adId : '';
                var promiseObj = $scope.adId ? workflowService.updateAd(postDataObj) : workflowService.createAd(postDataObj);
                promiseObj.then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.state = responseData.state;
                        $scope.adId = responseData.id;
                        $scope.updatedAt = responseData.updatedAt;
                        if ($scope.state && $scope.state.toLowerCase() === 'draft') {
                            var url = '/campaign/' + result.data.data.campaignId + '/overview';
                            $window.location.href = url;
                        }
                    }
                });
            },
            /*Function to get creatives for list view*/
            getTaggedCreatives: function (campaignId, adId) {
                workflowService.getTaggedCreatives(campaignId, adId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        if (responseData.creatives.length > 0)
                            $scope.emptyCreativesFlag = false;
                        else
                            $scope.emptyCreativesFlag = true;
                        $scope.creativeData['creativeInfo'] = responseData;
                    }
                    else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);

            },


            errorHandler: function (errData) {
                console.log(errData);
            }
        }

        $scope.utc = function (date) {
            return moment(date).utc().valueOf()
        }

        campaignOverView.getCampaignData($routeParams.campaignId);
        campaignOverView.fetchAdFormats();
        campaignOverView.fetchGoals();
        campaignOverView.fetchScreenType();
        campaignOverView.fetchUnitTypes();
        campaignOverView.fetchPlatforms();

        //campaignOverView.getCreatives(3,10);


        $scope.screenTypeSelection = function (screenTypeObj) {
            var screenTypeFound = _.filter($scope.adData.screenTypes, function (obj) {
                return obj.name === screenTypeObj.name
            });
            if (screenTypeFound.length > 0) {
                var idx = _.findLastIndex($scope.adData.screenTypes, screenTypeObj);
                $scope.adData.screenTypes.splice(idx, 1);

            } else {
                $scope.adData.screenTypes.push(screenTypeObj);
            }
        }

        $scope.adFormatSelection =  function(adformatName) {
            var adFormatsData = $scope.workflowData['adFormats'];
            _.each(adFormatsData, function(obj) {
                obj.name === adformatName ? obj.active = true : obj.active = false;
            })
        };

        $scope.goalSelection =  function(goal) {
            var goalData = $scope.workflowData['goals'];
            _.each(goalData, function(obj) {
                obj.name === goal ? obj.active = true : obj.active = false;
            })
        };

        $scope.toggleBtn = function(event) {
            var target = $(event.target);
            var parentElem =  target.parents('.miniToggle')
            parentElem.find("label").removeClass('active');
            target.parent().addClass('active');
            target.attr("checked", "checked");
        };

        $scope.handleFlightDate = function (data) {
            var startTime = data.startTime;
            var endDateElem = $('#endDateInput');
            var campaignEndTime = moment($scope.workflowData['campaignData'].endTime).format("MM/DD/YYYY");
            var changeDate;
            endDateElem.attr("disabled", "disabled").css({'background': '#eee'});
            if (startTime) {
                endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                changeDate = moment(startTime).format('MM/DD/YYYY')
                endDateElem.datepicker("setStartDate", changeDate);
                endDateElem.datepicker("setEndDate", campaignEndTime);
                endDateElem.datepicker("update", changeDate);
            }
        }

        // Switch BTN Animation
        $('.btn-toggle').click(function () {
            $(this).find('.btn').toggleClass('active');

            if ($(this).find('.btn-primary').size() > 0) {
                $(this).find('.btn').toggleClass('btn-primary');
            }
            if ($(this).find('.btn-success').size() > 0) {
                $(this).find('.btn').toggleClass('btn-success');
            }
            $(this).find('.btn').toggleClass('btn-default');
        });


        // Create AD Tab Animation



        var addFromLibrary = {
            modifyCreativesData : function(respData) {
                var arr;
                _.each(respData, function(data) {
                    if($scope.selectedArr.length >0) {
                        arr = _.filter($scope.selectedArr, function (obj) {
                            return obj.id === data.id
                        });
                        if(arr.length >0) {
                            data['checked'] = arr[0].checked;
                        }
                    } else {
                        data['checked'] = false;
                    }
                });
                return respData;
            },

            getCreativesFromLibrary: function (clientID, adID, format) {
                workflowService.getCreativesFromLibrary(clientID, adID, format).then(function (result) {
                    if (result.status === "OK" || result.status === "success" && result.data.data.length > 0) {
                        var responseData = result.data.data;
                        $scope.creativesLibraryData['creativesData'] = addFromLibrary.modifyCreativesData(responseData);
                        if($scope.creativesLibraryData.creativesData.length>0)
                            $scope.dataFromCreativeLibraryNotFound = false;
                        else
                            $scope.dataFromCreativeLibraryNotFound = true;
                    }
                    else {
                        addFromLibrary.errorHandler(result);
                    }
                }, addFromLibrary.errorHandler);
            },
            errorHandler: function (errData) {
                $scope.dataFromCreativeLibraryNotFound =  true;
                $scope.emptyCreativesFlag = true;
            }
        };

        $scope.showPopup = function () {
            $scope.showHidePopup = true;
            addFromLibrary.getCreativesFromLibrary($scope.workflowData['campaignData'].clientId, $scope.workflowData['campaignData'].advertiserId, $scope.adData.adFormat.toUpperCase());
        };

        $scope.saveCreativeTags = function () {
            $scope.showHidePopup = false;
            $scope.updateCreativeData($scope.selectedArr)
        };

        $scope.closePop = function () {
            $scope.showHidePopup = false;
        };

        $scope.updateCreativeData = function(data) {
            $scope.creativeData['creativeInfo'] = {'creatives' : data.slice() };
            if($scope.creativeData.creativeInfo.creatives.length>0)
                $scope.emptyCreativesFlag=false;
            else
                $scope.emptyCreativesFlag=true;

        };

        $scope.removeCreativeTags =  function(clickedTagData, actionFrom) {
            var selectedCreativeTag = _.filter($scope.selectedArr, function (obj) { return obj.id === clickedTagData.id});
            if (selectedCreativeTag.length > 0) {
                var idx = _.findLastIndex($scope.selectedArr, selectedCreativeTag[0]);
                $scope.selectedArr.splice(idx, 1);
                if(actionFrom !== 'popup') {
                    $scope.updateCreativeData($scope.selectedArr)
                }
            }
            var currIndx = _.findLastIndex($scope.creativesLibraryData['creativesData'], {'id' : selectedCreativeTag[0].id});
            $scope.creativesLibraryData['creativesData'][currIndx]['checked'] = false;
            $("#"+clickedTagData.id).removeAttr("checked");
            /*Enable save button of popup library if elements exists*/
            if($scope.selectedArr.length >0)
                $scope.enableSaveBtn = false;
            else
                $scope.enableSaveBtn = true;
        };

        $scope.stateChanged = function ($event, screenTypeObj) {
            var checkbox = $event.target;
            screenTypeObj['checked'] = checkbox.checked;

            var selectedChkBox = _.filter($scope.selectedArr, function (obj) {
                return obj.name === screenTypeObj.name
            });

            if (selectedChkBox.length > 0) {
                var idx = _.findLastIndex($scope.selectedArr, screenTypeObj);
                $scope.selectedArr.splice(idx, 1);

            } else {
                $scope.selectedArr.push(screenTypeObj);
            }
            /*Enable save button of popup library if elements exists*/
            if($scope.selectedArr.length >0)
                $scope.enableSaveBtn = false;
            else
                $scope.enableSaveBtn = true;
        };


        $scope.showCreateNewWindow=function(){
            $("#formCreativeCreate")[0].reset();
            $scope.isAddCreativePopup = true;
            /*enable cancel, save button on load*/
            $scope.disableCancelSave=false;
            $(".newCreativeSlide .popCreativeLib").show().delay( 300 ).animate({left: "50%" , marginLeft: "-307px"}, 'slow');
            $("#creative").delay( 300 ).animate({minHeight: "950px"}, 'slow');
        }
        
        
        // Blue Switch Toggle Btn
        function ani1 () {
            $(".btn-ani-toggle .btn").animate({left: "22px"});
            $(".btn-ani-toggle .togBtnBg").css({background: "#0978c9"});
            $("#switchLabel1").show();
            $("#switchLabel2").hide();
        }
        function ani2 () {
            $(".btn-ani-toggle .btn").animate({left: "-2px"});
            $(".btn-ani-toggle .togBtnBg").css({background: "#ccd2da"});
            $("#switchLabel1").hide();
            $("#switchLabel2").show();
        }
        
        if ($(".btn-ani-toggle .active")[0]){
            ani1();
        } else {
            ani2();
        }
        $scope.switchInclude=function(){
            return (this.tog = !this.tog) ? ani1() : ani2();
        }


        $scope.creativeLibraryFilterFunction = function(element) {
            console.log(element);
        }
        function getfreqCapParams(formData) {

            var freq_cap = [];
            var budgetType = formData.budgetType.toLowerCase() === 'cost' ? 'Budget' : formData.budgetType;
            var targetType =  budgetType.toLowerCase === 'budget' ? 'ALL' : 'PER_USER';
            if(formData.budgetAmount) {
                var freqDefaultCapObj = {'frequencyType': 'LIFETIME'};
                freqDefaultCapObj['quantity'] = Number(formData.budgetAmount);
                freqDefaultCapObj['capType'] = budgetType.toUpperCase();
                freqDefaultCapObj['pacingType'] = formData.pacingType;
                freqDefaultCapObj['targetType'] = 'ALL';
                freq_cap.push(freqDefaultCapObj);
            }
            var isSetCap = formData.setCap === 'true' ? true : false;
            if(isSetCap && formData.quantity) {
                var selectedfreqObj = {};
                selectedfreqObj['capType'] = "IMPRESSIONS";
                selectedfreqObj['frequencyType'] = formData.frequencyType;
                selectedfreqObj['quantity'] = Number(formData.quantity);
                selectedfreqObj['targetType'] = "PER_USER";
                selectedfreqObj['pacingType'] = 'EVENLY';
                freq_cap.push(selectedfreqObj);
            }
            return freq_cap;
        }

        $(function () {
           $("#SaveAd").on('click', function () {
                var formElem = $("#formAdCreate");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
               if (formData.budgetAmount  && $scope.formAdCreate.budgetAmount.$error.mediaCostValidator) {
                   return false;
               }

               var creativesData = $scope.creativeData['creativeInfo'];
                var postAdDataObj = {};
                postAdDataObj.name = formData.adName;
                postAdDataObj.campaignId = Number($scope.campaignId);
                postAdDataObj.state = $scope.workflowData['campaignData'].status;


                if (formData.adFormat)
                    postAdDataObj.adFormat = formData.adFormat.toUpperCase();

                if (formData.screens)
                    postAdDataObj.screens = _.pluck(JSON.parse(formData.screens), 'id');

                if (formData.goal)
                    postAdDataObj.goal = formData.goal;

                if (formData.startTime)
                    postAdDataObj.startTime = moment(formData.startTime).format('YYYY-MM-DD');

                if (formData.endTime)
                    postAdDataObj.endTime = moment(formData.endTime).format('YYYY-MM-DD');

                if (formData.unitType && formData.unitCost) {
                    postAdDataObj.rateType = formData.unitType
                    postAdDataObj.rateValue = formData.unitCost;
                }

               if(getfreqCapParams(formData).length >0) {
                   postAdDataObj.frequencyCaps = getfreqCapParams(formData);
               }

                if (formData.budgetType && formData.budgetAmount) {
                    postAdDataObj.budgetType = formData.budgetType
                    postAdDataObj.budgetValue = Number(formData.budgetAmount);
                }

                if (formData.platformId) {
                    postAdDataObj.platformId = Number(formData.platformId);
                }

                if(creativesData && creativesData.creatives) {
                    _.each(creativesData.creatives,
                        function(obj) { obj['sizeId'] = obj.size.id;
                        });
                    postAdDataObj['creatives'] = _.pluck(creativesData.creatives, 'id');

                }
                campaignOverView.saveAds(postAdDataObj)
            })
        })
        $scope.isPlatformSelected = false;

        $scope.changePlatform =  function(platformId) {
            $scope.$broadcast('renderTargetingUI', platformId)
        };

    });

    angObj.controller('buyingPlatformController', function($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $scope.$watch('adData.platformId', function(newValue) {
            $scope.$parent.changePlatform(newValue);
        })

    });

    angObj.controller('geoTargettingController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location, zipCode) {
        $scope.showTargettingForm = false;
        $scope.geoTargetArr = [{'name' : 'Geography', 'enable' : true}, {'name' : 'Behavior', 'enable' : false}, {'name' : 'Demographics', 'enable' : false}, {'name' : 'Interests', 'enable' : false}, {'name' : 'Technology', 'enable' : false}, {'name' : 'Content', 'enable' : false}, {'name' : 'Other', 'enable' : false}]
        $scope.geoTargetingData = {};
        var citiesListArray= [];
        var regionsListArray= [];
        var dmasListArray = [];
        $scope.$on('renderTargetingUI', function(event, platformId) {
            $scope.isPlatformId = platformId;
            $scope.isPlatformSelected = platformId ? true : false;
            if($scope.geoTargetName && $scope.geoTargetName.toLowerCase() ==='geography') {
                resetTargetingVariables();
                $scope.listRegions();
            }
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

            getRegionsList : function(parmas, callback) {
                var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);
                workflowService.getRegionsList(parmas.platformId, qryStr).then(function (result) {
                    var responseData = result.data.data;
                    callback && callback(responseData);
                });
            },

            getCitiesList : function(parmas, callback) {
                var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);
                workflowService.getCitiesList(parmas.platformId, qryStr).then(function (result) {
                    var responseData = result.data.data;
                    callback && callback(responseData);
                });
            },

            getDMAsList : function(parmas, callback) {
                var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);
                workflowService.getDMAsList(parmas.platformId, qryStr).then(function (result) {
                    var responseData= result.data.data;
                    _.each(responseData, function(data) {
                        data.region = $.trim(data.name.substring(data.name.lastIndexOf(" ")))
                        data.dmaName = $.trim(data.name.substring(0, data.name.lastIndexOf(" ")) )
                    })
                    callback && callback(responseData);
                });
            },

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
                $scope.geoTargetingData.selected[type].push(item);
            } else {
                // remove item
                for(var i=0 ; i < $scope.geoTargetingData.selected[type].length; i++) {
                    if($scope.geoTargetingData.selected[type][i].id == item.id){
                        $scope.geoTargetingData.selected[type].splice(i,1);
                    }
                }
            }
        };

        var resetTargetingVariables = function() {
            $scope.geoTargetingData['selected'] = {};
            $scope.geoTargetingData['selected']['regions']=[];
            $scope.geoTargetingData['selected']['cities']=[];
            $scope.geoTargetingData['selected']['dmas']=[];
            $scope.geoTargetingData['selected']['zip'] = [];
            citiesListArray.length = 0;
            regionsListArray.length = 0;
            dmasListArray.length =0;

        }

        resetTargetingVariables();


        //add zip code
        $scope.addZipCode =  function() {
            var values = $scope.adData.zipCodes;
            var addedZipCodes = [];
            var zipCodeList = $scope.geoTargetingData['selected']['zip'];

            var _getAllAddedZipCode =  function(zipCodeList) {
                _.each(zipCodeList, function(zipCodeObj){
                    _.each(zipCodeObj.added, function(val) {
                        addedZipCodes.push(val);
                    })
                })
            }
            _getAllAddedZipCode(zipCodeList);

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

        $scope.showZipCodeBox =  function() {

        }
        $scope.removeItem =  function(item, type) {
            var selectedItem = $scope.geoTargetingData['selected'][type];
            for(var i=0 ; i < selectedItem.length; i++) {
                if(selectedItem[i].id == item.id){
                    selectedItem.splice(i,1);
                }
            }
        };


        $scope.listDmas = function(defaults) {
            $scope.dmasListObj = {
                 platformId : $scope.isPlatformId,
                 sortOrder :'asc',
                 pageNo :1,
                 pageSize : 15
             }

            _.extend($scope.dmasListObj, defaults)

             geoTargetingView.getDMAsList($scope.dmasListObj, function(responseData) {
                 if(responseData.length ===0) {
                     $scope.dmasFetching = false;
                 }
                 dmasListArray.push(responseData);

                 $scope.geoTargetingData['dmas'] = _.flatten(dmasListArray);
             });
        }

        $scope.loadMoreDmas = function() {
            if($scope.dmasListObj) {
                $scope.dmasFetching = true;
                $scope.dmasListObj = $scope.dmasListObj['pageNo'] + 1;
                $scope.listDmas($scope.dmasListObj);
            }
        }

        //display the cities
        $scope.listCities = function(defaults) {
            var regions = $scope.geoTargetingData['selected']['regions'];
            $scope.citiesListObj = {
                platformId : $scope.isPlatformId,
                sortOrder :'asc',
                pageSize :15,
                pageNo : 1
            }

            _.extend($scope.citiesListObj, defaults)

            if(regions.length >0) {
                var regionIds = _.pluck(regions, 'id');
                $scope.citiesListObj['regions'] = regionIds.join(',');
            }

            geoTargetingView.getCitiesList($scope.citiesListObj, function(responseData) {
                if(responseData.length ===0) {
                    $scope.cityFetching = false;
                }
                citiesListArray.push(responseData);
                $scope.geoTargetingData['cities'] = _.flatten(citiesListArray);
            });
        }

        $scope.loadMoreCities = function() {
            if($scope.citiesListObj) {
                $scope.cityFetching = true;
                $scope.citiesListObj['pageNo'] = $scope.citiesListObj['pageNo'] + 1;
                $scope.listCities($scope.citiesListObj);
            }
        }
        $scope.listRegions = function(defaults) {

            $scope.regionListObj = {
                platformId : $scope.isPlatformId,
                sortOrder :'asc',
                pageSize : 15,
                pageNo : 1
            }

            _.extend($scope.regionListObj, defaults);

            geoTargetingView.getRegionsList($scope.regionListObj, function(responseData) {
                if(responseData.length ===0) {
                    $scope.regionFetching = false;
                }
                regionsListArray.push(responseData);
                $scope.geoTargetingData['regions'] = _.flatten(regionsListArray);
            });
        }

        $scope.loadMoreRegions = function() {
            if($scope.regionListObj) {
                $scope.regionFetching = true;
                $scope.regionListObj['pageNo'] = $scope.regionListObj['pageNo'] + 1;
                $scope.listRegions($scope.regionListObj);
            }
        }

        $scope.selectGeoTarget = function(geoTargetName) {
            if(geoTargetName.toLowerCase() === 'geography') {
                $scope.geoTargetName = geoTargetName;
                $scope.listRegions();
            }
        }

        $scope.selectedTab = 'regions';

        $scope.search = function(ev) {
            var target =  $(ev.target);
            var searchType = target.attr('data-searchfield');
            var searchVal = target.val();

            if(searchType === 'regions') {
                regionsListArray.length = 0;
                $scope.regionListObj['query'] = '';
                if(searchVal.length > 2) {
                    $scope.regionListObj['query'] = searchVal;
                    $scope.listRegions($scope.regionListObj);
                }

                if(searchVal.length ===0) {
                    $scope.listRegions($scope.regionListObj);
                }
            }

            if(searchType === 'cities') {
                citiesListArray.length =0;
                $scope.citiesListObj['query'] = '';
                if(searchVal.length > 2) {
                    $scope.citiesListObj['query'] = searchVal;
                    $scope.listCities($scope.citiesListObj);
                }

                if(searchVal.length ===0) {
                    $scope.listCities($scope.citiesListObj);
                }
            }

            if(searchType === 'dmas') {
                dmasListArray.length = 0;
                $scope.dmasListObj['query'] = '';
                if(searchVal.length > 2) {
                    $scope.dmasListObj['query'] = searchVal;
                    $scope.listDmas($scope.dmasListObj);
                }

                if(searchVal.length ===0) {
                    $scope.listDmas($scope.dmasListObj);
                }
            }
        }

        $scope.showRemoveConfirmBox = function(event, type) {
            $scope.boxType = type;
            $scope.showConfirmBox = true;
            var target = $(event.target);
            var position = target.position();
            var elem =  $("#confirmBox");
            elem.css( {position:"absolute", top:position.top, left: position.left});
        }

        $scope.removeSelectedList = function(type) {
            $scope.geoTargetingData.selected[type]=[];
            $scope.showConfirmBox = false;
        }

        $scope.hideConfirmBox = function() {
            $scope.showConfirmBox = false;
        }


        $scope.showGeographyTabsBox = function(event, tabType, showPopup) {
            if(tabType === 'zip' && showPopup) {
                return false;
            }
            $scope.enableZipCode = false;

            var target = event ? $(event.target) : $("#zipCodeTab");
            var tabElems = target.parents('.nav-tabs');
            tabElems.find("li").removeClass("active");
            target.parent().addClass('active');



            var tabContentElem = tabElems.siblings('.tab-content');
            tabContentElem.find('.contentBox').hide();
            tabContentElem.find("#"+tabType).show();

            if(tabType == 'dma') {
                $scope.listDmas();
                $scope.selectedTab = 'dmas';
            }
        }
    });

})();

