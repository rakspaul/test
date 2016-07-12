define(['angularAMD', 'reporting/models/campaign_cost'], function (angularAMD) { // jshint ignore:line
    'use strict';

    var CampaignCostData = function () {
        this.id = 0;
        this.impressions = 0;
        this.inventory_cost = 0;
        this.data_cost = 0;
        this.creative_cost = 0;
        this.ad_serving_cost = 0;
        this.ad_verification_cost = 0;
        this.research_cost = 0;
        this.platform_cost = 0;
        this.collective_cost=0;
        this.metric_provider_cost=0;
        this.total = 0;

        this.getImpressions = function () {
            return this.impressions;
        };

        this.getInventoryCost = function () {
            return this.roundOff(this.inventory_cost, 2);
        };

        this.getDataCost = function () {
            return this.roundOff(this.data_cost, 2);
        };

        this.getCreativeCost = function () {
            return this.roundOff(this.creative_cost, 2);
        };

        this.getAdServingCost = function () {
            return this.roundOff(this.serving_cost, 2);
        };

        this.getAdVerificationCost = function () {
            return this.roundOff(this.verification_cost, 2);
        };

        this.getResearchCost = function () {
            return this.roundOff(this.research_cost, 2);
        };

        this.getPlatformCost = function () {
            return this.roundOff(this.platform_cost, 2);
        };

        this.getCollectiveCost = function () {
            return this.roundOff(this.collective_cost, 2);
        };

        this.getMetricProviderCost = function () {
            return this.roundOff(this.metric_provider_cost, 2);
        };

        this.getTotal = function () {
            return this.roundOff(this.gross_rev, 2);
        };

        this.roundOff = function (value, places) {
            var factor = Math.pow(10, places);

            return Math.round(value * factor) / factor;
        };
    };

    angularAMD.value('campaignCost', CampaignCostData);
});
