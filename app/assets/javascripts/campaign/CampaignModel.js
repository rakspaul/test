//Data Manipulation in model
campaignModule.factory("campaignModel", ['urlService','dataService' ,'constants', function (urlService,dataService, constants) {
    var campaign = {};
    campaign.campaigns = {};
    campaign.selectedCampaign = {
        id: -1,

        name : 'Loading...',
        kpi : 'ctr',
        startDate : '-1',
        endDate : '-1'
    };


        campaign.setSelectedCampaign = function (_campaign) {
            campaign.selectedCampaign.id = (_campaign.id == undefined)? _campaign.campaign_id : _campaign.id;
            campaign.selectedCampaign.name = _campaign.name ;
            campaign.selectedCampaign.kpi = (_campaign.kpi == undefined)? (_campaign.kpi_type)  : _campaign.kpi ;
            campaign.selectedCampaign.startDate = (_campaign.startDate == undefined) ? _campaign.start_date : _campaign.startDate ;
            campaign.selectedCampaign.endDate = (_campaign.endDate == undefined) ? _campaign.end_date :  _campaign.endDate ;

            if(campaign.selectedCampaign !== undefined && (campaign.selectedCampaign.kpi == 'null' || campaign.selectedCampaign.kpi == null || campaign.selectedCampaign.kpi == undefined || campaign.selectedCampaign.kpi == 'NA')){
                campaign.selectedCampaign.kpi = 'ctr' ; // set default kpi as ctr if it is coming as null or NA from backend.
            }

        };

    campaign.getCampaigns = function (brand, searchCriteria) {
            var url = urlService.APICampaignDropDownList(brand, searchCriteria);
            return dataService.fetch(dataService.append(url , searchCriteria)).then(function(response) {

                campaign.campaigns =  (response.data.data !== undefined) ? response.data.data : {} ;

                if( campaign.campaigns.length >0 && campaign.selectedCampaign.id == -1){
                  var _selectedCamp = campaign.campaigns[0];

                    campaign.setSelectedCampaign(_selectedCamp);
                }

                return campaign.campaigns ;


            });

        };


    campaign.getSelectedCampaign = function() {
            return campaign.selectedCampaign ;
        } ;

    campaign.getCampaignObj = function() {
            return campaign;
        };

   return campaign ;

    }]);
