(function () {
    'use strict';
    strategyModule.controller('strategyController', function ($scope, $rootScope , campaignModel ,strategyModel ,apiPaths, constants , loginModel, analytics,utils ) {

        $scope.strategyData = {
            strategies : {},
            selectedStrategy :  {
                id: -1,
                name : 'Loading...'
            }
        };


        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function(event,brand) {
           // reset all data
           // fetch strategies
            console.log("EVNET CAMpaign change catch");
            $scope.reset();
            $scope.fetchStrategies(true);

        });

        $scope.reset= function(){
            $scope.strategyData.strategies = {} ;

            $scope.strategyData.selectedStrategy = {
                    id: -1,
                    name : 'Loading...'
                };
        };


        $scope.setStrategy = function(strategy){
            // update the model and controller scope variable . Fire strategy change event.
            console.log("Set Strategy is called ");
            console.log(strategy);

            strategyModel.setSelectedStrategy(strategy);
            $scope.strategyData.selectedStrategy.id =(strategy.id == undefined) ? (strategy.lineitemId == undefined ? strategy.strategyId : strategy.lineitemId): strategy.id ;
            $scope.strategyData.selectedStrategy.name = (strategy.name== undefined) ? strategy.strategy_name  : strategy.name ;

            $rootScope.$broadcast(constants.EVENT_STRATEGY_CHANGED, strategy);

        };


        $scope.fetchStrategies = function(set_strategy_to_first){
            console.log(campaignModel.getSelectedCampaign().id );

            if(campaignModel.getSelectedCampaign().id != -1){
                console.log("Fetch Stratgy for campaign id "+ campaignModel.getSelectedCampaign().id);
                strategyModel.getStrategies(campaignModel.getSelectedCampaign().id).then(function(){

                    console.log(" fetch Strategies success ");

                    var strategyObj = strategyModel.getStrategyObj();

                    $scope.strategyData.strategies = (strategyObj.strategies == undefined)? {} : strategyObj.strategies ;
                    console.log(strategyObj);

                    if(strategyObj.strategies.length >0 && set_strategy_to_first){
                        $scope.setStrategy(   $scope.strategyData.strategies[0]);
                    } else if(strategyObj.strategies.length == 0) {
                        $scope.strategyData.strategies ={} ;
                        $scope.strategyData.selectedStrategy.id = -1 ;
                        $scope.strategyData.selectedStrategy.name = 'No Strategy Found' ;
                    }

                });
            } else {
                console.log("Sad..campaignModel.getSelectedCampaign().id "+ campaignModel.getSelectedCampaign().id);
                $scope.strategyData.selectedStrategy.id = -1 ;
                $scope.strategyData.selectedStrategy.name = 'Loading...' ;
            }

        };


        $scope.fetchStrategies(true);

        //Function called when the user clicks on the strategy dropdown
        $('#strategies_list').click(function (e) {

                var selectedStrategy = {
                    id: $(e.target).attr('value'),
                    name:  $(e.target).text()
                };

                strategyModel.setSelectedStrategy(selectedStrategy);
                $scope.setStrategy(selectedStrategy);

        });

    });
}());
