define(['angularAMD', 'reporting/kpiSelect/kpi_select_model', 'reporting/campaignSelect/campaign_select_model', 'common/services/constants_service',
                       'login/login_model'],function (angularAMD) {

    'use strict';
    angularAMD.controller('KpiSelectController', function ($scope, $rootScope,
                                                                kpiSelectModel, campaignSelectModel, constants,
                                                                loginModel) {

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
            //$rootScope.$broadcast(constants.EVENT_KPI_CHANGED, _kpi);
        };

        $scope.setSelectedKpiAlt = function(_kpi, event_type){
            kpiSelectModel.setSelectedKpiAlt(_kpi);
            $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpiAlt() ;
            var obj = {'event_type' :event_type, 'kpi': _kpi};
            $rootScope.$broadcast(constants.EVENT_KPI_CHANGED, obj);
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function(){
            $scope.setSelectedKpi(campaignSelectModel.getSelectedCampaign().kpi);
            $scope.campaign_default_kpi_type = campaignSelectModel.getSelectedCampaign().kpi;
        });

        $rootScope.$on('tab_changed',function(){
            $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpi() ;
        });

       /* $scope.dropdownSortDirection = function(direction,reverse){

        }*/

        $scope.myData = {};
        $scope.myData.doClick = function($event,value) {
            var targetTags = $('.direction_arrows div.kpi_arrow_sort');
            var sortOrder = false;
            var _selectedKpi = value;
            $(".drop_list li").css("color", "#000");
            $(".drop_list li").removeClass('active');
            $("[value="+_selectedKpi+"]").css("color", "#0978c9");
            $(".drop_list li[value="+_selectedKpi+"]").addClass('active');
            var tags = $event.currentTarget.className.match("^active");
            var classesPresent = $event.currentTarget.className;
            $('.kpi-dd-holder').addClass( "active" );
            /* the redundan code here will be refactored and broken out into seperate function*/
            /* just a defect fix for now*/
            if(classesPresent.indexOf('non_cost') > -1 === true ){
                if(classesPresent.indexOf('is_active_point_up') > -1 === false && classesPresent.indexOf('is_active_point_down') > -1  === false  ){
                    $('.kpi_arrow_sort').removeClass( "is_active_point_up is_active_point_down" );
                    $event.currentTarget.className += "  is_active_point_down";
                    sortOrder = true;
                }
                else if (classesPresent.indexOf('is_active_point_down') > -1 === true ){
                    $('.kpi_arrow_sort').removeClass( "is_active_point_down" );
                    $event.currentTarget.className += "  is_active_point_up";
                    sortOrder = false;
                }
                else if (classesPresent.indexOf('is_active_point_up') > -1  === true  ){
                    $('.kpi_arrow_sort').removeClass( "is_active_point_up" );
                    $event.currentTarget.className += "  is_active_point_down";
                    sortOrder = true;
                }
            }

            else{
                if(classesPresent.indexOf('is_active_point_up') > -1 === false && classesPresent.indexOf('is_active_point_down') > -1  === false  ){
                    $('.kpi_arrow_sort').removeClass( "is_active_point_up is_active_point_down" );
                    $event.currentTarget.className += "  is_active_point_up";
                    sortOrder = false;
                }
                else if (classesPresent.indexOf('is_active_point_down') > -1 === true ){
                    $('.kpi_arrow_sort').removeClass( "is_active_point_down" );
                    $event.currentTarget.className += "  is_active_point_up";
                    sortOrder = false;
                }
                else if (classesPresent.indexOf('is_active_point_up') > -1  === true  ){
                    $('.kpi_arrow_sort').removeClass( "is_active_point_up" );
                    $event.currentTarget.className += "  is_active_point_down";
                    sortOrder = true;
                }
            }

            if(!classesPresent.indexOf('active') > -1){
                targetTags.removeClass( "active" );
                targetTags.hide();
                $event.currentTarget.className += "  active";
                $('.direction_arrows div.kpi_arrow_sort.active').show();
            }

            $scope.theKpiToblue = value;
            $rootScope.$broadcast('dropdown-arrow-clicked',value,sortOrder);

            if(_selectedKpi) {
                $scope.changeClickedSelectedKpiAlt(_selectedKpi);
            }
        };

        $scope.changeClickedSelectedKpiAlt = function(_kpi){
            $scope.setSelectedKpi(_kpi);
            $scope.setSelectedKpiAlt(_kpi);
            // grunt analytics.track(loginModel.getUserRole(), constants.GA_COST_METRIC_SELECTED, _kpi, loginModel.getLoginName());

        };
        $('.kpi_indicator_ul').click(function (e) {
            e.stopImmediatePropagation()
            var activeTabId = $(".reports_tabs_holder").find(".active").attr('id');
            if (activeTabId) {
                if ($(e.target).hasClass("active") === true) {
                    $('#reports_' + activeTabId + '_block .kpi-dd-holder').addClass("active");
                } else {
                    $('#reports_' + activeTabId + '_block .kpi-dd-holder').removeClass("active");
                }
            } else {
                if ($(e.target).hasClass("active") === true) {
                    $('.kpi-dd-holder').addClass("active");
                } else {
                    $('.kpi-dd-holder').removeClass("active");
                }
            }

            var _selectedKpi =  $(e.target).attr("value") ;
            if(_selectedKpi) {
                $scope.setSelectedKpi(_selectedKpi);
                $scope.setSelectedKpiAlt(_selectedKpi, 'clicked');
               //grunt  analytics.track(loginModel.getUserRole(), constants.GA_COST_METRIC_SELECTED, _selectedKpi, loginModel.getLoginName());
                $(e.target).closest(".reports_platform_header").find(".kpi-dd-holder").find(".open").removeClass("open") ;
                $("kpi-drop-down").removeClass('open');
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
});
