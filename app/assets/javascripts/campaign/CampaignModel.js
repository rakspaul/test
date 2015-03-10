//Data Manipulation in model
campaignModule.factory("campaignModel", ['urlService','dataService' ,'constants', function (urlService,dataService, constants) {
    var campaign = {};
    campaign.allCampaigns = {};
    campaign.campaigns = {};
    campaign.selectedCampaign = {
        id: -1,

        name : 'Loading...',
        kpi : 'NA',
        startDate : '-1',
        endDate : '-1'
    };

    return {

        getCampaigns: function (brand, searchCriteria) {


            var url = urlService.APICampaignDropDownList(brand, searchCriteria);
            return dataService.fetch(dataService.append(url , searchCriteria)).then(function(response) {

                campaign.allCampaigns  = (response.data.data !== undefined) ? response.data.data : {} ;
                campaign.campaigns =  (response.data.data !== undefined) ? response.data.data.slice(0,200) : {} ;

                if( campaign.allCampaigns.length >0 && campaign.selectedCampaign.id == -1){
                  var _selectedCamp = campaign.campaigns[0];


                   campaign.selectedCampaign.id = _selectedCamp.id;
                   campaign.selectedCampaign.name = _selectedCamp.name;
                   campaign.selectedCampaign.kpi = _selectedCamp.kpi_type ;
                   campaign.selectedCampaign.startDate = _selectedCamp.start_date;
                   campaign.selectedCampaign.endDate = _selectedCamp.end_date ;
                }

                return campaign.campaigns ;


            });

        },
        setSelectedCampaign: function (_campaign) {
            campaign.selectedCampaign.id = (_campaign.id == undefined)? _campaign.campaign_id : _campaign.id;
            campaign.selectedCampaign.name = _campaign.name ;
            campaign.selectedCampaign.kpi = (_campaign.kpi == undefined)? _campaign.kpi_type : _campaign.kpi ;
            campaign.selectedCampaign.startDate = (_campaign.startDate == undefined) ? _campaign.start_date : _campaign.startDate ;
            campaign.selectedCampaign.endDate = (_campaign.endDate == undefined) ? _campaign.end_date :  _campaign.endDate ;

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