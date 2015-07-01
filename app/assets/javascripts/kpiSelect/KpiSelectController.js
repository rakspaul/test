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

        $('.kpi_indicator_ul,.direction_arrows div.kpi_arrow_sort').click(function (e) {
            var _selectedKpi =  $(e.target).attr("value") ;
            var isArrow =  $(e.target).attr("class").match("^kpi_arrow_sort") ;
            if(isArrow !== null){
                $(".reports_platform_header").find(".active").removeClass("active");
                $('.kpi-dd-holder').addClass( "active" );
                $('#kpi_dropdown').addClass( "active" );
                $('.direction_arrows div.kpi_arrow_sort').removeClass( "active" );
                $(e.target).addClass( "active" );
                $(e.target).show();
                $( ".icon_text_holder" ).removeClass( "active" );
                $rootScope.$broadcast('dropdown-arrow-clicked',_selectedKpi);
            }
            if(_selectedKpi) {
                $scope.setSelectedKpi(_selectedKpi);
                $scope.setSelectedKpiAlt(_selectedKpi);
                analytics.track(loginModel.getUserRole(), constants.GA_COST_METRIC_SELECTED, _selectedKpi, loginModel.getLoginName());
                $scope.$apply();
            }
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
