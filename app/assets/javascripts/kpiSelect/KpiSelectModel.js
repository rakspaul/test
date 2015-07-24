//Data Manipulation in model
kpiSelectModule.factory("kpiSelectModel", ['constants', function (constants) {
    var kpiData = {};
    kpiData.selectedKpi =  (localStorage.getItem('selectedKpi') == undefined) ? 'ctr' : localStorage.getItem('selectedKpi') ;  //'ctr' ;
    kpiData.selectedKpiAlt =  (localStorage.getItem('selectedKpiAlt') == undefined) ? 'cpm' : localStorage.getItem('selectedKpiAlt') ;  //'cpm' ;
    kpiData.kpiDropDown = [ 'ctr' , 'action_rate', 'cpa' ,'cpc' ,'cpm','vtc' ] ;
    kpiData.newkpiDropDownAlt = [ 'cpm' , 'cpc', 'cpa' ] ;

    kpiData.setSelectedKpi = function (_kpi) {
        localStorage.setItem("selectedKpi", _kpi);
        kpiData.selectedKpi = _kpi ;
    };

    kpiData.setSelectedKpiAlt = function (_kpi) {
        localStorage.setItem("selectedKpiAlt", _kpi);
        kpiData.selectedKpiAlt = _kpi ;
    };


    kpiData.getSelectedKpi = function () {
        return (localStorage.getItem('selectedKpi') == undefined) ? kpiData.selectedKpi : localStorage.getItem('selectedKpi') ;
    };

    kpiData.getSelectedKpiAlt = function () {
        return (localStorage.getItem('selectedKpiAlt') == undefined) ? kpiData.selectedKpiAlt : localStorage.getItem('selectedKpiAlt') ;
    };


    kpiData.getKpiObj = function() {
        return kpiData;
    };

    return kpiData ;

}]);