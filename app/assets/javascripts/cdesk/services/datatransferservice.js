var angObj = angObj || {} ;
(function (){
    'use strict';
    angObj.factory("dataTransferService" , function($http){
         var campaignId = '', clickedAction = '', clickedStrategy = '', campaignName = '';
        return {

            initOptimizationData : function(param){
                campaignId = param.selectedCampaign.orderId;
                campaignName = param.selectedCampaign.campaignTitle ;
                clickedAction = param.selectedStrategy ;
                clickedStrategy = param.selectedCampaign ;
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
            }

        };


    });
}());