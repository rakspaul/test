(function () {
    'use strict';
    strategySelectModule.controller('StrategySelectController', function ($scope, $rootScope , campaignSelectModel ,strategySelectModel ,apiPaths, constants , loginModel, analytics,utils ) {

        var loadStrategies = true;

        $scope.strategyData = {
            strategies: [angular.copy(constants.ALL_STRATEGIES_OBJECT.clone)],
            selectedStrategy: angular.copy(constants.ALL_STRATEGIES_OBJECT)
        };

        $scope.$parent.strategyLoading =  true;
        $scope.isStrategyDropDownShow = true;
        $scope.$parent.isStrategyDropDownShow = true;


        // On this event, only fetch list of strategyies and retain selectedStrategy (done from outside).
        var eventCampaignStrategyChangedFunc =  $rootScope.$on(constants.EVENT_CAMPAIGN_STRATEGY_CHANGED, function() {
            $scope.reset();
            $scope.setStrategy($scope.strategyData.selectedStrategy);
        });

        $scope.reset = function() {
            loadStrategies = true;
            $scope.isStrategyDropDownShow = true;
            strategySelectModel.reset();// clean up models
            $scope.strategyData.strategies = strategySelectModel.getStrategyObj().strategies ;
            $scope.strategyData.selectedStrategy = strategySelectModel.getStrategyObj().selectedStrategy ;
            $scope.$watch(function(scope) { return $scope.strategyData.selectedStrategy });
        };

        $scope.add_active_to_strategy = function() {
            $(".dropdown_type1_holder").removeClass("active");
            $(".dropdown_type2").addClass("active") ;
        };

        $scope.setStrategy = function(strategy) {
            strategySelectModel.setSelectedStrategy(strategy);
            $scope.strategyData.selectedStrategy.id = strategy.id;
            $scope.strategyData.selectedStrategy.name = strategy.name;
            $rootScope.$broadcast(constants.EVENT_STRATEGY_CHANGED, strategy);
            if($scope.strategyData.selectedStrategy.id !== -1 && $scope.strategyData.selectedStrategy.id !== -99)
                $scope.$parent.strategyLoading = false;
        };

        $scope.setStrategy($scope.strategyData.selectedStrategy);

        function fetchStrategies() {
            if(campaignSelectModel.getSelectedCampaign().id == -1) {
              return;
            }
            if(loadStrategies) {
                loadStrategies = false;
                strategySelectModel.getStrategies(campaignSelectModel.getSelectedCampaign().id).then(function(result) {
                    var strategyObj = strategySelectModel.getStrategyObj();
                    $scope.strategyData.strategies = (strategyObj.strategies == undefined ? angular.copy(constants.ALL_STRATEGIES_OBJECT) : strategyObj.strategies);
                    $scope.setStrategy(strategyObj.selectedStrategy);
                });
            }
        };

        //Function called when the user clicks on the strategy dropdown
        $scope.strategiesDropdownClicked = function() {
            $scope.$parent.strategyLoading = true;
            fetchStrategies();
        };

        $('#strategies_list').click(function (e) {
            $scope.$parent.strategyLoading = true;
            var selectedStrategy = {
                id: $(e.target).attr('value'),
                name:  $(e.target).text()
            };
            $scope.setStrategy(selectedStrategy);
        });

        $scope.$on('$destroy', function() {
            eventCampaignStrategyChangedFunc();
        });

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function() {
            $scope.reset();
            $scope.setStrategy($scope.strategyData.selectedStrategy);
        });


    });
}());
