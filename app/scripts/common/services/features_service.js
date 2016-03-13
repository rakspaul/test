define(['angularAMD'], function (angularAMD) {
    angularAMD.service('featuresService', function () {

        var params = ['dashboard', 'mediaplan', 'report_overview', 'inventory', 'performance', 'quality', 'cost', 'optimization_impact', 'platform', 'scheduled', 'collective',
            'scheduled_reports', 'collective_insights', 'create_mediaplan', 'dashboard', 'mediaplan_list', 'ad_setup', 'meidaplan_hub', 'creative_list', 'reports_tab'];
        this.featureParams = [];

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
                    self.featureParams[0].report_overview = true;
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
                    this.featureParams[0].meidaplan_hub = true;
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

        this.setFeatureParams = function (featuresArr,consoleIt) {
            //API passes parameters :
            var self = this;
           console.log('set feature params',consoleIt,featuresArr);
            // this.featureParams['inventory_page'] = true;
           // featuresArr.push('ENABLE_ALL');
            featuresArr.push('REP_SCH');
            featuresArr.push('REP_QUALITY');
            featuresArr.push('REP_PERF');
            featuresArr.push('COST');
            console.log('features service: ', featuresArr);

            if (featuresArr.indexOf('ENABLE_ALL') > 0) {
                //Enable all features
                this.setAllFeatureParams(true);
            } else {
                _.each(featuresArr, function (features) {
                    self.setSingleFeatureParam(features)
                })
            }
            if(this.featureParams[0].dashboard === false) {
                this.featureParams[0].mediaplan = true;
            }

        }

        this.getFeatureParams = function (whichplace) {
            console.log('get feature params',whichplace,this.featureParams[0]);
            return this.featureParams;
        }


    })
});
