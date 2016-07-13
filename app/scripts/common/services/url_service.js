define(['angularAMD', 'common/services/vistoconfig_service',
    'common/services/constants_service', 'login/login_model'], function (angularAMD) {
        'use strict';

        angularAMD.service('urlService', ['vistoconfig', 'constants', 'loginModel', function (vistoconfig, constants, loginModel) {

                //Convention is to start all api urls with API.
                var APIlastViewedAction = function (campaignId) {
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.workflow_apiServicesUrl +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId +
                        '/viewedActions';
                },

                APIeditAction = function (actionId) {
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.workflow_apiServicesUrl +
                        '/clients/' + clientId +
                        '/actions/' + actionId;
                },

                APIloginAction = function () {
                    return vistoconfig.apiPaths.WORKFLOW_API_URL + '/login';
                },

                APIlogoutAction = function () {
                    return vistoconfig.apiPaths.WORKFLOW_API_URL + '/logout';
                },

                APIuserInfo = function () {
                    return vistoconfig.apiPaths.workflow_apiServicesUrl + '/userinfo';
                },

                buildParams  = function (qryObj) {
                    /*
                     @query Id
                     1  : dashboard_hardware_categories
                     2  : dashboard_ad_format
                     3  : dashboard_platform
                     4  : budget_top5_across_all_advertisers
                     5  : budget_top5_across_all_advertisers_brands
                     6  : budget_top5_across_all_brands
                     7  : performace_screens
                     8  : performace_formats
                     9  : performance_ad_sizes
                     10 : performace_creatives
                     11 : performace_days_of_week
                     12 : quality_data_for_all_ads
                     13 : quality_data_for_all_ads_strategy
                     14 : cost_report_for_one_or_more_campaign_ids
                     15 : cost_report_for_given_ad_group_id
                     16 : cost_download_report_for_given_campaign_id
                     17 : performace_screens_lineitem
                     18 : performace_formats_lineitem
                     19 : performace_ad_sizes_lineitem
                     20 : performace_creatives_lineitem
                     21 : performace_days_of_week_lineitem
                     */

                    var params ='';

                    if (qryObj.queryId) {
                        params = 'query_id=' + qryObj.queryId;
                    }

                    if (qryObj.clientId) {
                        params += '&client_id=' + qryObj.clientId;
                    }

                    if (qryObj.advertiserId) {
                        params += '&advertiser_id=' + qryObj.advertiserId;
                    }

                    if (qryObj.brandId) {
                        params += '&brand_id=' + qryObj.brandId;
                    }

                    if (qryObj.adGroupId) {
                        params += '&ad_group_id=' + qryObj.adGroupId;
                    }

                    if (qryObj.dateFilter) {
                        params += '&date_filter=' + qryObj.dateFilter;
                    }

                    if (qryObj.campaignStatus) {
                        params += '&campaign_status=' + qryObj.campaignStatus;
                    }

                    if (qryObj.campaignId) {
                        params += '&campaign_id=' + qryObj.campaignId;
                    }

                    if (qryObj.campaignIds) {
                        params += '&campaign_ids=' + qryObj.campaignIds;
                    }

                    if (qryObj.ad_group_id === 0) {
                        params += '&ad_group_id=0';
                    }

                    if (qryObj.download_config_id) {
                        params += '&download_config_id='+ qryObj.download_config_id;
                    }

                    if (qryObj.make_external !== undefined) {
                        params += '&make_external='+ qryObj.make_external;
                    }

                    // when strategyId = 0 qryObj.strategyId become false.
                    if (_.has(qryObj, 'strategyId') && qryObj.strategyId >= 0) {
                        params += '&lineitem_id=' + qryObj.strategyId;
                    }

                    return params;
                },

                APIVistoCustomQuery = function (qryObj) {
                    var params = this.buildParams(qryObj),
                        qryUrl = qryObj.url ? qryObj.url : '/reportBuilder/customQuery';

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW + qryUrl + '?' + params;
                },

                APICampaignCountsSummary = function (timePeriod, clientId, advertiserId, brandId, status) {
                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/campaigns/summary/counts?advertiser_id=' + advertiserId +
                        (brandId > -1 ? '&brand_id=' + brandId : '') + '&date_filter=' + timePeriod +
                        (status ? '&campaignState=' + status :'');
                },

                //API for dashbaord Bubble Chart
                APISpendWidgetForAllBrands = function (qryObj) {
                    var params;

                    qryObj.queryId = 6;
                    params = this.buildParams(qryObj);
                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/reportBuilder/customQuery?' + params;
                },

                APISpendWidgetForCampaigns = function (qryObj) {
                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + qryObj.clientId +
                        '/brands/' + qryObj.brandId +
                        '/campaigns/spend/perf?advertiser_id=' + qryObj.advertiserId +
                        '&date_filter=life_time&campaign_status=' + qryObj.campaignStatus + '&top_count=5';
                },

                APICalendarWidgetForBrand = function (clientId, advertiserId, brandId, sortColumn, status) {
                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/brands/campaigns/meta?advertiser_id=' + advertiserId + '&brand_id=' + brandId +
                        '&topCount=25&sort_column=' + sortColumn + '&campaignState=' + status;
                },

                APICalendarWidgetForAllBrands = function (clientId, advertiserId, sortColumn, status) {
                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/brands/campaigns/meta?advertiser_id=' + advertiserId + '&topCount=5&sort_column=' +
                        sortColumn + '&campaignState=' + status;
                },

                APIActionData = function (campaignId) {
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.workflow_apiServicesUrl +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId + '/actions';
                },

                APICampaignDropDownList = function (clientId, advertiserId, brandId) {
                    clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/brands/' + brandId +
                        '/campaigns/meta?x=x';
                },

                APIStrategiesForCampaign = function (campaingId) {
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/campaigns/' + campaingId +
                        '/lineitems/meta';
                },

                APIReportList = function (advertiserId, brandId, campaignId) {
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/listreports?advertiser_id=' + advertiserId + '&brand_id=' + brandId +
                        (campaignId > 0 ? '&campaign_id=' + campaignId : '');
                },

                APIUploadReport = function () {
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/upload';
                },

                APIDeleteReport = function (reportId) {
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/' + reportId;
                },

                APIEditReport = function (reportId) {
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/' + reportId;
                },

                APIDownloadReport = function (reportId) {
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/download/' + reportId;
                },

                scheduleReportsList = function () {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/reports/listReports';
                },

                //download option from the report builder
                downloadGeneratedRpt = function (reportId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/custom_reports/download/' + reportId;
                },

                downloadSchdRpt = function (instanceId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/downloadReport/' + instanceId;
                },

                downloadSavedRpt = function (instanceId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/downloadReport/' + instanceId;
                },

                scheduledReport = function (reportId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/getReport/' + reportId;
                },

                savedReport = function (reportId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/getReport/' + reportId;
                },

                deleteSchdRpt = function (reportId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/deleteReport/' + reportId;
                },

                deleteSavedRpt = function (reportId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/deleteReport/' + reportId;
                },

                deleteInstanceOfSchdRpt = function (reportId, instanceId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/deleteInstance/' + reportId +
                        '/' + instanceId;
                },

                createScheduledRpt = function () {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/createReport';
                },

                createSaveRpt = function () {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/createReport';
                },

                archiveSchldRpt = function (reportId, instanceId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/archiveInstance/' + reportId +
                        '/' + instanceId;
                },

                updateScheduledRpt = function (reportId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/updateReport/' + reportId;
                },

                updateSavedRpt = function (reportId) {
                    var clientId =  loginModel.getMasterClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/updateReport/' + reportId;
                },

                downloadAdminAdvPixel = function (clientId, advId){
                    return vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/' + advId +
                        '/pixels_download';
                },

                getInvoiceDetials = function (invoiceId){
                    var clientId =  loginModel.getSelectedClient().id;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/invoices/' + invoiceId;
                },

                getInvoiceData = function (invoiceReports, queryStr) {
                    var clientId =  loginModel.getSelectedClient().id,
                        url;

                    if (invoiceReports.isSearched) {
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/invoices/search' +
                            '?advertiser_id=' + invoiceReports.advertiserId +
                            '&brand_id=' + invoiceReports.brandId +
                            '&search_term=' + invoiceReports.searchTerm + queryStr;
                    } else {
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/invoices/list' +
                            '?advertiser_id=' + invoiceReports.advertiserId +
                            '&brand_id=' + invoiceReports.brandId + queryStr;
                    }

                    return url;
                },

                saveInvoiceListCredits = function (invoiceId){
                    var clientId =  loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;

                    return url + '/clients/' + clientId + '/invoices/' + invoiceId + '/adjustments';
                },

                downloadInvoiceCampaign = function (campaignId){
                    var clientId =  loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;

                    return url + '/clients/' + clientId + '/invoices/campaign_id/' + campaignId + '/download';
                },

                downloadTemplateWithCampaignId = function (campaignId){
                    var clientId =  loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;

                    return url + '/clients/' + clientId + '/invoices/campaign_id/' + campaignId + '/templatedownload';
                },

                downloadInvoiceWithId = function (invoiceId){
                    var clientId =  loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;

                    return url + '/clients/' + clientId + '/invoices/' + invoiceId + '/download';
                },

                uploadInvoiceData = function (invoiceId){
                    var clientId =  loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;

                    return url + '/clients/' + clientId + '/invoices/' + invoiceId + '/upload';
                },

                getCampaignSpend = function (queryObj) {
                    var params = this.buildParams(queryObj);

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/reportBuilder/customQuery?' + params;
                };

                return {
                    APIlastViewedAction : APIlastViewedAction,
                    APIeditAction : APIeditAction,
                    APIloginAction : APIloginAction,
                    APIlogoutAction : APIlogoutAction,
                    APIuserInfo : APIuserInfo,
                    buildParams : buildParams,
                    APIVistoCustomQuery : APIVistoCustomQuery,
                    APICampaignCountsSummary : APICampaignCountsSummary,
                    APISpendWidgetForAllBrands : APISpendWidgetForAllBrands,
                    APISpendWidgetForCampaigns : APISpendWidgetForCampaigns,
                    APICalendarWidgetForBrand : APICalendarWidgetForBrand,
                    APICalendarWidgetForAllBrands : APICalendarWidgetForAllBrands,
                    APIActionData : APIActionData,
                    APICampaignDropDownList : APICampaignDropDownList,
                    APIStrategiesForCampaign : APIStrategiesForCampaign,
                    APIReportList : APIReportList,
                    APIUploadReport : APIUploadReport,
                    APIDeleteReport : APIDeleteReport,
                    APIEditReport : APIEditReport,
                    APIDownloadReport : APIDownloadReport,
                    scheduleReportsList : scheduleReportsList,
                    downloadGeneratedRpt : downloadGeneratedRpt,
                    downloadSchdRpt : downloadSchdRpt,
                    downloadSavedRpt : downloadSavedRpt,
                    scheduledReport : scheduledReport,
                    savedReport : savedReport,
                    deleteSchdRpt : deleteSchdRpt,
                    deleteSavedRpt : deleteSavedRpt,
                    deleteInstanceOfSchdRpt : deleteInstanceOfSchdRpt,
                    createScheduledRpt : createScheduledRpt,
                    createSaveRpt : createSaveRpt,
                    archiveSchldRpt : archiveSchldRpt,
                    updateScheduledRpt : updateScheduledRpt,
                    updateSavedRpt : updateSavedRpt,
                    downloadAdminAdvPixel : downloadAdminAdvPixel,
                    getInvoiceDetials : getInvoiceDetials,
                    getInvoiceData : getInvoiceData,
                    saveInvoiceListCredits : saveInvoiceListCredits,
                    downloadInvoiceCampaign : downloadInvoiceCampaign,
                    downloadTemplateWithCampaignId : downloadTemplateWithCampaignId,
                    downloadInvoiceWithId : downloadInvoiceWithId,
                    uploadInvoiceData : uploadInvoiceData,
                    getCampaignSpend : getCampaignSpend
                };
            }
        ]);
    }
);
