define(['angularAMD','../../common/services/url_service','common/services/data_service','reporting/kpiSelect/kpi_select_model',
                     'login/login_model', 'reporting/advertiser/advertiser_model'], function (angularAMD) {
  angularAMD.factory("campaignSelectModel", ['$q', '$rootScope', '$routeParams', '$timeout', 'urlService', 'dataService', 'kpiSelectModel',
                     'loginModel', 'advertiserModel', 'localStorageService', 'brandsModel', 'utils', 'vistoconfig', 'strategySelectModel',
    function ($q, $rootScope, $routeParams, $timeout, urlService, dataService, kpiSelectModel, 
        loginModel, advertiserModel, localStorageService, brandsModel, utils, vistoconfig, strategySelectModel) {

    var campaign = {
        selectedCampaign: {},
        selectedCampaignOriginal: {}
    };
    // campaign.campaigns = {};
    // campaign.selectedCampaign = (localStorageService.selectedCampaign.get() == undefined) ? {
    //   id: -1,
    //   name: 'Loading...',
    //   kpi: 'ctr',
    //   startDate: '-1',
    //   endDate: '-1'
    // } : localStorageService.selectedCampaign.get();

    campaign.setSelectedCampaign = function (_campaign, fileIndex, allCampaign) {
      if (!$.isEmptyObject(_campaign)) {
        campaign.selectedCampaign.id = (_campaign.id == undefined) ? _campaign.campaign_id : _campaign.id;
        campaign.selectedCampaign.name = _campaign.name;
        campaign.selectedCampaign.kpi = (_campaign.kpi == undefined) ? (_campaign.kpi_type.toLowerCase()) : _campaign.kpi.toLowerCase();
        campaign.selectedCampaign.startDate = (_campaign.startDate == undefined) ? _campaign.start_date : _campaign.startDate;
        campaign.selectedCampaign.endDate = (_campaign.endDate == undefined) ? _campaign.end_date : _campaign.endDate;
        campaign.selectedCampaign.cost_transparency = _campaign.cost_transparency;
        campaign.selectedCampaign.redirectWidget = _campaign.type || '';
        campaign.selectedCampaign.advertiser_id = _campaign.advertiser_id;
        campaign.selectedCampaign.brand_id = _campaign.brand_id;

        if (campaign.selectedCampaign.kpi == 'null' || campaign.selectedCampaign.kpi == null 
          || campaign.selectedCampaign.kpi == undefined || campaign.selectedCampaign.kpi == 'NA') {
          campaign.selectedCampaign.kpi = 'ctr'; // set default kpi as ctr if it is coming as null or NA from backend.
        }

        // if (allCampaign == "true" || allCampaign == true) {
        //   localStorage.setItem('selectedCampaignAll', JSON.stringify(campaign.selectedCampaign));
        // } else {
        //   if (campaign.selectedCampaign.id != 0) {
        //       localStorageService.selectedCampaign.set(campaign.selectedCampaign);
        //   } else {
        //     $rootScope.$broadcast('CAMPAIGN_CHANGE');
        //   }
        // }
        kpiSelectModel.setSelectedKpi(campaign.selectedCampaign.kpi);
        if (campaign.selectedCampaign.name) {
          if (fileIndex == undefined) {
            $(".campaign_name_selected").text(campaign.selectedCampaign.name);
            $(".campaign_name_selected").prop('title', campaign.selectedCampaign.name);
            $("#campaignDropdown").val(campaign.selectedCampaign.name);
          } else {
            var campaignElems = $($(".campaign_name_selected")[fileIndex]);
            campaignElems.text(campaign.selectedCampaign.name);
            campaignElems.attr('campaignId', campaign.selectedCampaign.id)
            $(".campaignDropdown").val(campaign.selectedCampaign.name);
          }
        }
      }
    };

    campaign.getCampaigns = function (searchCriteria) {
      // var clientId = loginModel.getSelectedClient().id;
      var clientId = $routeParams.subAccountId || $routeParams.accountId,
          advertiserId = $routeParams.advertiserId || -1,
          brandId = ($routeParams.brandId && $routeParams.brandId >= 0) ? $routeParams.brandId : -1;

      var url = urlService.APICampaignDropDownList(clientId, advertiserId, brandId, searchCriteria);
      return dataService.fetch(dataService.append(url, searchCriteria)).then(function (response) {
            campaign.campaigns = (response.data.data !== undefined ? response.data.data : {});
            // if (campaign.campaigns.length > 0 && campaign.selectedCampaign.id == -1) {
            //   console.log('campaign.campaigns[0]', campaign.campaigns[0]);
            //   campaign.setSelectedCampaign(campaign.campaigns[0]);
            // }
            return campaign.campaigns;
      });

    };

    campaign.fetchCampaigns = function (clientId, advertiserId, brandId) {
        var searchCriteria = utils.typeaheadParams,
            url = urlService.APICampaignDropDownList(clientId, advertiserId, brandId, searchCriteria);
        return dataService.fetch(dataService.append(url, searchCriteria));
    };

    campaign.fetchCampaign = function (clientId, campaignId) {
        var deferred = $q.defer();
        if (campaign.getSelectedCampaign() && campaign.getSelectedCampaign().id == campaignId) {
            console.log('fetchCampaign', 'already fetched', campaign.getSelectedCampaign());
            $timeout(function() {
                deferred.resolve();
            }, 5);
            return deferred.promise;
        }
        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
            '/clients/' + clientId + '/campaigns/' + campaignId;
        dataService.getSingleCampaign(url).then(function (result) {
            if (result.status === 'success' && !angular.isString(result.data)) {
                campaign.selectedCampaignOriginal = result.data.data;
                campaign.setSelectedCampaign(result.data.data);
                console.log('fetchCampaign', 'is fetched');
            }
            deferred.resolve();
        }, function() {
            deferred.reject('Mediaplan not found');
        });
        return deferred.promise;
    };
    
    campaign.reset = function() {
        campaign.selectedCampaign = {};
        campaign.selectedCampaignOriginal = {};
        strategySelectModel.reset();
    };

    campaign.getSelectedCampaign = function () {
      return campaign.selectedCampaign;
      // return (localStorageService.selectedCampaign.get() == undefined) ? campaign.selectedCampaign : localStorageService.selectedCampaign.get();
    };

    campaign.getSelectedCampaignOriginal = function () {
      return campaign.selectedCampaignOriginal;
      // return (localStorageService.selectedCampaign.get() == undefined) ? campaign.selectedCampaign : localStorageService.selectedCampaign.get();
    };

    campaign.durationLeft = function (campaign) {
      var cmp = this.getSelectedCampaign();
      var today = new Date(),
        endDate = new Date(cmp.endDate),
        startDate = new Date(cmp.startDate);

      if (today < startDate) {
        //campaign yet to start
        return "Yet to start";
      }
      if (endDate < today) {
        //campaign ended
        return "Ended";
      }
      return "unknown";
    };

    campaign.daysSinceEnded = function () {
      var cmp = this.getSelectedCampaign();
      var today = new Date(),
        endDate = new Date(cmp.endDate);
      if (endDate > today)
        return 0;

      var timeDiff = Math.abs(today.getTime() - endDate.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return diffDays;
    };

    campaign.getCampaignObj = function () {
      return campaign;
    };

    campaign.removeSelectedCampaign = function () {
      return localStorageService.selectedCampaign.remove();
    }

    return campaign;

  }]);
});
