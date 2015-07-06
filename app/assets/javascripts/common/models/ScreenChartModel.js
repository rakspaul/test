(function () {
    "use strict";
    var screenChartData = function (utils, urlService, timePeriodModel, dataService, brandsModel ,dashboardModel ,requestCanceller, constants, loginModel) {
        var screenWidgetData = { selectedMetric : constants.SPEND ,
            metricDropDown : [constants.SPEND, constants.IMPRESSIONS, constants.CTR,constants.VTC, constants.CPA, constants.CPM, constants.CPC, constants.ACTION_RATE],
            selectedFormat : constants.SCREENS,
            formatDropDown : [constants.SCREENS, constants.FORMATS, constants.PLATFORMS],
            chartData : {},
            dataNotAvailable : true
        };

        var mapper =  {
            'spend' : 'gross_rev',
            'action rate' : 'action_rate'
        }

        var screenTypeMap = {
            'smartphone' : 'mobile_graph',
            'tv' : 'display_graph',
            'tablet' : 'tablet_graph',
            'desktop' : 'display_graph'
        }

        this.dataModifyForPlatform =  function(data, kpiModel, screenWidgetFormat) {
            var platformData = {};
            var modify = function (obj, platformData, key) { // Step 1 Data Mod holds value on memory
                _.each(obj, function (pltformObj, index) {
                    _.each(pltformObj.platforms, function (platform) {
                        platformData[key].push(platform);
                    })
                })
            }

            if(data  && data.platform_metrics) {
                _.each(data.platform_metrics, function (obj, idx) {
                    platformData[idx] = []
                    modify(obj, platformData, idx);
                });
            }

            return platformData.performance;
        },

        this.dataModifyForScreenAndFormat =  function(data, kpiModel, screenWidgetFormat) {
            var screenAndFormatData
            if (data && data.length > 0  && data[0].perf_metrics) {
                screenAndFormatData = _.filter(data[0].perf_metrics, function(obj) { return obj.dimension.toLowerCase() != 'unknown'});
            }
            return screenAndFormatData;
        },

        this.dataModifyForScreenChart =  function(data) {
            var kpiModel = this.getScreenWidgetMetric().toLowerCase();
            var screenWidgetFormat = this.getScreenWidgetFormat();
            var screensData;
            var chartDataScreen = [];
            var calculateTotalMetrics  = function(data, kpi) {
                var total = 1;
                if(kpi === 'gross_rev' || kpi === 'impressions' || kpi == 'cpa' || kpi == 'cpm' || kpi == 'cpc') {
                    var values = _.compact(_.pluck(data, kpi));
                    total = _.reduce(values, function (sum, num) { return sum + num;}, 0);
                }
                return total;
            };
            if(screenWidgetFormat.toLowerCase() ==='platforms') {
                screensData = this.dataModifyForPlatform(data, kpiModel, screenWidgetFormat);
            } else {
                screensData = this.dataModifyForScreenAndFormat(data, kpiModel, screenWidgetFormat);
            }

            if (screensData) {
                var selectedMetricKey =  mapper[kpiModel] || kpiModel.toLowerCase();
                var sortedData;
                if(selectedMetricKey === 'vtc') {
                    sortedData = _.sortBy(screensData, function(arr) { return arr.video_metrics.vtc_rate });
                } else {
                    sortedData =  _.sortBy(screensData, selectedMetricKey);
                }
                sortedData = (kpiModel.toLowerCase() === 'cpa' || kpiModel.toLowerCase() === 'cpm') ? sortedData : sortedData.reverse();
                sortedData = _.sortBy(sortedData, function(obj) { return obj[kpiModel] == 0 });
                sortedData  = sortedData.slice(0, 3);
            }

            var totalMetrics = calculateTotalMetrics(sortedData, selectedMetricKey);

            _.each(sortedData, function(data, idx) {
                var kpiData;
                if(selectedMetricKey === 'gross_rev' || selectedMetricKey === 'impressions') {
                    kpiData = ((data[selectedMetricKey] *100)/totalMetrics).toFixed(0);
                } else if(selectedMetricKey === 'ctr' ||  selectedMetricKey === 'action_rate')  {
                    kpiData = parseFloat((data[selectedMetricKey]*100).toFixed(2));
                } else if (selectedMetricKey === 'vtc') {
                    kpiData = parseFloat(data.video_metrics.vtc_rate.toFixed(2));
                } else {
                    kpiData = parseFloat(data[selectedMetricKey].toFixed(2));
                }

                var type = data.dimension || data.platform;
                var cls ='';
                if(screenWidgetFormat.toLowerCase() === 'screens') {
                    cls = screenTypeMap[data.dimension.toLowerCase()];
                } else if(screenWidgetFormat.toLowerCase() === 'formats') {
                    cls = data.dimension.toLowerCase() + "_graph"
                }
                chartDataScreen.push({className : cls, 'icon_url' : data.icon_url, 'type' : type, 'value' : kpiData});
            });

            var screenBarChartConfig = {
                widgetName : screenWidgetFormat,
                data : chartDataScreen,
                barHeight : 8,
                kpiType : selectedMetricKey || 'NA',
                gapScreen :70,
                widthToSubtract : 88    ,
                separator : ' ',
                page : 'dashboard'
            }

            return screenBarChartConfig;
        },

        this.getScreenChartData = function () {
            var _screenWidgetFormatType = "by" + screenWidgetData['selectedFormat'].toLowerCase(),
                url,
                selectedStatus =  dashboardModel.getData().selectedStatus,
                selectedTimePeriod = timePeriodModel.timeData.selectedTimePeriod.key,
                getAgencyId = loginModel.getAgencyId(),
                brandId = brandsModel.getSelectedBrand().id,
                that = this;

            url = urlService.APIScreenWidgetForBrand(selectedTimePeriod, getAgencyId, brandId , _screenWidgetFormatType,  selectedStatus);
            var canceller = requestCanceller.initCanceller(constants.SCREEN_CHART_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;
                if(typeof data !== 'undefined') {
                    screenWidgetData['responseData'] = data;
                }
            });
        };

        this.getScreenWidgetData = function(){
            return screenWidgetData ;
        };

        this.setScreenWidgetMetric = function( _selectedMetric){
            if(_selectedMetric.toLowerCase() === 'action rate') { _selectedMetric = 'action_rate' }
            screenWidgetData['selectedMetric'] = constants[_selectedMetric.toUpperCase()];

        };

        this.getScreenWidgetMetric = function(){
            return screenWidgetData['selectedMetric'];
        }

        this.setScreenWidgetFormat = function( _selectedFormat){
            screenWidgetData['selectedFormat'] = constants[_selectedFormat.toUpperCase()];
        };

        this.getScreenWidgetFormat = function(){
            return screenWidgetData['selectedFormat'];
        }


    };
    commonModule.service('screenChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel','dashboardModel' ,'requestCanceller', 'constants' , 'loginModel', screenChartData]);
}());