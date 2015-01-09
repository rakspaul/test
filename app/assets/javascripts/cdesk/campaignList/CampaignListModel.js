//originally part of controllers/campaign_controller.js
campaignListModule.factory("campaignListModel", ['$http', 'dataService', 'campaignListService', 'apiPaths', 'modelTransformer', 'campaignCDBData', 'campaignCost', 'dataStore', 'requestCanceller', 'constants', 'brandsModel', function($http, dataService, campaignListService, apiPaths, modelTransformer, campaignCDBData, campaignCost, dataStore, requestCanceller, constants, brandsModel) {

  var Campaigns = function() {
    this.timePeriodList = buildTimePeriodList();
    this.selectedTimePeriod = this.timePeriodList[2];
    this.displayTimePeriod = angular.uppercase(this.selectedTimePeriod.display);
    this.sortFieldList = buildSortFieldList();

    this.cdbDataMap = {}
    this.campaignList = [];
    this.costList = {};
    this.costIds = '';
    this.selectedCostType = 'cpa';
    this.costDate = {
      startDate : undefined,
      endDate : undefined
    };
    this.costMargin;
    this.busy = false;
    this.timePeriod = this.selectedTimePeriod.key;
    this.marketerName;
    this.nextPage = 1;
    this.sortParam = 'start_date';
    this.sortDirection = 'desc';
    this.totalPages;
    this.totalCount;
    this.brandId = brandsModel.getSelectedBrand().id;
    this.dashboard = {
      filterSelectAll: false,
      displayFilterSection: false,
      busy: false,
      pending: {
        width: undefined
      },
      active: {
        width: undefined,
        ontrackWidth: undefined
      },
      completed: {
        width: undefined,
        ontrackWidth: undefined
      },
      displayStatus:{
        draft: true,
        ready: true,
        paused: true,
        completed: true,
        underperforming: true,
        ontrack: true,
        active:true
      },
      filterActive : '(active,underperforming)',
      filterReady : undefined,
      filterDraft : undefined,
      filterCompleted : undefined,
      status : {
        active : {
          bothItem:'',
          underperforming : 'active',
          ontrack : ''
        },
        pending : {
          draft : '',
          ready : ''
        },
        completed : {
          underperforming : '',
          ontrack : ''
        }
      }
    };
    this.resetDasboard = function() {
      this.campaignList = [];
      this.busy = false;
      this.timePeriod = 'life_time';
      this.nextPage = 1;
      //this.brandId = 0;
      this.sortParam = undefined;
      this.sortDirection = undefined;
      this.totalPages = undefined;
      this.costMargin = undefined;
    };
    this.resetDasboardFilter = function(type,state) {
      if(type == 'active') {
        if (  this.dashboard.status.active.bothItem ==  'active') {
          this.dashboard.status.active.bothItem = undefined;
          this.dashboard.status.active.ontrack = undefined;
          this.dashboard.status.active.underperforming = undefined;
        }
      }
      if(type != 'activeAll') {
        this.dashboard.status.active.bothItem = undefined;
      }
      if(type !='active') {
        this.dashboard.filterActive = undefined;
        this.dashboard.status.active.underperforming = undefined;
        this.dashboard.status.active.ontrack = undefined;
      }
      if( type !='paused' ) {
        this.dashboard.status.paused = undefined;
        this.dashboard.filterPaused = undefined;
      }
      if( type !='completed' ) {
        this.dashboard.status.completed = undefined;
        this.dashboard.filterCompleted = undefined;
      }
      if( type !='ready' )  {
        this.dashboard.status.ready = undefined;
        this.dashboard.filterReady = undefined;
      }
      if( type !='draft' ) {
        this.dashboard.status.draft = undefined;
        this.dashboard.filterDraft = undefined;
      }
    };

    this.reset = function() {
      this.campaignList = [];
      this.busy = false;
      this.timePeriod = 'life_time';
      this.nextPage = 1;
      this.brandId = brandsModel.getSelectedBrand().id;
      this.sortParam = undefined;
      this.sortDirection = undefined;
      this.totalPages = undefined;
      this.costMargin = undefined;
    };

    this.resetFilters = function() {
      this.campaignList = [];
      this.busy = false;
      this.nextPage = 1;
      this.sortParam = 'start_date';
      this.sortDirection = 'desc';
      this.totalPages = undefined;
      this.totalCount = undefined;
    };

    this.resetSortParams = function() {
      this.campaignList = [];
      this.busy = false;
      this.nextPage = 1;
      this.sortParam = undefined;
      this.sortDirection = undefined;
      this.totalPages = undefined;
      this.totalCount = undefined;
    };
  };

  Campaigns.prototype.reloadGraphs = function() {
    campaignListService.loadGraphs(this.campaignList, timePeriodApiMapping(this.selectedTimePeriod.key))
  };

  Campaigns.prototype.fetchCampaigns = function() {
    if (this.totalPages && (this.totalPages + 1) == this.nextPage) {
      return;
    }

    this.busy = true;
    var self = this,
    url = Campaigns.prototype._campaignServiceUrl.call(this);
    campaignListService.getCampaigns(url, function(result) {
      requestCanceller.resetCanceller(constants.CAMPAIGN_LIST_CANCELLER);
      var data = result.data.data;
      self.nextPage += 1;
      self.marketerName = data.marketer_name;
      self.totalPages = data.total_pages;
      self.totalCount = data.total_count;
      self.periodStartDate = data.period_start_date;
      self.periodEndDate = data.period_end_date;

      self.busy = false;
      if (data.orders.length > 0) {
        var cdbApiKey = timePeriodApiMapping(self.selectedTimePeriod.key);
        angular.forEach(campaignListService.setActiveInactiveCampaigns(data.orders, timePeriodApiMapping(self.timePeriod), self.periodStartDate, self.periodEndDate), function(campaign) {
          this.push(campaign);
          self.costIds += campaign.orderId + ',';
          Campaigns.prototype.compareCostDates.call(self, campaign.startDate, campaign.endDate);
          dataService.getCampaignData(cdbApiKey, campaign, self.periodStartDate, self.periodEndDate).then(function(response) {
            if(response.status == 'success') {
              self.cdbDataMap[campaign.orderId] = modelTransformer.transform(response.data.data, campaignCDBData);
              self.cdbDataMap[campaign.orderId].vtc = response.data.data.video_metrics.vtc_rate * 100;
            }
          })
        }, self.campaignList);
        self.costIds = self.costIds.substring(0, self.costIds.length-1);

        if(self.costIds !== '') {
          Campaigns.prototype.fetchCostData.call(self);
          self.costIds='';
        }
      }
    }, function(result) {
      //failure
      self.busy = false;
      self.totalCount = 0;
    });

  },
    Campaigns.prototype.compareCostDates = function(startDate, endDate) {
      if(this.costDate.startDate === undefined) {
        this.costDate.startDate = new Date(startDate);
      } else {
        var smallestDate = new Date(this.costDate.startDate);
        var tempDate = new Date(startDate);
        if(tempDate < smallestDate) {
          this.costDate.startDate  = tempDate ;
        }
      }
      if(this.costDate.endDate === undefined) {
        this.costDate.endDate = new Date(endDate);
      } else {
        var highestDate = new Date(this.costDate.endDate);
        var tempDate = new Date(endDate);
        if(highestDate < tempDate) {
          this.costDate.endDate  = tempDate ;
        }

      }
    },
    Campaigns.prototype.fetchDashboardData = function() {

      this.dashboard.busy = true;
      var url = apiPaths.apiSerivicesUrl + '/campaigns/summary/counts?user_id=' + user_id + '&date_filter=' + this.timePeriod,
        self = this;
      //applying brand filter if active
      if(this.brandId > 0) {
        url += '&advertiser_filter=' + this.brandId;
      }
      var request_start = new Date();
      campaignListService.getDashboardData(url, function(result) {
        var diff = new Date() - request_start;
        ga(constants.GA_SEND, constants.GA_EVENT, constants.GA_DASHBOARD, constants.GA_CLICK, diff / 1000);
        self.dashboard.busy = false;
        requestCanceller.resetCanceller(constants.DASHBOARD_CANCELLER);
        if(result.status == "success" && !angular.isString(result.data)){
          self.dashboard.active = {
            total : result.data.data.active.ontrack + result.data.data.active.underperforming,
            ontrack : result.data.data.active.ontrack,
            underperforming :  result.data.data.active.underperforming
          };
          self.dashboard.draft = result.data.data.draft;
          self.dashboard.ready =  result.data.data.ready;
          self.dashboard.completed = result.data.data.completed.total;
          self.dashboard.paused =  result.data.data.paused;
          self.dashboard.total =   self.dashboard.draft +
            self.dashboard.ready +
            self.dashboard.active.total +
            self.dashboard.completed +
            self.dashboard.paused;
          self.dashboard.displayStatus.draft  = self.dashboard.draft  > 0 ? true:false;
          self.dashboard.displayStatus.ready  = self.dashboard.ready  > 0 ? true:false;
          self.dashboard.displayStatus.paused  = self.dashboard.paused  > 0 ? true:false;
          self.dashboard.displayStatus.completed  = self.dashboard.completed  > 0 ? true:false;
          self.dashboard.displayStatus.underperforming  = self.dashboard.active.underperforming  > 0 ? true:false;
          self.dashboard.displayStatus.ontrack  = self.dashboard.active.ontrack  > 0 ? true:false;
          if( self.dashboard.total  > 3) {
	    self.dashboard.displayFilterSection = true;
	    if(self.dashboard.active.underperforming == 0 ){
		self.dashboardFilter('active','ontrack');
		self.dashboard.filterActive = '(active,ontrack)';
		self.dashboard.status.active.ontrack = 'active';
		self.dashboard.status.active.underperforming = '';
	    }else {
	        self.dashboard.filterActive = '(active,underperforming)';
	        self.dashboard.status.active.underperforming = 'active';
	        self.dashboard.status.active.ontrack = '';
	    }
	  }else{
	      self.dashboard.displayFilterSection = false;
	      if(self.dashboard.total > 0 ){
		self.dashboardSelectedAll();
	      }
	  }
	}
      });

    },

    Campaigns.prototype.fetchCostData = function() {
      var self = this;
      campaignListService.getCampaignCostData(this.costIds, moment(this.costDate.startDate).format("YYYY-MM-DD"), moment(this.costDate.endDate).format("YYYY-MM-DD"), function(result) {
        if(result.status == "success" && !angular.isString(result.data)){
          self.costMargin = result.data.data.margin;
          angular.forEach(result.data.data.costData, function(cost) {
            self.costList[cost.id]= modelTransformer.transform(cost, campaignCost);
          });
        }
      });
    },

    Campaigns.prototype.dashboardFilter = function(type, state) {

      this.resetDasboard();
      this.resetDasboardFilter(type,state);
      this.dashboardRemoveSelectedAll(type,state);
      if (type == 'overwrite' && state == "") {
        this.dashboard.filterPaused = undefined;
        this.dashboard.filterCompleted = undefined;
        this.dashboard.filterDraft = undefined;
        this.dashboard.filterReady = undefined;
        this.dashboard.filterActive = undefined;
      }else if (type == 'paused' && state == "") {
          this.dashboard.filterPaused= '(paused)';
          this.dashboard.status.paused = 'active';
      }else if(type == 'completed' && state == ""){
          this.dashboard.filterCompleted= '(completed)';
          this.dashboard.status.completed = 'active';
      }else if(type == 'draft' && state == ""){
          this.dashboard.filterDraft= '(draft)';
          this.dashboard.status.draft = 'active';
      }else if(type == 'ready' && state == ""){
          this.dashboard.filterReady= '(ready)';
          this.dashboard.status.ready = 'active';
      }else if(type == 'active' && state == "ontrack"){
          this.dashboard.filterActive= '(active,ontrack)';
          this.dashboard.status.active.ontrack = 'active';
          this.dashboard.status.active.underperforming = '';
      }else if(type == 'active' && state == "underperforming"){
          this.dashboard.filterActive= '(active,underperforming)';
          this.dashboard.status.active.underperforming = 'active';
          this.dashboard.status.active.ontrack = '';
      }else if(type == 'activeAll'){
          this.dashboard.filterActive= '(active)';
          this.dashboard.status.active.bothItem = 'active';
          this.dashboard.status.active.underperforming = 'active';
          this.dashboard.status.active.ontrack = 'active';
      }
      //get the campaign list
      this.campaignList = [];
      Campaigns.prototype.fetchCampaigns.call(this);
    },
    Campaigns.prototype.filterCostType = function(type) {
      this.selectedCostType = type;
    },
    Campaigns.prototype.filterByTimePeriod = function(timePeriod) {
      this.selectedTimePeriod = timePeriod;
      this.displayTimePeriod = angular.uppercase(timePeriod.display);

      $("#cdbDropdown").toggle();
      this.timePeriodList.forEach(function(period) {
        if (period == timePeriod) {
          period.className = 'active';
        } else {
          period.className = '';
        }
      });

      ga('send', 'event', 'time-period-filter', 'click', this.displayTimePeriod);

      Campaigns.prototype._applyFilters.call(this, {
        timePeriod: timePeriod.key
      });

    },

    Campaigns.prototype.filterByBrand = function(brand) {
      $("#cdbDropdown").toggle();
      if (brand != undefined) {
        ga('send', 'event', 'brand-filter', 'click', brand.name);

        Campaigns.prototype._applyFilters.call(this, {
          brand: brand.id
        });
      }
    },

    Campaigns.prototype.sortCampaigns = function(fieldName) {
      if (this.sortParam) {
        if (this.sortParam == fieldName) {
          var sortDirection = toggleSortDirection(this.sortDirection);
          this.resetSortParams();
          this.sortDirection = sortDirection;
        } else {
          this.resetSortParams();
        }
      } else {
        this.resetSortParams();
      }!this.sortDirection && (this.sortDirection = 'asc');
      this.sortParam = fieldName;
      this.sortFieldList.forEach(function(field) {
        if (fieldName == field.key) {
          field.className = 'active';
        } else {
          field.className = '';
        }
      });

      ga('send', 'event', 'sort', 'click', this.sortParam + '-' + this.sortDirection);
      Campaigns.prototype.fetchCampaigns.call(this);
    },

    Campaigns.prototype.sortIcon = function(fieldName) {

      if (this.sortParam == fieldName) {
        return this.sortDirection == 'asc' ? 'ascending' : 'descending';
      } else {
        return '';
      }
    },

    Campaigns.prototype.editCampaign = function(campaign) {
      ga('send', 'event', 'edit-campaign', 'click', campaign.campaignTitle, {
        'hitCallback': function() {
          document.location = "campaigns#/campaigns/" + campaign.orderId;
        }
      });
    },

    Campaigns.prototype.campaignReports = function(campaign) {
      ga('send', 'event', 'campaign-report', 'click', campaign.campaignTitle, {
        'hitCallback': function() {
          document.location = "reports/reports/" + campaign.orderId;
        }
      });
    }

  Campaigns.prototype.durationLeft = function(campaign) {
    if(campaign !== undefined) {
      if (moment() < moment(campaign.startDate)) {
        //campaign yet to start
        return 0;
      }
      if (moment(campaign.endDate) < moment()) {
        //campaign ended
        return -1;
      }
      return moment(campaign.endDate).diff(moment(), 'days');
    }
  },

    Campaigns.prototype.durationCompletion = function(campaign) {
      if(campaign !== undefined) {
        var totalDays = moment(campaign.endDate).diff(moment(campaign.startDate), 'days'),
          daysOver = moment().diff(moment(campaign.startDate), 'days');

        return Math.round((daysOver / totalDays) * 100);
      }
    },

    Campaigns.prototype._applyFilters = function(filters) {
      console.log('filter campaigns: ' + JSON.stringify(filters));
      if (filters == undefined) {
        return;
      }
      this.resetFilters();
      filters.brand && (this.brandId = filters.brand);
      filters.timePeriod && (this.timePeriod = filters.timePeriod);

      if(filters.brand != undefined){
        this.dashboard.filterSelectAll=false;
    	  this.dashboard.status.active.underperforming = 'active';
    	  this.dashboard.filterActive = '(active,underperforming)';
    	  this.dashboard.filterPaused = undefined;
    	  this.dashboard.filterCompleted = undefined;
    	  this.dashboard.filterDraft = undefined;
    	  this.dashboard.filterReady = undefined;
    	  this.dashboard.status.paused = undefined
    	  this.dashboard.status.completed = undefined;
    	  this.dashboard.status.draft = undefined;
    	  this.dashboard.status.ready = undefined;
    	  this.dashboard.status.active.bothItem = undefined;
    	  this.dashboard.status.active.ontrack = undefined;
      }

      Campaigns.prototype.fetchDashboardData.call(this); //populating dashboard filter with new data
      Campaigns.prototype.fetchCampaigns.call(this);
    },
    Campaigns.prototype.dashboardSelectedAll = function () {
      this.nextPage=1;
      if(this.dashboard.filterSelectAll == false)
      {
        this.dashboard.filterSelectAll=true;
        this. dashboardSelectedAllResetFilter(true);
      }else{
        this.dashboard.filterSelectAll=false;
        this. dashboardSelectedAllResetFilter(false);
      }
    } ,
    Campaigns.prototype.dashboardRemoveSelectedAll = function (type,state) {
      if( this.dashboard.filterSelectAll == true)
      {
        this.dashboard.filterSelectAll=false;
        if(type=='active')
        {
          if(state =='ontrack')
          {
            this.dashboard.status.active.ontrack = undefined;
          }
          else
          {
            this.dashboard.status.active.underperforming = undefined;

          }
        }
        switch(type) {
          case "paused":
            this.dashboard.status.paused = undefined;
            break;
          case "completed":
            this.dashboard.status.completed = undefined;
            break;
          case "draft":
            this.dashboard.status.draft = undefined;
            break;
          case "ready":
            this.dashboard.status.ready = undefined;
            break;
          case "activeAll":
            this.dashboard.status.active.bothItem = undefined;
            this.dashboard.status.active.ontrack = undefined;
            this.dashboard.status.active.underperforming = undefined;
            break;
        }
      }
    } ,
    Campaigns.prototype.dashboardSelectedAllResetFilter = function (status) {
      if(status == true)
      {
        this.dashboard.status.paused = 'active';
        this.dashboard.status.completed = 'active';
        this.dashboard.status.draft = 'active';
        this.dashboard.status.ready = 'active';
        this.dashboard.status.active.bothItem = 'active';
        this.dashboard.status.active.ontrack = 'active';
        this.dashboard.status.active.underperforming = 'active';
        this.dashboard.filterPaused= '(paused)';
        this.dashboard.filterCompleted= '(completed)';
        this.dashboard.filterDraft= '(draft)';
        this.dashboard.filterActive= '(active)';
        this.dashboard.filterReady= '(ready)';
      }else{
        this.dashboard.status.paused = undefined;
        this.dashboard.status.completed = undefined
        this.dashboard.status.draft = undefined
        this.dashboard.status.active.bothItem = undefined;
        this.dashboard.status.ready =undefined
        this.dashboard.status.active.ontrack =undefined
        this.dashboard.status.active.underperforming = 'active';
        this.dashboard.filterPaused= undefined;
        this.dashboard.filterCompleted =undefined ;
        this.dashboard.filterDraft = undefined;
        this.dashboard.filterActive = '(active,underperforming)';
        this.dashboard.filterReady = undefined ;
      }
      this.campaignList = [];
      Campaigns.prototype.fetchCampaigns.call(this);

    } ,
    Campaigns.prototype._campaignServiceUrl = function() {
      var params = [
          'date_filter=' + this.timePeriod,
          'page=' + this.nextPage,
        'callback=JSON_CALLBACK'
      ];
      this.brandId > 0 && params.push('advertiser_filter=' + this.brandId);
      this.sortParam && params.push('sort_column=' + this.sortParam);
      this.sortDirection && params.push('sort_direction=' + this.sortDirection);
      this.dashboard.filterActive && params.push('conditions=' + this.dashboard.filterActive);
      this.dashboard.filterReady && params.push('conditions=' + this.dashboard.filterReady);
      this.dashboard.filterDraft && params.push('conditions=' + this.dashboard.filterDraft);
      this.dashboard.filterCompleted && params.push('conditions=' + this.dashboard.filterCompleted);
      this.dashboard.filterPaused && params.push('conditions=' + this.dashboard.filterPaused);
      return apiPaths.apiSerivicesUrl + '/campaigns/bystate?user_id='+user_id+'&' + params.join('&');
    };

  var toggleSortDirection = function(dir) {
      if (dir == 'asc') {
        return 'desc';
      }
      return 'asc';
    },

    buildSortFieldList = function() {
      return [{
        display: 'Campaign',
        key: 'order_name'
      }, {
        display: 'Brand',
        key: 'advertiser'
      }, {
        display: 'Flight dates',
        key: 'start_date',
        className: 'active'
      }];
    },

    buildTimePeriodList = function() {
      return [createTimePeriodObject('Last 7 days', 'last_week'),
        createTimePeriodObject('Last 30 days', 'last_month'),
        createTimePeriodObject('Lifetime', 'life_time', 'active')
      ];

    },

    createTimePeriodObject = function(display, key, className) {
      var obj = {
        "display": display,
        "key": key
      };
      obj.className = (className == undefined ? '' : className);
      return obj;
    };

  var timePeriodApiMapping = function(key) {
    var apiObj = {
      'last_week': 'last_7_days',
      'last_month': 'last_30_days',
      'life_time': 'life_time'
    };
    return apiObj[key];
  };

  return Campaigns;
}]);
