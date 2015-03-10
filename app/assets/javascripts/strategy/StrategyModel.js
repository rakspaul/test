strategyModule.factory("strategyModel", ['urlService','dataService' , 'requestCanceller','constants', function (urlService,dataService, requestCanceller,constants) {
    var strategyObj = {};
    strategyObj.strategies = {};
    strategyObj.selectedStrategy = {
        id: -1,
        name : 'Loading...'
    };

    return {
        getStrategies: function (campaignId) {
                var url = urlService.APIStrategiesForCampaign(campaignId) ;
                var canceller = requestCanceller.initCanceller(constants.STRATEGY_LIST_CANCELLER);
              //  return dataService.fetchCancelable(url, canceller, function(response)
                   return dataService.fetch(url).then(function(response){

                       if(response.status == 'OK' || response.status == 'successs'){
                           console.log("Strategy model");
                           console.log(response);
                           strategyObj.strategies =  (response.data.data !== undefined) ? response.data.data : {} ;

                           if(strategyObj.strategies.length >0 && strategyObj.selectedStrategy.id == -1 ) {
                               strategyObj.selectedStrategy.id = strategyObj.selectedStrategy[0].id;
                               strategyObj.selectedStrategy.name = strategyObj.selectedStrategy[0].name;
                           }
                       }
                   else  {
                        strategyObj.selectedStrategy.id = -1 ;
                        strategyObj.selectedStrategy.name = "No Strategy Found" ;
                    }

                });
        },
        setSelectedStrategy: function (_strategy) {

            strategyObj.selectedStrategy.id = (_strategy.id == undefined)? _strategy.strategy_id : _strategy.id;
            strategyObj.selectedStrategy.name = _strategy.name ;

        },
        getSelectedStrategy: function() {
            return strategyObj.selectedStrategy ;
        },
        getStrategyObj: function() {
            return strategyObj;
        }


    };
}])
;