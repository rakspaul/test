(function () {
  'use strict';
  angObj.controller('ActionsController', function ($scope, $filter, dataService, $routeParams, modelTransformer, ActionType, ActionSubType, Tactic) {
    dataService.getActions().then(function (response) {
      var action = {};
      action.types = [];
      action.external = false;
      action.name = '';
      var result = response.data.data;
      for (var i = 0; i < result.length; i++) {
        action.types[i] = modelTransformer.transform(result[i], ActionType);
        for (var j = 0; j < result[i].subTypeList.length; j++) {
          action.types[i].subTypes[j] = modelTransformer.transform(result[i].subTypeList[j], ActionSubType)
        }
      }
//      action.selectedType = action.types[0];
//      action.selectedSubType = action.selectedType.subTypes[0];
      $scope.action = action;
      $scope.setAction = function () {
        $scope.action.selectedSubType = $scope.action.selectedType.subTypes[0];
      }
    });
    dataService.getTactics($routeParams.campaignId).then(function (response) {
      var tactics = [];
      var result = response.data;
      for (var i = 0; i < result.length; i++) {
        var tactic = modelTransformer.transform(result[i], Tactic);
        tactics.push(tactic);
      }
      $scope.tactics = {};
      $scope.tactics.all = tactics;
//      $scope.tactics.selected = tactics[0];
    });
    var metrics = {};
    metrics.all = ['CPA', 'CPC', 'CPM', 'CTR', 'Action Rate', 'Delivery (Impressions)'];
//    metrics.selected = metrics.all[0];
    $scope.metrics = metrics;

    $scope.createAction = function () {
      $scope.action.submitBtnDisabled = false;
      var data = {};
      var selectedTypes = $scope.action.selectedSubType;
      var selectedIds=[];
      for(var i in selectedTypes){
        selectedIds.push(selectedTypes[i].id);
      }
      console.log(selectedIds);
      data.action_sub_type_ids = selectedIds ;//[$scope.action.selectedSubType.id];
      data.make_external = $scope.action.external;

      var selectedTactics = $scope.tactics.selected;
      var selectedTacticIds=1;//[];
      for(var i in selectedTactics){
        selectedTacticIds.push(selectedTactics[i].id);
      }
      data.ad_id = selectedTacticIds;//$scope.tactics.selected.id;
      data.metric_impacted = $scope.metrics.selected;
      data.name = $scope.action.name;
      data.created_by_id = parseInt(user_id);
      /*var now = $filter('date')(new Date(), 'yyyy-MM-dd');
      data.created_at = now;
      data.updated_at = now;*/
      data.action_type_id = $scope.action.selectedType.id;
      if(data.action_sub_type_ids.length > 0 &&
        data.action_type_id !='' &&
        data.metric_impacted != undefined &&
        data.name.length > 0) {
        console.log('Now you post ');
        console.log(data);
        dataService.createAction(data).then( function (response){
          resetActionFormData();
        }, function (response) {
          resetActionFormData();
        });
      }
    }
    function resetActionFormData() {
      $scope.action.submitBtnDisabled = false;
      $scope.action.external = false;
      $scope.action.name = '';
      $scope.action.selectedType = undefined;
      $scope.action.selectedSubType = undefined;
      $scope.tactics.selected = undefined;
      $scope.metrics.selected = undefined;
    }
  });
}());