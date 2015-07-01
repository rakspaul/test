var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('customReportController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout) {

        $scope.textConstants = constants;

        var reportDataJSON =
            {
                  "status": "OK",
                  "status_code": 200,
                  "meta": {
                    "host": "localhost:9021",
                    "method": "GET",
                    "path": "/api/reporting/v1/reporting/custom/meta",
                    "uri": "/api/reporting/v1/reporting/custom/meta"
                  },
                  "data": [
                    {
                      "client_type": "Network",
                      "report_template_id": 1,
                      "dimensions": [
                        "publisher",
                        "site",
                        "site_type",
                        "screen category",
                        "device type",
                        "os",
                        "context",
                        "zone",
                        "activity name",
                        "section",
                        "size",
                        "advertiser (Direct)",
                        "advertiser category (Direct)",
                        "order",
                        "lineitem",
                        "agency",
                        "agency_category",
                        "ad",
                        "ad_rate",
                        "creative",
                        "day",
                        "month",
                        "salesperson",
                        "sales region",
                        "sales office",
                        "business type",
                        "product type",
                        "rate type",
                        "marketing type",
                        "targeting type",
                        "geography type",
                        "tag_type",
                        "targeted_key_value",
                        "targeted_channel",
                        "site_region_target (srt)",
                        "location (dma)",
                        "location (country)",
                        "location ( state/province)",
                        "data_provider",
                        "rich media vendor",
                        "video_length",
                        "media_type",
                        "format_type",
                        "screen_sold",
                        "objective"
                      ],
                      "delivery_measures": [
                        "impressions",
                        "clicks",
                        "ctr",
                        "pi_actions ",
                        "pc_actions",
                        "pccr, %",
                        "Total Actions",
                        "Media Spend",
                        "eCPM",
                        "eCPC"
                      ],
                      "booked_measures": [
                        "ad_count",
                        "ad_start",
                        "ad_end",
                        "ad_days",
                        "booked_imps",
                        "actual_imps",
                        "diff_imps",
                        "perc_delivered",
                        "booked_rev",
                        "actual_rev",
                        "diff_rev",
                        "booked_ecpm",
                        "actual_ecpm",
                        "diff_ecmp"
                      ],
                      "engagement_measures": [
                        "inter",
                        "total_inter",
                        "avg_inter_time",
                        "ir_perc",
                        "total_ir_perc",
                        "avg_viewTime",
                        "ecpmi"
                      ],
                      "video_measures": [
                        "video_plays",
                        "completion_25",
                        "completion_50",
                        "completion_75",
                        "completion_100",
                        "complete_rate",
                        "play_rate",
                        "video_full_screen",
                        "mutes",
                        "mute_rate",
                        "pauses",
                        "replays",
                        "video_stops",
                        "vast_redirect_errors"
                      ]
                    }
                  ],
                  "message": "success"
                }
        ;

        $scope.reportData = reportDataJSON.data ;
    
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
            } 
        };

        $scope.select_dropdown_option = function(event) {
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text()) ;
        };

    });
}());