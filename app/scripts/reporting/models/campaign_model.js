define(['angularAMD'], function (angularAMD) {
    "use strict";
    angularAMD.value('campaignModel', function () {
        //following variables are returned by API
        this.id = -1;
        this.name = '';
        this.status = 'draft';
        this.start_date = '';
        this.end_date = '';
        this.kpi_type = '';
        this.kpi_value = '';
        this.total_impressions = '';
        this.total_media_cost = 0;
        this.expected_media_cost = '';
        this.brand_name = '';
        this.lineitems_count = '';
        this.actions_count = '';
        this.kpi_status = -1;
        this.momentInNetworkTZ = null;

        //following variables are used by campaignListModel
        this.setVariables = function () {
            this.orderId = this.id;
            this.startDate = this.start_date;
            this.endDate = this.end_date;
            this.fromSuffix = '';
            this.toSuffix = '';
            this.campaignTitle = this.name;
            this.campaignTitleHtml = this.name;
            this.brandName = this.brand_name;
            this.statusIcon = this.status;
            this.kpiType = this.kpi_type;
            this.kpiValue = this.kpi_value;
            this.totalImpressions = this.total_impressions;
            this.totalMediaCost = this.total_media_cost;
            this.expectedMediaCost = this.expected_media_cost;
            this.lineitemsCount = this.lineitems_count;
            this.actionsCount = this.actions_count;
            this.campaignStrategies = null;
            this.tacticMetrics = [];
            this.chart = true;
            this.campaignStrategiesLoadMore = null;
        };

        //following are redundant variables and should be removed from single campaign object as they are properties of campaign list.
        this.periodStartDate = '';
        this.periodEndDate = '';

        this.constructor = function () {
            return this;
        };

        this.setMomentInNetworkTz = function (momentInNetworkTZ) {
            this.momentInNetworkTZ = momentInNetworkTZ;
        };

        this.durationLeft = function () {
            //      console.log('durationLeft called: ' + this.startDate + " : " + this.endDate);
            var today = this.momentInNetworkTZ.today(),
                endDate = this.momentInNetworkTZ.newMoment(this.endDate),
                startDate = this.momentInNetworkTZ.newMoment(this.startDate);

            if (today.isBefore(startDate)) {
                //campaign yet to start
                return "Yet to start";
            }

            if (endDate.isBefore(today)) {
                //campaign ended
                return "Ended";
            }

            if (endDate.isSame(today)) {
                //campaign ending today
                return "Ending today";
            }

            if (startDate.isSame(today)) {
                //campaign starting today
                return "Started today";
            }

            return Math.round(endDate.diff(today, 'days', true)) + 1;
        };

        this.durationCompletion = function () {
            var today = this.momentInNetworkTZ.today(),
                endDate = this.momentInNetworkTZ.newMoment(this.endDate),
                startDate = this.momentInNetworkTZ.newMoment(this.startDate),
                totalDays = endDate.diff(startDate, 'days') + 1,
                daysOver = Math.round(today.diff(startDate, 'days', true));

            if (today.isBefore(startDate)) {
                return 0;
            }

            if (endDate.isBefore(today)) {
                return 100;
            }

            return Math.round((daysOver / totalDays) * 100);
        };

        this.daysSinceEnded = function () {
            var today = this.momentInNetworkTZ.today(),
                endDate = this.momentInNetworkTZ.newMoment(this.endDate);

            return !endDate.isBefore(today) ? 0 : Math.round(today.diff(endDate, 'days', true)) + 1;
        };
    });
});
