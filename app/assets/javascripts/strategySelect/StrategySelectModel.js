strategySelectModule.factory("strategySelectModel", ['urlService','dataService' , 'requestCanceller','constants', function (urlService,dataService,requestCanceller,constants) {
    var strategyObj = {};
    strategyObj.strategies = {};
    //strategyObj.selectedStrategy = (localStorage.getItem('selectedStrategy') == undefined) ? { id: -1,name : 'Loading...'} : (JSON.parse( localStorage.getItem('selectedStrategy') )) ;
    strategyObj.selectedStrategy = { id: -1, name : 'Loading...'};
    return {
        getStrategies: function (campaignId) {
            var url = urlService.APIStrategiesForCampaign(campaignId);
            var canceller = requestCanceller.initCanceller(constants.STRATEGY_LIST_CANCELLER);
            var errorHandler =  function() {
                strategyObj.selectedStrategy.id = -99 ;
                strategyObj.selectedStrategy.name = "No Strategy Found" ;
            };

            var modifyStrategiesData =  function(resp) {
                var strategyData = (resp && resp.data) ? resp.data : [];
                strategyData.unshift(constants.ALL_STRATEGIES_OBJECT);
                strategyObj.strategies =  (strategyData !== undefined) ? strategyData : {} ;
                if(strategyObj.strategies.length !== undefined && strategyObj.strategies.length >0 && strategyObj.selectedStrategy.id == -1 ) {
                    strategyObj.selectedStrategy.id = strategyObj.strategies[0].id;
                    strategyObj.selectedStrategy.name = strategyObj.strategies[0].name;
                }
            }

            return dataService.fetchCancelable(url , canceller , function(response) {
                modifyStrategiesData((response.status == 'OK' || response.status == 'success') ? response.data : errorHandler);
                return strategyObj ;
            }, errorHandler);
        },
        setSelectedStrategy: function (_strategy) {
            strategyObj.selectedStrategy.id = _strategy.id ;
            strategyObj.selectedStrategy.name = _strategy.name ;
            //localStorage.setItem('selectedStrategy', JSON.stringify(strategyObj.selectedStrategy) ) ;
        },
        getSelectedStrategy: function() {
            return strategyObj.selectedStrategy; //(localStorage.getItem('selectedStrategy') == undefined)? strategyObj.selectedStrategy : JSON.parse(localStorage.getItem('selectedStrategy')) ;
        },
        getStrategyCount : function() {
            return strategyObj.strategies.length;
        },
        getStrategyObj: function() {
            return strategyObj;
        },
        reset : function(){
            strategyObj.strategies = {};
            strategyObj.selectedStrategy.id = -1;
            strategyObj.selectedStrategy.name = 'Loading...' ;
        }


    };
}])
;