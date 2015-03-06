(function () {
    'use strict';
    angObj.directive('reportFilters', function (domainReports) {
        return {
            restrict:'EAC',

            scope: {
                listObject:'=',
                selectedFilter : '=',
                flag:'@'
            },
            template: '<span class="dropdown_ul_text" data-toggle="dropdown">'+
                           '<span class="default-kpi-header-icon" tooltip="Primary KPI" ng-if="selectedFilter.kpi_type.trim().toLowerCase() === selectedFilter.campaign_default_kpi_type.trim()"></span>'+
                           '<span class="dd_txt">{{selectedFilter.kpi_type_text.trim()}}</span>'+
                           '<span class="arrrow_img"></span>'+
                           '</span>'+
                           '<ul  class="dropdown_ul dropdown-menu kpi_indicator_ul">'+
                           '    <li ng-repeat="list in listObject" value="{{list.value}}"><span class="default-kpi-dropdown-icon"  ng-class="{ kpiIndicator : (list.value.toLowerCase() === selectedFilter.campaign_default_kpi_type)} " ></span>{{list.text}}</li>'+
                            '</ul>',
            link: function ($scope, element, attrs) {

                //function called when the user clicks on the list items
                $(element.find('ul')).click(function (e) {

                    var select = {text:'', value:''};
                    if (domainReports.checkStatus($scope.$parent.selectedCampaign.name, $scope.$parent.selectedStrategy.name)) {
                        if(attrs.flag == "kpitypes") {
                            select = {text:'kpi_type_text', value:'kpi_type'};
                        }else{
                            select = {text:'time_filter_text', value:'time_filter'};
                        }
                        $scope.$parent.selected_filters[select.value] = $(e.target).attr('value');
                        $scope.$parent.selected_filters[select.text] = $(e.target).text();
                        $scope.$parent.callBackKpiDurationChange(attrs.flag);
                    }
                });
            } 
        };
    });

}());