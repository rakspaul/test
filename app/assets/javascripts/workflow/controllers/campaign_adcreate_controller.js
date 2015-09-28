var angObj = angObj || {};
(function () {
    'use strict';

    angObj.controller('CampaignAdsCreateController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location,campaignListService,requestCanceller) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData = {}
        $scope.adData.screenTypes = [];
        $scope.creativeData = {};
        $scope.creativesLibraryData = {};
        $scope.creativesLibraryData['creativesData']= [];
        $scope.showHidePopup = false;
        $scope.campaignId = $routeParams.campaignId;
        $scope.adGroupId = $routeParams.adGroupId;
        $scope.selectedArr = [];
        $scope.unchecking=false;
        $scope.enableSaveBtn=true;
        $scope.isAddCreativePopup = false;
        $scope.IsVisible = false;//To show hide view tag in creatives listing
        $scope.currentTimeStamp = moment.utc().valueOf();
        $scope.adData.setSizes=constants.WF_NOT_SET;
        $scope.partialSaveAlertMessage = {'message':'','isErrorMsg':0};
        $scope.preDeleteArr = [];

        $scope.msgtimeoutReset = function(){
            $timeout(function(){
                $scope.resetPartialSaveAlertMessage() ;     
            }, 3000);
        }
        $scope.msgtimeoutReset() ;
        $scope.close_msg_box = function(event) {
            var elem = $(event.target);
            elem.closest(".top_message_box").hide() ;
            $scope.resetPartialSaveAlertMessage() ; 
        };

        $scope.resetPartialSaveAlertMessage = function(){
           $scope.partialSaveAlertMessage.message = '' ;
           $scope.partialSaveAlertMessage.isErrorMsg = 0 ;
        }

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

        $scope.checkForPastDate = function(startDate, endDate) {
            var endDate = moment(endDate).format("MM/DD/YYYY");
            return  moment().isAfter(endDate, 'day')
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
                        if(moment().isAfter(campaignStartTime, 'day')) {
                            campaignStartTime = moment().format('MM/DD/YYYY');
                        }
                        var campaignEndTime = moment($scope.workflowData['campaignData'].endTime).format("MM/DD/YYYY");
                        //startDateElem.datepicker("setStartDate", campaignStartTime);
                        //startDateElem.datepicker("setEndDate", campaignEndTime);
                        if(window.location.href.indexOf("adGroup")>-1)
                        {
                            startDateElem.datepicker("setStartDate", moment(localStorage.getItem("stTime")).format('MM/DD/YYYY'));
                            startDateElem.datepicker("setEndDate", moment(localStorage.getItem("edTime")).format('MM/DD/YYYY'));
                        }else{
                            startDateElem.datepicker("setStartDate", campaignStartTime);
                            startDateElem.datepicker("setEndDate", campaignEndTime);
                        }
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
               if(localStorage.getItem("networkUser")=="true")
                    $scope.workflowData['unitTypes'] = [{id: 1, name: 'CPM'}, {id: 2, name: 'CPC'}, {id: 3, name: 'CPA'}];
                else
                    $scope.workflowData['unitTypes'] = [{id: 1, name: 'CPM'}];
            },

            fetchPlatforms: function () {
                $scope.workflowData['platforms'] = [{id: 1, name: 'Collective Bidder'}, {id: 2, name: 'Appnexus'}];
            },

            saveAds: function (postDataObj) {
                    //console.log(window.location.href);
                if(window.location.href.indexOf("adGroup")>-1)
                {
                    postDataObj.adGroupId=$scope.adGroupId;console.log(postDataObj);
                }//save adGroup Ad


                if ($scope.adId) {
                    postDataObj['adId'] = $scope.adId;
                    postDataObj['updatedAt'] = $scope.updatedAt;
                    postDataObj['state'] = $scope.state;

                }
                var promiseObj = $scope.adId ? workflowService.updateAd(postDataObj) : workflowService.createAd(postDataObj);
                promiseObj.then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.state = responseData.state;
                        $scope.adId = responseData.id;
                        $scope.updatedAt = responseData.updatedAt;
                        $scope.partialSaveAlertMessage.message = $scope.textConstants.PARTIAL_AD_SAVE_SUCCESS ;
                        $scope.partialSaveAlertMessage.isErrorMsg = 0 ;
                        $scope.msgtimeoutReset() ;
                        if ($scope.state && $scope.state.toLowerCase() === 'ready') {
                            var url = '/campaign/' + result.data.data.campaignId + '/overview';
                            $location.url(url);
                            localStorage.setItem( 'topAlertMessage', $scope.textConstants.AD_CREATED_SUCCESS );
                        }
                    }
                }, function() {
                    $scope.partialSaveAlertMessage.message = $scope.textConstants.PARTIAL_AD_SAVE_FAILURE ;
                    $scope.partialSaveAlertMessage.isErrorMsg = 1 ;
                    $scope.msgtimeoutReset() ;
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
            var idx;
            if (screenTypeFound.length > 0) {
                for(var k in $scope.adData.screenTypes){
                    if($scope.adData.screenTypes[k].name==screenTypeObj.name)
                    idx=k;
                }
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
                 if(window.location.href.indexOf("adGroup")>-1)
                {
                    endDateElem.datepicker("setEndDate", moment(localStorage.getItem("edTime")).format('MM/DD/YYYY'));
                }else{
                    endDateElem.datepicker("setEndDate", campaignEndTime);
                }
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
        $(".masterContainer").on('shown.bs.tab', '.leftNavLink', function (e) {
            $('.leftNavLink').parents("li").removeClass('active');
            $(this).parents('li').addClass('active');

            var target = $(this).attr('href');
            $("#myTabs").find(target + "-tab").closest("li").addClass("active");
            $(target).css('bottom', '-' + $(window).width() + 'px');
            var bottom = $(target).offset().bottom;
            $(target).css({bottom: bottom}).animate({"bottom": "0px"}, "10");
            $scope.$broadcast('closeAddCreativePage');
        });


        $scope.showCreateNewWindow=function(){
            $("#formCreativeCreate")[0].reset();
            $scope.isAddCreativePopup = true;
            /*enable cancel, save button on load*/
            $scope.disableCancelSave=false;
            $(".newCreativeSlide .popCreativeLib").show().delay( 300 ).animate({left: "50%" , marginLeft: "-307px"}, 'slow');
            $("#creative").delay( 300 ).animate({minHeight: "950px"}, 'slow');
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
                //postAdDataObj.state = $scope.workflowData['campaignData'].status;


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

               postAdDataObj['targets'] ={};
                if($scope.adData.geoTargetingData) {
                    var postGeoTargetObj = postAdDataObj['targets']['geoTargets'] = {}


                    var buildGeoTargetingParams = function(data, type) {
                        var obj= {};
                        obj['isIncluded'] = _.uniq(_.pluck(data, type+'Included'))[0];
                        obj['geoTargetList'] = _.pluck(data, 'id');
                        return obj;
                    }

                    var geoTargetData = $scope.adData.geoTargetingData;
                    if (geoTargetData.regions.length > 0) {
                        postGeoTargetObj['REGION'] = buildGeoTargetingParams(geoTargetData.regions, 'regions');
                    }

                    if (geoTargetData.cities.length > 0) {
                        postGeoTargetObj["CITY"] = buildGeoTargetingParams(geoTargetData.cities, 'cities');
                    }

                    if (geoTargetData.dmas.length > 0) {
                        postGeoTargetObj["DMA"] = buildGeoTargetingParams(geoTargetData.dmas, 'dmas');
                    }

                    if($scope.adData.geoTargetingData.zip.length > 0) {
                        var zipObj = $scope.adData.geoTargetingData.zip;
                        var zipPostArr = [];
                        _.each(zipObj, function(zipArr) {
                            if(zipArr.added) {
                                _.each(zipArr.added, function(obj) {
                                    var arr = obj.split("-");
                                    if(arr.length > 1) {
                                        var start = Number(arr[0]), end = Number(arr[1]);
                                        for(var i=start; i<=end;i++) {
                                            zipPostArr.push(String(i));
                                        }
                                    } else {
                                        zipPostArr.push(arr[0]);
                                    }
                                })
                            }
                        })
                        postGeoTargetObj['ZIPCODE'] = {
                            "isIncluded" :  true,
                            "geoTargetList" : zipPostArr

                        }
                    }
                }

                if($scope.adData.inventory) {
                    var domainTargetObj = postAdDataObj['targets']['domainTargets'] = {};
                    domainTargetObj['inheritedList'] = {'ADVERTISER' : $scope.adData.inventory.domainListId};
                    postAdDataObj['domainInherit'] = 'APPEND';
                    postAdDataObj['domainAction'] = $scope.adData.inventory.domainAction;
                }

                campaignOverView.saveAds(postAdDataObj)
            })
        })
        $scope.isPlatformSelected = false;

        $scope.changePlatform =  function(platformId) {
            $scope.$broadcast('renderTargetingUI', platformId)
        };

        $scope.showPopup = function () {
            if($scope.selectedArr.length>0){
                $scope.unchecking=true;
            }else{
                $scope.unchecking=false;
            }
            $scope.$broadcast('showCreativeLibrary');
        };

        $scope.removeCreativeTags =  function(clickedTagData, actionFrom) {
            var selectedCreativeTag = _.filter($scope.selectedArr, function (obj) { return obj.id === clickedTagData.id});
            $("#"+clickedTagData.id).removeAttr("checked");
            $scope.$broadcast('removeCreativeTags', [selectedCreativeTag, actionFrom]);
        };

    });

    angObj.controller('creativeTagController', function($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $scope.emptyCreativesFlag = true;
        $scope.loadingFlag = true; //loading flag

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

            getCreativesFromLibrary: function (clientID, adID, format, query) {
                workflowService.getCreatives(clientID, adID, format, query, {cache:false}).then(function (result) { $scope.creativesLibraryData['creativesData']= [];
                    if (result.status === "OK" || result.status === "success" && result.data.data.length > 0) {
                        var responseData = result.data.data;
                        $scope.creativeListLoading = false;
                        $scope.creativesLibraryData['creativesData'] = addFromLibrary.modifyCreativesData(responseData);
                    }
                    else {
                        addFromLibrary.errorHandler(result);
                        $scope.loadingFlag = false;

                    }
                }, addFromLibrary.errorHandler);
            },
            errorHandler: function (errData) {
                $scope.creativesLibraryData['creativesData'] = [];
                $scope.creativeListLoading = false;
            }
        };

        $scope.creativeSearchFunc = function() {
            var campaignId = $scope.workflowData['campaignData'].clientId;
            var advertiserId = $scope.workflowData['campaignData'].advertiserId;
            var searchVal = $scope.adData.creativeSearch;
            var qryStr = '';
            var formats = 'VIDEO,DISPLAY'
            if(searchVal.length >0) {
                qryStr += '&query='+searchVal;
            }
            addFromLibrary.getCreativesFromLibrary(campaignId, advertiserId, formats, qryStr);
        }

        $scope.$on('showCreativeLibrary', function() {
            var campaignId = $scope.workflowData['campaignData'].clientId;
            var advertiserId = $scope.workflowData['campaignData'].advertiserId;
            $scope.showHidePopup = true;
            $scope.creativeListLoading = true;
            addFromLibrary.getCreativesFromLibrary(campaignId, advertiserId, $scope.adData.adFormat.toUpperCase());
        })

        $scope.saveCreativeTags = function () {
            $scope.showHidePopup = false; //console.log("xyzData:");console.log($scope.xyz);
            $scope.preDeleteArr = [];
            $scope.changeStatus();
            $scope.updateCreativeData($scope.selectedArr);
        };

        $scope.closePop = function () {
            $scope.showHidePopup = false; //console.log("xyzData:");console.log($scope.xyz);
            $scope.changeStatus();
            if($scope.preDeleteArr.length > 0){
                _.each($scope.preDeleteArr,function(obj){
                    obj.checked = true;
                    $scope.selectedArr.push(obj);
                    $("#"+obj.id).attr('checked',true);
                })
            }
            $scope.selectedArr = _.uniq($scope.selectedArr);
            $scope.updateCreativeData($scope.selectedArr);
        };

        $scope.changeStatus = function(){
            _.each($scope.selectedArr,function(obj){
                obj['checked'] = obj['userSelectedEvent'];
            })
        }

        $scope.updateCreativeData = function(data) {
            $scope.creativeData['creativeInfo'] = {'creatives' : data.slice() };
            $scope.setSizes($scope.creativeData['creativeInfo']);// set sizes on side bar.
        };
        $scope.setSizes = function (selectedcreatives) {
            if (typeof selectedcreatives.creatives != 'undefined') {
                if (selectedcreatives.creatives.length == 1) {
                    $scope.sizeString = selectedcreatives.creatives[0].size.size;
                } else if (selectedcreatives.creatives.length > 1) {
                    $scope.sizeString = "";
                    for (var i in selectedcreatives.creatives) {
                        $scope.sizeString += selectedcreatives.creatives[i].size.size + ",";
                    }
                    $scope.sizeString = $scope.sizeString.substring(0, $scope.sizeString.length - 1);
                }
            } else {
                $scope.sizeString = constants.WF_NOT_SET;
            }
            $scope.adData.setSizes = $scope.sizeString;
        }

        $scope.$on('removeCreativeTags', function($event, arg){
            //$scope.xyz=$scope.selectedArr;
            var selectedCreativeTag = arg[0]
            var actionFrom = arg[1];
            if (selectedCreativeTag.length > 0) {
                var idx = _.findLastIndex($scope.selectedArr, selectedCreativeTag[0]);
                $scope.selectedArr.splice(idx, 1);
                if(actionFrom !== 'popup') {
                    $scope.updateCreativeData($scope.selectedArr)
                }
            }
            var currIndx = _.findLastIndex($scope.creativesLibraryData['creativesData'], {'id' : selectedCreativeTag[0].id});
            $scope.creativesLibraryData['creativesData'][currIndx]['checked'] = false;
            /*Enable save button of popup library if elements exists*/
        })

        $scope.stateChanged = function ($event, screenTypeObj) { // console.log("selected array in state Changed: ");console.log($scope.selectedArr);
                                                                 // console.log("xyz array in state Changed: ");console.log($scope.xyz);

            var checkbox = $event.target;
            screenTypeObj.userSelectedEvent =  checkbox.checked; // temporary user old selected status before cancel
            //screenTypeObj['checked'] = checkbox.checked;

            var selectedChkBox = _.filter($scope.selectedArr, function (obj) {
                return obj.id === screenTypeObj.id
            });

            if (selectedChkBox.length > 0) {
                var idx = _.findIndex($scope.selectedArr, function(item) {
                    return item.id == screenTypeObj.id });
                var preidx = _.findIndex($scope.preDeleteArr, function(item) {
                    return item.id == screenTypeObj.id });

                $scope.selectedArr.splice(idx, 1);
                if(preidx == -1)
                    $scope.preDeleteArr.push(screenTypeObj);

            } else {
                $scope.selectedArr.push(screenTypeObj);
            }

            /*Enable save button of popup library if elements exists*/
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
        var regionListSortOrder = 'asc';
        var cityListSortOrder = 'asc';
        var dmaListSortOrder = 'asc';
        $scope.isRegionSelected = true;
        $scope.citiesIncluded = true;
        $scope.dmasIncluded = true;
        $scope.addedTargeting = true;

        $scope.$on('renderTargetingUI', function(event, platformId) {
            $scope.isPlatformId = platformId;
            $scope.isPlatformSelected = platformId ? true : false;
            $scope.resetTargetingVariables();
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
                workflowService.getRegionsList(parmas.platformId, qryStr , function (result) {
                    var responseData = result.data.data;
                    callback && callback(responseData);
                }, function(error) {
                    console.log("error");
                });
            },

            getCitiesList : function(parmas, callback) {
                var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);
                workflowService.getCitiesList(parmas.platformId, qryStr,function (result) {
                    var responseData = result.data.data;
                    callback && callback(responseData);
                },function(error){
                    console.log("error")
                });
            },

            getDMAsList : function(parmas, callback) {
                var qryStr = '?sortBy=name' + geoTargetingView.buildUrlParams(parmas);
                workflowService.getDMAsList(parmas.platformId, qryStr,function (result) {
                    var responseData= result.data.data;
                    _.each(responseData, function(data) {
                        data.region = $.trim(data.name.substring(data.name.lastIndexOf(" ")))
                        data.dmaName = $.trim(data.name.substring(0, data.name.lastIndexOf(" ")) )
                    })
                    callback && callback(responseData);
                },function(error){
                    console.log("error")
                });
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
                $scope.geoTargetingData.selected[type].push(item);
            } else {
                for(var i=0 ; i < $scope.geoTargetingData.selected[type].length; i++) {
                    if($scope.geoTargetingData.selected[type][i].id == item.id){
                        $scope.geoTargetingData.selected[type].splice(i,1);
                    }
                }
            }
            //console.log($scope.geoTargetingData.selected);
            $scope.includeorExcludeCityOnly(type);
        };

        $scope.resetTargetingVariables = function() {
            $scope.geoTargetingData['selected'] = {};
            $scope.geoTargetingData['selected']['regions']=[];
            $scope.geoTargetingData['selected']['cities']=[];
            $scope.geoTargetingData['selected']['dmas']=[];
            $scope.geoTargetingData['selected']['zip'] = [];
            $scope.dmasIncludeSwitchLabel =  true;
            $scope.isRegionSelected = true;
            $scope.citiesIncluded = true;
            $scope.addedTargeting = true;
            $scope.dmasIncluded = true;
            $scope.adData.geoTargetName = null;
            citiesListArray.length = 0;
            regionsListArray.length = 0;
            dmasListArray.length =0;
            getSwitchElem('on');
        }

        $scope.resetTargetingVariables();

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
                var selectedCities = $scope.geoTargetingData.selected[type];
                var selectedRegions = $scope.geoTargetingData.selected['regions'];
                var selectedCities = $scope.geoTargetingData.selected['cities'];
                $scope.showCitiesOnly = true;
                if(selectedRegions.length === 0  && selectedCities.length > 0) {
                    $scope.isRegionSelected =  false;
                } else {

                    _.each(selectedRegions, function(regionsObj) {
                        var tmpArr= [];
                        if(selectedCities.length > 0){
                            _.each(selectedCities, function(citiesObj, idx) {
                                if(citiesObj.parent.id === regionsObj.id) {
                                    $scope.showCitiesOnly = false;
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
            if (type === 'regions') {
                citiesListArray.length =0;
                $scope.listCities();

                var removeFromSelectedCityArr =  function(cityObj) {
                    var selectedCities = $scope.geoTargetingData['selected']['cities'];
                    var pos = _.findIndex(selectedCities, cityObj);
                    selectedCities.splice(pos, 1);
                }

                for (var j = 0; j < selectedItem.length; j++) {
                    if(selectedItem[j].cities && selectedItem[j].cities.length >0) {
                        for(var k=0; k < selectedItem[j].cities.length>0; k++) {
                            removeFromSelectedCityArr(selectedItem[j].cities[k]);
                            if (selectedItem[j].cities[k].id == item.id) {
                                selectedItem[j].cities.splice(k, 1);
                            }
                        }
                    }
                }
            }

            if(type ==='zip') {
                if($scope.zipCodesObj)  $scope.zipCodesObj = [];
            }
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

            elem.css( {position:"absolute", top:top_pos, left: left_pos});
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
        };

        $scope.listDmas = function(defaults) {
            $scope.dmasListObj = {
                 platformId : $scope.isPlatformId,
                 sortOrder : dmaListSortOrder,
                 pageNo :1,
                 pageSize : 25
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
             });
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
        $scope.listCities = function(event, defaults) {
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
                pageSize :25,
                pageNo : 1
            }

            if(searchVal != undefined && searchVal.length > 0) {
                $scope.citiesListObj = {
                    platformId : $scope.isPlatformId,
                    sortOrder :cityListSortOrder,
                    pageSize :25,
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
            });
        }

        $scope.loadMoreCities = function() {
            if($scope.citiesListObj) {
                $scope.cityFetching = true;
                $scope.citiesListObj['pageNo'] = $scope.citiesListObj['pageNo'] + 1;
                $scope.listCities(null, $scope.citiesListObj);
            }
        }

        $scope.listRegions = function(defaults, event) {
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
                pageSize : 25,
                pageNo : 1
            }

            if(searchVal != undefined && searchVal.length > 0) {
                $scope.regionListObj = {
                    platformId : $scope.isPlatformId,
                    sortOrder :regionListSortOrder,
                    pageSize :25,
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
            if(geoTargetName.toLowerCase() === 'geography' && !$scope.adData.geoTargetName) {
                $scope.adData.geoTargetName = geoTargetName;
                $scope.addedTargeting = false;
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
                $scope.regionListObj['pageNo'] = '';
                $scope.regionListObj['pageSize'] = '';

                if(searchVal.length > 0) {
                    $scope.regionListObj['query'] = searchVal;
                }
                $scope.listRegions($scope.regionListObj);
            }

            if(searchType === 'cities') {
                citiesListArray.length =0;
                $scope.citiesListObj['query'] = '';
                $scope.citiesListObj['pageNo'] = '';
                $scope.citiesListObj['pageSize'] = '';
                if(searchVal.length > 0) {
                    $scope.citiesListObj['query'] = searchVal;
                }
                $scope.listCities(null, $scope.citiesListObj);
            }

            if(searchType === 'dmas') {
                dmasListArray.length = 0;
                $scope.dmasListObj['query'] = '';
                $scope.dmasListObj['pageNo'] = '';
                $scope.dmasListObj['pageSize'] = '';
                if(searchVal.length > 0) {
                    $scope.dmasListObj['query'] = searchVal;
                }
                $scope.listDmas($scope.dmasListObj);
            }
        }



        $scope.hideConfirmBox = function() {
            $scope.showConfirmBox = false;
        };

        $scope.showGeographyTabsBox = function(event, tabType, showPopup) {
            $('.searchBox').val('');
            if(tabType === 'zip' && showPopup) {
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
            $scope.addedTargeting = true;
            if($scope.zipCodesObj) {
                $scope.zipCodesObj = [];
            }
            $scope.adData.zipCodes = '';
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
            $scope.geoTargetingData.selected['previewData'] = obj;
            $scope.adData.geoTargetingData = $scope.geoTargetingData.selected;

            $(".targettingFormWrap").slideUp();
            $(".targettingSelected").show();

        };

        $scope.editGeography =  function() {
            $(".targettingFormWrap").slideDown();
            $(".targettingSelected").hide();
            $scope.addedTargeting = false;
        };

        $scope.deleteGeography = function() {
            $(".targettingSelected").hide();
            $(".targettingFormWrap").slideDown();
            $scope.resetTargetingVariables();
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
                        $scope.citiesIncludeSwitchLabel =  false;
                        $scope[$scope.selectedTab+'Included'] = false;
                    }
                    else {
                        $scope.citiesIncludeSwitchLabel =  true; // may not be required
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
            $scope.adData.geoTargetName = null;
            $scope.addedTargeting = true;
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
    });

    angObj.controller('InventoryFiltersController', function($scope, $window, $routeParams, constants, workflowService, Upload, $timeout,  utils, $location) {

        $scope.prarentHandler = function(clientId, clientName, advertiserId, advertiserName) {
            $scope.clientId = clientId;
            $scope.advertiserId =  advertiserId;
            InventoryFiltersView.getAdvertisersDomainList(clientId, advertiserId)
        };

        $scope.showDomainListPopup = false;
        $scope.adData.inventoryType = 'Whitelist';

        $scope.inventoryAdsData = {};

          var InventoryFiltersView = {
              getAdvertisersDomainList : function(clientId, advertiserId) {
                  workflowService.getAdvertisersDomainList(clientId, advertiserId).then(function (result) {
                      $scope.workflowData['inventoryData'] = result.data.data;
                  });
              },
          }

        $scope.selectFiles = function(files) {
            if(files  != null && files.length >0) {
                $scope.showDomainListPopup = true;
                $scope.adData.listName = $scope.adData.inventory && $scope.adData.inventory.name;
                $scope.files = files;
            }
        }

        $scope.uploadDomain = function () {
            var domainId =  $scope.adData.inventory && $scope.adData.inventory.id || null;
            var files  = $scope.files;
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (!file.$error) {
                        Upload.upload({
                            url: workflowService.createAdvertiseDomainList($scope.clientId, $scope.advertiserId, domainId),
                            fields: {
                                'name': $scope.adData.listName,
                                'domainAction' : $scope.adData.inventoryType.toLowerCase() === 'blacklist' ? 'EXCLUDE' : 'INCLUDE',
                                'updatedAt' : $scope.adData.inventory ? $scope.adData.inventory.updatedAt : ''
                            },
                            fileFormDataName : 'domainList',
                            file: file,
                            method : domainId ? 'PUT' : "POST"
                        }).progress(function (evt) {
                            $scope.domainUploadInProgress =  true;
                        }).success(function (response, status, headers, config) {
                            if(config.method === 'PUT') {
                                $scope.adData.inventory.domainList = response.data.domainList;
                            } else {
                                $scope.workflowData['inventoryData'].push(response.data);
                            }
                            $scope.domainUploadInProgress = false;
                            $scope.showDomainListPopup = false;
                        });
                    }
                }
            }
        };


        $scope.closeDomainListPop = function() {
            $scope.showDomainListPopup = false;
        }
    });

})();

