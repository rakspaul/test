define(['angularAMD', 'workflow/services/workflow_service',
    'common/services/vistoconfig_service'], function (angularAMD) {

    'use strict';

    angularAMD.service('featuresService', function ($rootScope, $location, workflowService, vistoconfig) {
        var params = [
                'dashboard',
                'report_overview',
                'inventory',
                'performance',
                'discrepancy',
                'quality',
                'cost',
                'optimization_create',
                'optimization_transparency',
                'platform',
                'scheduled',
                'collective',
                'scheduled_reports',
                'collective_insights',
                'create_mediaplan',
                'dashboard',
                'mediaplan_list',
                'ad_setup',
                'mediaplan_hub',
                'creative_list',
                'reports_tab',
                'reports_invoice'
            ],

            dbFeatureToUIFeatureMap = {REP_OVERVIEW: 'report_overview', REP_INV: 'inventory', 
                    REP_PERF: 'performance', REP_QUALITY: 'quality', COST: 'cost',
                    REP_OPT_WRITE: ['optimization_create', 'optimization_transparency'], 
                    REP_OPT_TRANSPARENCY: 'optimization_transparency', 
                    REP_PLATFORM: 'platform', REP_SCH: 'scheduled_reports', REP_INSIGHTS: 'collective_insights',
                    MEDIAPLAN_SETUP: 'create_mediaplan', MEDIAPLAN_HUB: 'mediaplan_hub', AD_SETUP: 'ad_setup', 
                    MEDIAPLAN_LIST: 'mediaplan_list', CREATIVE_LIST: 'creative_list', DASHBOARD: 'dashboard',
                    REPORTS_TAB: 'reports_tab', REP_INVOICE: 'reports_invoice', REP_DISCREPANCY: 'discrepancy'},

            featureParams = [],

            serverResponseReceived = false,

            setAllFeatureParams = function (booleanValue) {
                var featureObj = {};

                _.each(params, function (eachParam) {
                    featureObj[eachParam] = booleanValue;
                });

                featureParams[0] = featureObj;
            },

            setSingleFeatureParam = function (featureName, boolStatus) {
                var uiFeatureName = dbFeatureToUIFeatureMap[featureName];
                if (uiFeatureName) {
                    if (_.isArray(uiFeatureName)) {
                        _.each(uiFeatureName, function(feature) {
                            featureParams[0][feature] = boolStatus;
                        });
                    } else {
                        featureParams[0][uiFeatureName] = boolStatus;
                    }
                }
            },

            disableReportTab = function () {
                featureParams[0].report_overview = false;
                featureParams[0].inventory = false;
                featureParams[0].performance = false;
                featureParams[0].quality = false;
                featureParams[0].cost = false;
                featureParams[0].optimization_transparency = false;
                featureParams[0].platform = false;
                featureParams[0].scheduled_reports = false;
                featureParams[0].collective_insights = false;
                featureParams[0].reports_invoice = false;
            },

            setFeatureParams = function (featuresArr) {
                serverResponseReceived = true;

                if (featuresArr.indexOf('ENABLE_ALL') !== -1) {
                    // Enable all features
                    setAllFeatureParams(true);
                } else {
                    // set all feature params to false before setting it true based on API enable list
                    setAllFeatureParams(false);

                    // set params true sent in enable list of API
                    _.each(featuresArr, function (feature) {
                        setSingleFeatureParam(feature, true);
                    });

                    // check if reports tab not there
                    if (featuresArr.indexOf('REPORTS_TAB') < 0) {
                        disableReportTab();
                    }

                    if (featuresArr.indexOf('MEDIAPLAN_HUB') < 0) {
                        setSingleFeatureParam('AD_SETUP', false);
                    }
                }

                if (featureParams[0].dashboard === false) {
                    featureParams[0].mediaplan_list = true;
                }

                $rootScope.$broadcast('features');
            },

            getFeatureParams = function () {
                return featureParams;
            },

            setGetFeatureParams = function (feature_param) {
                var masterClientId,

                    setFparams = function () {
                        var featureParams = getFeatureParams();

                        if ((feature_param === 'dashboard') && (featureParams[0][feature_param] === false)) {
                            $location.url(vistoconfig.MEDIA_PLANS_LINK);
                            return false;
                        } else if (featureParams[0][feature_param] === false) {
                            $location.url('/');
                        }
                    };

                if (serverResponseReceived) {
                    setFparams();
                } else {
                    masterClientId = JSON.parse(localStorage.getItem('masterClient')).id;

                    if (masterClientId) {
                        workflowService
                            .getClientData(masterClientId)
                            .then(function (response) {
                                serverResponseReceived = true;

                                if (response && response.data.data.features) {
                                    setFeatureParams(response.data.data.features, 'headercontroller');
                                }

                                setFparams();
                            });
                    }
                }
            };

        // initialize feature params
        setAllFeatureParams(false);

        return  {
            setGetFeatureParams: setGetFeatureParams,
            setFeatureParams: setFeatureParams,
            getFeatureParams: getFeatureParams
        };
    });
});
