var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('customReportController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, requestCanceller, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout) {

        $scope.textConstants = constants;
        var elem = $(".each_section_custom_report").find(".dropdown").find(".dd_txt");

        var keys = ['dimensions', 'delivery_metrics', 'booked_metrics', 'engagement_metrics', 'video_metrics'];
        var metricKey = _.without(keys, 'dimensions');
        $scope.dataNotFound = false;
        $scope.reportDataBusy = false;

        $scope.getDimensionList =  function(data, selectedMetrics) {
            $(".filtered_by_txt").text(elem.text());
            var metricKeyStr = elem.text() +",";
            if(selectedMetrics.length >0) {
                metricKeyStr += _.pluck(selectedMetrics, 'label').join()
            } else {
                _.each(metricKey, function(mkey, idx) {
                    metricKeyStr += _.pluck(data[mkey], 'value').join() + ',';
                })
                metricKeyStr = metricKeyStr.substring(0, metricKeyStr.length - 1);
            }


            $scope.metricKeyArr = _.uniq(metricKeyStr.split(","));
        };

        $scope.getMetricValues =  function(data, selectedMetrics) {
            var metricValuesStr ;
            var metrics;
            if(selectedMetrics.length >0) {
                metrics = _.pluck(selectedMetrics, 'key')
            }
            var pickedobj;
            _.each(data, function(obj) {
                metricValuesStr = '';
                _.each(metricKey, function(mkey, idx) {
                    if(metrics && metrics.length >0) {
                        pickedobj = _.filter(obj[mkey], function(value, key, object) {
                            return _.indexOf(metrics, key) != -1;
                        });
                    } else {
                        pickedobj = obj[mkey];
                    }
                    if(!$.isEmptyObject(pickedobj)) {
                        metricValuesStr +=  _.values(pickedobj).join() +',';
                    }
                });
                metricValuesStr = obj.dimension.value.replace(/\,/, ' - ') + ","+  metricValuesStr;
                metricValuesStr = metricValuesStr.substring(0, metricValuesStr.length - 1);
                $scope.metricValues.push(metricValuesStr.split(","));

            });
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

        $scope.back_to_custom_reports = function() {
            $scope.reset_metric_options() ;
            $(".report_builder_container").show();
            $(".custom_report_response_page").hide();
        };

        $scope.show_respective_table = function(id) {
            $(".custom_report_response_table").hide() ;
            $("#" +  id + "_table").show() ;
            $(".custom_report_response_tabs").find(".each_tab").removeClass("active") ;
            $(".custom_report_response_tabs").find("#" + id +  "_tab").addClass("active") ;
        };

        $scope.reset_metric_options = function(event) {
            $(".each_measurable_col .not_all_selected").removeClass("not_all_selected");
            $(".each_measurable_col .active").removeClass("active");
            $(".each_measurable_col").find(".squaredFourChkbox").prop("checked" , false ) ;
            $(".reportFilter").val('');
        };

        $scope.metricSelected =  function() {
            var selectedElems = $(".each_measurable_col").find(".active");
            _.each(selectedElems, function(ele) {
                var el = $(ele);
                $scope.selectedItems.push({key:el.attr("id"), label:el.text()})
            });


        };

        $scope.reset = function(){
            $scope.limit = 50;
            $scope.offset = 0;
            $scope.fetching = false;
        };

        $scope.fetchReportsData = function()  {
            $scope.reportDataBusy = true;
            var str =  $scope.selectedDimensionId + ($scope.filterTxt !== '' ?  (':' + $scope.filterTxt) : '');
            var params = $scope.reportID+"?dimension="+str+"&offset="+$scope.offset+"&limit="+$scope.limit;
            dataService.getCustomReportData($scope.campaign, params).then(function(result) {
                requestCanceller.resetCanceller(constants.NEW_REPORT_RESULT_CANCELLER);
                var reportData = result.data.data.report_data;
                $scope.fetching = false;
                $scope.reportDataBusy = false;
                if(reportData.length >0) {
                    $scope.getMetricValues(reportData, $scope.selectedItems);
                } else {
                    $scope.dataNotFound = true;
                    $scope.dataNotFoundMessage = constants.MSG_DATA_NOT_AVAILABLE;
                }
            });
        };

        $scope.generateReport = function() {
            $scope.selectedItems = [];
            $scope.metricValues = [];
            $(".report_builder_container").hide();
            $(".custom_report_response_page").show();
            $("html, body").animate({ scrollTop: 0 });
            $scope.metricSelected();
            $scope.getDimensionList($scope.customeDimensionData[0], $scope.selectedItems);
            $scope.reportID = elem.attr("data-template_id");
            $scope. selectedDimensionId = elem.attr("id");
            $scope.filterTxt = $.trim($(".reportFilter").val());
            $scope.reset();
            $scope.fetchReportsData();
        };

        $scope.loadMoreItems = function() {
            $scope.offset += $scope.limit;
            $scope.fetching = true;
            $scope.fetchReportsData();
        };
    });
}());