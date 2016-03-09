define(['angularAMD', 'common/services/vistoconfig_service','common/services/data_service','reporting/brands/brands_model','reporting/dashboard/dashboard_model','common/services/constants_service','login/login_model','common/services/role_based_service', 'reporting/advertiser/advertiser_model', 'common/services/vistoconfig_service'],function (angularAMD) {
  'use strict';
  angularAMD.service('screenChartModel', ['urlService', 'dataService', 'brandsModel','dashboardModel' ,'constants' , 'loginModel', 'RoleBasedService', 'advertiserModel', 'vistoconfig', function ( urlService, dataService, brandsModel, dashboardModel, constants, loginModel, RoleBasedService, advertiserModel, vistoconfig) {

        var screenWidgetData = { selectedMetric : constants.SPEND ,
            metricDropDown : [constants.SPEND, constants.IMPRESSIONS, constants.CTR,constants.VTC, constants.CPA, constants.CPM, constants.CPC, constants.ACTION_RATE],
            selectedFormat : constants.SCREENS,
            formatDropDown : [constants.SCREENS, constants.FORMATS, constants.PLATFORMS],
            chartData : {},
            dataNotAvailable : true
        };

        var mapper =  {
            //'spend' : 'gross_rev',
            'spend' : 'spend',
            'action rate' : 'action_rate'
        }

        var screenTypeMap = vistoconfig.screenTypeMap ;

        var formatTypeMap = vistoconfig.formatTypeMap  ;

        var usrRole  = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().ui_exclusions;
        if(usrRole && usrRole.ui_modules) {
            screenWidgetData.formatDropDown =  _.filter(screenWidgetData.formatDropDown, function(obj, idx) {
                obj = obj.slice(0, obj.length-1);
                return _.indexOf(usrRole.ui_modules, obj.toLowerCase()) == -1
            });
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
        };

        this.dataModifyForScreenAndFormat =  function(data, kpiModel, screenWidgetFormat) {
            var screenAndFormatData
            if (data && data.length > 0  && data[0].perf_metrics) {
                screenAndFormatData = _.filter(data[0].perf_metrics, function(obj) { return obj.dimension.toLowerCase() != 'unknown'});
            }
            return screenAndFormatData;
        };

        this.dataModifyForScreenChart = function(data) {
            var selectedFormat = this.getScreenWidgetFormat();
            var screenDataArr = [];
            var screenBarChartConfig = {"widgetName":selectedFormat,"barHeight": 8,  "gapScreen": 70, "widthToSubtract": 88, "separator": " ", "page": "dashboard"};
            var kpiModel = this.getScreenWidgetMetric().toLowerCase();
            var selectedMetricKey =  mapper[kpiModel] || kpiModel.toLowerCase();

            var calValMetricKey = selectedMetricKey;

            var values = _.compact(_.pluck(data, calValMetricKey));
            var total = _.reduce(values, function (sum, num) { return sum + num;}, 0);

            if (data) {
                var selectedMetricKey =  mapper[kpiModel] || kpiModel.toLowerCase();
                var sortedData, dataToDisplayOnWidget;
                sortedData =  _.sortBy(data, selectedMetricKey);
                sortedData = (kpiModel.toLowerCase() === 'cpa' || kpiModel.toLowerCase() === 'cpm' || kpiModel.toLowerCase() === 'cpc') ? sortedData : sortedData.reverse();
                sortedData = _.sortBy(sortedData, function(obj) { return obj[kpiModel] == 0 });
                dataToDisplayOnWidget  = sortedData.slice(0, 3);
            }

            var value;

            _.each(dataToDisplayOnWidget, function(eachObj) {
                var cls = '';
                var type = '';
                var icon_url;
                if (selectedFormat.toLowerCase() === 'screens') {
                    cls = screenTypeMap[eachObj.screen_type.toLowerCase()];
                    type = eachObj.screen_type;
                } else if (selectedFormat.toLowerCase() === 'formats') {
                    cls = formatTypeMap[eachObj.ad_format.toLowerCase()];
                    type = eachObj.ad_format.toLowerCase();
                } else {
                    type = eachObj.platform_name;
                    icon_url = eachObj.platform_icon_url == 'Unknown' ? 'platform_logo.png' : type.toLowerCase().replace(/ /g, '_') + '.png';
                    icon_url = '/images/platform_favicons/' + icon_url;
                }
                if (calValMetricKey === 'spend' || calValMetricKey === 'impressions') {
                    value = ((eachObj[calValMetricKey] * 100) / total).toFixed(0);
                } else if (calValMetricKey === 'ctr' || calValMetricKey === 'action_rate' || calValMetricKey === 'vtc') {
                    value = parseFloat((eachObj[calValMetricKey] * 100).toFixed(2));
                } else {
                    value = parseFloat(eachObj[calValMetricKey].toFixed(2));
                }

                //var value = (((eachObj[calValMetricKey])*100)/total).toFixed(0);
                screenDataArr.push({"className":cls,"type":type,"value": Number(value), 'icon_url': icon_url, kpiType : (calValMetricKey === 'spend' ? 'gross_rev' : calValMetricKey) });
            })
            screenBarChartConfig.data = screenDataArr;
            return screenBarChartConfig;
        };

        this.getScreenChartData = function() {
            var modifiedData = [];
            var selectedFormat = this.getScreenWidgetFormat();
            var queryId = 1; //dashboard_hardware_categories
            if(selectedFormat == constants.FORMATS) {
                queryId = 2; //dashboard_ad_format
            } else if(selectedFormat == constants.PLATFORMS) {
                queryId = 3; //dashboard_platform
            }
            var brandId = brandsModel.getSelectedBrand().id;
            var advertiserId = advertiserModel.getSelectedAdvertiser().id;

            var queryObj = {
               'queryId' :  queryId,
               'clientId': loginModel.getSelectedClient().id,
               'campaignStatus' :  dashboardModel.campaignStatusToSend(),
               'advertiserId' : advertiserId,
               'brandId' :  brandId,
               'dateFilter':'life_time'
            }

            var url = urlService.APIVistoCustomQuery(queryObj);
            return dataService.fetch(url).then(function(response){
                if(response.status == "success") {
                    screenWidgetData['responseData'] = response.data.data;
                } else {
                    screenWidgetData['responseData'] = "";
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
        };

        this.setScreenWidgetFormat = function( _selectedFormat){
            screenWidgetData['selectedFormat'] = constants[_selectedFormat.toUpperCase()];
        };

        this.getScreenWidgetFormat = function(){
            return screenWidgetData['selectedFormat'];
        };
  }]);
});
