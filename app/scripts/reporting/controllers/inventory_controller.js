define(['angularAMD','reporting/kpiSelect/kpi_select_model', 'reporting/campaignSelect/campaign_select_model', 'reporting/strategySelect/strategy_select_model',
        'reporting/common/charts/column_line', 'common/services/data_service', 'common/services/constants_service',
        'reporting/timePeriod/time_period_model', 'login/login_model', 'reporting/advertiser/advertiser_model',
        'reporting/brands/brands_model', 'common/services/url_service','reporting/kpiSelect/kpi_select_directive','reporting/kpiSelect/kpi_select_controller',
        'reporting/models/domain_reports','reporting/strategySelect/strategy_select_directive','reporting/strategySelect/strategy_select_controller','reporting/timePeriod/time_period_pick_directive'
    ],

    function (angularAMD) {  'use strict';
        angularAMD.controller('InventoryController', function ($scope,kpiSelectModel, campaignSelectModel, strategySelectModel,
                                                               columnline, dataService, constants,
                                                               timePeriodModel, loginModel, advertiserModel,
                                                               brandsModel, urlService,
                                                               domainReports) {

      $scope.textConstants = constants;


      //highlight the header menu - Dashborad, Campaigns, Reports
      domainReports.highlightHeaderMenu();

      //Default Values

      $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
      $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();

      $scope.api_return_code = 200;
      $scope.inventoryChart = true;

      $scope.getMessageForDataNotAvailable = function (campaign, dataSetType) {
          campaign = campaign || $scope.campaign;

          if (!campaign || campaign.id == -1) {
              return constants.MSG_DATA_NOT_AVAILABLE;
          } else if ($scope.api_return_code == 404 || $scope.api_return_code >=500) {
              return constants.MSG_UNKNOWN_ERROR_OCCURED;
          } else if ( campaignSelectModel.durationLeft() == 'Yet to start')
              return constants.MSG_CAMPAIGN_YET_TO_START;
          else if (campaignSelectModel.daysSinceEnded() > 1000)
              return constants.MSG_CAMPAIGN_VERY_OLD;
          else if ( $scope.selectedCampaign.kpi =='null')
              return constants.MSG_CAMPAIGN_KPI_NOT_SET;
          else if (dataSetType == 'inventory')
              return constants.MSG_METRICS_NOT_TRACKED;
          else
              return constants.MSG_DATA_NOT_AVAILABLE;
      };

      $scope.filters = domainReports.getReportsTabs();

      $scope.selected_filters_tb = '0';
      $scope.selected_filters_tab = 'categories';
      $scope.strategyLoading =  true;

      $scope.strategyTable = {
          cssClass: 'top_perf_symbol'
      };

      $scope.tacticList = {
          tacticList: [],
          topPerformance: [],
          show: 'topPerformance'
      };

      //URL for download
      $scope.download_urls = {
          category: null,
          domain: null
      };

      $scope.init = function () {
          $scope.strategyFound = false;
          $scope.strategyTableData = [];
          $scope.tacticList.tacticList = [];
          $scope.tacticList.topPerformance = [];
          $scope.strategyBusy = false;
          $scope.isStrategyDropDownShow = true;
          $scope.selected_filters = {};

          var fromLocStore = localStorage.getItem('timeSetLocStore');
          if(fromLocStore) {
              fromLocStore = JSON.parse(localStorage.getItem('timeSetLocStore'));
              $scope.selected_filters.time_filter = fromLocStore;
          }
          else {
              $scope.selected_filters.time_filter = 'life_time';
          }

          $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
          $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();

      };
      $scope.init();

       //This function is called for tactics Table data
     $scope.getTacticsChartData = function () {
        $scope.tacticList.tacticList = $scope.tacticListData;
        $scope.tacticList.topPerformance = [];
        for (var t in  $scope.tacticList.tacticList) {
            var topPerformance = [];
            var resultTableData = $scope.tacticList.tacticList[t].perf_metrics;
            for (var data in resultTableData) {
                topPerformance.push(resultTableData[data]);
            }
            var topChartObj = true;
            var isGraphPlot = true;
            //For Top Chart
            if (topPerformance.length > 2) {
                topChartObj = columnline.highChart(topPerformance, $scope.selected_filters.kpi_type);
            }
            if (topChartObj === undefined || topPerformance.length == 0) {
                topChartObj = false;
            }
            if(topPerformance.length === 1) {
                topChartObj = false;
                isGraphPlot = false;
            }
            $scope.tacticList.topPerformance.push({tacticId: $scope.tacticList.tacticList[t].id, name: $scope.tacticList.tacticList[t].name, data: topPerformance, chart: topChartObj, graphRender : isGraphPlot });
         }
      };

      $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
          $scope.init();
          //update the selected Campaign
          $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
          $scope.inventoryChart = true;
          if ($scope.tacticList[$scope.tacticList.show][0]) {
              $scope.tacticList[$scope.tacticList.show][0].chart = true;
          }
      });

     /*$scope.$on(constants.EVENT_SUB_ACCOUNT_CHANGED,function(){
        $scope.callBackStrategyChange();
     });*/

      $scope.$watch('selectedCampaign', function() {
          $scope.createDownloadReportUrl();
      });

      $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
          $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
          $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
          $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Media Plan total' : 'Ad Group total';
          $scope.callBackStrategyChange();
      });

      //Function called to draw the Strategy chart
      $scope.getStrategyChartData = function () {
          var inventoryQueryIdMapperWithAllAdsGroup = { 'categories' : 25, 'domains' : 27}
          var inventoryQueryIdMapperWithSelectedAdsGroup = { 'categories' : 26, 'domains' : 28}
          var datefilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key);
          var param = {
              campaignId: $scope.selectedCampaign.id,
              clientId:  loginModel.getSelectedClient().id,
              advertiserId: advertiserModel.getSelectedAdvertiser().id,
              brandId: brandsModel.getSelectedBrand().id,
              dateFilter: datefilter,
              domain: $scope.selected_filters_tab
          };
          if (Number($scope.selectedStrategy.id) >= 0) {
              param.queryId = inventoryQueryIdMapperWithSelectedAdsGroup[$scope.selected_filters_tab];
              param.strategyId = Number($scope.selectedStrategy.id);
          } else {
              param.queryId = inventoryQueryIdMapperWithAllAdsGroup[$scope.selected_filters_tab];
          }

          $scope.strategyBusy = true;
          $scope.loadingFlag = true;

          var errorHandler =  function(result) {
              if (result && result.data) {
                  $scope.api_return_code = result.data.status;
              }
              $scope.inventoryChart = false;
              $scope.strategyBusy = false;
             // $scope.strategyTableData = [];
              $scope.tacticList.tacticList = [];
              $scope.tacticList.topPerformance = [];
          };

          $scope.api_return_code = 200;
          var url = urlService.APIVistoCustomQuery(param);
          return dataService.fetch(url).then(function (result) {
              $scope.loadingFlag = false;
              $scope.strategyLoading =  false;

              if (result.status === "OK" || result.status === "success") {

                  if ((result.data.data[0] !== undefined) && (result.data.data[0] !== null) && (result.data.data.length > 0 )) {
                      // First confirm that the current selected tab and the tab for which we got data response are same. Then only process the data.
                      if (param.domain.toLowerCase() === $scope.selected_filters_tab.toLowerCase()) {
                          $scope.strategyBusy = false;
                          if (Number($scope.selectedStrategy.id) >= 0) {
                              // strategy selected
                              $scope.strategyTableData = _.filter(result.data.data, function(item) { return item.ad_id == -1; });

                              var adsTempData = _.filter(result.data.data, function(item) { return item.ad_id != -1; });
                              $scope.tacticListData = _.chain(adsTempData)
                                  .groupBy('ad_name')
                                  .map(function(value, key) {
                                      return {
                                          id: _.pluck(value, 'ad_id')[0],//get first element of ad_id array
                                          name: key,//ad_name
                                          perf_metrics: value
                                      }
                                  })
                                  .value();
                              $scope.getTacticsChartData();
                          } else {
                              $scope.strategyTableData = result.data.data;
                          }
                          if ($scope.strategyTableData.length > 0)
                            $scope.inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selected_filters.kpi_type);
                          else
                            $scope.inventoryChart = false;
                      }
                      // draw tactic graph only when strategy section got valid data.
                      //   $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                      if ($scope.inventoryChart === undefined || $scope.inventoryChart === null || ($scope.strategyTableData === undefined || $scope.strategyTableData === null) || $scope.strategyTableData.length == 0) {
                          $scope.inventoryChart = false;
                      }
                  }

                  else { //api call doesn't return result data or returns empty invetory metrics data.
                      errorHandler();

                  }
              } // Means no strategy data found with API response 404
              else {
                  errorHandler();
              }
          }, errorHandler);
      };

      //Function to expand and collide tactic accordian.
      $scope.clickTactic = function (id) {
          $('#tactic_' + id + '_body').toggle();
      };

      //Function is called from startegylist directive
      $scope.callBackStrategyChange = function () {
          $scope.tacticList.tacticList = [];
          $scope.tacticList.topPerformance = [];

          if ($scope.selectedStrategy.id == -99) {
                  $scope.strategyFound = false ;
          } else {
              $scope.strategyFound = true;
              $scope.getStrategyChartData();
              // grunt analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
          }
          $scope.inventoryBusy = false ;
      };

      //creating download report url
      $scope.createDownloadReportUrl = function () {
          $scope.download_report = [
              {
                  'url' : '/reportBuilder/customQueryDownload',
                  'query_id': 26,
                  'label' : 'Inventory Transparency by Site Category',
                  'download_config_id' : 1
              },
              {
                  'url' : '/reportBuilder/customQueryDownload',
                  'query_id': 28,
                  'label' : 'Inventory Transparency by Domain',
                  'download_config_id' : 1
              }
          ];
      };

      $scope.$on(constants.EVENT_KPI_CHANGED, function(event, params) {
          $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
          if(params.event_type === 'clicked') {
              $scope.callBackStrategyChange();
          }
      });

      //Function called when the user clicks on the category tabs
      $('#category_change').click(function (e) {
          $scope.inventoryChart = true;
          $scope.strategyBusy = true;
          $scope.selected_filters_tab = $(e.target).attr('_key');
          $(".inventory_tab_active").removeClass("inventory_tab_active");
          $(e.target).parent().addClass("inventory_tab_active");
          $scope.$apply();
          $scope.callBackStrategyChange();
          // grunt analytics.track(loginModel.getUserRole(), constants.GA_INVENTORY_TAB_USER_SELECTION, $scope.selected_filters_tab, loginModel.getLoginName());
      });

     $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED , function(event,strategy){
         $scope.selected_filters.time_filter = strategy;
         $scope.callBackStrategyChange();
         $scope.createDownloadReportUrl();
      });

      // hot fix for the enabling the active link in the reports dropdown
      setTimeout(function(){
          $(".main_navigation").find(".header_tab_dropdown").removeClass("active_tab") ;
          $(".main_navigation").find(".reports_sub_menu_dd_holder").find("#inventory").addClass("active_tab") ;
      }, 200);
      // end of hot fix for the enabling the active link in the reports dropdown
  });
});
