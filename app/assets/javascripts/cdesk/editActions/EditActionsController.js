(function () {
  'use strict';
  editActionsModule.controller('editActionsController', function ($rootScope, $scope, $filter, $timeout, dataService, $routeParams, modelTransformer, editActionsService, editAction, activityList) {
   
        $scope.showList = editAction.data;
        $scope.actionItems = activityList.data;

        //EDIT ACTIVITIES
        $scope.editActivity = false;
        $scope.saveBtnDisabled = false;

        $scope.showEdit= function(ad_id){
            console.log('requested data');
            console.log(editAction.data);

            editAction.data.show = true;
 
            _.each(activityList.data.data, function(activity) {
                if(activity.id == ad_id){
                    //updateUIModel
                    editAction.data.id = activity.id;
                    editAction.data.actionType = activity.action_type_name;
                    editAction.data.actionSubtype = activity.action_sub_type;
                    editAction.data.tactic = activity.ad_name;;
                    editAction.data.metricImpacted = activity.metric_impacted;
                    editAction.data.name = activity.comment;
                    editAction.data.makeExternal = activity.make_external;
                }
            });

        };

        $scope.closeEdit= function(){
            editAction.data.show = false;
        };

        $scope.editAction = function () {
            $scope.saveBtnDisabled = true;
          
            var data = {};
            data.make_external = editAction.data.makeExternal;
            data.ad_id =  editAction.data.id ;
            data.name = editAction.data.name ;

            console.log('new chnages');
            console.log(data);

  
            dataService.editAction(data).then( function (response){
                _.each(activityList.data.data, function(activity) {
                    if(activity.id == data.ad_id){
                        activity.make_external = data.make_external;
                        activity.comment = data.name ;

                    }
                });
                resetEditActionFormData();
                editAction.data.show = false;
            });
        }
        function resetEditActionFormData() {
            $scope.saveBtnDisabled = false;
            editAction.data.makeExternal = false;
            editAction.data.name = '';

        }
 

  });
}());