define(['angularAMD','reporting/campaignSelect/campaign_select_model', 'reporting/strategySelect/strategy_select_model','common/services/constants_service',
    'common/services/vistoconfig_service'], function (angularAMD) {

    'use strict';
    angularAMD.controller('StrategySelectController', function ($scope, $rootScope, $routeParams, $location,
                                                                campaignSelectModel, strategySelectModel, constants,
                                                                vistoconfig) {

        $scope.strategyData = {
            strategies: strategySelectModel.getStrategyList(),
            selectedStrategy: strategySelectModel.getSelectedStrategy()
        };
        $scope.$parent.strategyLoading =  true;
        //$scope.$parent.isFetchStrategiesCalled = false;
        $scope.isStrategyDropDownShow = true;


        // On this event, only fetch list of strategyies and retain selectedStrategy (done from outside).
        // var eventCampaignStrategyChangedFunc =  $rootScope.$on(constants.EVENT_CAMPAIGN_STRATEGY_CHANGED, function() {
        //     strategySelectModel.getStrategyObj().strategies = {} ;// reset strategy list
        //     $scope.fetchStrategies();// fetch strategies
        // });

        // $scope.reset= function() {
        //     strategySelectModel.reset();// clean up models
        //     $scope.strategyData.strategies = strategySelectModel.getStrategyObj().strategies ;
        //     $scope.strategyData.selectedStrategy = strategySelectModel.getStrategyObj().selectedStrategy ;
        //     $scope.$watch(function(scope) { console.log('watch');return $scope.strategyData.selectedStrategy });
        // };

        $scope.add_active_to_strategy = function(strategy) {
            $(".dropdown_type1_holder").removeClass("active");
            $(".dropdown_type2").addClass("active");
            $scope.selectStrategy(strategy);
        };

        $scope.selectStrategy = function(strategy) {
            var url = "/a/" + $routeParams.accountId;
            if ($routeParams.subAccountId) {
                url += "/sa/" + $routeParams.subAccountId;
            }
            ($routeParams.advertiserId > 0) && (url += '/adv/' + $routeParams.advertiserId);
            ($routeParams.advertiserId > 0 && $routeParams.brandId >= 0) && (url += '/b/' + $routeParams.brandId);
            url += "/mediaplans/" + $routeParams.campaignId + '/li/' + strategy.id + '/';
            var reportName = _.last($location.path().split('/'));
            url += reportName;

            console.log('url', url);
            $location.url(url);
        }

        // $scope.setStrategy = function(strategy) {
        //     strategySelectModel.setSelectedStrategy(strategy);
        //     if (strategySelectModel.getStrategyCount() === 1)  {
        //         $scope.$parent.isStrategyDropDownShow = false;
        //     } else {
        //         $scope.$parent.isStrategyDropDownShow = true;
        //     }
        //     $scope.strategyData.selectedStrategy.id =(strategy.id == undefined) ? (strategy.lineitemId == undefined ? strategy.strategyId : strategy.lineitemId): strategy.id ;
        //     $scope.strategyData.selectedStrategy.name = (strategy.name == undefined) ? strategy.strategy_name  : strategy.name ;
        //     $rootScope.$broadcast(constants.EVENT_STRATEGY_CHANGED, strategy);
        //     if($scope.strategyData.selectedStrategy.id !== -1 && $scope.strategyData.selectedStrategy.id !== -99)
        //         $scope.$parent.strategyLoading = false;
        // };


        // $scope.fetchStrategies = function() {
        //     $scope.isStrategyDropDownShow = false;
        //     if(campaignSelectModel.getSelectedCampaign().id != -1){
        //         strategySelectModel.getStrategies(campaignSelectModel.getSelectedCampaign().id).then(function(result){
        //             var strategyObj = strategySelectModel.getStrategyObj();
        //             $scope.strategyData.strategies = (strategyObj.strategies == undefined)? {} : strategyObj.strategies ;
        //             $scope.setStrategy(strategyObj.selectedStrategy);
        //         });
        //     } else {
        //         //$scope.$parent.isFetchStrategiesCalled =  false;
        //         $scope.$parent.strategyLoading = true;
        //         $scope.strategyData.strategies = {};
        //         $scope.strategyData.selectedStrategy.id = -1 ;
        //         $scope.strategyData.selectedStrategy.name = constants.NO_ADGROUPS_FOUND ;

        //     }
        // };

        //if(!$scope.$parent.isFetchStrategiesCalled) {
//        $scope.fetchStrategies();
        //}

        //Function called when the user clicks on the strategy dropdown
        // $('#strategies_list').click(function (e) {
        //     $scope.$parent.strategyLoading = true;
        //     var selectedStrategy = {
        //         id: $(e.target).attr('value'),
        //         name:  $(e.target).text()
        //     };
        //     $scope.setStrategy(selectedStrategy);
        // });

        // $scope.$on('$destroy', function() {
        //     eventCampaignStrategyChangedFunc();
        // });

    });
});

