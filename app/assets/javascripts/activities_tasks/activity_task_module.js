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
      var deferred = new $.Deferred();
    },

    fetchTaskTypes: function() {
      return ReachActivityTaskApp.request("taskType:entities");
    }
  };

  ActivitiesTasks.Layout = Marionette.Layout.extend({
    template: JST['templates/activities_tasks/activities_tasks_layout'],

    regions: {
      activitiesRegion: ".activities-region",
      tasksRegion: ".tasks-region",
      followersRegion: "#followersRegion"
    }
  });

  ActivitiesTasks.OrderTasksLayout = Marionette.Layout.extend({
    template: JST['templates/activities_tasks/orders_tasks_layout'],

    regions: {
      navigationRegion: "#taskNavigationRegion",
      taskListRegion: "#taskListContainerRegion"
    }
  });

  ActivitiesTasks.addInitializer(function(options) {
    ReachActivityTaskApp.order = {};
    switch (options.startedAt) {
      case "order_list":
        ActivitiesTasks.initAtOrderList();
        break;
      case "order_details":
        ReachActivityTaskApp.order = options.order;
        ActivitiesTasks.initAtOrderDetails();
        break;
    }
  });

  ActivitiesTasks.initAtOrderDetails = function () {
    this.activitiesTasksLayout = new ReachActivityTaskApp.ActivitiesTasks.Layout();
    ReachActivityTaskApp.middleRegion.show(this.activitiesTasksLayout);

    $.when(API.fetchTaskTypes())
      .done(function(taskTypes) {
        ReachActivityTaskApp.taskTypes = taskTypes.models;
        ReachActivityTaskApp.trigger("include:activities");
        ReachActivityTaskApp.trigger("include:tasks");
      });
  };

  /**
   * This init function designed specially to show task list on Order list page; "Assigned to me"
   * @param options
   */
  ActivitiesTasks.initAtOrderList = function () {
    this.orderTasksLayout = new ActivitiesTasks.OrderTasksLayout();
    ReachActivityTaskApp.middleRegion.show(this.orderTasksLayout);

    // We always will have navigation section, so just render Navigation view in a corresponding region
    this.orderTasksLayout.navigationRegion.show(new ReachActivityTaskApp.ActivitiesTasks.Views.Team.FilterView());
    //Note: As other views are not required for Beta release, not using router functionality here.
    // And just calling assigned to me view server call directly.
    //TODO: When implementing other views, you have to use router defined there in the task module.
    this.Tasks.List.Controller.assignedToMe();
  };
},JST);