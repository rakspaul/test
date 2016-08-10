define(['angularAMD', 'common/services/vistoconfig_service'], function (angularAMD) {
    'use strict';

    angularAMD.factory('kpiSelectModel', function (vistoconfig) {
        var kpiData = {};

        kpiData.selectedKpi = (localStorage.getItem('selectedKpi') === undefined) ?
            'ctr' : localStorage.getItem('selectedKpi');

        kpiData.selectedKpiAlt = (localStorage.getItem('selectedKpiAlt') === undefined) ?
            'cpm' : localStorage.getItem('selectedKpiAlt');

        kpiData.kpiDropDown = vistoconfig.kpiDropDown;
        kpiData.newkpiDropDownAlt = vistoconfig.newkpiDropDownAlt;

        var getKpiVale = function(_kpi){
            _kpi = _kpi.toLowerCase();
            if(_kpi === 'post click cpa'){
                _kpi = 'pc_cpa';
            }else if(_kpi === 'suspicious activity rate'){
                _kpi = 'suspicious_impressions_perc';
            }else if(_kpi === 'viewable impressions'){
                _kpi = 'suspicious_impressions_perc';
            }else if(_kpi === 'viewable rate'){
                _kpi = 'viewable_impressions_perc';
            }
            return _kpi;
        }
        kpiData.setSelectedKpi = function (_kpi) {
            _kpi = getKpiVale(_kpi);
            _kpi = _kpi.replace(/ /g, '_');
            localStorage.setItem('selectedKpi', _kpi);
            kpiData.selectedKpi = _kpi;
        };

        kpiData.setSelectedKpiAlt = function (_kpi) {
            _kpi = getKpiVale(_kpi);
            _kpi = _kpi.replace(/ /g, '_');
            localStorage.setItem('selectedKpiAlt', _kpi);
            kpiData.selectedKpiAlt = _kpi;
        };

        kpiData.getSelectedKpi = function () {
            return (localStorage.getItem('selectedKpi') === undefined) ?
                kpiData.selectedKpi : localStorage.getItem('selectedKpi');
        };

        kpiData.getSelectedKpiAlt = function () {
            return (localStorage.getItem('selectedKpiAlt') === undefined) ?
                kpiData.selectedKpiAlt : localStorage.getItem('selectedKpiAlt');
        };

        kpiData.getKpiObj = function () {
            return kpiData;
        };

        return kpiData;
    });
});
