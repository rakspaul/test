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
            $scope.reset();
            // fetch strategies
            $scope.fetchStrategies();

        });

        $scope.reset= function(){
            // clean up models
            strategyModel.reset();

            $scope.strategyData.strategies = strategyModel.getStrategyObj().strategies ;
            $scope.strategyData.selectedStrategy = strategyModel.getStrategyObj().selectedStrategy ;

//            strategyModel.getStrategyObj().strategies = {};
//            strategyModel.getStrategyObj().selectedStrategy.id = -1;
//            strategyModel.getStrategyObj().selectedStrategy.name = 'Loading...';

            //clean up controller variables
//            $scope.strategyData.strategies = {} ;
//            $scope.strategyData.selectedStrategy = {
//                    id: -1,
//                    name : 'Loading...'
//                };
        };


        $scope.setStrategy = function(strategy){
            strategyModel.setSelectedStrategy(strategy);
            $scope.strategyData.selectedStrategy.id =(strategy.id == undefined) ? (strategy.lineitemId == undefined ? strategy.strategyId : strategy.lineitemId): strategy.id ;
            $scope.strategyData.selectedStrategy.name = (strategy.name== undefined) ? strategy.strategy_name  : strategy.name ;

            $rootScope.$broadcast(constants.EVENT_STRATEGY_CHANGED, strategy);

        };


        $scope.fetchStrategies = function(){
            if(campaignModel.getSelectedCampaign().id != -1){
                console.log("fetch Strategies is called ");
                strategyModel.getStrategies(campaignModel.getSelectedCampaign().id).then(function(result){

                    var strategyObj = strategyModel.getStrategyObj();
                   // console.log(strategyObj);
                    $scope.strategyData.strategies = (strategyObj.strategies == undefined)? {} : strategyObj.strategies ;
                    $scope.setStrategy(strategyObj.selectedStrategy);

                });
            } else {
                $scope.strategyData.strategies = {};

                $scope.strategyData.selectedStrategy.id = -1 ;
                $scope.strategyData.selectedStrategy.name = 'Loading...' ;
            }

        };


        $scope.fetchStrategies();

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
