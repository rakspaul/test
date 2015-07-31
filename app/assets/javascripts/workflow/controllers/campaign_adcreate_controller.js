var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignAdsCreateController', function ($scope, $window, $routeParams, constants, workflowService, $timeout) {
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData= {}
        $scope.adData.screenType =[]

        $scope.getAdFormatIconName = function(adFormat) {
            var adFormatMapper = {'display' : 'picture', 'video' : 'film', 'rich media' : 'paperclip', 'social' : 'user' }
            return adFormatMapper[adFormat];
        }

        $scope.getScreenTypeIconName = function(screenType) {
            var screenTypeMapper = {'desktop' : 'phone', 'mobile' : 'phone', 'tablet' : 'phone'}
            return screenTypeMapper[screenType];
        }

        $scope.getGoalIconName = function(goal) {
            var goalMapper = {'performance' : 'signal', 'brand' : 'record'}
            return goalMapper[goal];
        }

        var campaignOverView = {
            getCampaignData :  function(campaignId) {
                console.log("campaignId"+campaignId);
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;
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


        $scope.screenTypeSelection = function(screenTypeObj) {
            //$scope.adData.screenType screenTypeObj.name

            var idx = $scope.adData.screenType.indexOf(screenTypeObj.name);

            // is currently selected
            if (idx > -1) {
                $scope.adData.screenType.splice(idx, 1);
            }
          else {
                $scope.adData.screenType.push(screenTypeObj.name);
            }
            console.log($scope.adData.screenType);
        }

        $scope.handleFlightDate = function(data) {
            var startTime = data.startTime;
            var endDateElem = $('#endFlight')
            var changeDate;
            changeDate =  moment(startTime).format('MM/DD/YYYY')
            endDateElem.datepicker("setStartDate", changeDate);
            endDateElem.datepicker("update", changeDate);

        }
        $(function() {
            $('.input-daterange').datepicker({
                format: "mm/dd/yyyy",
                orientation: "top auto",
                autoclose: true,
                todayHighlight: true
            });

            var startDateElem = $('#startFlight');
            var today =  moment().format("MM/DD/YYYY");
            startDateElem.datepicker("setStartDate", today);
            startDateElem.datepicker("update", today);

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


    });
})();

