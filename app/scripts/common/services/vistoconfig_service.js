define(['angularAMD'], function (angularAMD) {
    angularAMD.service('vistoconfig', ['$routeParams', function ($routeParams) {
        var urlPaths = {
            apiSerivicesUrl: scala_api,
            apiSerivicesUrl_NEW: scala_api_NEW,
            workflow_apiServicesUrl: workflow_api,
            WORKFLOW_API_URL: workflowCreate_api
        },
            clientTimeZone,
            selectedAccountData,
            noMediaPlanFoundMsg,
            defaultMsg = {
                message : '',
                isErrorMsg : 0
            };

        this.supportedBrowser = [
            {
                name: 'Chrome',
                version: 36
            },

            {
                name: 'Firefox',
                version: 35
            },

            {
                name: 'Internet Explorer',
                version: 10
            },

            {
                name: 'Safari',
                version: 8
            }
        ];

        this.actionColors = [
            '#7ED86C',
            '#2C417F',
            '#FF9F19',
            '#A750E5',
            '#6C717F',
            '#3F7F57',
            '#7F4F2C',
            '#3687D8',
            '#B235B2'
        ];

        this.screenTypeMap = {
            desktop: 'icon-desktop',
            unknown: 'icon-help',
            smartphone: 'icon-mobile',
            mobile: 'icon-mobile',
            tv: 'icon-desktop',
            video: 'icon-video',
            'set-top box': 'icon-desktop',
            tablet: 'icon-tablet',
            other: 'icon-image',
            social: 'icon-social',
            RICHMEDIA: 'icon-rich-media',
            display: 'icon-desktop',
            DISPLAY: 'icon-desktop'
        };

        this.formatTypeMap = {
            desktop: 'icon-desktop',
            unknown: 'icon-help',
            smartphone: 'icon-mobile',
            mobile: 'icon-mobile',
            tv: 'icon-desktop',
            video: 'icon-video',
            social: 'icon-social',
            richmedia: 'icon-rich-media',
            'set-top box': 'icon-desktop',
            tablet: 'icon-tablet',
            other: 'icon-image',
            display: 'icon-desktop',
            DISPLAY: 'icon-desktop'
        };

        this.kpiList = [
            {kpiType: 'ACTION RATE',                displayName: 'Action Rate'},
            {kpiType: 'CPA',                        displayName: 'CPA'},
            {kpiType: 'CPC',                        displayName: 'CPC'},
            {kpiType: 'CPM',                        displayName: 'CPM'},
            {kpiType: 'CTR',                        displayName: 'CTR'},
            {kpiType: 'IMPRESSIONS',                displayName: 'Impressions'},
            {kpiType: 'POST CLICK CPA',             displayName: 'Post Click CPA'},
            {kpiType: 'SUSPICIOUS ACTIVITY RATE',   displayName: 'Suspicious Activity %'},
            {kpiType: 'SPEND',                      displayName: 'Spend'},
            {kpiType: 'VIEWABLE IMPRESSIONS',       displayName: 'Viewable Impressions'},
            //{kpiType: 'VIEWABLE RATE',              displayName: 'Viewable Rate'},
            {kpiType: 'VTC',                        displayName: 'VTC'}
        ];

        this.kpiDropDown = [
            { kpi: 'action_rate',                   displayName: 'Action Rate' },
            { kpi: 'cpa',                           displayName: 'CPA' },
            { kpi: 'cpc',                           displayName: 'CPC' },
            { kpi: 'cpm',                           displayName: 'CPM' },
            { kpi: 'ctr',                           displayName: 'CTR' },
            { kpi: 'pc_cpa',                        displayName: 'Post Click CPA' },
            { kpi: 'spend',                         displayName: 'Spend' },
            //{ kpi: 'suspicious_impressions_perc',   displayName: 'Suspicious Activity %' },
            //{ kpi: 'viewable_impressions',          displayName: 'Viewable Impressions' },
            //{ kpi: 'viewable_impressions_perc',     displayName: 'Viewable Rate' },
            { kpi: 'vtc',                           displayName: 'VTC' }
        ];

        this.newkpiDropDownAlt = [
            { kpi: 'cpa',                           displayName: 'CPA' },
            { kpi: 'cpc',                           displayName: 'CPC' },
            { kpi: 'cpm',                           displayName: 'CPM' },
            { kpi: 'pc_cpa',                        displayName: 'Post Click CPA' },
            { kpi: 'spend',                         displayName: 'Spend' }
           // { kpi: 'suspicious_impressions_perc',   displayName: 'Suspicious Activity %' },
           // { kpi: 'viewable_impressions',          displayName: 'Viewable Impressions' },
           // { kpi: 'viewable_impressions_perc',     displayName: 'Viewable Rate' }
        ];

        this.kpiTypeSymbolMap = {
            '%': ['VTC', 'CTR', 'ACTION RATE', 'SUSPICIOUS ACTIVITY RATE', 'VIEWABLE RATE'],
            '#': ['IMPRESSIONS', 'VIEWABLE IMPRESSIONS']
        };

        this.PERFORMANCE_LINK = '/performance';
        this.PLATFORM_LINK = '/platform';
        this.COST_LINK = '/cost';
        this.INVENTORY_LINK = '/inventory';
        this.QUALITY_LINK = '/quality';
        this.OPTIMIZATION_LINK = '/optimization';
        this.MEDIA_PLANS_LINK = '/mediaplans';
        this.MEDIAPLAN_CREATE = '/mediaplan/create';

        this.api = scala_api;
        this.apiPaths = urlPaths;

        this.LINE_ITEM_DROPDWON_OBJECT = {
            name: 'All Line Items',
            id: -1,
            type: 'all'
        };

        this.getMasterClientId = function() {
            return Number($routeParams.accountId);
        };

        this.getSelectedAccountId = function() {
            return $routeParams.subAccountId || $routeParams.accountId;
        };

        this.getSelectAdvertiserId = function() {
            return $routeParams.advertiserId || -1;
        };

        this.getSelectedBrandId = function() {
            return $routeParams.brandId || -1;
        };

        this.getSelectedCampaignId = function() {
            return $routeParams.campaignId;
        };

        this.getSelectedStrategyId = function() {
            return $routeParams.li_id;
        };

        this.timeZoneNameMapper = {
            //Britain standard time
            'GB' : 'GMT',

            //America/New_York
            'EST' : 'EST',

            'US/Eastern' : 'America/New_York',

            //America/Los_Angeles
            'US/Pacific' : 'America/Los_Angeles',

            //America/Chicago
            'US/Central' : 'America/Chicago',

            //America/Denver
            'US/Mountain' : 'America/Denver',

            'US/Alaska' : 'America/Anchorage',

            'US/Hawaii' : 'Pacific/Honolulu',

            'GMT' : 'UTC'
        };

        this.setClientTimeZone = function(timeZone) {
            clientTimeZone = timeZone;
        };

        this.getClientTimeZone = function() {
            return clientTimeZone;
        };

        this.setNoMediaPlanFoundMsg = function(msgObj) {
            noMediaPlanFoundMsg = msgObj;
        };

        this.getNoMediaPlanFoundMsg = function() {
           return noMediaPlanFoundMsg;
        };

        this.setCurrentSelectedAccount = function(accountData) {
            selectedAccountData = accountData;
        };

        this.getCurrentSelectedAccount = function() {
            return selectedAccountData;
        };

        this.defaultMessage = {
            'set' : function(data){
                for(var k in data){
                    defaultMsg[k] = data[k];
                }
            },
            'get' : function(){
                return defaultMsg;
            },
            'reset' : function(){
                defaultMsg = {
                    message : '',
                    isErrorMsg : 0
                };
            }
        };

    }]);
});
