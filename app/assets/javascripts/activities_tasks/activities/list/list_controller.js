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
                var activitiesListView = new List.Activities({
                    collection: activities
                });
                ReachActivityTaskApp.ActivitiesTasks.Activities.activitiesLayout.contentRegion.show(activitiesListView);
            }
        }
    };
});
