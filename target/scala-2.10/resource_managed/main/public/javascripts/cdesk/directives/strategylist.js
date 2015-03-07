(function () {
    'use strict';
    angObj.directive('strategyList', function(domainReports, dataTransferService) {
        return {
            restrict: 'AE',
            scope:{
                selectedObj:"=",
                listColumns: "="
            },
            //controller : 'strategyDirectiveController',
            template: '<div class="clearfix"><span class="report_heading_dropdown_txt">Strategy</span>'+
                      '<div class="dropdown dropdown_type2 pull-left">' +
                '   <span class="dropdown_ul_text " data-toggle="dropdown">'+
                '   <span class="dd_txt" title="{{selectedObj.name}}">{{selectedObj.name | formatUrl:26}}</span>'+
                '       <span class="arrrow_img"></span>'+
                '   </span>'+
                '   <ul id="strategies_list" class="dropdown_ul dropdown-menu">'+
                '       <li ng-repeat="strategy in listColumns" start_date="{{strategy.startDate}}" end_date="{{strategy.endDate}}" value="{{strategy.id}}">{{strategy.name | formatUrl:26}}</li>'+
                '   </ul>'+
                '</div></div>',
            link: function ($scope, element, attrs) {

                //Function called when the user clicks on the strategy dropdown
                 element.find('#strategies_list').bind('click', function(e) {
                    if (domainReports.checkStatus($scope.$parent.selectedCampaign.name, $scope.$parent.selectedStrategy.name)) {
                        var selectedStrategy = {
                            id: $(e.target).attr('value'),
                            startDate:  $(e.target).attr('start_date'),
                            endDate:  $(e.target).attr('end_date'),
                            name:  $(e.target).text()
                        };
                        $scope.$parent.selectedStrategy.id =selectedStrategy.id;
                        $scope.$parent.selectedStrategy.name = selectedStrategy.name;
                        $scope.$parent.selectedStrategy.startDate = selectedStrategy.startDate ;
                        $scope.$parent.selectedStrategy.endDate = selectedStrategy.endDate ;
                       // console.log('strategyList Directive : '+$scope.$parent.selectedStrategy.id+' Value : '+$scope.$parent.selectedStrategy.name);
                        //  console.log( $scope.selectedStrategy.id + " is selected strategy");

                        dataTransferService.updateExistingStorageObjects({'strategyId' : selectedStrategy.id,
                                                                          'strategyName' :  selectedStrategy.name,
                                                                           'strategyStartDate' : selectedStrategy.startDate,
                                                                           'strategyEndDate' : selectedStrategy.endDate});
                        $scope.$apply();
                        //Define this function in the parent controllers,
                        $scope.$parent.callBackStrategyChange();
                    }
                });
            }
        }
    })
}());
