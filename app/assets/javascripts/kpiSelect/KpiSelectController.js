(function () {
    'use strict';
    kpiSelectModule.controller('kpiSelectController', function ($scope, $rootScope , kpiSelectModel, campaignSelectModel , constants , analytics, loginModel) {

        $scope.kpiData = {};
        $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpi() ;
        $scope.kpiData.selectedKpiAlt = kpiSelectModel.getSelectedKpiAlt() ;
        $scope.kpiData.kpiDropDown = kpiSelectModel.getKpiObj().kpiDropDown ;

        $scope.whichCaller = "";
        $scope.kpiData.newkpiDropDownAlt = kpiSelectModel.getKpiObj().newkpiDropDownAlt ;

        $scope.campaign_default_kpi_type = campaignSelectModel.getSelectedCampaign().kpi;

        $scope.setSelectedKpi = function(_kpi){
          kpiSelectModel.setSelectedKpi(_kpi);
          $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpi() ;
          $rootScope.$broadcast(constants.EVENT_KPI_CHANGED, _kpi);
        };

        $scope.setSelectedKpiAlt = function(_kpi){
            kpiSelectModel.setSelectedKpiAlt(_kpi);
            $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpiAlt() ;
            $rootScope.$broadcast(constants.EVENT_KPI_CHANGED, _kpi);

        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function(){
          $scope.setSelectedKpi(campaignSelectModel.getSelectedCampaign().kpi);
          $scope.campaign_default_kpi_type = campaignSelectModel.getSelectedCampaign().kpi;
        });


        $scope.myData = {};
        $scope.myData.doClick = function($event,value) {
            var targetTags = $('.direction_arrows div.kpi_arrow_sort');
            var _selectedKpi = value;
            var tags = $event.currentTarget.className.match("^active");
            var classesPresent = $event.currentTarget.className;

            if(classesPresent.indexOf('point_up') > -1){
                targetTags.removeClass( "point_up" );
                targetTags.addClass( "point_down" );
            }
            else{
                targetTags.removeClass( "point_down" );
                targetTags.addClass( "point_up" );
            }

            if(!classesPresent.indexOf('active') > -1){
                targetTags.removeClass( "active" );
                targetTags.hide();
                $event.currentTarget.className += "  active";
                $event.currentTarget.className += "  tester";


                $('.direction_arrows div.kpi_arrow_sort.active').show();

            }
            $rootScope.$broadcast('dropdown-arrow-clicked',value);

            if(_selectedKpi) {
                $scope.changeClickedSelectedKpiAlt(_selectedKpi);
            }
        };

        $scope.changeClickedSelectedKpiAlt = function(_kpi){
            $scope.setSelectedKpi(_kpi);
            $scope.setSelectedKpiAlt(_kpi);
            analytics.track(loginModel.getUserRole(), constants.GA_COST_METRIC_SELECTED, _kpi, loginModel.getLoginName());

        };
        $('.kpi_indicator_ul').click(function (e) {
            var _selectedKpi =  $(e.target).attr("value") ;
            if(_selectedKpi) {
                $scope.setSelectedKpi(_selectedKpi);
                $scope.setSelectedKpiAlt(_selectedKpi);
                analytics.track(loginModel.getUserRole(), constants.GA_COST_METRIC_SELECTED, _selectedKpi, loginModel.getLoginName());
                $scope.$apply();
            }
        });


          $('.direction_arrows div.kpi_arrow_sort').click(function (e) {

        });
        function setArrowSelector(){
            $('.kpi_indicator_ul li,.direction_arrows div.kpi_arrow_sort').hover(function (e) {
                    if(window.location.pathname !== "/inventory"){
                     var selectedKpi =  $(e.target).attr("value") ;
                     $('.direction_arrows div.kpi_arrow_sort').hide();
                        $('.direction_arrows div.kpi_arrow_sort.active').show();
                     $('.direction_arrows div.kpi_arrow_sort[value=' + selectedKpi +']').show();
                    }
                },
                function(e) {
                    $('.direction_arrows div.kpi_arrow_sort').hide();
                    $('.direction_arrows div.kpi_arrow_sort.active').show();
                }
            );
        }setTimeout(setArrowSelector, 2000);

        $scope.arrowPositionFunction = function () {

            if ($(".sort_order_up")[0]){
                return "point_down";
            } else {
                return "point_up";
            }
        };
    });
}());
