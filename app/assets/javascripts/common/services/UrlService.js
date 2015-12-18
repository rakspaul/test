(function () {
    var urlFactory = function (apiPaths, constants, loginModel) {
        //Convention is to start all api urls with API.
        this.APIlastViewedAction = function (campaignId) {
            var url = apiPaths.workflow_apiServicesUrl + '/campaigns/' + campaignId + '/viewedActions';
            return url;
        };
        this.APIeditAction = function (actionId) {
            var url = apiPaths.workflow_apiServicesUrl + '/actions/' + actionId;
            return url;
        };

        this.APIloginAction = function () {
            var url = apiPaths.WORKFLOW_APIUrl + '/login';
            return url;
        };

        this.APIlogoutAction = function () {
            var url = apiPaths.WORKFLOW_APIUrl + '/logout';
            return url;
        };

        this.APIuserInfo = function () {
            var url = apiPaths.workflow_apiServicesUrl + '/userinfo';
            return url;
        };

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

        this.buildParams  = function(qryObj) {
            var params ='';
            if(qryObj.queryId) {
                params = 'query_id=' + qryObj.queryId;
            }

            if(qryObj.clientId) {
                params += '&client_id=' + qryObj.clientId;
            }

            if(qryObj.advertiserId) {
                params += '&advertiser_id=' + qryObj.advertiserId;
            }

            if(qryObj.brandId) {
                params += '&brand_id=' + qryObj.brandId;
            }

            if(qryObj.adGroupId) {
                params += '&ad_group_id=' + qryObj.adGroupId;
            }

            if(qryObj.dateFilter) {
                params += '&date_filter=' + qryObj.dateFilter;
            }

            if(qryObj.campaignStatus) {
                params += '&campaign_status=' + qryObj.campaignStatus;
            }

            if(qryObj.campaignId) {
                params += '&campaign_id=' + qryObj.campaignId;
            }

            if(qryObj.campaignIds) {
                params += '&campaign_ids=' + qryObj.campaignIds;
            }

            // when strategyId = 0 qryObj.strategyId become false.
            if(_.has(qryObj, 'strategyId') && qryObj.strategyId >= 0) {
                params += '&ad_group_id=' + qryObj.strategyId;
            }
            return params;
        };

        this.APIVistoCustomQuery = function (qryObj) {
            var params = this.buildParams(qryObj);
            var qryUrl = qryObj.url ? qryObj.url : '/reportBuilder/customQuery'
            var url = apiPaths.apiSerivicesUrl_NEW + qryUrl + '?' + params;
            return url;
        };

        //TODO: need to remove user_id - @Gaurav/ @Richa needs to verify where this is used
        this.APICampaignList = function (user_id, date_filter, page, sort_column, sort_direction, conditions) {
            var clientId =  loginModel.getSelectedClient().id;
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/'+clientId+'/campaigns/bystate?user_id=' + user_id + '&date_filter=' + date_filter + '&page=' + page +
                '&callback=JSON_CALLBACK&sort_column=' + sort_column + '&sort_direction=' + sort_direction + '&conditions=' + conditions;
            return url;
        };

        this.APIDefaultCampaignList = function (user_id) {
            return this.APICampaignList(user_id, constants.PERIOD_LIFE_TIME, 1, 'start_date', constants.SORT_DESC, constants.ACTIVE_UNDERPERFORMING);
        };

        this.APICampaignCountsSummary = function (timePeriod, clientId, advertiserId, brandId, status) {
            var url = apiPaths.apiSerivicesUrl_NEW +'/clients/'+clientId+'/campaigns/summary/counts?advertiser_id=' + advertiserId + ((brandId > -1) ? ('&brands=' + brandId) : '') + '&date_filter=' + timePeriod + '&campaignState=' + (status == undefined ? undefined : status.toLowerCase());
            return url;
        };

        //API for dashbaord Bubble Chart
        this.APISpendWidgetForAllBrands = function (clientId, advertiserId, brandId, timePeriod, status) {
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/brands/spend/perf?advertiser_id='+advertiserId+'&date_filter=' + timePeriod + '&campaignState=' + status;
            return url;
        };

        this.APISpendWidgetForCampaigns = function (clientId, advertiserId, brandId, timePeriod, status) {
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/brands/' + (brandId?brandId:-1) + '/campaigns/spend/perf?advertiser_id='+advertiserId+'&date_filter=' + timePeriod + '&campaignState=' + status.toLowerCase();
            return url;
        };

        this.APICalendarWidgetForBrand = function (timePeriod, clientId, advertiserId, brandId, sortColumn, status) {
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/brands/campaigns/meta?advertiser_id=' + advertiserId + '&brand_id='+brandId+'&topCount=5&sort_column=' + sortColumn + '&campaignState=' + status.toLowerCase();
            return url;
        };

        this.APICalendarWidgetForAllBrands = function (timePeriod, clientId, advertiserId, sortColumn, status) {
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/brands/campaigns/meta?advertiser_id=' + advertiserId + '&topCount=5&sort_column=' + sortColumn + '&campaignState=' + status.toLowerCase();
            return url;
        };

        this.APIActionData = function (campaignId) {
            var clientId =  loginModel.getSelectedClient().id;
            return apiPaths.workflow_apiServicesUrl + '/clients/' + clientId + "/campaigns/" + campaignId + "/actions"
        };

        this.APICampaignDropDownList = function (clientId, advertiserId, brandId) {
            var clientId =  loginModel.getSelectedClient().id;
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/advertisers/'+advertiserId +'/brands/'+brandId+'/campaigns/meta?x=x';
            return url;
        };

        this.APIStrategiesForCampaign = function (campaingId) {
            var clientId =  loginModel.getSelectedClient().id;
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + campaingId + '/ad_groups/meta';
            return url;
        };

        this.APIReportList = function (brandId, campaignId) {
            var clientId =  loginModel.getSelectedClient().id;
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/uploadedreports/listreports/' + campaignId + '/' + brandId;
            return url;
        }

        this.APIUploadReport = function () {
            var clientId =  loginModel.getSelectedClient().id;
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/uploadedreports/upload';
            return url;
        }

        this.APIDeleteReport = function (reportId) {
            var clientId =  loginModel.getSelectedClient().id;
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/uploadedreports/' + reportId;
            return url;
        }

        this.APIEditReport = function (reportId) {
            var clientId =  loginModel.getSelectedClient().id;
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/uploadedreports/' + reportId;
            return url;
        }

        this.APIDownloadReport = function (reportId) {
            var clientId =  loginModel.getSelectedClient().id;
            var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/uploadedreports/download/' + reportId;
            return url;
        }

        this.scheduleReportsList = function () {
            var clientId =  loginModel.getSelectedClient().id;
            return apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/scheduledreports/listReports';
        }

        this.downloadSchdRpt = function (instanceId) {
            var clientId =  loginModel.getSelectedClient().id;
            return apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/scheduledreports/downloadReport/'+instanceId;
        }

        this.scheduledReport = function (reportId) {
            var clientId =  loginModel.getSelectedClient().id;
            return apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/scheduledreports/getReport/' + reportId;
        }

        this.deleteSchdRpt = function (reportId) {
            var clientId =  loginModel.getSelectedClient().id;
            return apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/scheduledreports/deleteReport/' + reportId;
        }

        this.deleteInstanceOfSchdRpt = function (reportId, instanceId) {
            var clientId =  loginModel.getSelectedClient().id;
            return apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/scheduledreports/deleteInstance/' + reportId + '/' + instanceId;
        }

        this.createScheduledRpt = function () {
            var clientId =  loginModel.getSelectedClient().id;
            return apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/scheduledreports/createReport';
        }

        this.archiveSchldRpt = function (reportId, instanceId) {
            var clientId =  loginModel.getSelectedClient().id;
            return apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/scheduledreports/archiveInstance/' + reportId + '/' + instanceId;
        }

        this.updateScheduledRpt = function(reportId ) {
            var clientId =  loginModel.getSelectedClient().id;
            return apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/scheduledreports/updateReport/' + reportId;
        }

    }

    commonModule.service("urlService", ['apiPaths', 'constants', 'loginModel', urlFactory]);

}());
