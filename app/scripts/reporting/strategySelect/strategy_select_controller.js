define(['angularAMD', 'campaign-select-model', 'strategy-select-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('StrategySelectController', ['$scope', '$rootScope', '$routeParams', '$location',
        'campaignSelectModel', 'strategySelectModel' , 'constants', function ($scope, $rootScope, $routeParams, $location,
                                                                campaignSelectModel, strategySelectModel , constants) {

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
            var url = '/a/' + $routeParams.accountId;
            if ($routeParams.subAccountId) {
                url += '/sa/' + $routeParams.subAccountId;
            }
            ($routeParams.advertiserId > 0) && (url += '/adv/' + $routeParams.advertiserId);
            ($routeParams.advertiserId > 0 && $routeParams.brandId >= 0) && (url += '/b/' + $routeParams.brandId);
            url += '/mediaplans/' + $routeParams.campaignId + '/li/' + strategy.id + '/';
            var reportName = _.last($location.path().split('/'));
            url += reportName;

            console.log('url', url);
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

