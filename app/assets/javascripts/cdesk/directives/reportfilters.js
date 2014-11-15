(function () {
    'use strict';
    angObj.directive('reportFilters', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                listObject:'=',
                selectedFilter : '=',
                flag:'@'
            },
            template: '<span class="dropdown_ul_text" data-toggle="dropdown">'+
                           '<span class="dd_txt">{{selectedFilter}}</span>'+
                           '<span class="arrrow_img"></span>'+
                           '</span>'+
                           '<ul  class="dropdown_ul dropdown-menu">'+
                           '    <li ng-repeat="list in listObject" value="{{list.value}}">{{list.text}}</li>'+
                            '</ul>',
            link: function ($scope, element, attrs) {

                //function called when the user clicks on the list items
                $(element.find('ul')).click(function (e) {

                    var select = {text:'', value:''};
                    if ($scope.$parent.checkStatus()) {
                        if(attrs.flag == "kpitypes") {
                            select = {text:'kpi_type_text', value:'kpi_type'};
                        }else{
                            select = {text:'time_filter_text', value:'time_filter'};
                        }
                        $scope.$parent.selected_filters[select.value] = $(e.target).attr('value');
                        $scope.$parent.selected_filters[select.text] = $(e.target).text();
                        $scope.$parent.onKpiDurationChange(attrs.flag);
                    }
                });
            } 
        };
    });

}());