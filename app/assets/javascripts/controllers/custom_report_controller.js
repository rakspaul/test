var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('customReportController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout) {

        $scope.textConstants = constants;

        var keys = ['dimensions', 'delivery_metrics', 'booked_metrics', 'engagement_metrics', 'video_metrics'];
        var metricKey = _.without(keys, 'dimensions');

        $scope.getDimensionList =  function(data) {
            var metricKeyStr = '';
            _.each(metricKey, function(mkey, idx) {
                metricKeyStr += _.pluck(data[mkey], 'key').join()
            })
            $scope.metricKeyArr = _.uniq(metricKeyStr.split(","));
        };

        $scope.getMetricValues =  function(data) {
            var metricValuesStr;
            var metricValues = [];
            _.each(data, function(obj) {
                metricValuesStr = '';
                _.each(metricKey, function(mkey, idx) {
                    metricValuesStr += _.values(obj[mkey]).join()
                });
                metricValues.push(metricValuesStr.split(","));
            });

            $scope.metricValues = metricValues;
        };

        dataService.getCustomReportMetrics($scope.campaign).then(function(result) {

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

            $scope.customeDimensionData = result.data.data;
            var modifiedDimesionArr = result.data.data[0];
            $scope.showDefaultDimension = modifiedDimesionArr.dimensions[0];
            $scope.showDefaultDimension['template_id'] = modifiedDimesionArr.template_id;



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
            elem.closest(".dropdown").find(".dd_txt").attr('id', elem.attr("id")) ;

        };

        $scope.reset_metric_options = function(event) {
            $(".each_measurable_col .not_all_selected").removeClass("not_all_selected");
            $(".each_measurable_col .active").removeClass("active");
            $(".each_measurable_col").find(".squaredFourChkbox").prop("checked" , false ) ;
        };

        $scope.metricSelected =  function() {
            var selectedElems = $(".each_measurable_col").find(".active");
            _.each(selectedElems, function(ele) {
                var el = $(ele);
                $scope.selectedItems.push({key:el.attr("id"), label:el.text()})
            });


        };

        $scope.generateReport = function() {
            $scope.selectedItems = [];
            $(".report_builder_container").hide();
            $(".custom_report_response_page").show();
            var metricsSelected;
            $scope.metricSelected();
            if($scope.selectedItems.length >0) {
                $scope.metricKeyAr = metricsSelected = _.pluck($scope.selectedItems, 'key');
            } else {
                $scope.getDimensionList($scope.customeDimensionData[0]);
            }

            var elem = $(".each_section_custom_report").find(".dropdown").find(".dd_txt");

            var reportID = elem.attr("data-template_id");
            var selectedDimensionId = elem.attr("id");
            var dimesionStr = selectedDimensionId + (metricsSelected && metricsSelected.length >0 ? ( ":" +  metricsSelected.join()) : '');
            var params = reportID+"?dimension="+dimesionStr+"&offset=101&limit=200";
            dataService.getCustomReportData($scope.campaign, params).then(function(result) {
                var reportData = result.data.data.report_data;
                $scope.getMetricValues(reportData);
            });
        };

        $scope.loadMoreItems = function() {
            console.log("load");
        };
    });
}());