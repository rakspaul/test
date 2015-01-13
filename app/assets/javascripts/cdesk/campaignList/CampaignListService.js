
(function () {
  "use strict";
  //originally in models/campaign.js
  campaignListModule.factory("campaignListService", ["dataService", "utils", "common", "line", '$q', 'modelTransformer', 'campaignModel', 'dataStore', 'apiPaths', 'requestCanceller', 'constants', function (dataService,  utils, common, line, $q, modelTransformer, campaignModel, dataStore, apiPaths, requestCanceller, constants) {

    var appendStrategyData = function(obj, key) {
      var str = '';
      for(var c in obj){
        str += obj[c][key] + ' ';
      }
      return str.substring(0, str.length - 1);
    };

    var appendZipData = function(obj) {
      var str = '';
      for(var c in obj){
        str += obj[c] + ', ';
      }
      return str.substring(0, str.length - 1);
    };

    var createTacticObject = function(tacticData, timePeriod, campaign, strategyId, kpiType, kpiValue) {
      var tacticObj = [],
        status = '',
        adSize = '',
        geoValues = '',
        zipValues = '',
        filterStartDate = '',
        filterEndDate = '';

      for(var index in tacticData) {
        var tactic = tacticData[index];

        if(tactic.targeting.audience_targeting.length > 0) {
          adSize = appendStrategyData(tactic.targeting.audience_targeting, 'title');
        }

        if(tactic.targeting.geo_targeting.length > 0) {
          geoValues = appendStrategyData(tactic.targeting.geo_targeting, 'title');
        }

        if(tactic.targeting.zip_targeting.length > 0) {
          zipValues = appendZipData(tactic.targeting.zip_targeting);
        }

        if(tactic.status === undefined || tactic.status.toLowerCase() == "ready"){
          status = "Draft";
        }else{
          status = tactic.status;
        }

        tacticObj.push({
          id: tactic.id,
          name: tactic.name,
          startDate: tactic.start_date,
          endDate: tactic.end_date,
          ad_size: tactic.ad_size,
          platform_name: tactic.platform_name,
          platform_icon: tactic.platform_icon_url,
          status: status,
          audience_targeting: adSize || null,
          zip_targeting: zipValues,
          geo_targeting: geoValues,
          totalImpressions: tactic.impressions,
          grossRev: null,
          expectedMediaCost: tactic.media_cost,
          ctr: 0,
          vtc: 0,
          actionRate: 0,
          chart: null
        });

        //based on time period use period dates or flight dates
        switch(timePeriod) {
          case 'last_7_days':
          case 'last_30_days':
            //campaign period dates for timefiltering
            filterStartDate = campaign.periodStartDate;
            filterEndDate = campaign.periodEndDate;
            break;
          case 'life_time':
          default:
            //campaign flight dates for timefilter
            filterStartDate = campaign.startDate;
            filterEndDate = campaign.endDate;
        }

        getTacticsCdbLineChart(index, tacticObj, timePeriod, campaign, strategyId, kpiType, kpiValue, filterStartDate, filterEndDate);

        for(var i in campaign.tacticMetrics) {
          if(campaign.tacticMetrics[i].id == tactic.id){
            getTacticsMetrics(index, tacticObj, campaign.tacticMetrics[i].data);
          }
        }
      }
      return tacticObj;
    };

    var getTacticList = function(index, strategyObj, timePeriod, campaign, strategyId, kpiType, kpiValue) {
      dataService.getStrategyTacticList(strategyId).then(function (response) {
        var result = response.data,
          pageSize = 3;
        if(result.status == "OK" && !angular.isString(result.data)) {
          if(result.data.length >= 0) {
            if(result.data.length <= pageSize) {
              strategyObj[index].strategyTactics = createTacticObject(result.data, timePeriod,campaign, strategyId, kpiType, kpiValue);
            } else {
              strategyObj[index].strategyTactics = createTacticObject(result.data.slice(0,pageSize), timePeriod, campaign, strategyId, kpiType, kpiValue);
              strategyObj[index].strategyTacticsLoadMore = createTacticObject(result.data.slice(pageSize), timePeriod, campaign, strategyId, kpiType, kpiValue);
            }
          }
        }
      });

    };

    var getTacticsMetrics = function(index, tacticObj, tacticMetrics) {
      if(!angular.isString(tacticMetrics)) {
        tacticObj[index].totalImpressions = tacticMetrics.impressions;
        tacticObj[index].grossRev = tacticMetrics.gross_rev;
        tacticObj[index].ctr = tacticMetrics.ctr * 100;
        tacticObj[index].actionRate = tacticMetrics.action_rate;
        tacticObj[index].map = {};
        tacticObj[index].map['cpa'] = tacticMetrics.gross_ecpa;
        tacticObj[index].map['cpc'] = tacticMetrics.gross_ecpc;
        tacticObj[index].map['cpm'] = tacticMetrics.gross_ecpm;
        tacticObj[index].map['vtc'] = tacticMetrics.video_metrics.vtc_rate * 100;
        tacticObj[index].map['clicks'] = tacticMetrics.clicks;
        tacticObj[index].map['action_rate'] = tacticMetrics.action_rate;
        tacticObj[index].map['ctr'] = tacticMetrics.ctr * 100;
      }
    };

    var getTacticsCdbLineChart = function(obj, tacticsList, timePeriod, campaign, strategyId, kpiType, kpiValue, filterStartDate, filterEndDate) {
      var sKpiType = kpiType,
        kpiMap = {
          'cpc': 'gross_ecpc',
          'cpa': 'gross_ecpa',
          'cpm': 'gross_ecpm'
        };
      dataService.getCdbTacticsChartData(campaign.orderId, strategyId, tacticsList[obj].id, timePeriod, filterStartDate, filterEndDate).then(function (result) {
        var lineData=[];
        if(result.status == "success" && !angular.isString(result.data)) {
          if(sKpiType != undefined || sKpiType != null) {
            if(result.data.data.length > 0) {
              var maxDays = result.data.data;
              for (var i = 0; i < maxDays.length; i++) {
                maxDays[i]['ctr'] *= 100
                maxDays[i]['vtc'] = maxDays[i].video_metrics.vtc_rate * 100
                var kpiType = kpiMap[sKpiType] ? kpiMap[sKpiType] : sKpiType;
                var kpiTypeLower = angular.lowercase(kpiType);
                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
              }
              tacticsList[obj].chart = new line.highChart(lineData, parseFloat(kpiValue), sKpiType);
            }
          }
        }
      });
    };

    var createStrategyObject = function(strategyData, timePeriod, campaign, kpiType, kpiValue) {
      var strategyObj = [], adSize = '', keyValues = '', geos = '';
      for(var index in strategyData) {
        var strategy = strategyData[index];
        //Iterating the creatives object
        if(strategy.creatives.length > 0) {
          adSize = appendStrategyData(strategy.creatives, 'ad_size');
        }

        if(strategy.selected_geos.length > 0) {
          geos = appendStrategyData(strategy.selected_geos, 'title');
        }

        if(strategy.selected_key_values.length > 0) {
          keyValues = appendStrategyData(strategy.selected_key_values, 'title');
        }
        var status;
        if(strategy.li_status == "Ready"){
          status = "Draft";
        }else{
          status = strategy.li_status;
        }
        strategyObj.push({
          id: strategy.general.id,
          brandName: campaign.brandName,
          name: strategy.general.name,
          startDate: strategy.general.start_date,
          endDate: strategy.general.end_date,
          order_id: strategy.general.order_id,
          li_status: status,
          ad_size: adSize,
          tactics_count: strategy.general.ads_count || 0,
          selected_key_values: keyValues,
          selected_geos: geos,
          totalImpressions: null,
          grossRev: null,
          expectedMediaCost: strategy.general.expected_media_cost,
          ctr: 0,
          actionRate: 0,
          chart: null
        });
        getStrategyCdbLineChart(index, strategyObj, timePeriod, campaign, kpiType, kpiValue);
        getStrategyMetrics(index, strategyObj, timePeriod, campaign);
        getTacticList(index, strategyObj, timePeriod, campaign, strategyObj[index].id, kpiType, kpiValue);
      }
      return strategyObj;
    };

    var getStrategyMetrics = function(index, strategyObj, timePeriod, campaign) {
      var  durationQuery= 'period=' + timePeriod;
      if(timePeriod === 'life_time') {
        durationQuery = 'start_date=' + strategyObj[index].startDate + '&end_date=' + strategyObj[index].endDate;
      }
      var url = '/campaigns/' + campaign.orderId + '/strategies/' + strategyObj[index].id + '/perf?' + durationQuery;
      dataService.getCampaignStrategies(url, 'metrics').then(function (result) {
        if(result.status == "success" && !angular.isString(result.data.data)) {
          strategyObj[index].totalImpressions = result.data.data.impressions;
          strategyObj[index].grossRev = result.data.data.gross_rev;
          strategyObj[index].ctr = result.data.data.ctr * 100;
          strategyObj[index].actionRate = result.data.data.action_rate;
          strategyObj[index].map = {};
          strategyObj[index].map['cpa'] = result.data.data.cpa;
          strategyObj[index].map['cpc'] = result.data.data.cpc;
          strategyObj[index].map['cpm'] = result.data.data.cpm;
          strategyObj[index].map['vtc'] = result.data.data.video_metrics.vtc_rate * 100;
          strategyObj[index].map['clicks'] = result.data.data.clicks;
          strategyObj[index].map['action_rate'] = result.data.data.action_rate;
          strategyObj[index].map['ctr'] = result.data.data.ctr * 100;
        }
      });
    };

    var getStrategyCdbLineChart = function(obj, strategyList, timePeriod, campaign, kpiType, kpiValue) {
      var sKpiType=kpiType;
      dataService.getCdbChartData(campaign, timePeriod, 'strategies', strategyList[obj].id).then(function (result) {
        var lineData=[];
        if(result.status == "success" && !angular.isString(result.data)) {
          if(sKpiType != undefined || sKpiType != null) {
            if(result.data.data.measures_by_days.length > 0) {
              var maxDays = result.data.data.measures_by_days;
              for (var i = 0; i < maxDays.length; i++) {
                var kpiType = (sKpiType);
                maxDays[i]['ctr'] *= 100
                maxDays[i]['vtc'] = maxDays[i].video_metrics.vtc_rate * 100
                var kpiTypeLower = angular.lowercase(kpiType);
                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
              }
              strategyList[obj].chart = new line.highChart(lineData, parseFloat(kpiValue), sKpiType);
            }
          }
        }
      });
    };

    var getStrategyList = function(campaign, timePeriod) {

      var kpiType = campaign.kpiType;
      var kpiValue = campaign.kpiValue;
     // var url = '/campaigns/' + campaign.orderId + '/lineitems.json';
        var url = '/campaigns/' + campaign.orderId + '/strategies' ;
      dataService.getCampaignStrategies(url, 'list').then(function (result) {

        if(result.status == "success" && !angular.isString(result.data.data)) {
          if(result.data.data.length >= 0) {
            if(result.data.data.length <= 3) {
              campaign.campaignStrategies = createStrategyObject(result.data.data, timePeriod, campaign, kpiType, kpiValue);
            } else {
              campaign.campaignStrategies = createStrategyObject(result.data.data.slice(0,3), timePeriod,campaign, kpiType, kpiValue);
              campaign.campaignStrategiesLoadMore = createStrategyObject(result.data.data.slice(3), timePeriod,campaign, kpiType, kpiValue);
            }
          }
        }
      });
    };

    var getCdbLineChart = function(obj, campaignList, timePeriod) {
      var campaignObject = campaignList[obj];

      dataService.getCdbChartData(campaignObject, timePeriod, 'campaigns', null).then(function (result) {
        var lineDate = [];
        campaignObject.chart = true;
        if(result.status == "success" && !angular.isString(result.data)) {
          if(!angular.isUndefined(campaignObject.kpiType)) {
            if(result.data.data.measures_by_days.length > 0) {
              var maxDays = result.data.data.measures_by_days;
              for (var i = 0; i < maxDays.length; i++) {
                maxDays[i]["ctr"] *= 100;
                maxDays[i]['vtc'] = maxDays[i].video_metrics.vtc_rate * 100

                var kpiType = (campaignObject.kpiType),
                  kpiTypeLower = angular.lowercase(kpiType);
                lineDate.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
              }
              campaignObject.chart = new line.highChart(lineDate, parseFloat(campaignObject.kpiValue), campaignObject.kpiType);
            }
          }
        }else{
          campaignObject.chart = false;
        }
      });
    };

    return {

      getCampaigns: function (url, success, failure) {
        var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_LIST_CANCELLER);
        return dataService.fetchCancelable(url, canceller, success, failure);
      },

      getDashboardData: function (url, success, failure) {
        var canceller = requestCanceller.initCanceller(constants.DASHBOARD_CANCELLER);
        return dataService.fetchCancelable(url, canceller, success, failure)
      },

      setActiveInactiveCampaigns: function (dataArr, timePeriod, periodStartDate, periodEndDate) {
        var status = '', campaignList = [];

        for (var obj in dataArr) {
          if (!angular.isObject(dataArr[obj])) {
            continue;
          }
          status = (dataArr[obj].status).toLowerCase();
          switch(status){
            case 'ready' :
            case 'draft' :
              status = 'draft';
              break;
            case 'active' :
            case 'delivering' :
              status = 'delivering';
              break;
            case 'completed' :
              status = 'completed';
              break;
            default :
              status = undefined;
          }
          var campaign = modelTransformer.transform(dataArr[obj], campaignModel);
          campaign.periodStartDate = periodStartDate;
          campaign.periodEndDate = periodEndDate;
          campaign.fromSuffix = utils.formatDate(this.start_date);
          campaign.toSuffix = utils.formatDate(this.end_date);
          campaign.setVariables();
          campaignList.push(campaign);

          getCdbLineChart(obj, campaignList, timePeriod);

        }
        return campaignList;
      },

      //should be moved to costservice inside cost module later
      getCampaignCostData: function(campaignIds, filterStartDate, filterEndDate, success) {
        var url = apiPaths.apiSerivicesUrl + '/campaigns/costs?ids=' + campaignIds + '&start_date=' + filterStartDate + '&end_date=' + filterEndDate;
        var canceller = requestCanceller.initCanceller(constants.COST_CANCELLER);
        return dataService.fetchCancelable(url, canceller, success);
      },

      //should be moved to campaign details service
      getStrategiesData: function(campaign, timePeriod) {
        return getStrategyList(campaign, timePeriod)
      },

      //should be moved to campaign details service
      getTacticsData: function(campaign, timePeriod) {

        var filterStartDate = '', filterEndDate = '';
        switch(timePeriod) {
          case constants.PERIOD_LAST_7_DAYS:
          case constants.PERIOD_LAST_30_DAYS:
            filterStartDate = campaign.periodStartDate;
            filterEndDate = campaign.periodEndDate;
            break;
          case constants.PERIOD_LIFE_TIME:
          default:
            //campaign flight dates for timefilter
            filterStartDate = campaign.start_date;
            filterEndDate = campaign.end_date;
        }
        dataService.getCdbTacticsMetrics(campaign.id, filterStartDate, filterEndDate).then(function (result) {
          if(result.status == "success" && !angular.isString(result.data)) {
            if(result.data.data.length > 0) {
              var tacticsData = result.data.data;
              for (var i = 0; i < tacticsData.length; i++) {
                campaign.tacticMetrics.push({id: tacticsData[i].ad_id, data: tacticsData[i]});
              }
            }
          }

        })

      }
    };
  }]);
}());
