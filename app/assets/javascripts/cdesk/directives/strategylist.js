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
            template: '<div class="dropdown dropdown_type2">'+
                '   <span class="dropdown_ul_text " data-toggle="dropdown">'+
                '   <span class="dd_txt" title="{{selectedObj.name}}">{{selectedObj.name | formatUrl:26}}</span>'+
                '       <span class="arrrow_img"></span>'+
                '   </span>'+
                '   <ul id="strategies_list" class="dropdown_ul dropdown-menu">'+
                '       <li ng-repeat="strategy in listColumns" value="{{strategy.id}}">{{strategy.name | formatUrl:26}}</li>'+
                '   </ul>'+
                '</div>',
            link: function ($scope, element, attrs) {

                //Function called when the user clicks on the strategy dropdown
                 element.find('#strategies_list').bind('click', function(e) {
                    if (domainReports.checkStatus($scope.$parent.selectedCampaign.name, $scope.$parent.selectedStrategy.name)) {
                        var id = $(e.target).attr('value'), txt = $(e.target).text();
                        //console.log('strategyList Directive : '+id+' Value : '+txt);
                        $scope.$parent.selectedStrategy.id =id;
                        $scope.$parent.selectedStrategy.name = txt;
                       // console.log('strategyList Directive : '+$scope.$parent.selectedStrategy.id+' Value : '+$scope.$parent.selectedStrategy.name);
                        //  console.log( $scope.selectedStrategy.id + " is selected strategy");
                        dataTransferService.updateExistingStorageObjects({'strategyId' : id, 'strategyName' :  txt});
                        $scope.$apply();
                        //Define this function in the parent controllers,
                        $scope.$parent.callBackStrategyChange();
                    }
                });
            }
        }
    })
}());
