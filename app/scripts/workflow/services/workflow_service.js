define(['angularAMD', 'common/services/vistoconfig_service', 'common/services/constants_service',
    'common/services/data_service', 'login/login_model', 'common/services/request_cancel_service',
    'common/moment_utils'], function (angularAMD) {
    'use strict';

    angularAMD.factory('workflowService', function ($rootScope, vistoconfig, constants, dataService, loginModel,
                                                        requestCanceller, momentService, $location) {
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
            rates,
            selectedAdvertiser,
            cloneMediaPlanData,
            lineitemDetails = null,
            lineitemDetailsEdit = null,
            lineitemDetailsBulk = null,
            advertiserBillingVal,
            executionType,
            subAccountTimezone,

            createObj = function (platform) {
                var integrationObj = {};

                integrationObj.id = platform.id;
                integrationObj.name = platform.vendorExecutionPlatform.code;
                integrationObj.displayName = platform.name;
                integrationObj.iconUrl = platform.iconURL;
                integrationObj.customInputJson = platform.vendorExecutionPlatform.customInputJson;
                integrationObj.executionVendorType = platform.vendorExecutionPlatform.executionVendorType;
                integrationObj.active = true; // TODO hardcoded true for now...
                integrationObj.summary = platform.description;
                integrationObj.vendorCapabilities = platform.vendorCapabilities;
                integrationObj.seats = platform.seats;

                _.each(integrationObj.seats, function (obj, idx) {
                    integrationObj.seats[idx].platform_id = platform.id;
                    integrationObj.seats[idx].iconUrl = platform.iconURL;
                });

                return integrationObj;
            },

            fetchCampaigns = function () {
                var clientId = vistoconfig.getSelectedAccountId(),
                    url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns';

                return dataService.fetch(url);
            },

            getClientData = function (clientId) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId;

                return dataService.fetch(url, {cache: false});
            },

            getSubAccounts = function (clientId, access_level) {
                var accessLevel = '',
                    url;

                if (access_level !== undefined) {
                    accessLevel = '&access_level=' + access_level;
                }

                if (clientId !== undefined) {
                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/descendants?level=last' + accessLevel;

                    return dataService.fetch(url);
                }
            },


            getDashboardSubAccount = function (clientId) {
                var url;

                if (clientId) {
                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/descendants?level=all';

                    return dataService.fetch(url);
                }
            },

            getClients = function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients';

                return dataService.fetch(url, {
                    cache: false
                });
            },

            getAdvertisers = function (clientId, accessLevel) {
                var isDashboardSubAccount = $location.path().endsWith('/dashboard');
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertisers';
                if (accessLevel && !isDashboardSubAccount) {
                    url = url + '?access_level=' + accessLevel;
                } else if (isDashboardSubAccount) {
                    url = url + '?level=all';
                }

                return dataService.fetch(url);
            },

            getBrands =  function (clientId, advertiserId, accessLevel) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +
                    '/advertisers/' + advertiserId + '/brands';
                if (accessLevel) {
                    url += '?access_level=' + accessLevel;
                }

                return dataService.fetch(url);
            },

            getPixels = function (advertiserId, client_Id, endDate, pixels, mode) {
                var clientId = vistoconfig.getMasterClientId(),
                    url;

                if (endDate) {
                    endDate = momentService.localTimeToUTC(endDate);
                }

                if (client_Id) {
                    clientId = client_Id;
                }

                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/pixels?type=PAGE_VIEW&min_expiry_date=' + endDate;

                if (mode === 'edit') {
                    if (pixels && pixels.length > 0) {
                        url += '&include='+ pixels.toString();
                    }
                }

                return dataService.fetch(url);
            },

            getRatesTypes = function (clientId,advertiserId) {
                var client_id = vistoconfig.getMasterClientId(),
                    url;

                if (clientId) {
                    client_id = clientId;
                }

                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + client_id +
                    '/advertisers/' + advertiserId +
                    '/allowedBillingTypes';

                if (client_id && advertiserId) {
                    return dataService.fetch(url);
                }
            },

            getBillingTypeValue = function (clientId, advertiserId) {
                var client_id = vistoconfig.getMasterClientId(),
                    url;

                if (clientId) {
                    client_id = clientId;
                }

                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + client_id +
                    '/advertisers/' + advertiserId +
                    '/billing';

                if (client_id && advertiserId) {
                    return dataService.fetch(url);
                }
            },

            saveCampaign = function (clientId, data) {
                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns',
                    data,
                    { 'Content-Type': 'application/json' }
                );
            },

            updateCampaign = function (clientId, data) {

                var campaignId = data.campaignId;
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns/' + campaignId,
                    data,
                    { 'Content-Type': 'application/json' }
                );
            },

            getCampaignData = function (clientId, campaignId) {


                var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId;

                return dataService.fetch(url, { cache: false });
            },

            getPlatforms = function (clientId, advertiserId, cacheObj) {

                var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/vendors?vendorType=EXECUTION_PLATFORM&sortBy=name';

                return dataService.fetch(url, cacheObj);
            },

            getAdsForCampaign = function (campaignId) {
                var clientId = vistoconfig.getSelectedAccountId(),

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/no_ad_group/ads';

                return dataService.fetch(url, { cache: false });
            },

            getPixelDataFile = function (campaignId) {
                var clientId = vistoconfig.getSelectedAccountId(),

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/pixels/download';

                return dataService.fetch(url, { cache: false });
            },

            getAdgroups = function (clientId, campaignId, searchTerm, isForClone) {
                var url;

                if (searchTerm) {
                    url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
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

                return dataService.fetch(url, { cache: false });
            },

            createAdGroups = function (clientId, campaignId, data) {

                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/campaigns/' + campaignId +
                    '/ad_groups',
                    data,
                    { 'Content-Type': 'application/json' }
                );
            },

            editAdGroups = function (clientId, campaignId, data) {

                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/campaigns/' + campaignId +
                    '/ad_groups/' + data.adgroupId,
                    data, { 'Content-Type': 'application/json' }
                );
            },

            getAdsInAdGroup = function (campaignId, adGroupID) {
                var clientId = vistoconfig.getSelectedAccountId(),
                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/ad_groups/' + adGroupID +
                        '/ads';

                return dataService.fetch(url, { cache: false });
            },

            createAd = function (data) {
                var clientId = vistoconfig.getSelectedAccountId();

                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + data.campaignId +
                        '/ads',
                    data, { 'Content-Type': 'application/json' }
                );
            },

            updateAd = function (data) {
                var clientId = vistoconfig.getSelectedAccountId();

                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + data.campaignId +
                        '/ads/' + data.adId,
                    data, { 'Content-Type': 'application/json' }
                );
            },

            deleteAd = function (campaignId, adId) {
                var clientId = vistoconfig.getSelectedAccountId();

                return dataService.deleteRequest(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/ads/' + adId,
                    { 'Content-Type': 'application/json' }
                );
            },

            pauseAd = function (data) {
                var clientId = vistoconfig.getSelectedAccountId();

                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + data.campaignId +
                        '/ads/' + data.id +
                        '/pause',
                    data,
                    { 'Content-Type': 'application/json' }
                );
            },

            resumeAd = function (data) {
                var clientId = vistoconfig.getSelectedAccountId();

                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + data.campaignId +
                        '/ads/' + data.id + '/resume',
                    data,
                    { 'Content-Type': 'application/json' }
                );
            },

            deleteCampaign = function (campaignId) {
                var clientId = vistoconfig.getSelectedAccountId();

                return dataService.deleteRequest(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId,
                    { 'Content-Type': 'application/json' }
                );
            },

            cloneCampaign  = function (data) {
                var clientId = vistoconfig.getMasterClientId();

                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId + '/campaigns/' + data.id + '/clone',
                    data,
                    { 'Content-Type': 'application/json' }
                );
            },

            checkforUniqueMediaPlan = function (cloneObj) {
                var clientId,
                    url;

                if (cloneObj.subAccountId) {
                    clientId = cloneObj.subAccountId;
                } else {
                    clientId = vistoconfig.getSelectedAccountId();
                }

                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + cloneObj.advertiserId +
                    '/campaigns/unique_name?name='+cloneObj.cloneMediaPlanName;

                return dataService.fetch(url);
            },

            getAd = function (clientId, data) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + data.campaignId +
                        '/ads/' + data.adId;

                return dataService.fetch(url, { cache: false });
            },

            getDetailedAdsInAdGroup = function (clientId, campaignId, adGroupID, adId) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/ad_groups/' + adGroupID +
                        '/ads/' + adId;

                return dataService.fetch(url, { cache: false });
            },

            pushCampaign = function (campaignId) {
                var clientId = vistoconfig.getSelectedAccountId(),

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/push';

                return dataService.fetch(url);
            },

            getTaggedCreatives = function (campaignId, adId) {
                var clientId = vistoconfig.getSelectedAccountId(),

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/ads/' + adId;

                return dataService.fetch(url);
            },

            // creative Library Flow
            getVendorsAdServer = function (subAccountId) {
                var clientId;

                if (subAccountId) {
                    clientId = subAccountId;
                } else {
                    clientId = vistoconfig.getSelectedAccountId();
                }

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/vendors?vendorType=ADSERVING');
            },

            // Ad Create Flow
            getAdServers = function (adFormat) {
                var clientId = vistoconfig.getSelectedAccountId();

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/vendors?format=' + adFormat.toUpperCase());
            },

            getTemplates = function (adServer, format,executionVendorType) {
                executionVendorType = executionVendorType ? '&executionVendorType=' + executionVendorType : '';

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/vendors/' + adServer.id +
                    '/templates?format=' + format.toUpperCase() + executionVendorType);
            },

            getCreativeSizes = function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/sizes');
            },

            saveCreatives = function (client_id, data) {
                var clientId;

                if (client_id) {
                    clientId = client_id;
                } else {
                    clientId = vistoconfig.getSelectedAccountId();
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

            getCreativeData = function (client_id, creativeId) {
                var clientId = client_id || vistoconfig.getSelectedAccountId();

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/creatives/' + creativeId);
            },

            getCreativePreViewData  = function(params) {
                var str,
                    qryStr;

                str = (params.campaignId && params.adId) ?
                    ('?campaignId=' + params.campaignId + '&adId=' + params.adId) : '';

                qryStr = '/clients/' + params.clientId +
                    '/advertisers/'+ params.advertiserId +
                    '/creatives/' + params.creativeId +
                    '/preview' + str;

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + qryStr);
            },

            forceSaveCreatives = function (clientId, advertiserId, data) {
                clientId = vistoconfig.getSelectedAccountId();

                return dataService.post(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/creatives?forceSave=true',
                    data,
                    { 'Content-Type': 'application/json' }
                );
            },

            getCreatives = function (clientId, adId, formats, query, cacheObj, state, executionPlatformType,
                                    success, failure) {
                var queryStr = query ? query : '',
                    creativeFormats = formats ? '?creativeFormat=' + formats : '',
                    url,
                    canceller;

                state = state ? '&status=READY' : '';

                executionPlatformType = executionPlatformType ? '&executionVendorType=' + executionPlatformType : '';

                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + adId +
                    '/creatives' + creativeFormats + queryStr  + state + executionPlatformType;

                canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);

                return dataService.fetchCancelable(url, canceller, success, failure);
            },

            validateCreative = function(o){
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + o.clientId +
                        '/advertisers/' + o.advertiserId + '/creatives/validate',
                    o.data,
                    {'Content-Type': 'application/json'}
                );
            },

            deleteCreatives = function (clientId, data) {
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/creatives/bulkdelete',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            getCreativeAds = function (creativeId) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/creatives/' + creativeId + '/ads?enabled=true';

                return dataService.fetch(url, {cache: false});
            },

            updateCreative = function (client_id, adId, id, data) {
                var clientId = client_id || vistoconfig.getMasterClientId();

                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + adId +
                        '/creatives/' + id +
                        '?forceSave=true',
                    data,
                    {'Content-Type': 'application/json'}
                );
            },

            downloadCreativeTemplate = function (adServerId, templateId) {
                var clientId = vistoconfig.getMasterClientId(),

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/adserver/' + adServerId +
                        '/template/' + templateId +
                        '/creatives/export?type=HEADER_ONLY';

                return dataService.downloadFile(url);
            },

            downloadCreativeErrors = function (fileName) {
                var url;

                fileName = fileName.substr(fileName.indexOf('fileName=') + 9);
                url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/creatives/downloadCreativeLogs?fileName=' + fileName;

                return dataService.downloadFile(url);
            },

            uploadBulkCreativeUrl = function (adServerId, creativeFormat, templateId) {
                var clientId = vistoconfig.getMasterClientId();

                return vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +
                    '/adserver/' + adServerId +
                    '/format/' + creativeFormat.replace(/\s+/g, '').toUpperCase() +
                    '/template/' + templateId +
                    '/creatives/bulkimport';
            },

            getCountries = function (platformId, data, requestType, success, failure) {
                var canceller,

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/vendors/' + platformId +
                        '/countries' + data;

                if (requestType === 'cancellable') {
                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);

                    return dataService.fetchCancelable(url, canceller, success, failure);
                } else {
                    return dataService.fetch(url);
                }
            },

            getRegions = function (platformId, data, requestType, success, failure) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/vendors/' + platformId + '/regions' + data,
                    canceller;

                if (requestType === 'cancellable') {
                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                } else {
                    return dataService.fetch(url);
                }
            },

            getCities = function (platformId, data, requestType, success, failure) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/vendors/' + platformId + '/cities' + data,
                    canceller;

                if (requestType === 'cancellable') {
                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);

                    return dataService.fetchCancelable(url, canceller, success, failure);
                } else {
                    return dataService.fetch(url);
                }
            },

            getCreativesforCreativeList = function (params, success, failure) {

                var queryStr,
                    creativeFormats,
                    url,
                    canceller,
                    advertiserString = '',
                    pageSize,
                    pageNo;


                queryStr = params.query ? ('query=' + params.query) : '';
                creativeFormats = params.formats ? ('creativeFormat=' + params.formats) : '';
                pageSize = params.pageSize ? ('&pageSize=' + params.pageSize ) : '';
                pageNo = params.pageNo ? ( '&pageNo=' + params.pageNo ) : '';
                advertiserString = params.advertiserId > 0 ? ('/advertisers/' + params.advertiserId) : '';

                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + params.clientId + advertiserString +
                    '/creatives?' + creativeFormats + queryStr + pageSize + pageNo;

                canceller = requestCanceller.initCanceller(constants.ADDLIBRARY_FILTER_CANCELLER);

                return dataService.fetchCancelable(url, canceller, success, failure);
            },

            getDMAs = function (platformId, data, requestType, success, failure) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/vendors/' + platformId + '/dmas' + data,
                    canceller;

                if (requestType === 'cancellable') {
                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);

                    return dataService.fetchCancelable(url, canceller, success, failure);
                } else {
                    return dataService.fetch(url);
                }
            },

            getAdvertisersDomainList = function (clientId, advertiserId) {
                var url;

                clientId = vistoconfig.getMasterClientId();

                url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/inventory_lists?inventoryType=ALL&sortBy=name&sortOrder=asc';

                return dataService.fetch(url);
            },

            createAdvertisersDomainList = function (clientId, advertiserId, domainId) {
                var domainIdstr = domainId ? '/' + domainId : '';

                clientId = vistoconfig.getMasterClientId();

                return vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/inventory_lists/upload' + domainIdstr;
            },

            getPlatformCustomInputs = function (clientId, platformId) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/vendors/' + platformId;
                return dataService.fetch(url);
            },

            getLineItem = function (clientId, campaignId, isFromMediaPlan) {

                var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/lineitems';

                if (!isFromMediaPlan) {
                    //append this in case the call is made from campaign overview page
                    url += '?flat_fee=false&archived=false';
                }

                return dataService.fetch(url);
            },

            createLineItems = function (campaignId,client_id,data) {
                var clientId = client_id || vistoconfig.getMasterClientId(),

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/lineitems';

                return dataService.post(
                    url,
                    data,
                    { 'Content-Type': 'application/json' }
                );
            },

            updateLineItems = function (campaignId, client_id, data) {
                var clientId = client_id || vistoconfig.getMasterClientId(),

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/lineitems/' + data.id;

                return dataService.put(
                    url,
                    data,
                    { 'Content-Type': 'application/json' }
                );
            },

            getVideoTargetsType = function (type) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/video_targets/' + type;

                return dataService.fetch(url);
            },

            getObjectives = function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/objectiveTypes');
            },

            getVendors = function () {
                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL + '/cost_categories/5/vendors');
            },

            getVendorConfigs = function (advertiserId, client_id) {
                var clientId = vistoconfig.getMasterClientId();

                if (client_id) {
                    clientId = client_id;
                }

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/clientVendorConfigs?rateType=FIXED&rateTypeIncluded=false');
            },

            getCostAttr = function (advertiserId, client_id) {
                var clientId = vistoconfig.getMasterClientId();

                if (client_id) {
                    clientId = client_id;
                }

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/clientVendorConfigs?rateType=FIXED');
            },

            getSystemOfRecord = function (advertiserId, client_id) {
                var clientId = vistoconfig.getMasterClientId();

                if (client_id) {
                    clientId = client_id;
                }

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/advertisers/' + advertiserId +
                    '/clientVendorConfigs?sor=true');
            },

            getBillingTypeAndValue = function (advertiserId, client_id) {
                var clientId = client_id || vistoconfig.getMasterClientId();

                return dataService.fetch(vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/billing_types?advertiser_id=' + advertiserId);
            },

            getVendorForSelectedCostCategory = function (clientId, categoryId) {
                return dataService.fetch(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + clientId +
                    '/cost_categories/' + categoryId +
                    '/vendors'
                );
            },

            getAllCampaignsForAdClone = function () {
                var clientId = vistoconfig.getMasterClientId(),
                    advertiserId = window.JSON.parse(localStorage.campaignData).advertiserId,

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId +
                        '/advertisers/' + advertiserId + '/campaigns?status=ACTIVE';

                return dataService.fetch(url, {
                    cache: false
                });
            },

            cloneAd = function (data, selectedMediaPlanId) {
                var clientId = vistoconfig.getMasterClientId(),

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

            platformResponseModifier = function (resp) {
                var platforms = {
                        fullIntegrationsPlatforms: [],
                        trackingPlatforms: []
                    },

                    i;

                for (i = 0; i < resp.length; i++) {
                    if (resp[i].vendorExecutionPlatform.executionVendorType === 'FULL INTEGRATION') {
                        //full integration platform
                        platforms.fullIntegrationsPlatforms.push(createObj(resp[i]));
                    } else {
                        platforms.trackingPlatforms.push(createObj(resp[i]));
                    }
                }

                platforms.fullIntegrationsPlatforms =
                    _.sortBy(platforms.fullIntegrationsPlatforms, 'displayName');

                platforms.trackingPlatforms =
                    _.sortBy(platforms.trackingPlatforms, 'displayName');

                return platforms;
            },

            platformCreateObj = function (resp) {
                return createObj(resp);
            },

            recreateLabels = function (labelObj) {
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

            processVendorConfig = function (data) {
                var processedData = {},
                    i,
                    j,
                    permission,
                    config;

                processedData.userPermission = [];
                processedData.configs = [];

                for (j = 0; j < data.length; j++) {
                    if (data[j].clientConfigPermissions.length > 0 && data[j].clientVendorOfferings.length > 0) {
                        for (i = 0; i < data[j].clientConfigPermissions.length; i++) {
                            permission = {};

                            if (data[j].clientConfigPermissions[i]) {
                                permission.vendorName = data[j].vendorName;
                                permission.configName = data[j].name;
                                permission.metric = data[j].clientConfigPermissions[i].metric;
                                permission.adFormat = data[j].clientConfigPermissions[i].adFormat;
                                processedData.userPermission.push(permission);
                            }
                        }

                        //vendor config object creation
                        for (i = 0; i < data[j].clientVendorOfferings.length; i++) {
                            config = {};
                            config.vendorName = data[j].vendorName;
                            config.configName = data[j].name;
                            config.adFormat = data[j].clientVendorOfferings[i].name;

                            config.rate = 'Media Cost + ' + data[j].clientVendorOfferings[i].rateValue + ' ' +
                                data[j].clientVendorOfferings[i].rateType.name;

                            config.category = data[j].clientVendorOfferings[i].costCategory.name;
                            processedData.configs.push(config);
                        }
                    }
                }

                return processedData;
            },

            processCostAttr = function (data) {
                var rateTypeObj,
                    costAttrbs = {};

                costAttrbs.offering = [];
                costAttrbs.vendor = [];
                costAttrbs.category = [];

                _.each(data, function (obj) {
                    if (obj.clientVendorOfferings && obj.clientVendorOfferings.length > 0) {
                        rateTypeObj = _.pluck(obj.clientVendorOfferings, 'rateType');
                        costAttrbs.rateTypeId = _.pluck(rateTypeObj, 'id')[0];

                        costAttrbs.clientVendorConfigurationId =
                            _.pluck(obj.clientVendorOfferings,
                                'clientVendorConfigurationId')[0];

                        costAttrbs.vendor.push({
                            id: obj.vendorId,
                            name: obj.vendorName
                        });

                        _.each(obj.clientVendorOfferings, function (vObj) {
                            costAttrbs.offering.push({
                                id: vObj.id,
                                name: vObj.name
                            });

                            costAttrbs.category.push({
                                id: vObj.costCategory.id,
                                name: vObj.costCategory.name
                            });
                        });
                    }

                    costAttrbs.category = _.uniq(costAttrbs.category, 'name');
                });

                return costAttrbs;
            },

            processLineItemsObj = function (lineItemList) {
                var newItemList = [],
                    dateTimeZone;

                dateTimeZone = this.getSubAccountTimeZone();

                _.each(lineItemList, function (item) {
                    var newItemObj = {};

                    newItemObj.adGroupName = item.adGroupName;
                    item.startTime = momentService.localTimeToUTC(item.startTime, 'startTime', dateTimeZone);
                    item.endTime = momentService.localTimeToUTC(item.endTime, 'endTime', dateTimeZone);

                    if (typeof item.pricingRate === 'string') {
                        item.pricingRate = Number(item.pricingRate.split('%')[0]);
                    }

                    newItemObj.lineItem = item;
                    newItemList.push(newItemObj);
                });

                return newItemList;
            },

            deleteLineItem = function (lineItem,client_id) {
                var clientId = client_id || vistoconfig.getMasterClientId();

                return dataService.deleteRequest(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + lineItem.campaignId +
                        '/lineitems/' + lineItem.id,
                    { 'Content-Type': 'application/json' }
                );
            },

            addCommaToNumber = function (nStr) {
                var x,
                    x1,
                    x2,
                    rgx;

                nStr += '';
                x = nStr.split('.');
                x1 = x[0];
                x2 = x.length > 1 ? '.' + x[1] : '';
                rgx = /(\d+)(\d{3})/;

                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }

                return x1 + x2;
            },

            getPublisher  = function (params) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/vendors/' + params.vendorId +
                    '/seats/' + params.seatId +
                    '/publishers';

                return dataService.fetch(url);
            },

            getUnitSize  = function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/sizes';

                return dataService.fetch(url);
            },

            getPlacement  = function (data, params) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/vendors/' + data.vendorId +
                    '/seats/' + data.seatId +
                    '/placements' + params;

                return dataService.fetch(url);
            },

            validateZipCodes = function(params) {
                return dataService.post(vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/vendors/' + params.vendorId +
                        '/zipcodes/validate',
                    params.data,
                    {'Content-Type': 'application/json'}
                );
            },

            segrigateInventory = function (selectedList) {
                var inventryListObj = {},
                    domainList = [],
                    appList = [];

                _.each(selectedList,function (item) {
                    if(item.inventoryType === 'DOMAIN'){
                        domainList.push(item.domainListId);
                    }

                    if(item.inventoryType === 'APP'){
                        appList.push(item.domainListId);
                    }
                });

                inventryListObj.domainList = domainList;
                inventryListObj.appList = appList;

                return inventryListObj;
            },

            setModuleInfo = function (module) {
                vistoModule = module;
            },

            getModuleInfo = function () {
                return vistoModule;
            },

            clearModuleInfo = function () {
                vistoModule = null;
            },

            setMode = function (m) {
                mode = m;
            },

            getMode = function () {
                return mode;
            },

            setIsAdGroup = function (m) {
                isAdGroup = m;
            },

            getIsAdGroup = function () {
                return isAdGroup;
            },

            setUnallocatedAmount = function (m) {
                unallocatedAmount = m;
            },

            getUnallocatedAmount = function () {
                return unallocatedAmount;
            },

            setAdsDetails = function (ad) {
                adDetails = ad;
            },

            getAdsDetails = function () {
                return adDetails;
            },

            setNewCreative = function (creative) {
                newCreative = creative;
                $rootScope.$broadcast('updateNewCreative');
            },

            getNewCreative = function () {
                return newCreative;
            },

            setPlatform = function (m) {
                platform = m;
            },

            setPlatformSeat = function (platformSeat) {
                seat = platformSeat;
            },

            setVendorExecutionType = function (vendorExecutionType) {
                executionType=vendorExecutionType;
            },

            getVendorExecutionType = function () {
                return executionType;
            },

            getPlatform = function () {
                return platform;
            },

            getSeat = function () {
                return seat;
            },

            setSavedGeo = function (geoDetails) {
                savedGeo = geoDetails;
            },

            resetSavedGeo = function () {
                savedGeo = null;
            },

            getSavedGeo = function () {
                return savedGeo;
            },

            setDeleteModule = function (module) {
                deletedModule.push(module);
            },

            getDeleteModule = function () {
                return deletedModule;
            },

            resetDeleteModule = function () {
                deletedModule = [];
            },

            setCreativeEditData = function (data) {
                creativeEditData = data;
            },

            getCreativeEditData = function () {
                return creativeEditData;
            },

            setCreativeEditMode = function (mode) {
                creativeMode = mode;
            },

            getCreativeEditMode = function () {
                return creativeMode;
            },

            setRateTypes = function (r) {
                rates = r;
            },

            getRateTypes = function () {
                return rates;
            },

            setAdvertiserTypeValue = function (bv) {
                advertiserBillingVal = bv;
            },

            getAdvertiserTypeValue = function () {
                return advertiserBillingVal;
            },

            setSelectedAdvertiser = function (adv) {
                selectedAdvertiser = adv;
            },

            getSelectedAdvertiser = function () {
                return selectedAdvertiser;
            },

            setMediaPlanClone  = function (mediaPlanObj) {
                cloneMediaPlanData = mediaPlanObj;
            },

            getMediaPlanClone  = function () {
                return cloneMediaPlanData;
            },

            setLineItemData = function (data) {
                lineitemDetails = data;
            },

            getLineItemData = function () {
                return lineitemDetails;
            },

            setLineItemDataEdit = function (data) {
                lineitemDetailsEdit = data;
            },

            getLineItemDataEdit = function () {
                return lineitemDetailsEdit;
            },

            setLineItemBulkData = function (bulk) {
                lineitemDetailsBulk = bulk;
            },

            getLineItemBulkData = function () {
                return lineitemDetailsBulk ;
            },

            wrapperForActiveAdGroups = function(groupList) {
                // this wrapper is written because when the ad group api is called with ACTIVE parameter
                // response structure is different from normal API
                var obj = {};
                obj.ad_groups = [];

                _.each(groupList,function(group,key) {
                    obj.ad_groups[key] = {};
                    obj.ad_groups[key].adGroup = group;
                });

                return obj;

            },
            setSubAccountTimeZone = function(timezone) {
                console.log('setSubAccountTimeZone', timezone);
                subAccountTimezone = timezone;
            },

            getSubAccountTimeZone = function() {
                return subAccountTimezone;
            };


        return {
                fetchCampaigns: fetchCampaigns,
                getClientData: getClientData,
                getSubAccounts: getSubAccounts,
                getDashboardSubAccount: getDashboardSubAccount,
                getClients: getClients,
                getAdvertisers: getAdvertisers,
                getBrands: getBrands,
                getPixels: getPixels,
                getRatesTypes: getRatesTypes,
                getBillingTypeValue: getBillingTypeValue,
                saveCampaign: saveCampaign,
                updateCampaign: updateCampaign,
                getCampaignData: getCampaignData,
                getPlatforms: getPlatforms,
                getAdsForCampaign: getAdsForCampaign,
                getPixelDataFile: getPixelDataFile,
                getAdgroups: getAdgroups,
                createAdGroups: createAdGroups,
                editAdGroups: editAdGroups,
                getAdsInAdGroup: getAdsInAdGroup,
                createAd: createAd,
                updateAd: updateAd,
                deleteAd: deleteAd,
                pauseAd: pauseAd,
                resumeAd: resumeAd,
                deleteCampaign: deleteCampaign,
                cloneCampaign: cloneCampaign,
                checkforUniqueMediaPlan: checkforUniqueMediaPlan,
                getAd: getAd,
                getDetailedAdsInAdGroup: getDetailedAdsInAdGroup,
                pushCampaign: pushCampaign,
                getTaggedCreatives: getTaggedCreatives,
                getVendorsAdServer: getVendorsAdServer,
                getAdServers: getAdServers,
                getTemplates: getTemplates,
                getCreativeSizes: getCreativeSizes,
                saveCreatives: saveCreatives,
                getCreativeData: getCreativeData,
                getCreativePreViewData: getCreativePreViewData,
                forceSaveCreatives: forceSaveCreatives,
                getCreatives: getCreatives,
                validateCreative: validateCreative,
                deleteCreatives: deleteCreatives,
                getCreativeAds: getCreativeAds,
                updateCreative: updateCreative,
                downloadCreativeTemplate: downloadCreativeTemplate,
                downloadCreativeErrors: downloadCreativeErrors,
                uploadBulkCreativeUrl: uploadBulkCreativeUrl,
                getCountries: getCountries,
                getRegions: getRegions,
                getCities: getCities,
                getCreativesforCreativeList: getCreativesforCreativeList,
                getDMAs: getDMAs,
                getAdvertisersDomainList: getAdvertisersDomainList,
                createAdvertisersDomainList: createAdvertisersDomainList,
                getPlatformCustomInputs: getPlatformCustomInputs,
                getLineItem: getLineItem,
                createLineItems: createLineItems,
                updateLineItems: updateLineItems,
                getVideoTargetsType: getVideoTargetsType,
                getObjectives: getObjectives,
                getVendors: getVendors,
                getVendorConfigs: getVendorConfigs,
                getCostAttr: getCostAttr,
                getSystemOfRecord: getSystemOfRecord,
                getBillingTypeAndValue: getBillingTypeAndValue,
                getVendorForSelectedCostCategory: getVendorForSelectedCostCategory,
                getAllCampaignsForAdClone: getAllCampaignsForAdClone,
                cloneAd: cloneAd,
                platformResponseModifier: platformResponseModifier,
                platformCreateObj: platformCreateObj,
                recreateLabels: recreateLabels,
                processVendorConfig: processVendorConfig,
                processCostAttr: processCostAttr,
                processLineItemsObj: processLineItemsObj,
                deleteLineItem: deleteLineItem,
                addCommaToNumber: addCommaToNumber,
                getPublisher: getPublisher,
                getUnitSize: getUnitSize,
                getPlacement: getPlacement,
                validateZipCodes: validateZipCodes,
                segrigateInventory: segrigateInventory,
                setModuleInfo: setModuleInfo,
                getModuleInfo: getModuleInfo,
                clearModuleInfo: clearModuleInfo,
                setMode: setMode,
                getMode: getMode,
                setIsAdGroup: setIsAdGroup,
                getIsAdGroup: getIsAdGroup,
                setUnallocatedAmount: setUnallocatedAmount,
                getUnallocatedAmount: getUnallocatedAmount,
                setAdsDetails: setAdsDetails,
                getAdsDetails: getAdsDetails,
                setNewCreative: setNewCreative,
                getNewCreative: getNewCreative,
                setPlatform: setPlatform,
                setPlatformSeat: setPlatformSeat,
                setVendorExecutionType: setVendorExecutionType,
                getVendorExecutionType: getVendorExecutionType,
                getPlatform: getPlatform,
                getSeat: getSeat,
                setSavedGeo: setSavedGeo,
                resetSavedGeo: resetSavedGeo,
                getSavedGeo: getSavedGeo,
                setDeleteModule: setDeleteModule,
                getDeleteModule: getDeleteModule,
                resetDeleteModule: resetDeleteModule,
                setCreativeEditData: setCreativeEditData,
                getCreativeEditData: getCreativeEditData,
                setCreativeEditMode: setCreativeEditMode,
                getCreativeEditMode: getCreativeEditMode,
                setRateTypes: setRateTypes,
                getRateTypes: getRateTypes,
                setAdvertiserTypeValue: setAdvertiserTypeValue,
                getAdvertiserTypeValue: getAdvertiserTypeValue,
                setSelectedAdvertiser: setSelectedAdvertiser,
                getSelectedAdvertiser: getSelectedAdvertiser,
                setMediaPlanClone: setMediaPlanClone,
                getMediaPlanClone: getMediaPlanClone,
                setLineItemData: setLineItemData,
                getLineItemData: getLineItemData,
                setLineItemDataEdit: setLineItemDataEdit,
                getLineItemDataEdit: getLineItemDataEdit,
                setLineItemBulkData: setLineItemBulkData,
                getLineItemBulkData: getLineItemBulkData,
                wrapperForActiveAdGroups: wrapperForActiveAdGroups,
                setSubAccountTimeZone : setSubAccountTimeZone,
                getSubAccountTimeZone : getSubAccountTimeZone
            };
    });
});
