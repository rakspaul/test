ReachActivityTaskApp.module("ActivitiesTasks.Tasks.Team", function (Team, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  Team.Layout = Marionette.Layout.extend({
    template: JST['templates/team/task_list'],

    regions: {
      taskFormRegion: '.team-task-form-container'
    }
  });

});