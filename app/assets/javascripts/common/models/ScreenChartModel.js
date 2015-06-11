(function () {
    "use strict";
    var screenChartData = function (utils, urlService, timePeriodModel, dataService, brandsModel ,dashboardModel ,requestCanceller, constants, loginModel) {
        var screenWidgetData = { selectedMetric : constants.SPEND ,
            metricDropDown : [constants.SPEND, constants.IMPRESSIONS, constants.CTR,constants.VTC, constants.CPA, constants.CPM, constants.CPC, constants.ACTION_RATE],
            selectedFormat : constants.SCREENS,
            formatDropDown : [constants.SCREENS, constants.FORMATS],
            chartData : {},
            dataNotAvailable : true

        };

        this.getScreenChartData = function () {
           var _screenWidgetFormatType = "by" + screenWidgetData['selectedFormat'].toLowerCase();
            var url;
            if(brandsModel.getSelectedBrand().id !== -1){
                 url = urlService.APIScreenWidgetForBrand(timePeriodModel.timeData.selectedTimePeriod.key, loginModel.getAgencyId(), brandsModel.getSelectedBrand().id , _screenWidgetFormatType, dashboardModel.getData().selectedStatus );
            }else {
                 url = urlService.APIScreenWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key, loginModel.getAgencyId(), _screenWidgetFormatType, dashboardModel.getData().selectedStatus );
            }

            var canceller = requestCanceller.initCanceller(constants.SCREEN_CHART_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;
                if(data !== undefined && data.length >0)
                    data=data[0].perf_metrics;
                if(data !== undefined && data.length >0){
                    screenWidgetData['dataNotAvailable'] = false ;
                    screenWidgetData['chartData'] = data ;
                } else {
                    screenWidgetData['dataNotAvailable'] = true ;
                }

              //  return  screenWidgetData['chartData'] ;
            })
        };

        this.getScreenWidgetData = function(){
            return screenWidgetData ;
        };

        this.setScreenWidgetMetric = function( _selectedMetric){
            console.log("coming here");
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
                case 'spend' :
                    screenWidgetData['selectedMetric'] = constants.SPEND;
                    break;
                case 'vtc' :
                    screenWidgetData['selectedMetric'] = constants.VTC;
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
    commonModule.service('screenChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel','dashboardModel' ,'requestCanceller', 'constants' , 'loginModel', screenChartData]);
}());