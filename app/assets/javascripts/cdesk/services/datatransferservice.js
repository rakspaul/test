var angObj = angObj || {} ;
(function (){
    'use strict';
    angObj.factory("dataTransferService" , function($http){
        return {
            initOptimizationData : function(param){
                localStorage.setItem( 'campaignDetails', JSON.stringify({
                    campaignId :  param.selectedCampaign.orderId,
                    startDate : param.selectedCampaign.startDate,
                    endDate : param.selectedCampaign.endDate,
                    campaignName : param.selectedCampaign.campaignTitle,
                    clickedStrategy  :  param.selectedStrategy,
                    clickedAction  :  param.selectedAction,
                    clickedKpiType  :  param.selectedCampaign.kpiType,
                    clickedKpiValue  :  param.selectedCampaign.kpiValue,
                    clickedActionItems  :  param.selectedActionItems,
                    strategyId : null,
                    strategyName : null,
                    filterDurationType:null,
                    filterDurationValue:null,
                    filterKpiType:null,
                    filterKpiValue:null
                }));
            },
            getDomainReportsValue : function(key){
                if(localStorage.getItem('campaignDetails') !== null && JSON.parse(localStorage.getItem('campaignDetails'))[key] !== undefined) {
                    return JSON.parse(localStorage.getItem('campaignDetails'))[key];
                }else{
                    return false;
                }
            },
            getCampaignDetailsObject : function(key) {
                if(localStorage.getItem('campaignDetails') !== null) {
                    return JSON.parse(localStorage.getItem('campaignDetails'))[key];
                }else{
                    return '';
                }
            },
            getClickedStrategyId : function(){
                return  this.getCampaignDetailsObject('strategyId');
            },
            getClickedStrategyName : function(){
                return  this.getCampaignDetailsObject('strategyName');
            },
            getClickedCampaignId : function(){
                return  this.getCampaignDetailsObject('campaignId');
            },
            getClickedCampaignName : function(){
                return  this.getCampaignDetailsObject('campaignName');
            },
            getClickedStrategy : function(){
                return  this.getCampaignDetailsObject('clickedStrategy');
            },
            getClickedAction : function(){
                return  this.getCampaignDetailsObject('clickedAction');
            },
            getClickedKpiType : function(){
                return  this.getCampaignDetailsObject('clickedKpiType');
            },
            getClickedKpiValue : function(){
                return  this.getCampaignDetailsObject('clickedKpiValue');
            },
            getClickedActionItems : function(){
                return  this.getCampaignDetailsObject('clickedActionItems');
            },
            getClickedCampaignStartDate : function(){
                return  this.getCampaignDetailsObject('startDate');
            },
            getClickedCampaignEndDate : function(){
                return  this.getCampaignDetailsObject('endDate');
            },
            setCampaignList : function(key, campaignListObject) {
                localStorage['campaignList'] = JSON.stringify(campaignListObject);
            },
            getCampaignList : function(){
                if(localStorage['campaignList'] === undefined){
                    return false;
                }else {
                    return JSON.parse( localStorage['campaignList']);
                }
            },
            //@obj format :{campaignDetails key : value, ...});
            updateExistingStorageObjects : function(obj){
                if(localStorage['campaignDetails'] === undefined){
                    return false;
                }else {
                    var storedObj = JSON.parse(localStorage['campaignDetails']);
                    for(var key in obj) {
                        storedObj[key] = obj[key];
                    }
                    localStorage['campaignDetails'] = JSON.stringify(storedObj);
                }
            }

        };
    });
}());