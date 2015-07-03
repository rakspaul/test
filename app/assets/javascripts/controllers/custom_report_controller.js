var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('customReportController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout) {

        $scope.textConstants = constants;
        dataService.getCustomReportMetrics($scope.campaign).then(function(result) {
            var keys = ['dimensions', 'delivery_metrics', 'booked_metrics', 'engagement_metrics', 'video_metrics'];

            var jsonModifier =  function(data) {
                var arr= [];
                _.each(data, function(obj) {
                    var d  = obj.split(":");
                    arr.push({'key' : d[0], 'value' :d[1] });
                });

                return arr;
            }

            _.each(keys, function(k) {
                result.data.data[0][k] = jsonModifier(result.data.data[0][k]);
            });

            $scope.reportData = result.data.data ;

        });

        $scope.select_option = function(event) {
            var elem = $(event.target);
            if( elem.hasClass("active")  ) {
                elem.removeClass("active") ;
                elem.closest(".each_measurable_col").find(".squaredFourChkbox").prop("checked" , false ) ;
            } else {
                elem.addClass("active") ;

            }

            var total_items = elem.closest(".each_measurable_col").find(".each_option").length  ;
            var active_items = elem.closest(".each_measurable_col").find(".active").length  ;

            if( active_items > 0  ) {
                elem.closest(".each_measurable_col").find(".squaredFour").addClass("not_all_selected") ;
            } else {
                elem.closest(".each_measurable_col").find(".squaredFour").removeClass("not_all_selected") ;
            }

            if(total_items == active_items ) {
                elem.closest(".each_measurable_col").find(".squaredFourChkbox").prop("checked" , true ) ;
            } 
        };

        $scope.select_unselect_all = function(event) {
            var elem = $(event.target);
            elem.closest(".squaredFour").removeClass("not_all_selected");
            if( elem.prop("checked") ) {
                elem.closest(".each_measurable_col").find(".each_option").addClass("active") ;
            } else {
                elem.closest(".each_measurable_col").find(".each_option").removeClass("active") ;
            }
        };

        $scope.select_dropdown_option = function(event) {
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text()) ;
        };

        $scope.reset_metric_options = function(event) {
            $(".each_measurable_col .not_all_selected").removeClass("not_all_selected");
            $(".each_measurable_col .active").removeClass("active");
            $(".each_measurable_col").find(".squaredFourChkbox").prop("checked" , false ) ;
        };

        $scope.generateReport = function() {
            $scope.selectedItems = [];
            $(".report_builder_container").hide();
            $(".custom_report_response_page").show();
            var selectedElems = $(".each_measurable_col").find(".active");
            _.each(selectedElems, function(ele) {
                var el = $(ele);
                $scope.selectedItems.push({key: el.attr("id"), value : el.text()})
            });

            console.log($scope.selectedItems);

            /*dataService.getCustomReportData($scope.campaign).then(function(result) {


            });*/
        };
        //$scope.responseReportData
        //var results = {"report_id":10,"report_time":"2015-06-30 T 15:00","meta":{"host":"API","method":"GET","path":"/api/reporting/v1/reports/custom/10","uri":"/api/reporting/v1/reports/custom/10?dimensions="},"report_data":[{"dimensions":{"campaign":"Clorox Company(Clorox Company)-FY16 JAS CTP Toiletwand (C/BC)"},"metrics":{"delivery_metrics":{"impressions":172799,"clicks":6,"ctr":0.003,"post_imp_action":0,"post_click_action":0,"pccr":0.000,"actions":0,"gross_rev":1019.51,"ecpm":5.90,"ecpc":169.92,"ecpa":0.00},"booked_metrics":{"ad_count":0,"ad_start":0,"ad_end":0,"ad_days":0,"booked_impressions":245855,"actual_impressions":172799,"diff_impressions":-73056,"delivered_perc":70.00,"booked_rev":1450.54,"actual_rev":1019.514,"diff_rev":-431.03,"booked_ecpm":5.90,"actual_ecpm":5.90,"diff_ecpm":0.00},"engagement_metrics":{"interactions":5213.02,"total_interactions":9692.60,"avg_inter_time":0.011,"inter_perc":3.017,"total_inter_perc":5.609,"avg_view_time":20.09,"gross_ecpmi":105.19,},"video_metrics":{"ad_starts":0,"completion_25":0,"completion_50":0,"completion_75":0,"completion_100":0,"completion_rate":0,"play_rate":0,"video_full_screen":0,"mutes":0,"mute_rate":0,"pauses":0,"video_replays":0,"video_stops":0,"vast_redirect_errors":0}}}],"message":"Report data"} ;
        //var reportData = results.report_data;

    });
}());