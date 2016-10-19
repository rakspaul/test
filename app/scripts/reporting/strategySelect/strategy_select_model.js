define(['angularAMD', 'url-service', 'request-cancel-service'], function (angularAMD) {
    'use strict';

    angularAMD.factory('strategySelectModel', ['$q', '$timeout', 'urlService', 'dataService', 'requestCanceller',
        'constants', 'vistoconfig', function ($q, $timeout, urlService, dataService, requestCanceller,
                                              constants, vistoconfig) {

            var strategyList = [],
                selectedStrategy = vistoconfig.LINE_ITEM_DROPDWON_OBJECT,
                previousCampaignId;

            return {
                fetchStrategyList: function (clientId, campaignId) {
                    var deferred,
                        url,
                        canceller;

                    if (previousCampaignId !== campaignId) {
                        this.reset();
                    }

                    deferred = $q.defer();

                    if (strategyList.length > 0) {
                        $timeout(function() {
                            deferred.resolve();
                        }, 10);

                        return deferred.promise;
                    }

                    url = urlService.APIStrategiesForCampaign(clientId, campaignId);
                    canceller = requestCanceller.initCanceller(constants.STRATEGY_LIST_CANCELLER);

                    return dataService.fetchCancelable(url, canceller, function (response) {
                        if (response && response.data.data.length > 0) {
                            strategyList = response.data.data;
                            strategyList.unshift(vistoconfig.LINE_ITEM_DROPDWON_OBJECT);
                        } else {
                            strategyList = [vistoconfig.LINE_ITEM_DROPDWON_OBJECT];
                        }

                        previousCampaignId = campaignId;
                        deferred.resolve();
                    });
                },

                allowedStrategy: function (strategyId) {
                    if (strategyId) {
                        selectedStrategy = _.find(strategyList, function(s) {
                            return Number(s.id) === Number(strategyId);
                        });

                        if (selectedStrategy) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        selectedStrategy = vistoconfig.LINE_ITEM_DROPDWON_OBJECT;
                    }

                    return true;
                },

                getStrategyList: function () {
                    return strategyList;
                },

                getSelectedStrategy: function () {
                    return selectedStrategy;
                },

                getStrategyCount: function () {
                    return strategyList.length;
                },


                reset: function () {
                    strategyList = [];
                    selectedStrategy = undefined;
                },

                setSelectedStrategy: function(strategyObj) {
                    selectedStrategy = strategyObj;
                },

                allAdFormats: function () {
                    var result,
                        adFormatsArr;

                    if (strategyList && strategyList.length > 0) {
                        if (Number(selectedStrategy.id) === -1) {
                            adFormatsArr = _.map(strategyList, function (strategy) {
                                return strategy.ad_formats || [];
                            });

                            result = _.uniq(_.flatten(adFormatsArr));
                        } else {
                            selectedStrategy =
                                _.find(strategyList, function (strategy) {
                                    return strategy.id === Number(selectedStrategy.id);
                                });

                            result = selectedStrategy ? selectedStrategy.ad_formats : [];
                        }
                    }

                    return result || [];
                }
            };
        }
    ]);
});
