//Data Manipulation in model
timePeriodModule.factory("timePeriodModel", ['constants', function (constants) {
  var selectedBrand = {id: -1};
  var buildTimePeriodList = function() {
      return [createTimePeriodObject('Last 7 days', 'last_week'),
        createTimePeriodObject('Last 30 days', 'last_month'),
        createTimePeriodObject('Lifetime', 'life_time', 'active')
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
    this.timeData.displayTimePeriod = angular.uppercase(this.timeData.selectedTimePeriod.display);
    this.selectTimePeriod = function(timePeriod) {
      self.timeData.selectedTimePeriod = timePeriod;
      self.timeData.displayTimePeriod = angular.uppercase(timePeriod.display);
      $("#cdbDropdown").toggle();
      self.timeData.timePeriodList.forEach(function(period) {
      if (period == timePeriod) {
        period.className = 'active';
      } else {
        period.className = '';
      }
      })

    };
    self.timeData.displayTimePeriod = angular.uppercase(this.timeData.selectedTimePeriod.display)
  };
  return new tpModel();
}])
;