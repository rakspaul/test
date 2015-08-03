var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignAdsCreateController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData= {}
        $scope.adData.screenNames =[];
        $scope.adData.screenIds =[];

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
                console.log("campaignId"+campaignId);
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;
                        console.log($scope.workflowData['campaignData']);
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
            var idx = $scope.adData.screenNames.indexOf(screenTypeObj.name);
            if (idx > -1) {
                $scope.adData.screenNames.splice(idx, 1);
            }
          else {
                $scope.adData.screenNames.push(screenTypeObj.name);
                $scope.adData.screenIds.push(screenTypeObj.id);
            }
        }

        $scope.handleFlightDate = function(data) {
            var startTime = data.startTime;
            var endDateElem = $('#endDateInput')
            var changeDate;
            endDateElem.attr("disabled","disabled").css({'background':'#eee'});
            if(startTime) {
                endDateElem.removeAttr("disabled").css({'background':'transparent'});
                changeDate = moment(startTime).format('MM/DD/YYYY')
                endDateElem.datepicker("setStartDate", changeDate);
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

            var startDateElem = $('#startDateInput');
            var today =  moment().format("MM/DD/YYYY");
            startDateElem.datepicker("setStartDate", today);
            startDateElem.datepicker("update", today);


            $("#SaveAd").on('click',function() {
                var formElem = $("#formAdCreate");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                console.log(formData);
                var postAdDataObj = {};
                postAdDataObj.name = formData.adName;
                postAdDataObj.campaignId = Number($scope.campaignId);
                postAdDataObj.state =  $scope.workflowData['campaignData'].status;

                if(formData.adFormatId)
                    postAdDataObj.adFormatId = Number(formData.adFormatId);

                if(formData.goal)
                    postAdDataObj.goal = formData.goal;

                if(formData.startTime)
                    postAdDataObj.startTime = formData.startTime;

                if(formData.endTime)
                    postAdDataObj.endTime = formData.endTime;

                if(formData.unitType && formData.unitCost) {
                    postAdDataObj.rateType = formData.unitType
                    postAdDataObj.rateValue = formData.unitCost;
                }

                if(formData.budgetType && budgetValue1) {
                    postAdDataObj.budgetType = formData.budgetType
                    postAdDataObj.budgetValue1 = formData.budgetValue1;
                }

                if(formData.platformId) {
                    postAdDataObj.platformId = Number(formData.platformId);
                }

                console.log(postAdDataObj);

                workflowService.saveAd(postAdDataObj).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.sucessHandler(result);
                    }
                });
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
            var target = $(this).attr('href');  
              
            $(target).css('bottom','-'+$(window).width()+'px');   
            var bottom = $(target).offset().bottom;
            $(target).css({bottom:bottom}).animate({"bottom":"0px"}, "10");
        });
        
    });
})();

