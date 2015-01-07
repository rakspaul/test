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
                        {value: 'action_rate', text: 'Action Rate'},
                        {value: 'CPA', text: 'CPA'},
                        {value: 'CPC', text: 'CPC'},
                        {value: 'CPM', text: 'CPM'},
                        {value: 'VTC', text: 'VTC'}
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
            getAllCampaignListForUser : function(brand_id) {

                if(datatransferservice.getAllCampaignList(brand_id)) {
                    return datatransferservice.getAllCampaignList(brand_id);
                }else {
                    return performanceService.getCampaingsForUser(brand_id);
                }
            },
            //TODO: Remove getCampaignStrategyList method. Better have a seprate service which has api call for campaing and strategy drop down.
            // directly call that service method from each controller instead of calling following ( to get list of strategy for a campaign)
            getCampaignStrategyList : function(campaignId) {
                 return performanceService.getStrategiesForCampaign(campaignId);

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