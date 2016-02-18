//Data Manipulation in model
timePeriodModule.factory("timePeriodModel",function () {
    var buildTimePeriodList = function() {
        return [
            createTimePeriodObject('Last 7 days', 'last_7_days'),
            createTimePeriodObject('Last 30 days', 'last_30_days'),
            createTimePeriodObject('Lifetime', 'life_time', 'active'),
            createTimePeriodObject('Custom', 'custom')
        ];

    };
    var timePeriodApiMapping = function(key) {
        var apiObj = {
            'last_week': 'last_7_days',
            'last_month': 'last_30_days',
            'life_time': 'life_time'
        };
        return apiObj[key];
    };
    var createTimePeriodObject = function(display, key, className) {
        var obj = {
            "display": display,
            "key": key
        };
        obj.className = (className == undefined ? '' : className);
        return obj;
    };
    var tpModel = function() {
        this.timeData = {};
        this.timeData.timePeriodList = buildTimePeriodList();
        this.timeData.selectedTimePeriod = this.timeData.timePeriodList[2];
        var self = this;

        var fromLocStoreTime = localStorage.getItem('timeSetLocStore');
        if(fromLocStoreTime) {
            fromLocStoreTime = JSON.parse(localStorage.getItem('timeSetLocStore'));
            this.timeData.selectedTimePeriod.key = fromLocStoreTime;
        }

        var fromLocStore = JSON.parse(localStorage.getItem('timeSetTextLocStore'));
        if(fromLocStore !== null){
            this.timeData.displayTimePeriod = fromLocStore; //
        }
        else{
            this.timeData.displayTimePeriod = this.timeData.selectedTimePeriod.display;
        }

        //this.timeData.displayTimePeriod = this.timeData.selectedTimePeriod.display;
        this.selectTimePeriod = function(timePeriod) {
            self.timeData.selectedTimePeriod = timePeriod;
            self.timeData.displayTimePeriod = timePeriod.display;
            $("#cdbDropdown").toggle();
            self.timeData.timePeriodList.forEach(function(period) {
                if (period == timePeriod) {
                    period.className = 'active';
                } else {
                    period.className = '';
                }
            })

        };
    };
    return new tpModel();
})
;