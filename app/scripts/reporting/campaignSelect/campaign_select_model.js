define(['angularAMD', 'common/services/url_service', 'common/services/data_service',
    'reporting/kpiSelect/kpi_select_model', 'login/login_model', 'reporting/advertiser/advertiser_model',
    'common/services/vistoconfig_service'], function (angularAMD) {
        angularAMD.factory('campaignSelectModel', ['$q', '$rootScope', '$routeParams', '$timeout', 'urlService',
            'dataService', 'kpiSelectModel', 'loginModel', 'advertiserModel', 'localStorageService', 'brandsModel',
            'utils', 'vistoconfig', 'strategySelectModel',
            function ($q, $rootScope, $routeParams, $timeout, urlService, dataService, kpiSelectModel, loginModel,
                      advertiserModel, localStorageService, brandsModel, utils, vistoconfig, strategySelectModel) {
                var campaign = {
                    selectedCampaign: {},
                    selectedCampaignOriginal: {}
                };

                campaign.setSelectedCampaign = function (_campaign) {
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

                        kpiSelectModel.setSelectedKpi(campaign.selectedCampaign.kpi);
                    }
                };

                campaign.getCampaigns = function (brand, searchCriteria) {
                    var clientId = vistoconfig.getSelectedAccountId(),
                        advertiserId = vistoconfig.getSelectAdvertiserId(),
                        url = urlService.APICampaignDropDownList(clientId, advertiserId, brand, searchCriteria);

                    return dataService
                        .fetch(dataService.append(url, searchCriteria))
                        .then(function (response) {
                            campaign.campaigns = (response.data.data !== undefined ? response.data.data : {});

                            return campaign.campaigns;
                        });
                };

                campaign.fetchCampaigns = function (clientId, advertiserId, brandId) {
                    var searchCriteria = utils.typeAheadParams,
                        url = urlService.APICampaignDropDownList(clientId, advertiserId, brandId, searchCriteria);

                    return dataService.fetch(dataService.append(url, searchCriteria));
                };

                campaign.fetchCampaign = function (clientId, campaignId) {
                    var url,
                        deferred = $q.defer();

                    if (campaign.getSelectedCampaign() && campaign.getSelectedCampaign().id === campaignId) {
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
                };

                campaign.getSelectedCampaignOriginal = function () {
                    return campaign.selectedCampaignOriginal;
                };

                campaign.durationLeft = function () {
                    var cmp = this.getSelectedCampaign(),
                        today = new Date(),
                        endDate = new Date(cmp.endDate),
                        startDate = new Date(cmp.startDate);

                    if (today < startDate) {
                        // campaign yet to start
                        return 'Yet to start';
                    }

                    if (endDate < today) {
                        // campaign ended
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
