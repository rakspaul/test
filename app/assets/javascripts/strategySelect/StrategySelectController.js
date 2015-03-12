(function () {
    'use strict';
    strategySelectModule.controller('strategySelectController', function ($scope, $rootScope , campaignSelectModel ,strategySelectModel ,apiPaths, constants , loginModel, analytics,utils ) {

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
            strategySelectModel.reset();

            $scope.strategyData.strategies = strategySelectModel.getStrategyObj().strategies ;
            $scope.strategyData.selectedStrategy = strategySelectModel.getStrategyObj().selectedStrategy ;

        };


        $scope.setStrategy = function(strategy){
            strategySelectModel.setSelectedStrategy(strategy);
            $scope.strategyData.selectedStrategy.id =(strategy.id == undefined) ? (strategy.lineitemId == undefined ? strategy.strategyId : strategy.lineitemId): strategy.id ;
            $scope.strategyData.selectedStrategy.name = (strategy.name == undefined) ? strategy.strategy_name  : strategy.name ;

            $rootScope.$broadcast(constants.EVENT_STRATEGY_CHANGED, strategy);

        };


        $scope.fetchStrategies = function(){
            if(campaignSelectModel.getSelectedCampaign().id != -1){
                strategySelectModel.getStrategies(campaignSelectModel.getSelectedCampaign().id).then(function(result){

                    var strategyObj = strategySelectModel.getStrategyObj();
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

            // strategyModel.setSelectedStrategy(selectedStrategy);
            $scope.setStrategy(selectedStrategy);

        });

    });
}());
