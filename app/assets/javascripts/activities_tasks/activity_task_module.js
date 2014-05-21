/*
 Initialize marionette application object here..
 once you have application object created, you can create modules later using this object

 Marionette documentation is available here: https://backbonemarionette.readthedocs.org/en/latest/index.html
 */
ReachActivityTaskApp = new Marionette.Application();

/*
    Add regions here to take effect. Put up a div in order_detail_layout.jst.ejs where we will include activities-tasks UI.
 */
ReachActivityTaskApp.addRegions({
    middleRegion : '.middle-region'
});

/*
    Defining a new module to include activities and tasks regions. Check out the below template file for layout structure.
 */
ReachActivityTaskApp.module("ActivitiesTasks",function(ActivitiesTasks,ReachActivityTaskApp,BackBone,Marionette,$,_,JST){

    /*
        TODO: Define routes here to fetch master data like activity-types, states etc...

     */

    API={

        fetchMasterData:function(){
            var deferred = $._deferred();
        },

        fetchTaskTypes: function(){

        },

        fetchUsersAndTeams: function(){

        }

    };

    ActivitiesTasks.Layout = Marionette.Layout.extend({
        template: JST['templates/activities_tasks/activities_tasks_layout'],

        regions: {
            activitiesRegion: ".activities-region",
            tasksRegion: ".tasks-region"
        }
    });

    /**
     * addInitializer is a Marionette initialization function and it will invoke when module starts.
     * You can have as many as these methods. Please refer to marionette js documentation. Link is given above.
     *
     */
    ActivitiesTasks.addInitializer(function(options){
        this.activitiesTasksLayout = new ActivitiesTasks.Layout();
        ReachActivityTaskApp.middleRegion.show(this.activitiesTasksLayout);
        console.log(JSON.stringify(options.order));
        ReachActivityTaskApp.order = options.order;
        //ReachActivityTaskApp.username = window.current_user_name;
        ReachActivityTaskApp.trigger("include:activities");
        ReachActivityTaskApp.trigger("include:tasks");
    });

    /*
        TODO: Have to implement stop method for all the modules.
     */

},JST);