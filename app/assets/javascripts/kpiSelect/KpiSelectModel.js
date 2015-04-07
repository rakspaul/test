//Data Manipulation in model
kpiSelectModule.factory("kpiSelectModel", ['constants', function (constants) {

    var kpiData = {};
    kpiData.selectedKpi =  (localStorage.getItem('selectedKpi') == undefined) ? 'ctr' : localStorage.getItem('selectedKpi') ;  //'ctr' ;
    kpiData.kpiDropDown = [ 'ctr' , 'action_rate', 'cpa' ,'cpc' ,'cpm','vtc' ] ;

    kpiData.setSelectedKpi = function (_kpi) {
        localStorage.setItem("selectedKpi", _kpi);
        kpiData.selectedKpi = _kpi ;
    };

    kpiData.getSelectedKpi = function () {
        return (localStorage.getItem('selectedKpi') == undefined) ? kpiData.selectedKpi : localStorage.getItem('selectedKpi') ;
    };

    kpiData.getKpiObj = function() {
        return kpiData;
    };

    return kpiData ;

}]);