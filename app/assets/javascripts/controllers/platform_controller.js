var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('platformController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout) {
        domainReports.setCampaignTab();
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.filters = domainReports.getReportsTabs();
        $scope.api_return_code = 200;

        $scope.getMessageForDataNotAvailable = function (dataSetType) {
            if ($scope.api_return_code == 404 || $scope.api_return_code >=500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            }
            if ( campaignSelectModel.durationLeft() == 'Yet to start')
                return constants.MSG_CAMPAIGN_YET_TO_START;
            else if (campaignSelectModel.daysSinceEnded() > 1000)
                return constants.MSG_CAMPAIGN_VERY_OLD;
            else if ( $scope.selectedCampaign.kpi =='null')
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };

        $scope.selected_tab = 'performance';

        var platform_icon_map= {
            'Facebook':'',
            'Everyscreen Media':'assets/images/platform_logos/dstillery_logo.png',
            'ATT Network':'https://www.att.com/favicon.ico',
            'DoubleClick':'assets/images/platform_logos/double_logo.png',
            'AppNexus':'assets/images/platform_logos/appnexus_logo.png',
            'Telemetry':'assets/images/platform_logos/telemetry_logo.png',
            'Collective Bidder':'assets/images/platform_logos/collective_logo.png',
            'Collective Publishers':'assets/images/platform_logos/collective_logo.png',
            'Adap.tv':'https://adap.tv/favicon.ico',
            'Google Ad Exchange':'assets/images/platform_logos/double_logo.png',
            'Prog_Mechanics':'',
            'Yahoo Ad Exchange':'https://www.yahoo.com/favicon.ico',
            'TriVu Media - YouTube':'assets/images/platform_logos/trivumedia_logo.png',
            'Admeld':'assets/images/platform_logos/double_logo.png',
            'Beanstock':'assets/images/platform_logos/beanstock_logo.png',
            'LiveRail':'assets/images/platform_logos/liverail_logo.png',
            'OpenX':'assets/images/platform_logos/openx_logo.png',
            'Pubmatic':'',
            'Rubicon':'assets/images/platform_logos/rubicon_logo.png',
            'Miscellaneous':'assets/images/platform_logos/platform_logo.png',
            'Collective Test Media':'assets/images/platform_logos/collective_logo.png',
            'Microsoft':'https://www.msn.com/favicon.ico'
        };

        $scope.getPlatformIcon=function(platformName) {
            var pIcon=platform_icon_map[platformName];
            return (pIcon!== undefined && pIcon!=='')  ? pIcon:platform_icon_map['Miscellaneous'];
        }

        $scope.strategyPlatformData =  function() {
            var param = {
                campaignId: $scope.selectedCampaign.id,
                strategyId: Number($scope.selectedStrategy.id),
                strategyStartDate: $scope.selectedCampaign.startDate,
                strategyEndDate: $scope.selectedCampaign.endDate,
                tab: $scope.selected_tab,
                timeFilter: $scope.selected_filters.time_filter
            }

            $scope.performanceBusy = true;
            $scope.costBusy = true;
            $scope.viewablityBusy = true;

            this.errorHandlerForPerformanceTab = function(result) {

            }

            this.getPlatformData = function() {
                $scope.api_return_code=200;
                var that = this;
                //platformService.getStrategyPlatformData(param).then(function (result) {
                    var result = {"status":"OK","status_code":200,"meta":{"host":"localhost:9010","method":"GET","path":"/api/reporting/v1/campaigns/330217/byplatforms","uri":"/api/reporting/v1/campaigns/330217/byplatforms"},"data":{"id":330217,"platform_metrics":[{"platform_type":"Exchange","platformType_aggregation":{"platform_type":"Exchange","impressions":21735,"clicks":15,"actions":0,"gross_rev":53.555,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.0006901311249137336,"cpm":2.4639981596503335,"cpc":3.570333333333333,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0},"platforms":[{"platform":"Yahoo Ad Exchange","icon_url":"https://www.yahoo.com/favicon.ico","platform_type":"Exchange","impressions":18297,"clicks":14,"actions":0,"gross_rev":44.795,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.0007651527572826146,"cpm":2.44821555446248,"cpc":3.1996428571428575,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0},{"platform":"Admeld","icon_url":"assets/images/platform_logos/double_logo.png","platform_type":"Exchange","impressions":3438,"clicks":1,"actions":0,"gross_rev":8.76,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.00029086678301337986,"cpm":2.5479930191972078,"cpc":8.76,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0}]},{"platform_type":"Unknown","platformType_aggregation":{"platform_type":"Unknown","impressions":15274,"clicks":10,"actions":0,"gross_rev":40.298,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.00065470734581642,"cpm":2.6383396621710093,"cpc":4.0298,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0},"platforms":[{"platform":"Pubmatic","icon_url":"Unknown","platform_type":"Unknown","impressions":15274,"clicks":10,"actions":0,"gross_rev":40.298,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.00065470734581642,"cpm":2.6383396621710093,"cpc":4.0298,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0}]},{"platform_type":"Network","platformType_aggregation":{"platform_type":"Network","impressions":36701,"clicks":7,"actions":0,"gross_rev":89.771,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.00019073049780659929,"cpm":2.446009645513746,"cpc":12.824428571428571,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0},"platforms":[{"platform":"Collective Test Media","icon_url":"assets/images/platform_logos/collective_logo.png","platform_type":"Network","impressions":11491,"clicks":3,"actions":0,"gross_rev":26.126,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.0002610738839091463,"cpm":2.273605430336785,"cpc":8.708666666666668,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0},{"platform":"Rubicon","icon_url":"assets/images/platform_logos/rubicon_logo.png","platform_type":"Network","impressions":25032,"clicks":4,"actions":0,"gross_rev":63.237,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.00015979546180888463,"cpm":2.526246404602109,"cpc":15.80925,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0},{"platform":"OpenX","icon_url":"assets/images/platform_logos/openx_logo.png","platform_type":"Network","impressions":178,"clicks":0,"actions":0,"gross_rev":0.408,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0,"cpm":2.292134831460674,"cpc":0,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0}]},{"platform_type":"Bidder","platformType_aggregation":{"platform_type":"Bidder","impressions":174720,"clicks":52,"actions":0,"gross_rev":480.49900000000025,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.00029761904761904765,"cpm":2.750108745421247,"cpc":9.240365384615389,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0},"platforms":[{"platform":"Collective Publishers","icon_url":"assets/images/platform_logos/collective_logo.png","platform_type":"Bidder","impressions":174720,"clicks":52,"actions":0,"gross_rev":480.49900000000025,"inventory_cost":0,"data_cost":0,"richMedia_cost":0,"ad_serving":0,"ad_verification":0,"research":0,"ias_imps_delivered":0,"ias_measurable_imps":0,"ias_viewable_imps":0,"ias_total_suspicious_imps":0,"ias_gross_revenue":0,"ias_clicks":0,"ias_actions":0,"action_rate":0,"ctr":0.00029761904761904765,"cpm":2.750108745421247,"cpc":9.240365384615389,"cpa":0,"total_imps":0,"measurable_imps_perc":0,"viewable_imps_perc":0,"susp_activity_perc":0,"total_spend":0}]}]},"message":"success"};
                    if (result.status === "OK" || result.status === "success") {
                        $scope.performanceBusy = false;
                        $scope.costBusy = false;
                        $scope.viewablityBusy = false;
                        var platform_metrics = result.data.platform_metrics;
                        $scope.strategyDataByPerformance= platform_metrics;
                        //$scope.strategyDataByCost= platform_metrics;
                        //$scope.strategyDataByViewablity= platform_metrics;


                        //$scope['strategyDataBy'+param.tab.substr(0, 1).toUpperCase() + param.tab.substr(1)]  = platform_metrics;
                        //console.log('strategyDataBy'+param.tab.substr(0, 1).toUpperCase() + param.tab.substr(1));
                        //console.log($scope['strategyDataBy'+param.tab.substr(0, 1).toUpperCase() + param.tab.substr(1)]);
                        //$scope.strategyDataByCost= platform_metrics;
                    } else {
                        that.errorHandlerForPerformanceTab(result);
                    }
                //}, that.errorHandlerForPerformanceTab(result));
            };
            this.getPlatformData();
        },

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
                $scope.strategyFound = false ;
            } else {
                $scope.strategyFound = true;
                $scope.strategyPlatformData();
            }
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();  //update the selected Campaign
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';
            $scope.isStrategyDataEmpty = false;
            $scope.createDownloadReportUrl();
            $scope.callBackStrategyChange();
        });

        $scope.resetVariables =  function() {
            $scope.performanceBusy = false;
            $scope.tacticPerformanceBusy = false ;

            $scope.costBusy = false;
            $scope.tacticCostBusy = false;

            $scope.viewablityBusy = false;
            $scope.tacticViewablityBusy = false ;

            $scope.tacticList = [];

            $scope.strategyDataByPerformance = [];
            $scope.strategyDataByCost = [];
            $scope.strategyDataByViewablity = [];

            $scope.tacticsDataListByPerformance = [];
            $scope.tacticsPerfDataListByCost = [];
            $scope.tacticsPerfDataListByViewablity = [];

            $scope.dataNotFoundForPerformance = false;
            $scope.dataNotFoundForCost = false;
            $scope.dataNotFoundForViewablity = false;
        };

        $scope.togglePlatformRow = function(e) {
            var targetRow = $(e.currentTarget);
            var platformRow = targetRow.siblings('.platform_row');
            var that;
            platformRow.toggle( "slow", function() {
                that = $(this)
                if(that.hasClass('expand')) {
                    that.removeClass('expand'); that.addClass('collapse');
                } else {
                    that.removeClass('collapse'); that.addClass('expand');
                }
            })
        };

        $scope.init= function(){
            $scope.strategyFound = false ;
            $scope.api_return_code = 200;
            $scope.isStrategyDataEmpty = false;
            $scope.strategies = {};
            $scope.resetVariables();
            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
            $scope.selected_filters.campaign_default_kpi_type =  kpiSelectModel.getSelectedKpi();
        }

        $scope.init();

        $(function() {
            $(".each_tab").click(function (event) {
                var tab_id = $(this).attr("id").split("_tab")
                $(".reports_tabs_holder").find(".active").removeClass("active");
                $(this).addClass("active");
                $(".reports_block").hide();
                $scope.selected_tab = tab_id[0].split("_")[1]
                console.log($("#reports_" + tab_id[0] + "_block"));
                $("#reports_" + tab_id[0] + "_block").show();
                $scope.callBackStrategyChange();
                event.preventDefault();
            });
        });


    });
}());