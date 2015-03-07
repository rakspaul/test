//Data Manipulation in model
campaignModule.factory("campaignModel", ['urlService','dataService' ,'constants', function (urlService,dataService, constants) {
    console.log("campaign model");
    var campaign = {};
    campaign.allCampaigns = {};
    campaign.selectedCampaign = {
        id: -1,
        name : 'No Campaign',
        kpi : 'NA',
        startDate : '-1',
        endDate : '-1'
    };

    return {
        getCampaigns: function (brand) {

            var url = urlService.APICampaignList(brand);
            return dataService.fetch(url).then(function(response) {

                campaign.allCampaigns  = (response.data.data !== undefined) ? response.data.data : {} ;

                if( campaign.allCampaigns.length >0 && campaign.selectedCampaign.id == -1){
                  var _selectedCamp = campaign.allCampaigns[0];

                   campaign.selectedCampaign.id = _selectedCamp.id;
                   campaign.selectedCampaign.name = _selectedCamp.name;
                   campaign.selectedCampaign.kpi = _selectedCamp.kpi_type ;
                   campaign.selectedCampaign.startDate = _selectedCamp.start_date;
                   campaign.selectedCampaign.endDate = _selectedCamp.end_date ;
                }
            });

        },
        setSelectedCampaign: function (_campaign) {
            campaign.selectedCampaign = _campaign;
        },
        getSelectedCampaign: function() {
            return campaign.selectedCampaign;
        },
        getCampaignObj: function() {
            return campaign;
        }


    };
}])
;