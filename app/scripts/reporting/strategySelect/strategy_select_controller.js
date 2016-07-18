define(['angularAMD', 'reporting/campaignSelect/campaign_select_model', // jshint ignore:line
    'reporting/strategySelect/strategy_select_service','common/services/constants_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('StrategySelectController', function ($scope, $rootScope, campaignSelectModel,
                                                                strategySelectModel , constants) {
        var eventCampaignStrategyChangedFunc;

        $scope.strategyData = {
            strategies : {},

            selectedStrategy :  {
                id: -1,
                name : 'Loading...'
            }
        };

        $scope.$parent.strategyLoading =  true;
        $scope.isStrategyDropDownShow = true;

        // On this event, only fetch list of strategies and retain selected Strategy (done from outside).
        eventCampaignStrategyChangedFunc =  $rootScope.$on(constants.EVENT_CAMPAIGN_STRATEGY_CHANGED, function () {
            // reset strategy list
            strategySelectModel.getStrategyObj().strategies = {};

            // fetch strategies
            $scope.fetchStrategies();
        });

        $scope.reset = function () {
            // clean up models
            strategySelectModel.reset();

            $scope.strategyData.strategies = strategySelectModel.getStrategyObj().strategies;
            $scope.strategyData.selectedStrategy = strategySelectModel.getStrategyObj().selectedStrategy;

            $scope.$watch(function () {
                return $scope.strategyData.selectedStrategy;
            });
        };

        $scope.add_active_to_strategy = function () {
            $('.dropdown_type1_holder').removeClass('active');
            $('.dropdown_type2').addClass('active');
        };

        $scope.setStrategy = function (strategy) {
            strategySelectModel.setSelectedStrategy(strategy);

            if (strategySelectModel.getStrategyCount() === 1)  {
                $scope.$parent.isStrategyDropDownShow = false;
            } else {
                $scope.$parent.isStrategyDropDownShow = true;
            }

            $scope.strategyData.selectedStrategy.id = (strategy.id === undefined) ?
                (strategy.lineitemId === undefined ? strategy.strategyId : strategy.lineitemId): strategy.id;

            $scope.strategyData.selectedStrategy.name = (strategy.name === undefined) ?
                strategy.strategy_name  : strategy.name;

            $rootScope.$broadcast(constants.EVENT_STRATEGY_CHANGED, strategy);

            if ($scope.strategyData.selectedStrategy.id !== -1 && $scope.strategyData.selectedStrategy.id !== -99) {
                $scope.$parent.strategyLoading = false;
            }
        };


        $scope.fetchStrategies = function () {
            $scope.isStrategyDropDownShow = false;

            if (campaignSelectModel.getSelectedCampaign().id !== -1) {
                strategySelectModel
                    .getStrategies(campaignSelectModel.getSelectedCampaign().id)
                    .then(function () {
                        var strategyObj = strategySelectModel.getStrategyObj();

                        $scope.strategyData.strategies =
                            (strategyObj.strategies === undefined) ? {} : strategyObj.strategies;

                        $scope.setStrategy(strategyObj.selectedStrategy);
                    });
            } else {
                $scope.$parent.strategyLoading = true;
                $scope.strategyData.strategies = {};
                $scope.strategyData.selectedStrategy.id = -1;
                $scope.strategyData.selectedStrategy.name = constants.NO_ADGROUPS_FOUND;
            }
        };

        $scope.fetchStrategies();

        // Function called when the user clicks on the strategy dropdown
        $('#strategies_list').click(function (e) {
            var selectedStrategy;

            $scope.$parent.strategyLoading = true;

            selectedStrategy = {
                id: $(e.target).attr('value'),
                name:  $(e.target).text()
            };

            $scope.setStrategy(selectedStrategy);
        });

        $scope.$on('$destroy', function () {
            eventCampaignStrategyChangedFunc();
        });
    });
});

