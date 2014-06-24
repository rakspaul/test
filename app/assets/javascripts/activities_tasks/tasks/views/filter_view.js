ReachActivityTaskApp.module("ActivitiesTasks.Views.Team",function(Team, ReachActivityTaskApp, Backbone, Marionette, $, _, JST) {

  Team.FilterView = Marionette.ItemView.extend({
    tagName: "ul",
    id: "taskListFilter",
    template: JST['templates/team/navigation']
  });

}, JST);