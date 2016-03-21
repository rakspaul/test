define(['angularAMD','workflow/services/workflow_service'], function (angularAMD) {
    angularAMD.service('featuresService', function ($rootScope,$location,workflowService) {

        var params = ['dashboard','report_overview', 'inventory', 'performance', 'quality', 'cost', 'optimization_impact', 'platform', 'scheduled', 'collective',
            'scheduled_reports', 'collective_insights', 'create_mediaplan', 'dashboard', 'mediaplan_list', 'ad_setup', 'mediaplan_hub', 'creative_list', 'reports_tab'];
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

        this.setSingleFeatureParam = function (fParam) {
            var self = this;
            switch (fParam) {
                case 'REP_OVERVIEW':
                    this.featureParams[0].report_overview = true;
                    break;
                case 'REP_INV':
                    this.featureParams[0].inventory = true;
                    break;
                case 'REP_PERF':
                    this.featureParams[0].performance = true;
                    break;
                case 'REP_QUALITY':
                    this.featureParams[0].quality = true;
                    break;
                case 'COST':
                    this.featureParams[0].cost = true;
                    break;
                case 'REP_OPT':
                    this.featureParams[0].optimization_impact = true;
                    break;
                case 'REP_PLATFORM':
                    this.featureParams[0].platform = true;
                    break;
                case 'REP_SCH':
                    this.featureParams[0].scheduled_reports = true;
                    break;
                case 'REP_INSIGHTS':
                    this.featureParams[0].collective_insights = true;
                    break;
                case 'MEDIAPLAN_SETUP':
                    this.featureParams[0].create_mediaplan = true;
                    break;
                case 'MEDIAPLAN_HUB':
                    this.featureParams[0].mediaplan_hub = true;
                    break;
                case 'AD_SETUP':
                    this.featureParams[0].ad_setup = true;
                    break;
                case 'MEDIAPLAN_LIST':
                    this.featureParams[0].mediaplan_list = true;
                    break;
                case 'CREATIVE_LIST':
                    this.featureParams[0].creative_list = true;
                    break;
                case 'DASHBOARD':
                    this.featureParams[0].dashboard = true;
                    break;
                case 'REPORTS_TAB':
                    this.featureParams[0].reports_tab = true;
                    break;
            }
        }

        this.disableReportTab = function() {
            this.featureParams[0].report_overview = false;
            this.featureParams[0].inventory = false;
            this.featureParams[0].performance = false;
            this.featureParams[0].quality = false;
            this.featureParams[0].cost = false;
            this.featureParams[0].optimization_impact = false;
            this.featureParams[0].platform = false;
            this.featureParams[0].scheduled_reports = false;
            this.featureParams[0].collective_insights = false;
        }

        this.setFeatureParams = function (featuresArr,consoleIt) {
            this.serverResponseReceived = true;
            //API passes parameters :
            var self = this;
            //console.log('server feature Arr: ',featuresArr);

            if (featuresArr.indexOf('ENABLE_ALL') !==-1) {
                //Enable all features
                this.setAllFeatureParams(true);
            } else {
                _.each(featuresArr, function (features) {
                    self.setSingleFeatureParam(features)
                })
                //check if reports tab not there
                if (featuresArr.indexOf('REPORTS_TAB') < 0) {
                    this.disableReportTab();
                }
            }
            if(this.featureParams[0].dashboard === false) {
                this.featureParams[0].mediaplan_list = true;
            }
            $rootScope.$broadcast('features');
        }

        this.getFeatureParams = function (whichplace) { //console.log('this.featureParams',this.featureParams[0]);
            return this.featureParams;
        }

        this.setGetFeatureParams = function(feature_param) {
            var self = this;
            var setFparams = function() {
                var featureParams = self.getFeatureParams();
                if(featureParams[0][feature_param] === false) {
                    $location.url('/');
                }
            }
            if(this.serverResponseReceived) {
                setFparams();
            } else {
                var clientId = JSON.parse(localStorage.getItem('selectedClient')).id;
                if(clientId) {
                    workflowService.getClientData(clientId).then(function (response) {
                        this.serverResponseReceived = true;
                        self.setFeatureParams(response.data.data.features,'headercontroller');
                        setFparams();
                    });
                }

            }
        }


    })
});
