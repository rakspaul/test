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
ReachActivityTaskApp.module("ActivitiesTasks", function(ActivitiesTasks, ReachActivityTaskApp, BackBone, Marionette, $, _, JST) {

  /*
   TODO: Define routes here to fetch master data like activity-types, states etc...

   */

  var API = {
    fetchMasterData: function() {
      var deferred = $._deferred();
    },

    fetchTaskTypes: function() {
      return ReachActivityTaskApp.request("taskType:entities");
    },
  };

  ActivitiesTasks.Layout = Marionette.Layout.extend({
    template: JST['templates/activities_tasks/activities_tasks_layout'],

    regions: {
      activitiesRegion: ".activities-region",
      tasksRegion: ".tasks-region",
      followersRegion: "#followersRegion"
    }
  });

  /**
   * addInitializer is a Marionette initialization function and it will invoke when module starts.
   * You can have as many as these methods. Please refer to marionette js documentation. Link is given above.
   */
  ActivitiesTasks.addInitializer(function(options){
    options = options || {};
    // Application could be started either from Order details or from Order List page, thus no `options.order` provided
    // 1. Application started from Order.Details page, have options.order provided
    if (!_.isUndefined(options.order)) {
      ReachActivityTaskApp.order = options.order;

      // Fetch master data
      var taskTypes = API.fetchTaskTypes();
      $.when(taskTypes).done(function(taskTypes) {
        ReachActivityTaskApp.taskTypes = taskTypes.models;
        ActivitiesTasks.init();
      });

    // 2. Application started from Order.List page, we have reference to holding layout passed through `options` object
    } else {
      ActivitiesTasks.initAtOrderList(options);
    }
  });

  ActivitiesTasks.init = function() {
    this.activitiesTasksLayout = new ActivitiesTasks.Layout();
    ReachActivityTaskApp.middleRegion.show(this.activitiesTasksLayout);
    //ReachActivityTaskApp.username = window.current_user_name;
    ReachActivityTaskApp.trigger("include:activities");
    ReachActivityTaskApp.trigger("include:tasks");
  };

  /**
   * This init function designed specially to show task list on Order list page; "Assigned to me"
   * @param options
   */
  ActivitiesTasks.initAtOrderList = function (options) {
    // keep the reference to parent layout in this application
    ReachActivityTaskApp.holdingLayout = options.parentLayout;
    ReachActivityTaskApp.commands.execute("orderList:include:tasks");
  }

  // TODO: Have to implement stop method for all the modules.

},JST);