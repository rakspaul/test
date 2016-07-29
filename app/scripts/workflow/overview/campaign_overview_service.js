define(['angularAMD', 'common/services/data_service','common/services/vistoconfig_service'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('campaignOverviewService', function (dataService,vistoconfig) {

            var pauseAllAds = function(params){

                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + params.clientId +
                    '/campaigns/' + params.campaignId +
                    '/ad_groups/'+ params.adGroupId+
                    '/pause',
                    { 'Content-Type': 'application/json' }
                );

            }, resumeAllAds = function(params){

                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL +
                    '/clients/' + params.clientId +
                    '/campaigns/' + params.campaignId +
                    '/ad_groups/'+ params.adGroupId+
                    '/resume',
                    { 'Content-Type': 'application/json' }
                );

            };

            return {
                pauseAllAds:pauseAllAds,
                resumeAllAds:resumeAllAds
            };
        });
    }
);
