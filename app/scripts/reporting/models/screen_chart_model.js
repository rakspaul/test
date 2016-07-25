define(['angularAMD', 'common/services/vistoconfig_service','common/services/data_service',
    'reporting/brands/brands_model','reporting/dashboard/dashboard_model','common/services/constants_service',
    'login/login_model','common/services/role_based_service', 'reporting/advertiser/advertiser_model',
    'common/services/vistoconfig_service','common/services/sub_account_service'], function (angularAMD) {
    'use strict';

    angularAMD.service('screenChartModel', ['$filter', 'urlService', 'dataService', 'brandsModel',
        'dashboardModel', 'constants', 'loginModel', 'RoleBasedService', 'advertiserModel', 'vistoconfig',
        'subAccountService', function ($filter, urlService, dataService, brandsModel, dashboardModel, constants,
                                     loginModel, RoleBasedService, advertiserModel, vistoconfig) {
            var screenWidgetData = {
                    selectedMetric: constants.SPEND,

                    metricDropDown: [
                        constants.SPEND,
                        constants.IMPRESSIONS,
                        constants.CTR,
                        constants.VTC,
                        constants.CPA,
                        constants.CPM,
                        constants.CPC,
                        constants.ACTION_RATE
                    ],

                    selectedFormat: constants.SCREENS,
                    formatDropDown: [constants.SCREENS, constants.FORMATS, constants.PLATFORMS],
                    chartData: {},
                    dataNotAvailable: true
                },

                mapper =  {
                    spend: 'spend',
                    'action rate': 'action_rate'
                },

                screenTypeMap = vistoconfig.screenTypeMap,
                formatTypeMap = vistoconfig.formatTypeMap,
                usrRole = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().uiExclusions;

            if (usrRole && usrRole.ui_modules) {
                screenWidgetData.formatDropDown =
                    _.filter(screenWidgetData.formatDropDown, function (obj) {
                        obj = obj.slice(0, obj.length-1);

                        return _.indexOf(usrRole.ui_modules, obj.toLowerCase()) === -1;
                    });
            }

            this.dataModifyForPlatform =  function (data) {
                var platformData = {},

                    modify = function (obj, platformData, key) {
                        // Step 1 Data Mod holds value on memory
                        _.each(obj, function (pltformObj) {
                            _.each(pltformObj.platforms, function (platform) {
                                platformData[key].push(platform);
                            });
                        });
                    };

                if (data  && data.platform_metrics) {
                    _.each(data.platform_metrics, function (obj, idx) {
                        platformData[idx] = [];
                        modify(obj, platformData, idx);
                    });
                }

                return platformData.performance;
            };

            this.dataModifyForScreenAndFormat =  function (data) {
                var screenAndFormatData;

                if (data && data.length > 0  && data[0].perf_metrics) {
                    screenAndFormatData = _.filter(data[0].perf_metrics, function (obj) {
                        return obj.dimension.toLowerCase() !== 'unknown';
                    });
                }

                return screenAndFormatData;
            };

            this.dataModifyForScreenChart = function (data) {
                var selectedFormat = this.getScreenWidgetFormat(),
                    screenDataArr = [],
                    sortedData,
                    dataToDisplayOnWidget,
                    value,

                    screenBarChartConfig = {
                        widgetName: selectedFormat,
                        barHeight: 8,
                        gapScreen: 70,
                        widthToSubtract: 88,
                        separator: ' ',
                        page: 'dashboard'
                    },

                    kpiModel = this.getScreenWidgetMetric().toLowerCase(),
                    selectedMetricKey =  mapper[kpiModel] || kpiModel.toLowerCase(),
                    calValMetricKey = selectedMetricKey,
                    values = _.compact(_.pluck(data, calValMetricKey)),

                    total = _.reduce(values, function (sum, num) {
                        return sum + num;
                    }, 0);

                if (data) {
                    selectedMetricKey =  mapper[kpiModel] || kpiModel.toLowerCase();
                    sortedData =  _.sortBy(data, selectedMetricKey);

                    sortedData = (kpiModel.toLowerCase() === 'cpa' ||
                        kpiModel.toLowerCase() === 'cpm' ||
                        kpiModel.toLowerCase() === 'cpc') ?
                        sortedData : sortedData.reverse();

                    sortedData = _.sortBy(sortedData, function (obj) {
                        return obj[kpiModel] === 0;
                    });

                    dataToDisplayOnWidget  = sortedData.slice(0, 3);
                }

                _.each(dataToDisplayOnWidget, function (eachObj) {
                    var cls = '',
                        type = '',
                        iconUrl;

                    if (selectedFormat.toLowerCase() === 'screens') {
                        cls = screenTypeMap[eachObj.screen_type.toLowerCase()];
                        type = eachObj.screen_type;
                    } else if (selectedFormat.toLowerCase() === 'formats') {
                        // It removes empty space and makes a single word and then convert to lower case
                        cls = formatTypeMap[eachObj.ad_format.replace(/ /g,'').toLowerCase()];

                        type = $filter('toPascalCase')(eachObj.ad_format.toLowerCase());
                    } else {
                        type = eachObj.platform_name;

                        iconUrl = eachObj.platform_iconUrl === 'Unknown' ?
                            'platform_logo.png' : type.toLowerCase().replace(/ /g, '_') + '.png';

                        iconUrl = '/images/platform_favicons/' + iconUrl;
                    }

                    if (calValMetricKey === 'spend' || calValMetricKey === 'impressions') {
                        value = ((eachObj[calValMetricKey] * 100) / total);
                        value = value && value.toFixed(0);
                    } else if (calValMetricKey === 'ctr' ||
                        calValMetricKey === 'action_rate' ||
                        calValMetricKey === 'vtc') {
                        value = parseFloat(eachObj[calValMetricKey]);
                        value = value && value.toFixed(2);
                    } else {
                        value = parseFloat(eachObj[calValMetricKey]);
                        value= value && value.toFixed(2);
                    }

                    screenDataArr.push({
                        className: cls,
                        type: type,
                        value: Number(value),
                        icon_url: iconUrl,
                        kpiType: (calValMetricKey === 'spend' ? 'gross_rev' : calValMetricKey)
                    });
                });

                screenBarChartConfig.data = screenDataArr;

                return screenBarChartConfig;
            };

            this.getScreenChartData = function () {
                var selectedFormat = this.getScreenWidgetFormat(),

                    // dashboard_hardware_categories
                    queryId = 1,
                    queryObj,
                    url;

                if (selectedFormat === constants.FORMATS) {
                    // dashboard_ad_format
                    queryId = 2;
                } else if (selectedFormat === constants.PLATFORMS) {
                    // dashboard_platform
                    queryId = 3;
                }

                queryObj = {
                   queryId: queryId,
                   clientId: vistoconfig.getSelectedAccountId(),
                   advertiserId: vistoconfig.getSelectAdvertiserId(),
                   brandId: vistoconfig.getSelectedBrandId(),
                   dateFilter: 'life_time',
                   campaignStatus: dashboardModel.campaignStatusToSend()
                };

                url = urlService.APIVistoCustomQuery(queryObj);

                return dataService.fetch(url).then(function (response) {
                    if (response.status === 'success') {
                        screenWidgetData.responseData = response.data.data;
                    } else {
                        screenWidgetData.responseData = '';
                    }
                });
            };

            this.getScreenWidgetData = function () {
                return screenWidgetData;
            };

            this.setScreenWidgetMetric = function (_selectedMetric) {
                if (_selectedMetric.toLowerCase() === 'action rate') {
                    _selectedMetric = 'action_rate';
                }

                screenWidgetData.selectedMetric = constants[_selectedMetric.toUpperCase()];
            };

            this.getScreenWidgetMetric = function () {
                return screenWidgetData.selectedMetric;
            };

            this.setScreenWidgetFormat = function (_selectedFormat) {
                screenWidgetData.selectedFormat = constants[_selectedFormat.toUpperCase()];
            };

            this.getScreenWidgetFormat = function () {
                return screenWidgetData.selectedFormat;
            };
        }
    ]);
});
