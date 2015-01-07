(function () {
  'use strict';
  angObj.controller('ActionsController', function ($scope,$rootScope, $filter, dataService, $routeParams, modelTransformer, ActionType, ActionSubType, Tactic) {
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
      data.action_sub_type_ids = selectedIds ;
      data.make_external = $scope.action.external;
      //var selectedTactics = $scope.tactics.selected;
      /*if($scope.tactics.selected != undefined){
        data.ad_id = $scope.tactics.selected.id;
      }else{
         data.ad_id ='';
      }*/
      var selectedTactics = $scope.tactics.selected;
      var selectedTacticIds=[];
      for(var i in selectedTactics){
        selectedTacticIds.push(selectedTactics[i].id);
      }
      data.action_tactic_ids = selectedTacticIds;
      data.metric_impacted = $scope.metrics.selected;
      data.name = $scope.action.name;
      data.created_by_id = parseInt(user_id);
      /*var now = $filter('date')(new Date(), 'yyyy-MM-dd');
      data.created_at = now;
      data.updated_at = now;*/
      if($scope.action.selectedType){
         data.action_type_id = $scope.action.selectedType.id;
      }else{
        data.action_type_id ='';
      }

      if(data.action_sub_type_ids.length > 0 &&
        data.action_type_id !=undefined &&
        data.metric_impacted != undefined &&
        data.name.length > 0 ) {
      for(var i in data.action_tactic_ids){
        data.ad_id = data.action_tactic_ids[i]; 
        dataService.createAction(data).then( function (response){
          resetActionFormData();
        }, function (response) {
          resetActionFormData();
        });
      }
      }else{
        if(data.action_type_id !=''){
           $scope.action.selectedTypeError = false;
           $scope.action.actionFlag = 1;

          }else{
              $scope.action.selectedTypeError = true;
              $scope.action.selectedSubTypeError = false;
              $scope.action.selectedTacticError = false;
              $scope.action.selectedMetricError = false;
              $scope.action.nameError = false;
              $scope.action.actionFlag = 0;
          }
          if( $scope.action.actionFlag  > 0 ){
             if(data.action_sub_type_ids.length > 0){
               $scope.action.selectedSubTypeError = false;
               $scope.action.actionSubTypeFlag = 1;
            }else{
                $scope.action.selectedTypeError = false;
                $scope.action.selectedSubTypeError = true;
                $scope.action.selectedTacticError = false;
                $scope.action.selectedMetricError = false;
                $scope.action.nameError = false;
                $scope.action.actionSubTypeFlag = 0;
            }
          }
         if( $scope.action.actionFlag  > 0 &&  $scope.action.actionSubTypeFlag > 0 ){
           if( data.action_tactic_ids.length > 0 ){
            $scope.action.selectedTacticError = false;
            $scope.action.TacticFlag = 1;
            }else{
                $scope.action.selectedTypeError = false;
                $scope.action.selectedSubTypeError = false;
                $scope.action.selectedTacticError = true;
                $scope.action.selectedMetricError = false;
                $scope.action.nameError = false;
                $scope.action.TacticFlag = 0;
            }

         }
         if( $scope.action.actionFlag  > 0 &&  $scope.action.actionSubTypeFlag > 0 && $scope.action.TacticFlag > 0  ){
          if(  data.metric_impacted != undefined ){
            $scope.action.selectedMetricError = false;
             $scope.action.MetricFlag = 1;
          }else{
                $scope.action.selectedTypeError = false;
                $scope.action.selectedSubTypeError = false;
                $scope.action.selectedTacticError = false;
                $scope.action.selectedMetricError = true;
                $scope.action.nameError = false;
              $scope.action.MetricFlag = 0;
          }
        }
         if( $scope.action.actionFlag  > 0 &&  $scope.action.actionSubTypeFlag > 0 && $scope.action.TacticFlag > 0 &&  $scope.action.MetricFlag > 0  ){
          if(  data.name.length  > 0 ){
            $scope.action.nameError = false;
          }else{
                $scope.action.selectedTypeError = false;
                $scope.action.selectedSubTypeError = false;
                $scope.action.selectedTacticError = false;
                $scope.action.selectedMetricError = false;
                $scope.action.nameError = true;
          }
        }

      }
    }
    $scope.resetValidation = function(){
       $scope.action.selectedTypeError = false;
       $scope.action.selectedSubTypeError = false;
       $scope.action.selectedTacticError = false;
       $scope.action.selectedMetricError = false;
       $scope.action.nameError = false;

    }
    function resetActionFormData() {
      $scope.action.submitBtnDisabled = false;
      $scope.action.external = false;
      $scope.action.name = '';
      $scope.action.selectedType = undefined;
      $scope.action.selectedSubType = undefined;
      $scope.tactics.selected = undefined;
      $scope.metrics.selected = undefined;
      $scope.selectedAll = false;
      $rootScope.$broadcast("clear");
      $rootScope.$broadcast("removeOptions");
    }
     $scope.getActionType = function(){
      var flag = "removeOptions";
      if($scope.action.selectedType !=undefined){
        if($scope.action.selectedType.id > 0 ){
              var flag = "showOptions";
          }else{
              var flag = "removeOptions";
          }
      }else
      {
         var flag = "removeOptions";
      }
      $rootScope.$broadcast(flag);
    }
    
  });
}());