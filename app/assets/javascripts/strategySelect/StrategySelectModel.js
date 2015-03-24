strategySelectModule.factory("strategySelectModel", ['urlService','dataService' , 'requestCanceller','constants', function (urlService,dataService,requestCanceller,constants) {
    var strategyObj = {};
    strategyObj.strategies = {};
    strategyObj.selectedStrategy = { id: -1, name : 'Loading...'};
    return {
        getStrategies: function (campaignId) {
            var url = urlService.APIStrategiesForCampaign(campaignId);
            var canceller = requestCanceller.initCanceller(constants.STRATEGY_LIST_CANCELLER);
            var errorHandler =  function() {
                strategyObj.selectedStrategy.id = -99 ;
                strategyObj.selectedStrategy.name = "No Strategy Found" ;
            }

            return dataService.fetchCancelable(url , canceller , function(response) {
                if(response.status == 'OK' || response.status == 'success'){
                    strategyObj.strategies =  (response.data.data !== undefined) ? response.data.data : {} ;

                    if(strategyObj.strategies.length !== undefined && strategyObj.strategies.length >0 ) {
                        if(strategyObj.selectedStrategy.id == -1){
                            strategyObj.selectedStrategy.id = strategyObj.strategies[0].id;
                            strategyObj.selectedStrategy.name = strategyObj.strategies[0].name;
                        }

                    } else {
                        errorHandler();
                    }
                }
                else  {
                    errorHandler();
                }
                return strategyObj ;
            }, errorHandler);
        },
        setSelectedStrategy: function (_strategy) {
            strategyObj.selectedStrategy.id = _strategy.id ;
            strategyObj.selectedStrategy.name = _strategy.name ;

        },
        getSelectedStrategy: function() {
            return strategyObj.selectedStrategy ;
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