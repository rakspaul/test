(function () {
    "use strict";
    var screenChartData = function (utils, urlService, timePeriodModel, dataService, brandsModel, requestCanceller, constants) {
        var screenWidgetData = { selectedMetric : constants.SPEND ,
            metricDropDown : [constants.SPEND, constants.IMPRESSIONS, constants.CTR, constants.CPA, constants.CPM, constants.CPC, constants.ACTION_RATE],
            selectedFormat : constants.SCREENS,
            formatDropDown : [constants.SCREENS, constants.FORMATS],
            chartData : {}

        };

        this.getScreenChartData = function () {
           var _screenWidgetFormatType = "by" + screenWidgetData['selectedFormat'].toLowerCase();
            var url = urlService.APIScreenWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key,573, _screenWidgetFormatType );
            var canceller = requestCanceller.initCanceller(constants.SCREEN_CHART_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;
                screenWidgetData['chartData'] = data ;
                return  screenWidgetData['chartData'] ;
            })
        };

        this.getScreenWidgetData = function(){
            return screenWidgetData ;
        };

        this.setScreenWidgetMetric = function( _selectedMetric){
            switch (_selectedMetric.toLowerCase()) {
                case 'ctr':
                    screenWidgetData['selectedMetric'] = constants.CTR;
                    break;
                case 'cpm':
                     screenWidgetData['selectedMetric'] = constants.CPM;
                    break;
                case 'cpa':
                    screenWidgetData['selectedMetric'] = constants.CPA;
                    break;
                case 'cpc':
                    screenWidgetData['selectedMetric'] = constants.CPC;
                    break;
                case 'impressions':
                    screenWidgetData['selectedMetric'] = constants.IMPRESSIONS;
                    break;
                case 'action_rate' :
                    screenWidgetData['selectedMetric'] = constants.ACTION_RATE;
                    break;
                case 'action rate':
                    screenWidgetData['selectedMetric'] = constants.ACTION_RATE;
                    break;
                case 'spend allocation' :
                    screenWidgetData['selectedMetric'] = constants.SPEND;
                    break;
            }

        };

        this.getScreenWidgetMetric = function(){
            return screenWidgetData['selectedMetric'];
        }

        this.setScreenWidgetFormat = function( _selectedFormat){
            switch (_selectedFormat.toLowerCase()) {
                case 'screens':
                    screenWidgetData['selectedFormat'] = constants.SCREENS;
                    break;
                case 'formats':
                    screenWidgetData['selectedFormat'] = constants.FORMATS;
                    break;
            }

        };

        this.getScreenWidgetFormat = function(){
            return screenWidgetData['selectedFormat'];
        }


    };
    commonModule.service('screenChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel', 'requestCanceller', 'constants' , screenChartData]);
}());