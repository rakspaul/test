/**
 * Controller for Header view.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.Header", function(Header, ReachActivityTaskApp, Backbone, Marionette, $, _){
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

    //saving activity
    saveActivity: function(activity) {
      var fetchActivity = ReachActivityTaskApp.request("activity:save", activity);
      $.when(fetchActivity).done(function(activity) {
        ReachActivityTaskApp.trigger("activities:list");
        Header.headerLayout.resetFormControls();
      });
    },

    saveTask: function(activity) {
      var fetchActivity = ReachActivityTaskApp.request("activity:save", activity);
      $.when(fetchActivity).done(function(activity){
        ReachActivityTaskApp.trigger("activities:list");
        ReachActivityTaskApp.trigger("tasks:list");
        Header.headerLayout.resetFormControls();
      });
    }

  };

});
