define(['angularAMD', 'kpi-select-model', 'campaign-select-model'], function (angularAMD) {
    'use strict';

    angularAMD.controller('KpiSelectController', ['$scope', '$rootScope', 'kpiSelectModel', 'campaignSelectModel',
        'constants', function ($scope, $rootScope, kpiSelectModel, campaignSelectModel,
                                                           constants) {
        function setArrowSelector() {
            $('.kpi_indicator_ul li,.direction_arrows div.kpi_arrow_sort').hover(function (e) {
                    if (window.location.pathname !== '/inventory') {
                        var selectedKpi =  $(e.target).attr('value');
                        $('.direction_arrows div.kpi_arrow_sort').hide();
                        $('.direction_arrows div.kpi_arrow_sort.active').show();
                        $('.direction_arrows div.kpi_arrow_sort[value=' + selectedKpi +']').show();
                    }
                },

                function () {
                    $('.direction_arrows div.kpi_arrow_sort').hide();
                    $('.direction_arrows div.kpi_arrow_sort.active').show();
                }
            );
        }

        $scope.kpiData = {};
        $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpi();
        $scope.kpiData.selectedKpiAlt = kpiSelectModel.getSelectedKpiAlt();
        $scope.kpiData.kpiDropDown = kpiSelectModel.getKpiObj().kpiDropDown;
        $scope.whichCaller = '';
        $scope.kpiData.newkpiDropDownAlt = kpiSelectModel.getKpiObj().newkpiDropDownAlt;

        $scope.campaign_default_kpi_type = campaignSelectModel.getSelectedCampaign().kpi;

        $scope.kpiData.selectedKpiDisplayName = _.find($scope.kpiData.newkpiDropDownAlt,function(obj){
            return obj.kpi === $scope.kpiData.selectedKpiAlt;
        });

        if($scope.kpiData.selectedKpiDisplayName && $scope.kpiData.selectedKpiDisplayName.displayName){
            $scope.kpiData.selectedKpiDisplayName = $scope.kpiData.selectedKpiDisplayName.displayName;
        }

        $scope.checkNewkpiDropDownAlt = function(){
            return true;
            //TODO
            //var ret = _.find($scope.kpiData.newkpiDropDownAlt,function(obj){
            //    return obj.kpi === $scope.kpiData.selectedKpiAlt;
            //});
            //
            //return (ret ? true : false);
        };

        $scope.getDisplayKpiName = function(){
            var ret;
            _.each($scope.kpiData.kpiDropDown,function(obj){
                if(obj.kpi === $scope.kpiData.selectedKpi){
                    ret = obj.displayName;
                }
            });
            return ret;
        };

        $scope.setSelectedKpi = function (_kpi) {
            kpiSelectModel.setSelectedKpi(_kpi);
            $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpi();
            _.each($scope.kpiData.kpiDropDown,function(obj){
                if(obj.kpi === $scope.kpiData.selectedKpi){
                    $scope.kpiData.selectedKpiDisplayName = obj.displayName;
                }
            });
        };

        $scope.setSelectedKpiAlt = function (_kpi, event_type) {
            var obj = {
                event_type: event_type,
                kpi: _kpi
            };

            kpiSelectModel.setSelectedKpiAlt(_kpi);
            $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpiAlt();
            $rootScope.$broadcast(constants.EVENT_KPI_CHANGED, obj);
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function () {
            $scope.setSelectedKpi(campaignSelectModel.getSelectedCampaign().kpi);
            $scope.campaign_default_kpi_type = campaignSelectModel.getSelectedCampaign().kpi;
        });

        $rootScope.$on(constants.TAB_CHANGED,function () {
          /*
          it's been hard coded in performance controller on tab change we are doing the same may be we can come out with better solution, this is to match the headers and value
          - for hot fix sapna
            */
           $scope.kpiData.selectedKpi = 'cpm';//campaignSelectModel.getSelectedCampaign().kpi;//kpiSelectModel.getSelectedKpi();
        });

        $scope.myData = {};

        $scope.myData.doClick = function ($event, data) {
            var targetTags = $('.direction_arrows div.kpi_arrow_sort'),
                sortOrder = false,
                _selectedKpi = data.kpi,
                dropList = $('.drop_list li'),
                classesPresent = $event.currentTarget.className;

            dropList.css('color', '#000');
            dropList.removeClass('active');

            $('[value=' + _selectedKpi + ']').css('color', '#0978c9');
            $('.drop_list li[value=' + _selectedKpi + ']').addClass('active');
            $('.kpi-dd-holder').addClass( 'active');

            // TODO: the redundant code here will be refactored and broken out into seperate function
            // just a defect fix for now
            if (classesPresent.indexOf('non_cost') > -1 === true) {
                if (classesPresent.indexOf('is_active_point_up') > -1 === false &&
                    classesPresent.indexOf('is_active_point_down') > -1  === false) {
                    $('.kpi_arrow_sort').removeClass( 'is_active_point_up is_active_point_down');
                    $event.currentTarget.className += '  is_active_point_down';
                    sortOrder = true;
                } else if (classesPresent.indexOf('is_active_point_down') > -1 === true) {
                    $('.kpi_arrow_sort').removeClass( 'is_active_point_down');
                    $event.currentTarget.className += '  is_active_point_up';
                    sortOrder = false;
                } else if (classesPresent.indexOf('is_active_point_up') > -1  === true) {
                    $('.kpi_arrow_sort').removeClass( 'is_active_point_up');
                    $event.currentTarget.className += '  is_active_point_down';
                    sortOrder = true;
                }
            } else {
                if (classesPresent.indexOf('is_active_point_up') > -1 === false &&
                    classesPresent.indexOf('is_active_point_down') > -1  === false) {
                    $('.kpi_arrow_sort').removeClass( 'is_active_point_up is_active_point_down');
                    $event.currentTarget.className += '  is_active_point_up';
                    sortOrder = false;
                } else if (classesPresent.indexOf('is_active_point_down') > -1 === true) {
                    $('.kpi_arrow_sort').removeClass( 'is_active_point_down');
                    $event.currentTarget.className += '  is_active_point_up';
                    sortOrder = false;
                } else if (classesPresent.indexOf('is_active_point_up') > -1  === true) {
                    $('.kpi_arrow_sort').removeClass( 'is_active_point_up');
                    $event.currentTarget.className += '  is_active_point_down';
                    sortOrder = true;
                }
            }

            if (!classesPresent.indexOf('active') > -1) { // jshint ignore:line
                targetTags.removeClass( 'active');
                targetTags.hide();
                $event.currentTarget.className += '  active';
                $('.direction_arrows div.kpi_arrow_sort.active').show();
            }

            $scope.theKpiToblue = data.kpi;
            $rootScope.$broadcast('dropdown-arrow-clicked',data.kpi,sortOrder);

            if (_selectedKpi) {
                $scope.changeClickedSelectedKpiAlt(_selectedKpi);
            }
        };

        $scope.changeClickedSelectedKpiAlt = function (_kpi) {
            $scope.setSelectedKpi(_kpi);
            $scope.setSelectedKpiAlt(_kpi);
        };

        $('.kpi_indicator_ul').click(function (e) {
            var activeTabId = $('.reports_tabs_holder').find('.active').attr('id'),
                _selectedKpi;

            e.stopImmediatePropagation();

            if (activeTabId) {
                if ($(e.target).hasClass('active') === true) {
                    $('#reports_' + activeTabId + '_block .kpi-dd-holder').addClass('active');
                } else {
                    $('#reports_' + activeTabId + '_block .kpi-dd-holder').removeClass('active');
                }
            } else {
                if ($(e.target).hasClass('active') === true) {
                    $('.kpi-dd-holder').addClass('active');
                } else {
                    $('.kpi-dd-holder').removeClass('active');
                }
            }

            _selectedKpi =  $(e.target).attr('value');

            if (_selectedKpi) {
                $scope.setSelectedKpi(_selectedKpi);
                $scope.setSelectedKpiAlt(_selectedKpi, 'clicked');

                $(e.target)
                    .closest('.reports_platform_header')
                    .find('.kpi-dd-holder')
                    .find('.open')
                    .removeClass('open');

                $('kpi-drop-down').removeClass('open');
                $scope.$apply();
            }
        });

        setTimeout(setArrowSelector, 2000);

        $scope.arrowPositionFunction = function () {
            if ($('.sort_order_up')[0]) {
                return 'point_down';
            } else {
                return 'point_up';
            }
        };
    }]);
});
