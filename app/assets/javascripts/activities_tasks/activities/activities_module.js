/*
    Activities sub-module takes care of handling events, request and responses for activities.
    As this module is a place holder, view and controller defined here it self rather than put them in the new files.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities",function(Activities,ReachActivityTaskApp,BackBone,Marionette,$,_,JST){

    //by default, all sub-modules will start when parent module starts, this field will restrict module to start with parent start.
    this.startWithParent = false,

    Activities.Layout = Marionette.Layout.extend({
        template: JST['templates/activities_tasks/activities/activity_content'],

        regions: {
            headerRegion: ".activities-header",
            contentRegion: ".activities-content"
        }
    });

    /*
        API to fetch activities.
     */
    var API = {
        fetchActivities: function (filter) {
            var fetchPromise = ReachActivityTaskApp.request("activity:entities",filter);
            $.when(fetchPromise).done(function(activities){
                console.log("Activities data from server:"+ JSON.stringify(activities));
                var showFilters = false;
                if(filter)
                    showFilters = true;
                renderActivities(activities,showFilters);
            });
        }
    };

    /*
        After activities fetch, this will render header and activities list.
     */
    function renderActivities(activities,showFilters){
       Activities.Header.Controller.showActivities(activities,showFilters);
       Activities.List.Controller.showActivities(activities);
    }

    /*
        Listens to "include:activities" event, this can be triggered by any part of application using trigger method on App object.
     */
    ReachActivityTaskApp.on("include:activities", function(){
        Activities.activitiesLayout = new Activities.Layout();
        console.log("including activities region");
        ReachActivityTaskApp.ActivitiesTasks.activitiesTasksLayout.activitiesRegion.show(Activities.activitiesLayout);
        ReachActivityTaskApp.trigger("activities:list");
    });

    /*
        Listens to "activities:list"
     */
    ReachActivityTaskApp.on("activities:list", function(filter){
        API.fetchActivities(filter);
    });

},JST);