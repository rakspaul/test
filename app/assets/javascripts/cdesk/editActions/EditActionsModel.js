(function() {
  "use strict";
  var editAction = function(editActionsService) {
    this.data = {
      id: 0,
      actionType: '',
      actionSubtype: '',
      tactic: '',
      metricImpacted: '',
      name: '',
      makeExternal: '',
      show: false
    };

    var updateAction = function(){
      //WIP
    };
  }
  angObj.service('editAction', ['editActionsService', editAction]);


}());