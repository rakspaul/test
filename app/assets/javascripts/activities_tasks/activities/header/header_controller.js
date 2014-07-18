/**
 * Controller for Header view.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.Header", function(Header, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  Header.addInitializer(function() {
    EventsBus.bind('lineitem:logRevision', Header.Controller.saveRevisedIOActivity, this);
  });

  Header.Controller = {

    showActivities: function(){
      Header.headerLayout = new Header.Layout({model: new ReachActivityTaskApp.Entities.MasterActivity()});
      ReachActivityTaskApp.ActivitiesTasks.Activities.activitiesLayout.headerRegion.show(Header.headerLayout);
    },

    //Header view call this method on specific filter and pass the inclusive filters.
    fetchActivities: function(filters){
      //Note: When a filter is triggered on the UI, we should not hide filters any more though particular filter doesn't have activities list.
      ReachActivityTaskApp.trigger("activities:list", filters);
    },

    saveRevisedIOActivity:function(note) {
      var activity = new ReachActivityTaskApp.Entities.Activity();
      activity.set("note", note);
      activity.set("activity_type", Header.ACTIVITY_TYPES.SYSTEM);
      Header.Controller.saveActivity(activity);
    },

    //saving activity
    saveActivity: function(activity) {
      var fetchActivity = ReachActivityTaskApp.request("activity:save", activity);
      $.when(fetchActivity)
        .done(function() {
          ReachActivityTaskApp.trigger("activities:list");
          Header.headerLayout.resetFormControls();
        });
    },

    saveTask: function(activity) {
      var fetchActivity = ReachActivityTaskApp.request("activity:save", activity);
      $.when(fetchActivity).done(function(activity){
        ReachActivityTaskApp.trigger("activities:list");
        ReachActivityTaskApp.trigger("include:tasks");
        Header.headerLayout.resetFormControls();
      });
    }

  };

});
