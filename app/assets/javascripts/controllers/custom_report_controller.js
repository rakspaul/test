var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('customReportController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, requestCanceller, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout) {

        $scope.textConstants = constants;
        var _customctrl = this;
        var elem = $(".each_section_custom_report").find(".dropdown").find(".dd_txt");

        var metricKey = ['dimensions', 'delivery_metrics', 'booked_metrics', 'engagement_metrics', 'video_metrics'];
        var metricKey1 = ['dimension', 'delivery_metrics', 'booked_metrics', 'engagement_metrics', 'video_metrics'];
        $scope.dataNotFound = false;
        $scope.reportDataBusy = false;
        $scope.activeTab = "delivery_metrics"



        _customctrl.getDimensionList =  function(data, selectedMetrics) {
            $scope.selectedDimension  = elem.text();
            if(selectedMetrics.length >0) {
                $scope.metricKeyArr = {'delivery_metrics' : selectedMetrics};
            } else {
                $scope.metricKeyArr = data;
            }
        };

        _customctrl.getDataBasedOnTabSelected =  function(activeTab) {
            var obj = {};
            obj[activeTab] = [];
            _.each($scope.reportMetaData, function(data) {
                _.extend(data[activeTab], data['dimension']);
                obj[activeTab].push(data[activeTab]);
            });
            console.log(obj[activeTab]);
            $scope.metricValues = obj;
            console.log($scope.metricValues);
        };

        _customctrl.getMetricValues =  function(data, selectedMetrics) {
            if(selectedMetrics && selectedMetrics.length >0) {
                var modifiedMetricsList = selectedMetrics.slice();
                modifiedMetricsList.unshift({key:'value', value:''});

                var metrics;
                var metricObj
                _.each(data, function(obj) {
                    metricObj = {};
                    _.each(metricKey1, function(mkey) {
                        if(obj.hasOwnProperty(mkey)) {
                            metrics = _.pick(obj[mkey], _.pluck(modifiedMetricsList, 'key'))
                            if(!$.isEmptyObject(metrics)) {
                                _.extend(metricObj, metrics);
                            }
                        }
                    });
                    $scope.reportMetaData.push(metricObj);
                });

                $scope.metricValues = {'delivery_metrics':$scope.reportMetaData};
            } else {
                _.each(data, function(obj) {
                    $scope.reportMetaData.push(obj);
                });
                _customctrl.getDataBasedOnTabSelected($scope.activeTab)
            }
        };

        dataService.getCustomReportMetrics($scope.campaign).then(function(result) {
            var jsonModifier =  function(data) {
                var arr= [];
                _.each(data, function(obj) {
                    var d  = obj.split(":");
                    arr.push({'key' : d[0], 'value':d[1] });
                });

                return arr;
            }
            _.each(metricKey, function(k) {
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
        $scope.delete_level = function(event) {
             var elem = $(event.target);
             elem.closest(".breakdown_div").remove();
         };

        $scope.select_dropdown_option = function(event , arg ) {
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text()) ;
            elem.closest(".dropdown").find(".dd_txt").attr('id', elem.attr("id")) ;
            elem.closest(".breakdown_div").find(".filter_input_txtbox").show() ;
            var startDate,endDate;
            // switch(arg) {
            //     case 'yesterday':
            //         $('#startDateInput').datepicker('update', '2015, 07, 20');
            //         $('#startDateInput').datepicker('update', '2015, 07, 28');
                
            //         break;
            //     case 'week':
                    
            //         break;
            //     default:
            //         //default code block
            // }
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
            $scope.activeTab = id +"_metrics";
            _customctrl.getDataBasedOnTabSelected($scope.activeTab);
        };

        $scope.reset_metric_options = function(event) {
            $(".each_measurable_col .not_all_selected").removeClass("not_all_selected");
            $(".each_measurable_col .active").removeClass("active");
            $(".each_measurable_col").find(".squaredFourChkbox").prop("checked" , false ) ;
            $(".reportFilter").val('');
        };

        _customctrl.metricSelected =  function() {
            var selectedItems= [];
            var selectedElems = $(".each_measurable_col").find(".active");
            _.each(selectedElems, function(ele) {
                var el = $(ele);
                selectedItems.push({key:el.attr("id"), value:el.text()});
            });
            return selectedItems;
        };

        _customctrl.reset = function(){
            $scope.limit = 15;
            $scope.offset = 0;
            $scope.fetching = false;
        };

        _customctrl.fetchReportsData = function(selectedMetricsList)  {
            $scope.reportDataBusy = true;
            var selectedDimensionId = elem.attr("id");
            var reportID = elem.attr("data-template_id");
            var filterTxt = $.trim($(".reportFilter").val());
            var str =  selectedDimensionId + (filterTxt !== '' ?  (':' + filterTxt) : '');
            var params = reportID+"?dimension="+str+"&offset="+$scope.offset+"&limit="+$scope.limit;
            dataService.getCustomReportData($scope.campaign, params).then(function(result) {
                console.log(result);
                requestCanceller.resetCanceller(constants.NEW_REPORT_RESULT_CANCELLER);
                var reportData = result.data.data.report_data;
                $scope.fetching = false;
                $scope.reportDataBusy = false;
                if(reportData.length >0) {
                    _customctrl.getMetricValues(reportData, $scope.selectedMetricsList);
                } else {
                    $scope.dataNotFound = true;
                    $scope.dataNotFoundMessage = constants.MSG_DATA_NOT_AVAILABLE;
                }
            });
        };

        $scope.generateReport = function() {
            var selectedMetricsList;
            $scope.metricValues = [];
            $scope.reportMetaData=[];
            $scope.hideReportsTabs = false;
            $(".img_table_container").hide();
            $(".custom_report_response_page").show();
            $("html, body").animate({ scrollTop: 0 });
            $scope.selectedMetricsList =  _customctrl.metricSelected();
            if($scope.selectedMetricsList.length >0) {
                $scope.hideReportsTabs = true;
            }
            _customctrl.getDimensionList($scope.customeDimensionData[0], $scope.selectedMetricsList);
            _customctrl.reset();
            _customctrl.fetchReportsData($scope.selectedMetricsList);
        };

        $scope.loadMoreItems = function() {
            $scope.offset += $scope.limit;
            $scope.fetching = true;
            _customctrl.fetchReportsData();
        };
    });
}());