define(['angularAMD', 'common/services/vistoconfig_service', 'common/services/constants_service',
    'common/services/data_service', 'login/login_model', 'common/services/request_cancel_service'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('workflowService', function ($rootScope, vistoconfig, constants, dataService, loginModel,
                                                       requestCanceller) {
            var mode,
                adDetails,
                newCreative,
                platform,
                savedGeo,
                vistoModule,
                creativeMode,
                creativeEditData,
                isAdGroup,
                unallocatedAmount,
                deletedModule = [];

            function createObj(platform) {
                var integrationObj = {};

                integrationObj.id = platform.id;
                integrationObj.name = platform.vendorExecutionPlatform.code;
                integrationObj.displayName = platform.name;
                integrationObj.iconUrl = platform.iconURL;
                integrationObj.customInputJson = platform.vendorExecutionPlatform.customInputJson;
                integrationObj.fullIntegration = platform.vendorExecutionPlatform.fullIntegration;
                integrationObj.active = true; // TODO hardcoded true for now...
                integrationObj.summary = platform.description;

                return integrationObj;
            }

            return {
                fetchCampaigns: function () {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns';

                    return dataService.fetch(url);
                },

                getClients: function () {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients';

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                getClientData: function (clientId) {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId;

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                getSubAccounts: function () {
                    var clientId = loginModel.getMasterClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/descendants?level=last';

                    if (clientId !== undefined) {
                        return dataService.fetch(url);
                    }
                },

                getAdvertisers: function (accessLevel) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers';

                    if (accessLevel) {
                        url = url + '?access_level=' + accessLevel;
                    }

                    return dataService.fetch(url);
                },

                getBrands: function (advertiserId, accessLevel) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +
                            '/advertisers/' + advertiserId + '/brands';

                    if (accessLevel) {
                        url = url + '?access_level=' + accessLevel;
                    }
                    return dataService.fetch(url);
                },

                saveCampaign: function (data) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.post(
                        vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns',
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                updateCampaign: function (data, id) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.put(
                        vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns/' + id,
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                getCampaignData: function (campaignId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns/' + campaignId;

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                getPlatforms: function (cacheObj) {
                    var clientId = loginModel.getSelectedClient().id,
                        //url = vistoconfig.apiPaths.WORKFLOW_API_URL +  '/clients/' + clientId +
                    // '/platforms?sortBy=displayName',
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId + '/vendors?vendorType=EXECUTION_PLATFORM&sortBy=name';

                    return dataService.fetch(url, cacheObj);
                },

                getAdsForCampaign: function (campaignId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/no_ad_group/ads';

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                getAdgroups: function (campaignId, isForClone) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/ad_groups';

                    if (isForClone) {
                        url += '?status=ACTIVE';
                    }

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                createAdGroups: function (campaignId, data) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.post(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/ad_groups',
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                editAdGroups: function (campaignId, data) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.put(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/ad_groups/' + data.adgroupId,
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                getAdsInAdGroup: function (campaignId, adGroupID) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/ad_groups/' + adGroupID +
                            '/ads';

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                createAdGroupOfIndividualAds: function () {
                    // TODO: ???
                },

                createAd: function (data) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.post(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId + '/campaigns/' + data.campaignId + '/ads',
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                updateAd: function (data) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.put(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + data.campaignId +
                        '/ads/' + data.adId,
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                deleteAd: function (campaignId, adId) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.delete(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/ads/' + adId, {
                                'Content-Type': 'application/json'
                            }
                    );
                },

                pauseAd: function (data) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.put(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + data.campaignId +
                        '/ads/' + data.id +
                        '/pause',
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                resumeAd: function (data) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.put(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + data.campaignId +
                        '/ads/' + data.id + '/resume',
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                deleteCampaign: function (campaignId) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.delete(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId, {
                                'Content-Type': 'application/json'
                            }
                    );
                },

                getAd: function (data) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + data.campaignId +
                            '/ads/' + data.adId;

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                getDetailedAdsInAdGroup: function (campaignId, adGroupID, adId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/ad_groups/' + adGroupID +
                            '/ads/' + adId;

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                pushCampaign: function (campaignId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                                '/clients/' + clientId +
                                '/campaigns/' + campaignId +
                                '/push';

                    return dataService.fetch(url);
                },

                getTaggedCreatives: function (campaignId, adId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/ads/' + adId;

                    return dataService.fetch(url);
                },

                /*creative Library Flow*/
                getVendorsAdServer: function () {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/vendors?vendorType=ADSERVING');
                },

                /*Ad Create Flow*/
                getAdServers: function (adFormat) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/vendors?format=' + adFormat.replace(/\s+/g, '').toUpperCase());
                },

                getTemplates: function (adServer, format, isTracking) {
                    if (isTracking !== undefined) {
                        return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/vendors/' + adServer.id +
                            '/templates?format=' + format.replace(/\s+/g, '').toUpperCase() +
                            '&isTracking=' + isTracking);
                    } else {
                        return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/vendors/' + adServer.id +
                            '/templates?format=' + format.replace(/\s+/g, '').toUpperCase());
                    }
                },

                getCreativeSizes: function () {
                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/sizes');
                },

                saveCreatives: function (clientId, data) {
                    clientId = loginModel.getSelectedClient().id;
                    return dataService.post(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/advertisers/' + data.advertiserId + '/creatives',
                            data, {
                                'Content-Type': 'application/json'
                            }
                    );
                },

                getCreativeData: function (id) {
                    var clientId = loginModel.getSelectedClient().id;

                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/creatives/' + id);
                },

                forceSaveCreatives: function (clientId, adId, data) {
                    clientId = loginModel.getSelectedClient().id;
                    return dataService.post(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/advertisers/' + adId +
                            '/creatives?forceSave=true',
                            data, {
                                'Content-Type': 'application/json'
                            }
                    );
                },

                getCreatives: function (clientId, formats, query, cacheObj, integrationTracking, state, success,
                                        failure) {
                    var queryStr = query ? query : '',
                        creativeFormats = formats ? '?creativeFormat=' + formats : '',
                        intTracking = integrationTracking ? '&tracking=true' : '&tracking=false',
                        url,
                        canceller;

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/creatives' + creativeFormats + queryStr + intTracking + state;
                    state = state ? '&status=READY' : '';
                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);

                    return dataService.fetchCancelable(url, canceller, success, failure);
                },

                getCreativesforCreativeList: function (clientId, formats, query, pageSize, pageNo, success, failure) {
                    var queryStr = query ? query : '',
                        creativeFormats = formats ? 'creativeFormat=' + formats : '',
                        url, canceller;

                    pageSize = pageSize ? '&pageSize=' + pageSize : '';
                    pageNo = pageNo ? '&pageNo=' + pageNo : '';

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/creatives?' +
                        creativeFormats + queryStr + pageSize + pageNo;

                    canceller = requestCanceller.initCanceller(constants.ADDLIBRARY_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);

                    //  return dataService.fetch(url);
                },

                deleteCreatives: function (clientId, data) {
                    return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId + '/creatives/bulkdelete',
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                getCreativeAds: function (creativeId) {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/creatives/' + creativeId + '/ads?enabled=true';

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                updateCreative: function (clientId, adId, id, data) {
                    clientId = loginModel.getSelectedClient().id;
                    return dataService.put(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/advertisers/' + adId +
                            '/creatives/' + id + '?forceSave=true',
                            data, {
                                'Content-Type': 'application/json'
                            }
                    );
                },

                getRegionsList: function (platformId, data, success, failure, flag) {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/vendors/' + platformId + '/regions' + data,
                        canceller;

                    if (flag === 'cancellable') {
                        canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                        return dataService.fetchCancelable(url, canceller, success, failure);
                    } else {
                        return dataService.fetch(url);
                    }
                },

                getCitiesList: function (platformId, data, success, failure, flag) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/vendors/' + platformId + '/cities' + data,
                        canceller;

                    if (flag === 'cancellable') {
                        canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                        return dataService.fetchCancelable(url, canceller, success, failure);
                    } else {
                        return dataService.fetch(url);
                    }
                },

                getDMAsList: function (platformId, data, success, failure, flag) {
                    var // clientId =  loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/vendors/' + platformId + '/dmas' + data,
                        canceller;

                    if (flag === 'cancellable') {
                        canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                        return dataService.fetchCancelable(url, canceller, success, failure);
                    } else {
                        return dataService.fetch(url);
                    }
                },

                getAdvertisersDomainList: function (clientId, advertiserId) {
                    var url;

                    clientId = loginModel.getSelectedClient().id;
                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/domain_lists?sortBy=name&sortOrder=asc';

                    return dataService.fetch(url);
                },

                createAdvertisersDomainList: function (clientId, advertiserId, domainId) {
                    var domainIdstr = domainId ? '/' + domainId : '';

                    clientId = loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/domain_lists/upload' + domainIdstr;
                },

                getPlatformCustomInputs: function (platformId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/vendors/' + platformId;

                    return dataService.fetch(url);
                },

                setModuleInfo: function (module) {
                    vistoModule = module;
                },

                getModuleInfo: function (module) {
                    return vistoModule;
                },

                clearModuleInfo: function () {
                    vistoModule = null;
                },

                setMode: function (m) {
                    mode = m;
                },

                getMode: function () {
                    return mode;
                },

                setIsAdGroup: function (m) {
                    isAdGroup = m;
                },

                getIsAdGroup: function () {
                    return isAdGroup;
                },

                setUnallocatedAmount: function (m) {
                    unallocatedAmount = m;
                },

                getUnallocatedAmount: function () {
                    return unallocatedAmount;
                },

                setAdsDetails: function (ad) {
                    adDetails = ad;
                },

                getAdsDetails: function () {
                    return adDetails;
                },

                setNewCreative: function (creative) {
                    newCreative = creative;
                    $rootScope.$broadcast('updateNewCreative');
                },

                getNewCreative: function () {
                    return newCreative;
                },

                setPlatform: function (m) {
                    platform = m;
                },

                getPlatform: function () {
                    return platform;
                },

                getObjectives: function () {
                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/objectiveTypes');
                },

                getVendors: function (categoryId) {
                    // var url= vistoconfig.apiPaths.WORKFLOW_API_URL + '/costCategories/'+categoryId+'/vendors';
                    // for system of records.
                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/costCategories/5/vendors');
                },

                getCostCategories: function () {
                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/costCategories');
                },

                getVendorForSelectedCostCategory: function (clientId, categoryId) {
                    return dataService.fetch(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/costCategories/' + categoryId +
                        '/vendors'
                    );
                },

                setSavedGeo: function (geoDetails) {
                    savedGeo = geoDetails;
                },

                resetSavedGeo: function () {
                    savedGeo = null;
                },

                getSavedGeo: function () {
                    return savedGeo;
                },

                setDeleteModule: function (module) {
                    deletedModule.push(module);
                },

                getDeleteModule: function () {
                    return deletedModule;
                },

                resetDeleteModule: function () {
                    deletedModule = [];
                },

                setCreativeEditData: function (data) {
                    creativeEditData = data;
                },

                getCreativeEditData: function () {
                    return creativeEditData;
                },

                setCreativeEditMode: function (mode) {
                    creativeMode = mode;
                },

                getCreativeEditMode: function () {
                    return creativeMode
                },

                getAllCampaignsForAdClone: function () {
                    var clientId = loginModel.getSelectedClient().id,
                        advertiserId = window.JSON.parse(localStorage.campaignData).advertiserId,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +
                            '/advertisers/' + advertiserId + '/campaigns?status=ACTIVE';

                    return dataService.fetch(url, {
                        cache: false
                    });
                },

                cloneAd: function (data, selectedMediaPlanId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +
                            '/campaigns/' + selectedMediaPlanId + '/ads/clone';

                    if (data.source_ad_id) {
                        url += '?source_ad_id=' + data.source_ad_id;
                    }

                    if (data.ad_group) {
                        url += '&ad_group=' + data.ad_group;
                    }

                    return dataService.post(
                        url,
                        data, {
                            'Content-Type': 'application/json'
                        }
                    );
                },

                platformResponseModifier: function (resp) {
                    var platforms = {
                            fullIntegrationsPlatforms: [],
                            trackingPlatforms: []
                        },
                        i;

                    for (i = 0; i < resp.length; i++) {
                        if (resp[i].vendorExecutionPlatform.fullIntegration) {
                            //full integration platform
                            platforms.fullIntegrationsPlatforms.push(createObj(resp[i]));
                        } else {
                            platforms.trackingPlatforms.push(createObj(resp[i]));
                        }
                    }

                    platforms.fullIntegrationsPlatforms = _.sortBy(platforms.fullIntegrationsPlatforms, 'displayName');
                    platforms.trackingPlatforms = _.sortBy(platforms.trackingPlatforms, 'displayName');

                    return platforms;
                },

                platformCreateObj: function (resp) {
                    return createObj(resp);
                },

                recreateLabels: function (labelObj) {
                    var labelArr = [],
                        i,
                        obj = {};

                    for (i = 0; i < labelObj.length; i++) {
                        obj.label = labelObj[i];
                        labelArr.push(obj);
                    }

                    return labelArr;
                }
            };
        });
    }
);