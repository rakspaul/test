/*
 Controller for the list view.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.List", function(List, ReachActivityTaskApp, Backbone, Marionette, $, _){

  List.Controller = {
    showActivities: function(activities){
      //if activities are not available then we should show empty view otherwise show list of activities.
      if(activities==null || activities.length == 0){
        console.log("Rendering empty view");
        //preparing empty view here using empty context object
        var emptyContext = new ReachActivityTaskApp.Empty.Context({name:"Activities"});
        var emptyView = new ReachActivityTaskApp.Empty.View({model:emptyContext});
        ReachActivityTaskApp.ActivitiesTasks.Activities.activitiesLayout.contentRegion.show(emptyView);
      } else {
        console.log("Rendering activities");
        List.activitiesListView = new List.Activities({
          collection: activities
        });
        ReachActivityTaskApp.ActivitiesTasks.Activities.activitiesLayout.contentRegion.show(List.activitiesListView);
      }
    },

    loadMoreActivities:function(offset){
      ReachActivityTaskApp.trigger("load-more-activities:list",offset);
    },

    appendActivities: function(activities){
      if(activities.length>0){
        activities.each(function(activity){
          console.log("Activity to add:"+JSON.stringify(activity));
          List.activitiesListView.collection.add(activity);
        });
        //present collection size
        var collectionLength = List.activitiesListView.collection.length;
        if(collectionLength%ReachActivityTaskApp.Entities.DEF_NO_OF_ROWS_TO_FETCH == 0){
          List.activitiesListView.showHideLoadMoreControl(true);
        } else {
          List.activitiesListView.showHideLoadMoreControl(false);
        }
      } else {
        List.activitiesListView.showHideLoadMoreControl(false);
      }
    }
  };
});
