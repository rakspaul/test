define(['angularAMD', 'common/services/vistoconfig_service', 'common/services/constants_service',
    'common/services/data_service', 'login/login_model', 'common/services/request_cancel_service','common/moment_utils'],
    function (angularAMD) {
        angularAMD.factory('workflowService', function ($rootScope, vistoconfig, constants, dataService, loginModel,
                                                       requestCanceller,momentService,$location) {

            var mode,
                adDetails,
                newCreative,
                platform,
                seat,
                savedGeo,
                vistoModule,
                creativeMode,
                creativeEditData,
                isAdGroup,
                unallocatedAmount,
                deletedModule = [],
                rates;

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
                integrationObj.vendorCapabilities=platform.vendorCapabilities;
                integrationObj.seats = platform.seats;
                _.each(integrationObj.seats, function(obj, idx) {
                        integrationObj.seats[idx]['platform_id'] = platform.id;  integrationObj.seats[idx]['iconUrl'] = platform.iconURL;
                    });
                return integrationObj;
            }

            return {
                fetchCampaigns: function () {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns';
                    return dataService.fetch(url);
                },

            getClientData: function (clientId) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId;

                return dataService.fetch(url, {cache: false});
            },

            getSubAccounts: function(access_level){
                var accessLevel = '';
                if(access_level !== undefined) {
                    var accessLevel = '&access_level='+access_level;
                }

                var clientId =  loginModel.getMasterClient().id;
                if(clientId !== undefined) {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/descendants?level=last' + accessLevel;
                    return dataService.fetch(url);
                }
            },

            getDashboardSubAccount: function() {
                var clientId = loginModel.getMasterClient().id;
                if(clientId) {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/descendants?level=all';
                    return dataService.fetch(url);
                }
            },

            getClients: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients';

                return dataService.fetch(url, {
                    cache: false
                });
            },

            getAdvertisers: function (accessLevel,client_id) {
                var clientId =  loginModel.getSelectedClient().id;
                var isDashboardSubAccount = false;

                var locationPath = $location.url();
                if((locationPath === '/dashboard') || (locationPath === '/')) {
                    isDashboardSubAccount = true;
                }


                if(client_id) {
                    var clientId =  client_id;
                } else if(isDashboardSubAccount) {
                    var clientId = loginModel.getDashboardClient().id
                }

                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers';

                if(accessLevel && !isDashboardSubAccount) {
                    url =  url +'?access_level='+accessLevel;
                } else if(isDashboardSubAccount) {
                    url =  url +'?level=all';
                }

                return dataService.fetch(url);
            },

            getBrands: function (client_id,advertiserId, accessLevel) {
                var clientId =  loginModel.getSelectedClient().id;
                if(client_id){
                    var clientId =  client_id;
                }
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +
                            '/advertisers/' + advertiserId + '/brands';
                if (accessLevel) {
                    url = url + '?access_level=' + accessLevel;
                }

                return dataService.fetch(url);
            },
            getPixels: function (advertiserId,client_Id) {
                var clientId = loginModel.getSelectedClient().id;;
                if(client_Id){
                    clientId = client_Id;
                }

                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +
                            '/advertisers/' + advertiserId + '/pixels?type=PAGE_VIEW';

                return dataService.fetch(url);
            },
            getRatesTypes: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/billing_types';

                return dataService.fetch(url);
            },
            saveCampaign: function (data) {
                var isLeafNode = loginModel.getMasterClient().isLeafNode;
                if(isLeafNode) {
                    var clientId =  loginModel.getSelectedClient().id;
                } else {
                    var clientId = data.clientId;

                }
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns',
                    data,
                    {'Content-Type': 'application/json'}
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

                getPlatforms: function (cacheObj, advertiserId) {
                    var clientId = loginModel.getSelectedClient().id,
                        campaignData = JSON.parse(localStorage.getItem("campaignData"));
                    if(!advertiserId  && campaignData) {
                        advertiserId = campaignData.advertiserId;
                    }

                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId + '/advertisers/' + advertiserId +'/vendors?vendorType=EXECUTION_PLATFORM&sortBy=name';
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

                getAdgroups: function (campaignId, searchTerm, isForClone) {
                    var clientId = loginModel.getSelectedClient().id,
                        url;

                    if (searchTerm) {
                        url = 'http://qa-desk.collective.com/api/reporting/v3' +



                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/search/adgroups?search_term=' + searchTerm;
                    } else {
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/ad_groups';
                    }

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

                saveCreatives: function (client_id, data) {
                    if(client_id) {
                        var clientId = client_id;
                    }else {
                        var clientId = loginModel.getSelectedClient().id;
                    }

                    return dataService.post(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/advertisers/' + data.advertiserId + '/creatives',
                            data, {
                                'Content-Type': 'application/json'
                            }
                    );
                },

            getCreativeData:function(id,client_id){
                if(client_id) {
                    var clientId = client_id;
                } else {
                    var clientId =  loginModel.getSelectedClient().id;
                }

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL  +'/clients/'+clientId+'/creatives/'+id);
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

                getCreatives: function (clientId,adId, formats, query, cacheObj, integrationTracking, state, success,
                                        failure) {
                    var queryStr = query ? query : '',
                        creativeFormats = formats ? '?creativeFormat=' + formats : '',
                        intTracking = integrationTracking ? '&tracking=true' : '&tracking=false',
                        url,
                        canceller;
                    state = state ? '&status=READY' : '';

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + adId +
                        '/creatives' + creativeFormats + queryStr + intTracking + state;

                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);

                    return dataService.fetchCancelable(url, canceller, success, failure);
                },

            deleteCreatives:function(clientId,data){
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +'/creatives/bulkdelete',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getCreativeAds:function(creativeId){
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/creatives/' + creativeId + '/ads?enabled=true';

                return dataService.fetch(url, {cache: false});
            },

            updateCreative: function (client_id, adId, id, data) {
                var clientId =  client_id || loginModel.getSelectedClient().id;

                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers/' + adId + '/creatives/' + id+'?forceSave=true',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            downloadCreativeTemplate: function(adServerId, templateId) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/adserver/' + adServerId
                    + '/template/' + templateId + '/creatives/export?type=HEADER_ONLY';

                return dataService.downloadFile(url);
            },

            downloadCreativeErrors: function(fileName) {
                fileName = fileName.substr(fileName.indexOf('fileName=') + 9);
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/creatives/downloadCreativeLogs?fileName=' + fileName;

                return dataService.downloadFile(url);
            },

            uploadBulkCreativeUrl: function(adServerId, creativeFormat, templateId) {

                var clientId = loginModel.getSelectedClient().id;

                return  vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/adserver/' + adServerId
                    + '/format/' + creativeFormat.replace(/\s+/g, '').toUpperCase() + '/template/' + templateId + '/creatives/bulkimport';
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

                getCreativesforCreativeList: function (clientId, formats, query, pageSize, pageNo, advertiserId, success, failure) {
                    var queryStr = query ? query : '',
                        creativeFormats = formats ? 'creativeFormat=' + formats : '',
                        url, canceller;

                    pageSize = pageSize ? '&pageSize=' + pageSize : '';
                    pageNo = pageNo ? '&pageNo=' + pageNo : '';

                    var advertiserString = "";
                    if(advertiserId>0){
                        advertiserString = '/advertisers/'+ advertiserId
                    }

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +advertiserString+ '/creatives?' +
                        creativeFormats + queryStr + pageSize + pageNo;

                    canceller = requestCanceller.initCanceller(constants.ADDLIBRARY_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);

                    //  return dataService.fetch(url);
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

                getLineItem: function (campaignId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns/' + campaignId +'/lineitems?flat_fee=false&archived=false';

                    return dataService.fetch(url);
                },

                getVideoTargetsType: function (type) {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/video_targets/' + type;
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

                setPlatformSeat: function(platformSeat) {
                    seat = platformSeat
                },

                getPlatform: function () {
                    return platform;
                },

                getSeat: function () {
                    return seat;
                },

                getObjectives: function () {
                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/objectiveTypes');
                },
                getVendors: function (categoryId) {
                    // var url= vistoconfig.apiPaths.WORKFLOW_API_URL + '/cost_categories/'+categoryId+'/vendors';
                    // for system of records.
                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/cost_categories/5/vendors');
                },
                getVendorConfigs: function (advertiserId,client_id) {
                    var clientId = loginModel.getSelectedClient().id;
                    if(client_id) {
                        clientId = client_id;
                    }

                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/'+clientId+'/advertisers/'+advertiserId+'/clientVendorConfigs?rateType=FIXED&rateTypeIncluded=false');
                },

                 getCostAttr: function (advertiserId,client_id) {
                    var clientId = loginModel.getSelectedClient().id;
                     if(client_id) {
                         clientId = client_id;
                     }

                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/'+clientId+'/advertisers/'+advertiserId+'/clientVendorConfigs?rateType=FIXED');
                },

                getCostCategories: function () {
                    return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/cost_categories');
                },

                getVendorForSelectedCostCategory: function (clientId, categoryId) {
                    return dataService.fetch(
                        vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/cost_categories/' + categoryId +
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
                        obj;

                    for (i = 0; i < labelObj.length; i++) {
                        obj = {};
                        obj.label = labelObj[i];
                        labelArr.push(obj);
                    }

                    return labelArr;
                },
                validateUrl: function(url){
                    var re =  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
                    return re.test(url);
                },
                processVendorConfig: function(data){
                    var processedData = {};
                    processedData.userPermission = [];
                    processedData.configs = [];
                    for(var j = 0; j < data.length; j++){
                        for(var i = 0; i < data[j].clientConfigPermissions.length ; i ++){
                            var permission = {};
                            if(data[j].clientConfigPermissions[i]){
                                permission.vendorName = data[j].vendorName;
                                permission.configName = data[j].name;
                                permission.metric = data[j].clientConfigPermissions[i].metric;
                                permission.adFormat = data[j].clientConfigPermissions[i].adFormat;
                                processedData.userPermission.push(permission);
                            }

                        }
                        //vendor config object creation
                        for(var i = 0; i < data[j].clientVendorOfferings.length ; i ++){
                            var config = {};
                            config.vendorName = data[j].vendorName;
                            config.configName = data[j].name;
                            config.adFormat = data[j].clientVendorOfferings[i].name;
                            config.rate = 'Media Cost + ' + data[j].clientVendorOfferings[i].rateValue + ' ' + data[j].clientVendorOfferings[i].rateType.name;
                            config.category = data[j].clientVendorOfferings[i].costCategory.name;
                            processedData.configs.push(config);
                        }
                    }


                    return processedData;
                },
                processCostAttr: function(data){
                    var costAttrbs = {};
                    costAttrbs.offering = [];
                    costAttrbs.vendor = [];
                    costAttrbs.category = [];
                    var rateTypeObj;

                    _.each(data, function(obj) {
                        if(obj.clientVendorOfferings && obj.clientVendorOfferings.length >0) {
                            rateTypeObj = _.pluck(obj.clientVendorOfferings, 'rateType');
                            costAttrbs.rateTypeId = _.pluck(rateTypeObj, 'id')[0];
                            costAttrbs.clientVendorConfigurationId = _.pluck(obj.clientVendorOfferings, 'clientVendorConfigurationId')[0];
                        }
                    })

                    if(data.length > 0) {
                         _.each(data,function(obj){
                            costAttrbs.vendor.push({'id':obj.id,'name':obj.name});
                            _.each(obj.clientVendorOfferings,function(vObj){
                                costAttrbs.offering.push({'id':vObj.id ,'name':vObj.name});
                                costAttrbs.category.push({'id':vObj.costCategory.id,'name':vObj.costCategory.name});
                            })
                        })

                        costAttrbs.category = _.uniq(costAttrbs.category, 'name')
                    }
                    return costAttrbs;
                },
                processLineItemsObj: function(lineItemList){
                    var newItemList = [];
                    _.each(lineItemList,function(item){
                            var newItemObj = {};
                            newItemObj.adGroupName = item.adGroupName;
                            item.startTime = momentService.localTimeToUTC(item.startTime, 'startTime');
                            item.endTime = momentService.localTimeToUTC(item.endTime, 'endTime');
                            item.pricingRate = Number(item.pricingRate.split('%')[0]);
                            newItemObj.lineItem = item;
                            newItemList.push(newItemObj);
                    });
                    //console.log("newItemList &***(((",newItemList);
                    return newItemList;
                },
                setRateTypes: function(r){
                    rates = r;
                },
                getRateTypes: function(){
                    return rates;
                }

            };
        });
    }
);
