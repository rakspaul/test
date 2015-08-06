var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignAdsCreateController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData= {}
        $scope.adData.screenTypes =[];

        $scope.campaignId = $routeParams.campaignId;

        $scope.getAdFormatIconName = function(adFormat) {
            var adFormatMapper = {'display' : 'picture', 'video' : 'film', 'rich media' : 'paperclip', 'social' : 'user' }
            return adFormatMapper[adFormat.toLowerCase()];
        }

        $scope.getScreenTypeIconName = function(screenType) {
            var screenTypeMapper = {'desktop' : 'phone', 'mobile' : 'phone', 'tablet' : 'phone'}
            return screenTypeMapper[screenType.toLowerCase()];
        }

        $scope.getGoalIconName = function(goal) {
            var goalMapper = {'performance' : 'signal', 'brand' : 'record'}
            return goalMapper[goal.toLowerCase()];
        }

        $scope.getPlatformIconName = function(platform) {
            var platformMapper = {'collective bidder' : 'logo_C_bidder', 'appnexus' : 'logo_C_appnexus'}
            return platformMapper[platform.toLowerCase()];
        }

        var campaignOverView = {
            getCampaignData :  function(campaignId) {
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;

                        var startDateElem = $('#startDateInput');
                        var campaignStartTime =  moment($scope.workflowData['campaignData'].startTime).format("MM/DD/YYYY");
                        var campaignEndTime =  moment($scope.workflowData['campaignData'].endTime).format("MM/DD/YYYY");
                        startDateElem.datepicker("setStartDate", campaignStartTime);
                        startDateElem.datepicker("setEndDate", campaignEndTime);
                    }
                    else{
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            fetchGoals :  function() {
                $scope.workflowData['goals'] = [{id : 1, name : 'Performance'}, {id : 2, name : 'Brand'}]
            },

            fetchAdFormats :  function() {
                $scope.workflowData['adFormats'] = [{id : 1, name : 'Display', disable:false}, {id : 2, name : 'Video', disable : true}, {id : 3, name : 'Rich Media', disable : true}, {id : 4, name : 'Social', disable : true}]
            },

            fetchScreenType:  function() {
                $scope.workflowData['screenTypes'] = [{id : 1, name : 'Desktop'}, {id : 2, name : 'Mobile'}, {id : 3, name : 'Tablet'}]
            },

            fetchUnitTypes:  function() {
                $scope.workflowData['unitTypes'] = [{id :1 , name: 'CPM'}, {id: 2, name :'CPC'}, {id:3, name:'CPA'}];
            },

            fetchPlatforms:  function() {
                $scope.workflowData['platforms'] = [{id :1 , name: 'Collective Bidder'}, {id: 2, name :'Appnexus'}];
            },

            saveAds :  function(postDataObj) {
                if($scope.adId) {
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

            errorHandler : function(errData) {
                console.log(errData);
            }
        }

        $scope.utc = function(date) {
            return Date.parse(date)
        }

        campaignOverView.getCampaignData($routeParams.campaignId);
        campaignOverView.fetchAdFormats();
        campaignOverView.fetchGoals();
        campaignOverView.fetchScreenType();
        campaignOverView.fetchUnitTypes();
        campaignOverView.fetchPlatforms();


        $scope.screenTypeSelection = function(screenTypeObj) {
            var screenTypeFound = _.filter($scope.adData.screenTypes, function(obj) { return obj.name === screenTypeObj.name});
            if(screenTypeFound.length >0) {
                var idx = _.findLastIndex($scope.adData.screenTypes, screenTypeObj);
                $scope.adData.screenTypes.splice(idx, 1);

            } else {
                $scope.adData.screenTypes.push(screenTypeObj);
            }
        }

        $scope.handleFlightDate = function(data) {
            var startTime = data.startTime;
            var endDateElem = $('#endDateInput');
            var campaignEndTime =  moment($scope.workflowData['campaignData'].endTime).format("MM/DD/YYYY");
            var changeDate;
            endDateElem.attr("disabled","disabled").css({'background':'#eee'});
            if(startTime) {
                endDateElem.removeAttr("disabled").css({'background':'transparent'});
                changeDate = moment(startTime).format('MM/DD/YYYY')
                endDateElem.datepicker("setStartDate", changeDate);
                endDateElem.datepicker("setEndDate", campaignEndTime);
                endDateElem.datepicker("update", changeDate);
            }

        }
    
        $(function() {
            $('.input-daterange').datepicker({
                format: "mm/dd/yyyy",
                orientation: "top auto",
                autoclose: true,
                todayHighlight: true
            });

            $("#SaveAd").on('click',function() {
                var formElem = $("#formAdCreate");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                var postAdDataObj = {};
                postAdDataObj.name = formData.adName;
                postAdDataObj.campaignId = Number($scope.campaignId);
                postAdDataObj.state =  $scope.workflowData['campaignData'].status;

                if(formData.adFormatId)
                    postAdDataObj.adFormatId = Number(formData.adFormatId);

                if(formData.screens)
                    postAdDataObj.screens = JSON.parse(formData.screens);

                if(formData.goal)
                    postAdDataObj.goal = formData.goal;

                if(formData.startTime)
                    postAdDataObj.startTime = moment(formData.startTime).format('YYYY-MM-DD');

                if(formData.endTime)
                    postAdDataObj.endTime = moment(formData.endTime).format('YYYY-MM-DD');

                if(formData.unitType && formData.unitCost) {
                    postAdDataObj.rateType = formData.unitType
                    postAdDataObj.rateValue = formData.unitCost;
                }

                if(formData.budgetType && formData.budgetValue1) {
                    postAdDataObj.budgetType = formData.budgetType
                    postAdDataObj.budgetValue = Number(formData.budgetValue1);
                }

                if(formData.platformId) {
                    postAdDataObj.platformId = Number(formData.platformId);
                }

                campaignOverView.saveAds(postAdDataObj)


            })
        })

        // Switch BTN Animation
        $('.btn-toggle').click(function(){
            $(this).find('.btn').toggleClass('active');

            if ($(this).find('.btn-primary').size()>0) {
                $(this).find('.btn').toggleClass('btn-primary');
            }
            if ($(this).find('.btn-success').size()>0) {
                $(this).find('.btn').toggleClass('btn-success');
            }
            $(this).find('.btn').toggleClass('btn-default');
        });

        // Buying Platform Views
        $('.clickCm, .clickCb, .clickNx').click(function(){
            $('.buyingPlatformHolder').toggle();
        });
        // Collective Media-Buying Platform Views
        $('.clickCm').click(function(){
            $('.collectMediaScreenHolder').toggle();
        });
        // Collective Bidder-Buying Platform Views
        $('.clickCb').click(function(){
            $('.collectBidderScreenHolder').toggle();
        });
        // Nexus-Buying Platform Views
        $('.clickNx').click(function(){
            $('.collectNexusScreenHolder').toggle();
        });
        // Change-Buying Platform Views
        $('.editPlatform').click(function(){
            $('.buyingPlatformHolder').toggle();
            $('.collectMediaScreenHolder, .collectBidderScreenHolder, .collectNexusScreenHolder').hide();
        });
        // Show Hide Preset Values
        $('.showPreset').click(function(){
            $('.presetGreyBox').slideToggle();
        });

        // Create AD Tab Animation
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            $('a[data-toggle="tab"]').parents("li").removeClass('active');
            $(this).parents('li').addClass('active');
            
            var target = $(this).attr('href');
            $("#myTabs").find( target + "-tab" ).closest("li").addClass("active") ;
            $(target).css('bottom','-'+$(window).width()+'px');
            var bottom = $(target).offset().bottom;
            $(target).css({bottom:bottom}).animate({"bottom":"0px"}, "10");
        });
        
    });
})();

