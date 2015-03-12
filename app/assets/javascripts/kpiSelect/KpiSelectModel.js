//Data Manipulation in model
kpiSelectModule.factory("kpiSelectModel", ['constants', function (constants) {

    var kpiData = {};
    kpiData.selectedKpi = 'ctr' ;
    kpiData.kpiDropDown = [ 'ctr' , 'action_rate', 'cpa' ,'cpc' ,'cpm','vtc' ] ;

    kpiData.setSelectedKpi = function (_kpi) {
        kpiData.selectedKpi = _kpi ;
    };

    kpiData.getSelectedKpi = function () {
        return kpiData.selectedKpi ;
    };

    kpiData.getKpiObj = function() {
        return kpiData;
    };

    return kpiData ;

}]);