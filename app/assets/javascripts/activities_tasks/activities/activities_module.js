/*
 Activities sub-module takes care of handling events, request and responses for activities.
 As this module is a place holder, view and controller defined here it self rather than put them in the new files.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities", function(Activities, ReachActivityTaskApp, BackBone, Marionette, $, _, JST) {

  //by default, all sub-modules will start when parent module starts, this field will restrict module to start with parent start.
  //this.startWithParent = false,

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
    fetchActivities: function (filters) {
      var fetchPromise = ReachActivityTaskApp.request("activity:entities", filters);
      $.when(fetchPromise).done(function(activities) {
        renderActivities(activities);
      });
    },

    loadMoreActivities:function(offset) {
      //get filters from header module
      var filters = Activities.Header.filters;
      var fetchPromise = ReachActivityTaskApp.request("activity:entities", filters, offset);
      $.when(fetchPromise).done(function(activities) {
        appendActivities(activities);
      });
    }
  };

  /*
   After activities fetch, this will render header and activities list.
   */
  function renderActivities(activities) {
    Activities.List.Controller.showActivities(activities);
  }

  function appendActivities(activities) {
    Activities.List.Controller.appendActivities(activities);
  }

  /*
   Listens to "include:activities" event, this can be triggered by any part of application using trigger method on App object.
   */
  ReachActivityTaskApp.on("include:activities", function() {
    Activities.activitiesLayout = new Activities.Layout();
    ReachActivityTaskApp.ActivitiesTasks.activitiesTasksLayout.activitiesRegion.show(Activities.activitiesLayout);
    Activities.Header.Controller.showActivities();
    ReachActivityTaskApp.trigger("activities:list");
  });

  /*
   Listens to "activities:list"
   */
  ReachActivityTaskApp.on("activities:list", function(filters) {
    API.fetchActivities(filters);
  });

  ReachActivityTaskApp.on("load-more-activities:list", function(offset) {
    API.loadMoreActivities(offset);
  });

  // We should cover Activities Log region with a semi-transparent layer
  ReachActivityTaskApp.on("include:taskDetails", function () {
    $("#activitiesRegionOverlay").fadeIn();
  });

  ReachActivityTaskApp.on("task:details:closed", function () {
    $("#activitiesRegionOverlay").fadeOut();
  });

  ReachActivityTaskApp.on("activities:resetFilter", function() {
    ReachActivityTaskApp.ActivitiesTasks.Activities.Header.headerLayout.resetFilters();
  });
}, JST);