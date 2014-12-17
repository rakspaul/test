var angObj = angObj || {} ;
(function (){
    'use strict';
    angObj.factory("dataTransferService" , function($http){
        localStorage.setItem( 'campaignDetails', JSON.stringify({
            campaignId : null,
            campaignName:null,
            strategyId : null,
            strategyName : null,
            strategyStartDate : null,
            strategyEndDate : null,
            filterDurationType:null,
            filterDurationValue:null,
            filterKpiType:null,
            filterKpiValue:null,
            previousCampaignId:null
        }));
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
                    navigationFromReports: param.navigationFromReports,
                    strategyId : null,
                    strategyName : null,
                    filterDurationType:null,
                    filterDurationValue:null,
                    filterKpiType:null,
                    filterKpiValue:null,
                    previousCampaignId:null
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
            getNavigationFromReports : function(){
                return this.getCampaignDetailsObject('navigationFromReports');
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
            getClickedCampaignStartDate : function(){
                return  this.getCampaignDetailsObject('startDate');
            },
            getClickedCampaignEndDate : function(){
                return  this.getCampaignDetailsObject('endDate');
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
            setCampaignList : function(key, campaignListObject) {
                localStorage['campaignList'] = JSON.stringify(campaignListObject);
            },
            setAllCampaignList : function(key, campaignListObject) {
                localStorage['allCampaignList'] = JSON.stringify(campaignListObject);
            },
            setCampaignStrategyList : function(campaignId , StrategyListObject) {
                if(campaignId > 0) {
                    localStorage.setItem('strategy_'+campaignId,  JSON.stringify(StrategyListObject));
                }
            },
            getCampaignList : function(){
                if(localStorage['campaignList'] === undefined){
                    return false;
                }else {
                    return JSON.parse( localStorage['campaignList']);
                }
            },
            getAllCampaignList : function(){
                if(localStorage['allCampaignList'] === undefined){
                    return false;
                }else {
                    return JSON.parse( localStorage['allCampaignList']);
                }
            },
            getCampaignStrategyList : function(campaignId){
                if(campaignId > 0) {
                    if (localStorage['strategy_'+campaignId] === undefined) {
                        return false;
                    } else {
                        if(localStorage['strategy_'+campaignId] === undefined) {
                            console.log('LocalStorage data for strategyList for campaignId : '+campaignId+' in localStorage[strategy_'+campaignId+'] not found');
                        } else {
                            return JSON.parse(localStorage['strategy_'+campaignId]);
                        }
                    }
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