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
            getDurationKpi : function () {
                return {
                    time_filter: datatransferservice.getDomainReportsValue('filterDurationType') ? datatransferservice.getDomainReportsValue('filterDurationType') : 'life_time',
                    time_filter_text: datatransferservice.getDomainReportsValue('filterDurationValue') ? datatransferservice.getDomainReportsValue('filterDurationValue')  : 'Life Time',
                    kpi_type: datatransferservice.getDomainReportsValue('filterKpiType') ? datatransferservice.getDomainReportsValue('filterKpiType')  :  'CPA',
                    kpi_type_text: datatransferservice.getDomainReportsValue('filterKpiValue') ? datatransferservice.getDomainReportsValue('filterKpiValue')  :   'CPA'
                };
            },
            getCampaignListForUser : function() {

                if(datatransferservice.getCampaignList()){
                    return datatransferservice.getCampaignList();
                }else {
                    return inventoryService.getCampaingsForUser();
                }
            }
        };
    }]);
}());