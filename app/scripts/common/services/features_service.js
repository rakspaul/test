define(['angularAMD','workflow/services/workflow_service','common/services/vistoconfig_service'], function (angularAMD) {
    angularAMD.service('featuresService', function ($rootScope,$location,workflowService,vistoconfig) {

        var params = ['dashboard','report_overview', 'inventory', 'performance', 'quality', 'cost', 'optimization_create', 
            'optimization_transparency', 'platform', 'scheduled', 'collective',
            'scheduled_reports', 'collective_insights', 'create_mediaplan', 'dashboard', 'mediaplan_list', 'ad_setup', 
            'mediaplan_hub', 'creative_list', 'reports_tab'];

        this.featureParams = [];

        this.serverResponseReceived = false;

        this.setAllFeatureParams = function (booleanValue) {
            var featureObj = {};
            _.each(params, function (eachParam) {
                featureObj[eachParam] = booleanValue;
            })
            this.featureParams[0] = featureObj;
        }

        //initialize feature params
        this.setAllFeatureParams(false);

        this.setSingleFeatureParam = function (fParam, boolStatus) {
            switch (fParam) {
                case 'REP_OVERVIEW':
                    this.featureParams[0].report_overview = boolStatus;
                    break;
                case 'REP_INV':
                    this.featureParams[0].inventory = boolStatus;
                    break;
                case 'REP_PERF':
                    this.featureParams[0].performance = boolStatus;
                    break;
                case 'REP_QUALITY':
                    this.featureParams[0].quality = boolStatus;
                    break;
                case 'COST':
                    this.featureParams[0].cost = boolStatus;
                    break;
                case 'REP_OPT_WRITE':
                    this.featureParams[0].optimization_create = boolStatus;
                    this.featureParams[0].optimization_transparency = boolStatus;
                    break;
                case 'REP_OPT_TRANSPARENCY':
                    this.featureParams[0].optimization_transparency = boolStatus;
                    break;
                case 'REP_PLATFORM':
                    this.featureParams[0].platform = boolStatus;
                    break;
                case 'REP_SCH':
                    this.featureParams[0].scheduled_reports = boolStatus;
                    break;
                case 'REP_INSIGHTS':
                    this.featureParams[0].collective_insights = boolStatus;
                    break;
                case 'MEDIAPLAN_SETUP':
                    this.featureParams[0].create_mediaplan = boolStatus;
                    break;
                case 'MEDIAPLAN_HUB':
                    this.featureParams[0].mediaplan_hub = boolStatus;
                    break;
                case 'AD_SETUP':
                    this.featureParams[0].ad_setup = boolStatus;
                    break;
                case 'MEDIAPLAN_LIST':
                    this.featureParams[0].mediaplan_list = boolStatus;
                    break;
                case 'CREATIVE_LIST':
                    this.featureParams[0].creative_list = boolStatus;
                    break;
                case 'DASHBOARD':
                    this.featureParams[0].dashboard = boolStatus;
                    break;
                case 'REPORTS_TAB':
                    this.featureParams[0].reports_tab = boolStatus;
                    break;
            }
        }

        this.disableReportTab = function() {
            this.featureParams[0].report_overview = false;
            this.featureParams[0].inventory = false;
            this.featureParams[0].performance = false;
            this.featureParams[0].quality = false;
            this.featureParams[0].cost = false;
            this.featureParams[0].optimization_transparency = false;
            this.featureParams[0].platform = false;
            this.featureParams[0].scheduled_reports = false;
            this.featureParams[0].collective_insights = false;
        }

        this.setFeatureParams = function (featuresArr) {
            this.serverResponseReceived = true;
            //API passes parameters :
            var self = this;

            if (featuresArr.indexOf('ENABLE_ALL') !== -1) {
                //Enable all features
                this.setAllFeatureParams(true);
            } else {
                //set all feature params to false before setting it true based on API enable list
                this.setAllFeatureParams(false);

                //set params true sent in enable list of API
                _.each(featuresArr, function (feature, index) {
                    self.setSingleFeatureParam(feature, true);
                })

                //check if reports tab not there
                if (featuresArr.indexOf('REPORTS_TAB') < 0) {
                    this.disableReportTab();
                }

                if (featuresArr.indexOf('MEDIAPLAN_HUB') < 0) {
                    this.setSingleFeatureParam('AD_SETUP', false);
                }

            }
            if(this.featureParams[0].dashboard === false) {
                this.featureParams[0].mediaplan_list = true;
            }
            $rootScope.$broadcast('features');
        }

        this.getFeatureParams = function (whichplace) {
            return this.featureParams;
        }

        this.setGetFeatureParams = function(feature_param) {
            var self = this;
            var setFparams = function() {
                var featureParams = self.getFeatureParams();

                if((feature_param == 'dashboard') && (featureParams[0][feature_param] === false)) {
                    $location.url(vistoconfig.MEDIA_PLANS_LINK);
                    return false;
                } else if(featureParams[0][feature_param] === false) {
                    $location.url('/');
                }
            }
            if(this.serverResponseReceived) {
                setFparams();
            } else {
                var masterClientId = JSON.parse(localStorage.getItem('masterClient')).id;
                if(masterClientId) {
                    workflowService.getClientData(masterClientId).then(function (response) {
                        this.serverResponseReceived = true;
                        self.setFeatureParams(response.data.data.features,'headercontroller');
                        setFparams();
                    });
                }

            }
        }


    })
});
