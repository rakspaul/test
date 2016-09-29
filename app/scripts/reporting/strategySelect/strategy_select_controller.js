define(['angularAMD', 'campaign-select-model', 'strategy-select-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('StrategySelectController', ['$scope', '$rootScope', '$routeParams', '$location',
        'campaignSelectModel', 'strategySelectModel' , 'constants', 'urlBuilder', function ($scope, $rootScope, $routeParams, $location,
                                                                                            campaignSelectModel, strategySelectModel , constants, urlBuilder) {

            $scope.strategyData = {
                strategies: strategySelectModel.getStrategyList(),
                selectedStrategy: strategySelectModel.getSelectedStrategy()
            };

            $scope.$parent.strategyLoading =  true;
            $scope.isStrategyDropDownShow = true;

            $scope.add_active_to_strategy = function () {
                $('.dropdown_type1_holder').removeClass('active');
                $('.dropdown_type2').addClass('active');
            };

            $scope.selectStrategy = function(strategy) {
                var url = urlBuilder.buildBaseUrl(),
                    reportName;

                url += '/mediaplans/' + $routeParams.campaignId;

                strategy.id > 0 && (url +=  '/li/' + strategy.id);

                reportName = _.last($location.path().split('/'));

                url += '/' + reportName;

                $location.url(url);
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
        }]);
});

