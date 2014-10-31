var angObj = angObj || {} ;
(function (){
    'use strict';
    angObj.factory("dataTransferService" , function($http){
        var campaignId = '', clickedAction = '', clickedStrategy = '', campaignName = '', clickedKpiType='', clickedKpiValue='', clickedActionItems='', endDate='', startDate='';
        return {

            initOptimizationData : function(param){
                campaignId = param.selectedCampaign.orderId;
                startDate = param.selectedCampaign.startDate;
                endDate = param.selectedCampaign.endDate;
                campaignName = param.selectedCampaign.campaignTitle ;
                clickedStrategy = param.selectedStrategy ;
                clickedAction = param.selectedAction ;
                clickedKpiType = param.selectedCampaign.kpiType ;
                clickedKpiValue = param.selectedCampaign.kpiValue ;
                clickedActionItems = param.selectedActionItems;
            },

            getClickedCampaignId : function(){
                return campaignId;
            },
            getClickedCampaignName : function(){
                return campaignName;
            },
            getClickedStrategy : function(){
                return clickedStrategy;
            },
            getClickedAction : function(){
                return clickedAction;
            },
            getClickedKpiType : function(){
                return clickedKpiType;
            },
            getClickedKpiValue : function(){
                return clickedKpiValue;
            },
            getClickedActionItems : function(){
                return clickedActionItems;
            },
            getClickedCampaignStartDate : function(){
                return startDate;
            },
            getClickedCampaignEndDate : function(){
                return endDate;
            }

        };


    });
}());