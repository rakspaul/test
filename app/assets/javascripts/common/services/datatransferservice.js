(function (){
  'use strict';
  commonModule.factory("dataTransferService" , function($http, loginModel) {
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
          filterDurationType:'life_time',
          filterDurationValue:'Life Time',
          filterKpiType:param.selectedCampaign.kpi_type,
          filterKpiValue:param.selectedCampaign.kpi_type.toUpperCase(),
          primary_kpi: param.selectedCampaign.kpi_type,
          previousCampaignId:null
        }));
      },
      initReportingData : function(param){
        localStorage.setItem( 'campaignDetails', JSON.stringify({
          campaignId :  param.selectedCampaign.id,
          campaignName : param.selectedCampaign.name,
          strategyId : param.strategyId,
          strategyName : param.strategyName,
          strategyStartDate: param.strategyStartDate,
          strategyEndDate : param.strategyEndDate,
          filterDurationType:'life_time',
          filterDurationValue:'Life Time',
          filterKpiType:param.selectedCampaign.kpi_type,
          filterKpiValue:(param.selectedCampaign.kpi_type === 'action_rate' || param.selectedCampaign.kpi_type === 'action rate' ) ? 'Action rate' : param.selectedCampaign.kpi_type.toUpperCase(),
          primary_kpi: param.selectedCampaign.kpi_type
        }));
      },

      getDomainReportsValue : function(key){
        if(localStorage.getItem('campaignDetails') !== null && JSON.parse(localStorage.getItem('campaignDetails'))[key] !== undefined && JSON.parse(localStorage.getItem('campaignDetails'))[key] !== null) {
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