(function (){
  'use strict';
  commonModule.factory("dataTransferService" , function($http, loginModel) {
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
      initReportingData : function(param){
        console.log("data transfer service");
        console.log(param);
        localStorage.setItem( 'campaignDetails', JSON.stringify({
          campaignId :  param.selectedCampaign.id,
          startDate : param.selectedCampaign.start_date,
          endDate : param.selectedCampaign.end_date,
          campaignName : param.selectedCampaign.name,
          selectedStrategy  :  param.selectedStrategy,
          navigationFromReports: param.navigationFromReports,
          strategyId : null,
          strategyName : null,
          filterDurationType:null,
          filterDurationValue:null,
          filterKpiType:param.selectedCampaign.kpi_type,
          filterKpiValue:param.selectedCampaign.kpi_value,
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
      setAllCampaignList : function(campaignListObject, brand_id) {

          // check if cache expiry is set if yes, clear the cache if it is expired.
          if(localStorage.getItem('cache_expiry') !== null && localStorage.getItem('cache_expiry') !== undefined ){
              if(localStorage.getItem('cache_expiry') < (new Date().getTime())  ){
                  localStorage.removeItem('allCampaignList_'+ brand_id + '_' + loginModel.getUserId());

              }
          }

          // check if in localStorage any key matches with 'allCampaignList...' and doesn't belong to the logged in user.If yes remove that.
          var length = localStorage.length;
          var suspectedKey = "allCampaignList" ;
          for(var i =0 ;  i< length ; i++){
              var current_key = localStorage.key(i);
              if((current_key !== null)&& (current_key.indexOf(suspectedKey) >= 0) && (current_key !== 'allCampaignList_'+ brand_id + '_' + loginModel.getUserId()) )  {
                  // means some invalid key exists.
                  localStorage.removeItem(current_key);
              }
          }

          if(brand_id === -1){
              localStorage['allCampaignList_'+ brand_id + '_' + loginModel.getUserId()] = JSON.stringify(campaignListObject);
          }

          // extra code to clear old and unused cache keys form localStorage.
          if(localStorage.getItem('allCampaignList_'+ loginModel.getUserId()) !== null && localStorage.getItem('allCampaignList_'+ loginModel.getUserId()) !== undefined) {
              localStorage.removeItem('allCampaignList_' + loginModel.getUserId());

          }

         var expiry = new Date().getTime() + (60 * 60 * 1000)  ; // cache expiry is 60 min

        localStorage['cache_expiry']  = expiry ;

      },
      getAllCampaignList : function(brand_id){

          // check if in localStorage any key matches with 'allCampaignList...' and doesn't belong to the logged in user.If yes remove that.
          var length = localStorage.length;
          var suspectedKey = "allCampaignList" ;
          for(var i =0 ;  i< length ; i++){
              var current_key = localStorage.key(i);
              if( (current_key !== null) && (current_key.indexOf(suspectedKey) >= 0) && (current_key !== 'allCampaignList_'+ brand_id + '_' + loginModel.getUserId()) )  {
                  // means some invalid key exists.
                  localStorage.removeItem(current_key);
              }
          }

          // clear old and unused cache keys form localStorage.
          if(localStorage.getItem('allCampaignList_'+ loginModel.getUserId()) !== null && localStorage.getItem('allCampaignList_'+ loginModel.getUserId()) !== undefined) {
              localStorage.removeItem('allCampaignList_' + loginModel.getUserId());
          }

          if( localStorage.getItem('cache_expiry') !== null &&localStorage.getItem('cache_expiry') !== undefined ){
              if(localStorage.getItem('cache_expiry') < (new Date().getTime())  ){
                  localStorage.removeItem('allCampaignList_'+ brand_id + '_' + loginModel.getUserId());
              }
          }

          if(localStorage['allCampaignList_'+ brand_id + '_' + loginModel.getUserId()] === undefined || localStorage['allCampaignList_'+ brand_id + '_' + loginModel.getUserId()] === null) {
              return false;
          }
          // check if expiry is present and if we need to time out
          else {
                return JSON.parse(localStorage['allCampaignList_'+ brand_id + '_' + loginModel.getUserId()]);
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