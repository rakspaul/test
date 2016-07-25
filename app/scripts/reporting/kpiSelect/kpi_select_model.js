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

        kpiData.setSelectedKpi = function (_kpi) {
            localStorage.setItem('selectedKpi', _kpi);
            kpiData.selectedKpi = _kpi;
        };

        kpiData.setSelectedKpiAlt = function (_kpi) {
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
