define(['angularAMD', '../../common/services/url_service', 'common/services/data_service', 'common/services/request_cancel_service',
                      'common/services/constants_service', 'common/services/vistoconfig_service'],function (angularAMD) {

    angularAMD.factory("strategySelectModel", ['$q', '$timeout', 'urlService', 'dataService', 'requestCanceller',
                                               'constants', 'vistoconfig', function ($q, $timeout, urlService, dataService, requestCanceller,
                                                                                     constants, vistoconfig) {

        var strategyList = [],
            selectedStrategy = vistoconfig.LINE_ITEM_DROPDWON_OBJECT,
            previousCampaignId;

        // var strategyObj = {};
        // strategyObj.strategies = {};
        // //strategyObj.selectedStrategy = (localStorage.getItem('selectedStrategy') == undefined) ? { id: -1,name : 'Loading...'} : (JSON.parse( localStorage.getItem('selectedStrategy') )) ;
        // strategyObj.selectedStrategy = {id: -1, name: 'Loading...'};
        return {
            fetchStrategyList: function (clientId, campaignId) {
                if (previousCampaignId != campaignId) {
                    this.reset();
                }
                var deferred = $q.defer();
                if (strategyList.length > 0) {
                    console.log('fetchStrategyList ', 'already fetched');
                    $timeout(function() {
                        deferred.resolve();
                    }, 10);
                    return deferred.promise;
                }
                var url = urlService.APIStrategiesForCampaign2(clientId, campaignId);
                var canceller = requestCanceller.initCanceller(constants.STRATEGY_LIST_CANCELLER);

                return dataService.fetchCancelable(url, canceller, function (response) {
                    if (response && response.data.data.length > 0) {
                        strategyList = response.data.data;
                        strategyList.unshift(vistoconfig.LINE_ITEM_DROPDWON_OBJECT);
                    } else {
                        strategyList = [vistoconfig.LINE_ITEM_DROPDWON_OBJECT];
                    }
                    previousCampaignId = campaignId;
                    console.log('fetchStrategyList', 'is fetched');
                    deferred.resolve();
                });
            },

            allowedStrategy: function(strategyId) {
                if (strategyId) {
                    selectedStrategy = _.find(strategyList, function(s) {
                        return s.id == strategyId;
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

            getStrategyList: function() {
                return strategyList;
            },

            getSelectedStrategy: function() {
                return selectedStrategy;
            },

            reset: function() {
                strategyList = [];
                selectedStrategy = undefined;
            }

            // getStrategies: function (campaignId) {
            //     var url = urlService.APIStrategiesForCampaign(campaignId);
            //     var canceller = requestCanceller.initCanceller(constants.STRATEGY_LIST_CANCELLER);
            //     var errorHandler = function () {
            //         strategyObj.selectedStrategy.id = -99;
            //         strategyObj.selectedStrategy.name = constants.NO_ADGROUPS_FOUND;
            //     };

            //     var modifyStrategiesData = function (resp) {
            //         var strategyData = (resp && resp.data) ? resp.data : [];
            //         strategyData.unshift(vistoconfig.LINE_ITEM_DROPDWON_OBJECT);
            //         strategyObj.strategies = (strategyData !== undefined) ? strategyData : {};
            //         if (strategyObj.strategies.length !== undefined && strategyObj.strategies.length > 0 && strategyObj.selectedStrategy.id == -1) {
            //             strategyObj.selectedStrategy.id = strategyObj.strategies[0].id;
            //             strategyObj.selectedStrategy.name = strategyObj.strategies[0].name;
            //         }
            //     }

            //     return dataService.fetchCancelable(url, canceller, function (response) {
            //         modifyStrategiesData((response.status == 'OK' || response.status == 'success') ? response.data : errorHandler);
            //         return strategyObj;
            //     });
            // },
            // setSelectedStrategy: function (_strategy) {
            //     strategyObj.selectedStrategy.id = _strategy.id;
            //     strategyObj.selectedStrategy.name = _strategy.name;
            //     //localStorage.setItem('selectedStrategy', JSON.stringify(strategyObj.selectedStrategy) ) ;
            // },
            // getSelectedStrategy: function () {
            //     return strategyObj.selectedStrategy; //(localStorage.getItem('selectedStrategy') == undefined)? strategyObj.selectedStrategy : JSON.parse(localStorage.getItem('selectedStrategy')) ;
            // },

            // getStrategyCount: function () {
            //     return strategyObj.strategies.length;
            // },
            // getStrategyObj: function () {
            //     return strategyObj;
            // },
            // reset: function () {
            //     strategyObj.strategies = {};
            //     strategyObj.selectedStrategy.id = -1;
            //     strategyObj.selectedStrategy.name = 'Loading...';
            // }


        };
    }]);
});
