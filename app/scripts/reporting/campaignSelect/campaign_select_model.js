define(['angularAMD', '../../common/services/url_service', 'common/services/data_service', // jshint ignore:line
    'reporting/kpiSelect/kpi_select_model', 'login/login_model', 'reporting/advertiser/advertiser_model'],
    function (angularAMD) {
        angularAMD.factory('campaignSelectModel', ['$rootScope', 'urlService', 'dataService', 'kpiSelectModel',
            'loginModel', 'advertiserModel', 'localStorageService', function ($rootScope, urlService, dataService,
                                                                              kpiSelectModel, loginModel,
                                                                              advertiserModel, localStorageService) {
                var campaign = {};

                campaign.campaigns = {};

                campaign.selectedCampaign = (localStorageService.selectedCampaign.get() === undefined) ?
                    {
                        id: -1,
                        name: 'Loading...',
                        kpi: 'ctr',
                        startDate: '-1',
                        endDate: '-1'
                    } :
                    localStorageService.selectedCampaign.get();

                campaign.setSelectedCampaign = function (_campaign, fileIndex, allCampaign) {
                    var campaignNameSelected,
                        campaignElems;

                    if (!$.isEmptyObject(_campaign)) {
                        campaign.selectedCampaign.id = (_campaign.id === undefined) ?
                            _campaign.campaign_id :
                            _campaign.id;

                        campaign.selectedCampaign.name = _campaign.name;

                        campaign.selectedCampaign.kpi = (_campaign.kpi === undefined) ?
                            (_campaign.kpi_type.toLowerCase()) :
                            _campaign.kpi.toLowerCase();

                        campaign.selectedCampaign.startDate = (_campaign.startDate === undefined) ?
                            _campaign.start_date :
                            _campaign.startDate;

                        campaign.selectedCampaign.endDate = (_campaign.endDate === undefined) ?
                            _campaign.end_date :
                            _campaign.endDate;

                        campaign.selectedCampaign.cost_transparency = _campaign.cost_transparency;
                        campaign.selectedCampaign.redirectWidget = _campaign.type || '';

                        if (campaign.selectedCampaign !== undefined &&
                            (campaign.selectedCampaign.kpi === 'null' ||
                            campaign.selectedCampaign.kpi === null ||
                            campaign.selectedCampaign.kpi === undefined ||
                            campaign.selectedCampaign.kpi === 'NA')) {
                            // set default kpi as ctr if it is coming as null or NA from backend.
                            campaign.selectedCampaign.kpi = 'ctr';
                        }

                        if (allCampaign === 'true' || allCampaign === true) {
                            localStorage.setItem('selectedCampaignAll', JSON.stringify(campaign.selectedCampaign));
                        } else {
                            if (campaign.selectedCampaign.id !== 0) {
                                localStorageService.selectedCampaign.set(campaign.selectedCampaign);
                            } else {
                                $rootScope.$broadcast('CAMPAIGN_CHANGE');
                            }
                        }

                        kpiSelectModel.setSelectedKpi(campaign.selectedCampaign.kpi);

                        if (campaign.selectedCampaign.name) {
                            if (fileIndex === undefined) {
                                campaignNameSelected = $('.campaign_name_selected');
                                campaignNameSelected.text(campaign.selectedCampaign.name);
                                campaignNameSelected.prop('title', campaign.selectedCampaign.name);
                                $('#campaignDropdown').val(campaign.selectedCampaign.name);
                            } else {
                                campaignElems = $($('.campaign_name_selected')[fileIndex]);
                                campaignElems.text(campaign.selectedCampaign.name);
                                campaignElems.attr('campaignId', campaign.selectedCampaign.id);
                                $('.campaignDropdown').val(campaign.selectedCampaign.name);
                            }
                        }
                    }
                };

                campaign.getCampaigns = function (brand, searchCriteria) {
                    var clientId = loginModel.getSelectedClient().id,
                        advertiserId = advertiserModel.getSelectedAdvertiser().id,
                        url = urlService.APICampaignDropDownList(clientId, advertiserId, brand, searchCriteria);

                    return dataService
                        .fetch(dataService.append(url, searchCriteria))
                        .then(function (response) {
                            var _selectedCamp;

                            campaign.campaigns = (response.data.data !== undefined) ? response.data.data : {};

                            if (campaign.campaigns.length > 0 && campaign.selectedCampaign.id === -1) {
                                _selectedCamp = campaign.campaigns[0];
                                campaign.setSelectedCampaign(_selectedCamp);
                            }

                            return campaign.campaigns;
                        });

                };

                campaign.getSelectedCampaign = function () {
                    return (localStorageService.selectedCampaign.get() === undefined) ?
                        campaign.selectedCampaign :
                        localStorageService.selectedCampaign.get();
                };

                campaign.durationLeft = function () {
                    var cmp = this.getSelectedCampaign(),
                        today = new Date(),
                        endDate = new Date(cmp.endDate),
                        startDate = new Date(cmp.startDate);

                    if (today < startDate) {
                        //campaign yet to start
                        return 'Yet to start';
                    }

                    if (endDate < today) {
                        //campaign ended
                        return 'Ended';
                    }

                    return 'unknown';
                };

                campaign.daysSinceEnded = function () {
                    var cmp = this.getSelectedCampaign(),
                        today = new Date(),
                        endDate = new Date(cmp.endDate),
                        timeDiff = Math.abs(today.getTime() - endDate.getTime()),
                        diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    if (endDate > today) {
                        return 0;
                    }

                    return diffDays;
                };

                campaign.getCampaignObj = function () {
                    return campaign;
                };

                campaign.removeSelectedCampaign = function () {
                    return localStorageService.selectedCampaign.remove();
                };

                return campaign;
            }
        ]);
    }
);