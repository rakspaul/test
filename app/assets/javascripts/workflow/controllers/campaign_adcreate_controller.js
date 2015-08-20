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
        $scope.dataFromCreativeLibraryNotFound = true;
        $scope.enableSaveBtn=true;
        $scope.isAddCreativePopup = false;
        $scope.IsVisible = false;//To show hide view tag in creatives listing

        $scope.ShowHide = function (context) {
            //If DIV is visible it will be hidden and vice versa.
            context.IsVisible = context.IsVisible ? false : true;
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


        var campaignOverView = {
            initiateDatePicker : function() {
                $('.input-daterange').datepicker({
                    format: "mm/dd/yyyy",
                    orientation: "top auto",
                    autoclose: true,
                    todayHighlight: true
                });
            },
            getCampaignData: function (campaignId) {
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;
                        campaignOverView.initiateDatePicker();
                        var startDateElem = $('#startDateInput');
                        var campaignStartTime = moment($scope.workflowData['campaignData'].startTime).format("MM/DD/YYYY");
                        var campaignEndTime = moment($scope.workflowData['campaignData'].endTime).format("MM/DD/YYYY");
                        startDateElem.datepicker("setStartDate", campaignStartTime);
                        startDateElem.datepicker("setEndDate", campaignEndTime);
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

        // Buying Platform Views
        $('.clickCm, .clickCb, .clickNx').click(function () {
            $('.buyingPlatformHolder').toggle();
        });
        // Collective Media-Buying Platform Views
        $('.clickCm').click(function () {
            $('.collectMediaScreenHolder').toggle();
        });
        // Collective Bidder-Buying Platform Views
        $('.clickCb').click(function () {
            $('.collectBidderScreenHolder').toggle();
        });
        // Nexus-Buying Platform Views
        $('.clickNx').click(function () {
            $('.collectNexusScreenHolder').toggle();
        });
        // Change-Buying Platform Views
        $('.editPlatform').click(function () {
            $('.buyingPlatformHolder').toggle();
            $('.collectMediaScreenHolder, .collectBidderScreenHolder, .collectNexusScreenHolder').hide();
        });
        // Show Hide Preset Values
        $('.showPreset').click(function () {
            $('.presetGreyBox').slideToggle();
        });

        // Create AD Tab Animation
        $('.leftNavLink').on('shown.bs.tab', function (e) {
            $('.leftNavLink').parents("li").removeClass('active');
            $(this).parents('li').addClass('active');

            var target = $(this).attr('href');
            $("#myTabs").find(target + "-tab").closest("li").addClass("active");
            $(target).css('bottom', '-' + $(window).width() + 'px');
            var bottom = $(target).offset().bottom;
            $(target).css({bottom: bottom}).animate({"bottom": "0px"}, "10");
        });


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
            $scope.isAddCreativePopup = true;
            $(".newCreativeSlide .popCreativeLib").delay( 300 ).animate({left: "50%" , marginLeft: "-307px"}, 'slow');
            $("#creative").delay( 300 ).animate({minHeight: "950px"}, 'slow');
        }
        
        $scope.closeBtnCreative=function(){
            $(".newCreativeSlide .popCreativeLib").delay( 300 ).animate({left: "100%" , marginLeft: "0px"}, 'slow');
            $("#creative").delay( 300 ).animate({minHeight: "530px"}, 'slow');
        }

        function getfreqCapParams(formData) {

            var freq_cap = [];
            var targetType =  formData.budgetType.toLowerCase === 'budget' ? 'ALL' : 'PER_USER';
            var freqDefaultCapObj = {'frequencyType':'DAILY','quantity':100};
            freqDefaultCapObj['capType'] = formData.budgetType.toUpperCase();
            freqDefaultCapObj['pacingType'] = formData.pacingType;
            freqDefaultCapObj['targetType'] = targetType;
            freqDefaultCapObj['quantity'] = 100;;

            freq_cap.push(freqDefaultCapObj);
            var isSetCap = formData.setCap === 'true' ? true : false;
            if(isSetCap) {
                var selectedfreqObj = {};
                selectedfreqObj['capType'] = formData.budgetType.toUpperCase();
                selectedfreqObj['frequencyType'] = formData.frequencyType;
                selectedfreqObj['quantity'] = Number(formData.quantity);
                selectedfreqObj['targetType'] = targetType;
                selectedfreqObj['pacingType'] = formData.pacingType;
                freq_cap.push(selectedfreqObj);
            }
            return freq_cap;
        }

        $(function () {


            $("#SaveAd").on('click', function () {
                var formElem = $("#formAdCreate");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                var creativesData = $scope.creativeData['creativeInfo'];
                var postAdDataObj = {};
                postAdDataObj.name = formData.adName;
                postAdDataObj.campaignId = Number($scope.campaignId);
                postAdDataObj.state = $scope.workflowData['campaignData'].status;


                if (formData.adFormat)
                    postAdDataObj.adFormat = formData.adFormat.toUpperCase();

                if (formData.screens)
                    postAdDataObj.screens = JSON.parse(formData.screens);

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

                postAdDataObj.frequencyCaps = getfreqCapParams(formData);

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
                    postAdDataObj['creatives'] = creativesData.creatives;

                }
                campaignOverView.saveAds(postAdDataObj)


            })
        })

    });
})();

