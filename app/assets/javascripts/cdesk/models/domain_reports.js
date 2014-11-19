/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("domainReports", ["inventoryService", "dataTransferService", function (inventoryService,  datatransferservice) {

        return {
            getReportsDropDowns : function() {
                return {
                    'tabs' : [
                        {
                            href:'#',
                            title: 'Optimization Impact'
                        },
                        {
                            href:'#',
                            title: 'Cost'
                        },
                        {
                            href:'#',
                            title: 'Performance'
                        },
                        {
                            href:'inventory',
                            title: 'Inventory'
                        },
                        {
                            href:'viewability',
                            title: 'Viewability'
                        }
                    ],
                    'duration' : [
                        {value: 'weekly', text: 'Last 7 days'},
                        {value: 'monthly', text: 'Last month'},
                        {value: 'life_time', text: 'Life Time'}
                    ],
                    'kpiTypes' : [
                        {value: 'CPA', text: 'CPA'},
                        {value: 'CPC', text: 'CPC'},
                        {value: 'CPM', text: 'CPM'},
                        {value: 'CTR', text: 'CTR'},
                        {value: 'action_rate', text: 'Action Rate'}
                    ],
                    activeTab : document.location.hash.substring(2)
                }
            },
            getDefaultValues : function() {
                return {
                        id: '-1',
                        name: 'Loading...'
                }
            },
            getNotFound : function() {
                return {
                    campaign : {
                        id:-1,
                        name:'No Campaign Found'
                    },
                    strategy : {
                        id:-1,
                        name:'No Strategy Found'
                    }
                };
            },
            getFound : function(obj) {
                return {
                    campaign : {
                        id: datatransferservice.getDomainReportsValue('campaignId') ? datatransferservice.getDomainReportsValue('campaignId') : obj.campaign_id,
                        name: datatransferservice.getDomainReportsValue('campaignName') ? datatransferservice.getDomainReportsValue('campaignName') :  obj.name
                    },
                    strategy : {
                        id:-1,
                        name:'No Strategy Found'
                    }
                };
            },
            checkStatus : function (campaignname, strategyname) {
                if (campaignname == 'Loading...' ||
                    strategyname == 'Loading...' ||
                    campaignname == 'No Campaign Found' ||
                    strategyname == 'No Strategy Found') {
                    return false;
                }
                return true;
            },

            getDurationKpi : function () {
                return {
                    time_filter: datatransferservice.getDomainReportsValue('filterDurationType') ? datatransferservice.getDomainReportsValue('filterDurationType') : 'life_time',
                    time_filter_text: datatransferservice.getDomainReportsValue('filterDurationValue') ? datatransferservice.getDomainReportsValue('filterDurationValue')  : 'Life Time',
                    kpi_type: datatransferservice.getDomainReportsValue('filterKpiType') ? datatransferservice.getDomainReportsValue('filterKpiType')  :  'CPA',
                    kpi_type_text: datatransferservice.getDomainReportsValue('filterKpiValue') ? datatransferservice.getDomainReportsValue('filterKpiValue')  :   'CPA'
                };
            },
            getCampaignListForUser : function() {

                if(datatransferservice.getCampaignList()) {
                    return datatransferservice.getCampaignList();
                }else {
                    return inventoryService.getCampaingsForUser();
                }
            },
            getCampaignStrategyList : function(campaignId) {
                if(datatransferservice.getCampaignStrategyList(campaignId)) {
                    return datatransferservice.getCampaignStrategyList(campaignId);
                }else {
                    return inventoryService.getStrategiesForCampaign(campaignId);
                }
            },
            loadFirstStrategy : function(id, name) {
                var strategyObj = {id:null, name:null};
                if(datatransferservice.getDomainReportsValue('previousCampaignId') !== datatransferservice.getDomainReportsValue('campaignId')) {
                    strategyObj.id = id;
                    strategyObj.name = name
                }else {
                    strategyObj.id = datatransferservice.getDomainReportsValue('strategyId') ? datatransferservice.getDomainReportsValue('strategyId') : id;
                    strategyObj.name = datatransferservice.getDomainReportsValue('strategyName') ? datatransferservice.getDomainReportsValue('strategyName') : name;
                }

            }
        };
    }]);
}());