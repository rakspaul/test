define(['angularAMD'], function (angularAMD) {
        'use strict';

        angularAMD.service('urlService', ['vistoconfig', function (vistoconfig) {


                var APIeditAction = function (clientId, actionId) {

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
                     7  : performance_screens
                     8  : performance_formats
                     9  : performance_ad_sizes
                     10 : performance_creatives
                     11 : performance_days_of_week
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
                        if(Number(qryObj.brandId) === 0) {
                            qryObj.brandId = -1;
                        }
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

                    if (qryObj.lineitemId) {
                        params += '&lineitem_id=' + qryObj.lineitemId;
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

               // Performance canned report
                APIVistoCustomQuery = function (qryObj) {

                    var params = this.buildParams(qryObj),
                        qryUrl = qryObj.url ? qryObj.url : '/reportBuilder/customQuery';

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW + qryUrl + '?' + params;
                },

                APICampaignCountsSummary = function (timePeriod, clientId, advertiserId, brandId, status) {

                    brandId = (Number(brandId) === 0)?-1:brandId;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/campaigns/summary/counts?advertiser_id=' + advertiserId +
                        '&brand_id=' + brandId + '&date_filter=' + timePeriod +
                        (status ? '&campaignState=' + status :'');
                },

                // API for dashbaord Bubble Chart
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

                APICalendarWidgetForAdvertiser = function (clientId, advertiserId, brandId, sortColumn, status) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/advertisers/campaigns/meta?advertiser_id=' + advertiserId + '&brand_id=' + brandId +
                        '&topCount=25&sort_column=' + sortColumn + '&campaignState=' + status;
                },

                APICalendarWidgetForAllAdvertisers = function (clientId, advertiserId, sortColumn, status) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/advertisers/campaigns/meta?advertiser_id=' + advertiserId + '&topCount=5&sort_column=' +
                        sortColumn + '&campaignState=' + status;
                },

                APIActionData = function (clientId, campaignId) {
                    return vistoconfig.apiPaths.workflow_apiServicesUrl +
                        '/clients/' + clientId +
                        '/campaigns/' + campaignId + '/actions';
                },

                APICampaignDropDownList = function (clientId, advertiserId, brandId) {
                    brandId = Number(brandId) || -1;
                    advertiserId = Number(advertiserId) || -1;

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/advertisers/' + advertiserId +
                        '/brands/' + brandId +
                        '/campaigns/meta?x=x';
                },

                APIStrategiesForCampaign = function (clientId, campaingId) {
                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' +
                        campaingId + '/lineitems/meta';
                },

                APIReportList = function (clientId, advertiserId, brandId, campaignId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/listreports?advertiser_id=' + advertiserId + '&brand_id=' + brandId +
                        (campaignId > 0 ? '&campaign_id=' + campaignId : '');
                },

                APIUploadReport = function (clientId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/upload';
                },

                APIDeleteReport = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/' + reportId;
                },

                APIEditReport = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/' + reportId;
                },

                APIDownloadReport = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/uploadedreports/download/' + reportId;
                },

                scheduleReportsList = function (clientId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/reports/listReports';
                },

                // download option from the report builder
                downloadGeneratedRpt = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/custom_reports/download/' + reportId;
                },

                downloadSchdRpt = function (clientId, instanceId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/downloadReport/' + instanceId;
                },

                downloadSavedRpt = function (clientId, instanceId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/downloadReport/' + instanceId;
                },

                scheduledReport = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/getReport/' + reportId;
                },

                savedReport = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/getReport/' + reportId;
                },

                deleteSchdRpt = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/deleteReport/' + reportId;
                },

                deleteSavedRpt = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/deleteReport/' + reportId;
                },

                deleteInstanceOfSchdRpt = function (clientId, reportId, instanceId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/deleteInstance/' + reportId +
                        '/' + instanceId;
                },

                createScheduledRpt = function (clientId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/createReport';
                },

                createSaveRpt = function (clientId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/createReport';
                },

                archiveSchldRpt = function (clientId, reportId, instanceId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/archiveInstance/' + reportId +
                        '/' + instanceId;
                },

                updateScheduledRpt = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/scheduledreports/updateReport/' + reportId;
                },

                updateSavedRpt = function (clientId, reportId) {

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/savedreports/updateReport/' + reportId;
                },

                downloadAdminAdvPixel = function (clientId, advId){
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/pixels_download';
                    url += advId ? '?advertiserId='+advId : '';
                    return url;
                },

                getInvoiceDetials = function (clientId, invoiceId){

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                        '/clients/' + clientId +
                        '/invoices/' + invoiceId;
                },

                getInvoiceData = function (invoiceReports, queryStr) {
                    var url;

                    if (invoiceReports.isSearched) {
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + invoiceReports.clientId +
                            '/invoices/search' +
                            '?advertiser_id=' + invoiceReports.advertiserId +
                            '&brand_id=' + invoiceReports.brandId +
                            '&search_term=' + invoiceReports.searchTerm + queryStr;
                    } else {
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + invoiceReports.clientId +
                            '/invoices/list' +
                            '?advertiser_id=' + invoiceReports.advertiserId +
                            '&brand_id=' + invoiceReports.brandId + queryStr;
                    }

                    return url;
                },

                saveInvoiceListCredits = function (clientId, invoiceId){

                    var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;
                    return url + '/clients/' + clientId + '/invoices/' + invoiceId + '/adjustments';
                },

                downloadInvoiceCampaign = function (clientId, campaignId){

                    var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;
                    return url + '/clients/' + clientId + '/invoices/campaign_id/' + campaignId + '/download';
                },

                downloadTemplateWithCampaignId = function (clientId, campaignId){

                    var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;
                    return url + '/clients/' + clientId + '/invoices/campaign_id/' + campaignId + '/templatedownload';
                },

                downloadInvoiceWithId = function (clientId, invoiceId){

                    var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;
                    return url + '/clients/' + clientId + '/invoices/' + invoiceId + '/download';
                },

                uploadInvoiceData = function (clientId, invoiceId){

                    var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW;
                    return url + '/clients/' + clientId + '/invoices/' + invoiceId + '/upload';
                },

                customRptFilterAutoSugg = function(params) {
                        var url =  vistoconfig.apiPaths.apiSerivicesUrl_NEW;
                        url+= '/clients/'+params.clientId+'/reports/custom/dimension/meta?dimension='+params.dimension;
                        if(params.searchKey) {
                            url+='&search_term='+params.searchKey;
                        }
                        if(params.offset) {
                            url+='&offset='+params.offset;
                        }
                        return url;
                },

                getCampaignSpend = function (queryObj) {
                    var params = this.buildParams(queryObj);

                    return vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/reportBuilder/customQuery?' + params;
                };

                return {
                    APIeditAction : APIeditAction,
                    APIloginAction : APIloginAction,
                    APIlogoutAction : APIlogoutAction,
                    APIuserInfo : APIuserInfo,
                    buildParams : buildParams,
                    APIVistoCustomQuery : APIVistoCustomQuery,
                    APICampaignCountsSummary : APICampaignCountsSummary,
                    APISpendWidgetForAllBrands : APISpendWidgetForAllBrands,
                    APISpendWidgetForCampaigns : APISpendWidgetForCampaigns,
                    APICalendarWidgetForAdvertiser : APICalendarWidgetForAdvertiser,
                    APICalendarWidgetForAllAdvertisers : APICalendarWidgetForAllAdvertisers,
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
                    getCampaignSpend : getCampaignSpend,
                    customRptFilterAutoSugg:customRptFilterAutoSugg
                };
            }
        ]);
    }
);
