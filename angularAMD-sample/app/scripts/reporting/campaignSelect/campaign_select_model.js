define(['angularAMD','common/services/url_service','common/services/data_service','reporting/kpiSelect/kpi_select_model',
                     'reporting/advertiser/advertiser_model'], function (angularAMD) {
  angularAMD.factory("campaignSelectModel", ['urlService', 'dataService', 'kpiSelectModel',
                                             'loginModel', 'advertiserModel',
    function (urlService, dataService, kpiSelectModel, loginModel, advertiserModel) {

    var campaign = {};
    campaign.campaigns = {};
    campaign.selectedCampaign = (localStorage.getItem('selectedCampaign') == undefined) ? {
      id: -1,
      name: 'Loading...',
      kpi: 'ctr',
      startDate: '-1',
      endDate: '-1'
    } : (JSON.parse(localStorage.getItem('selectedCampaign')));

    campaign.setSelectedCampaign = function (_campaign, fileIndex, allCampaign) {
      if (!$.isEmptyObject(_campaign)) {
        campaign.selectedCampaign.id = (_campaign.id == undefined) ? _campaign.campaign_id : _campaign.id;
        campaign.selectedCampaign.name = _campaign.name;
        campaign.selectedCampaign.kpi = (_campaign.kpi == undefined) ? (_campaign.kpi_type.toLowerCase()) : _campaign.kpi.toLowerCase();
        campaign.selectedCampaign.startDate = (_campaign.startDate == undefined) ? _campaign.start_date : _campaign.startDate;
        campaign.selectedCampaign.endDate = (_campaign.endDate == undefined) ? _campaign.end_date : _campaign.endDate;
        campaign.selectedCampaign.cost_transparency = _campaign.cost_transparency;
        campaign.selectedCampaign.redirectWidget = _campaign.type || '';

        if (campaign.selectedCampaign !== undefined && (campaign.selectedCampaign.kpi == 'null' || campaign.selectedCampaign.kpi == null || campaign.selectedCampaign.kpi == undefined || campaign.selectedCampaign.kpi == 'NA')) {
          campaign.selectedCampaign.kpi = 'ctr'; // set default kpi as ctr if it is coming as null or NA from backend.
        }

        if (allCampaign == "true" || allCampaign == true) {
          localStorage.setItem('selectedCampaignAll', JSON.stringify(campaign.selectedCampaign));
        } else {
          if (campaign.selectedCampaign.id != 0) {
            localStorage.setItem('selectedCampaign', JSON.stringify(campaign.selectedCampaign));
          } else {
            $rootScope.$broadcast('CAMPAIGN_CHANGE');
          }
        }
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

    campaign.getCampaigns = function (brand, searchCriteria) {
      //console.log('search criteria:',searchCriteria);
      //console.log("brand", brand);
      var clientId = loginModel.getSelectedClient().id;
      var advertiserId = advertiserModel.getSelectedAdvertiser().id;
      var url = urlService.APICampaignDropDownList(clientId, advertiserId, brand, searchCriteria);
      return dataService.fetch(dataService.append(url, searchCriteria)).then(function (response) {
        campaign.campaigns = (response.data.data !== undefined) ? response.data.data : {};
        if (campaign.campaigns.length > 0 && campaign.selectedCampaign.id == -1) {
          var _selectedCamp = campaign.campaigns[0];
          campaign.setSelectedCampaign(_selectedCamp);
        }
        return campaign.campaigns;
      });

    };

    campaign.getSelectedCampaign = function () {
      return (localStorage.getItem('selectedCampaign') == undefined) ? campaign.selectedCampaign : JSON.parse(localStorage.getItem('selectedCampaign'));
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
      return localStorage.removeItem('selectedCampaign');
    }

    return campaign;

  }]);
});
