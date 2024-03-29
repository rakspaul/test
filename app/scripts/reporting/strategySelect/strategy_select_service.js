define(['angularAMD', 'url-service', 'request-cancel-service'], function (angularAMD) {
    'use strict';

    angularAMD.service('strategySelectService', ['urlService', 'dataService', 'requestCanceller', 'constants',
        'vistoconfig', function (urlService, dataService, requestCanceller, constants, vistoconfig) {
            var strategyObj = {
                strategies :  {},
                selectedStrategy : {id: -1, name: 'Loading...'}
            },

            getStrategies = function (campaignId) {
                var url = urlService.APIStrategiesForCampaign(campaignId),
                    canceller = requestCanceller.initCanceller(constants.STRATEGY_LIST_CANCELLER),

                    errorHandler = function () {
                        strategyObj.selectedStrategy.id = -99;
                        strategyObj.selectedStrategy.name = constants.NO_ADGROUPS_FOUND;
                    },

                    modifyStrategiesData = function (resp) {
                        var strategyData = (resp && resp.data) ? resp.data : [];

                        strategyData.unshift(vistoconfig.LINE_ITEM_DROPDWON_OBJECT);
                        strategyObj.strategies = (strategyData !== undefined) ? strategyData : {};



                        if (strategyObj.strategies.length !== undefined &&
                            strategyObj.strategies.length > 0 &&
                            strategyObj.selectedStrategy.id  === -1) {
                            strategyObj.selectedStrategy.id = strategyObj.strategies[0].id;
                            strategyObj.selectedStrategy.name = strategyObj.strategies[0].name;
                        }
                    };

                return dataService.fetchCancelable(url, canceller, function (response) {
                    modifyStrategiesData((response.status  === 'OK' || response.status  === 'success') ?
                        response.data : errorHandler);

                    return strategyObj;
                });
            },

            setSelectedStrategy =  function (_strategy) {
                strategyObj.selectedStrategy.id = _strategy.id;
                strategyObj.selectedStrategy.name = _strategy.name;
            },

            getSelectedStrategy = function () {
                return strategyObj.selectedStrategy;
            },

            getStrategyCount = function () {
                return strategyObj.strategies.length;
            },

            getStrategyObj = function () {
                return strategyObj;
            },

            reset = function () {
                strategyObj.strategies = {};
                strategyObj.selectedStrategy.id = -1;
                strategyObj.selectedStrategy.name = 'Loading...';
            },

            allAdFormats = function () {
                var result,
                    adFormatsArr,
                    selectedStrategy;

                if (strategyObj.strategies && strategyObj.strategies.length > 0) {
                    if (Number(strategyObj.selectedStrategy.id) === -1) {
                        adFormatsArr = _.map(strategyObj.strategies, function (strategy) { // jshint ignore:line
                            return strategy.ad_formats || [];
                        });

                        result = _.uniq(_.flatten(adFormatsArr)); // jshint ignore:line
                    } else {
                        selectedStrategy =
                            _.find(strategyObj.strategies, function (strategy) { // jshint ignore:line
                                return strategy.id === Number(strategyObj.selectedStrategy.id);
                            });

                        result = selectedStrategy ? selectedStrategy.ad_formats : [];
                    }
                }

                return result || [];
            };

            return {
                getStrategies : getStrategies,
                setSelectedStrategy : setSelectedStrategy,
                getSelectedStrategy : getSelectedStrategy,
                getStrategyCount : getStrategyCount,
                getStrategyObj : getStrategyObj,
                reset : reset,
                allAdFormats : allAdFormats
            };
        }]);
});
