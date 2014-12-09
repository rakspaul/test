/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("domainReports", ["performanceService", "dataTransferService", function (performanceService,  datatransferservice) {

        return {
            getReportsDropDowns : function() {
                return {
                    'tabs' : [
                        {
                            href:'performance',
                            title: 'Performance'
                        },
                        {
                            href:'cost',
                            title: 'Cost'
                        },
                        {
                            href:'inventory',
                            title: 'Inventory'
                        },
                        {
                            href:'viewability',
                            title: 'Viewability'
                        },
                        {
                            href:'optimization',
                            title: 'Optimization Impact'
                        }

                    ],
                    'duration' : [
//                        {value: 'weekly', text: 'Last 7 days'},
//                        {value: 'monthly', text: 'Last month'},
                        {value: 'life_time', text: 'Life Time'}
                    ],
                    'kpiTypes' : [
                        {value: 'CTR', text: 'CTR'},
                        {value: 'CPC', text: 'CPC'},
                        {value: 'CPM', text: 'CPM'},
                        {value: 'CPA', text: 'CPA'},
                        {value: 'action_rate', text: 'Action Rate'}
                    ],
                    activeTab : document.location.hash.substring(2)
                }
            },
            getDefaultValues : function() {
                return {
                    campaign : {
                        id: '-1',
                        name: 'Loading...'

                    },
                    strategy : {
                        id:-1,
                        name:'Loading...',
                        startDate: '-1',
                        endDate: '-1'
                    }
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
                    kpi_type: datatransferservice.getDomainReportsValue('filterKpiType') ? datatransferservice.getDomainReportsValue('filterKpiType')  :  'CTR',
                    kpi_type_text: datatransferservice.getDomainReportsValue('filterKpiValue') ? datatransferservice.getDomainReportsValue('filterKpiValue')  :   'CTR'
                };
            },
            getCampaignListForUser : function() {

                if(datatransferservice.getCampaignList()) {
                    return datatransferservice.getCampaignList();
                }else {
                    return performanceService.getCampaingsForUser();
                }
            },
            getCampaignStrategyList : function(campaignId) {
                if(datatransferservice.getCampaignStrategyList(campaignId)) {
                    return datatransferservice.getCampaignStrategyList(campaignId);
                }else {
                    return performanceService.getStrategiesForCampaign(campaignId);
                }
            },
            loadFirstStrategy : function(id, name, startDate, endDate) {
                var strategyObj = {id:null, name:null, startDate: null, endDate: null};
                strategyObj.id = datatransferservice.getDomainReportsValue('strategyId') ? datatransferservice.getDomainReportsValue('strategyId') : id;
                strategyObj.name = datatransferservice.getDomainReportsValue('strategyName') ? datatransferservice.getDomainReportsValue('strategyName') : name;
                strategyObj.startDate = datatransferservice.getDomainReportsValue('strategyStartDate') ? datatransferservice.getDomainReportsValue('strategyStartDate') : startDate;
                strategyObj.endDate = datatransferservice.getDomainReportsValue('strategyEndDate') ? datatransferservice.getDomainReportsValue('strategyEndDate') : endDate;
                return strategyObj;

            }
        };
    }]);
}());