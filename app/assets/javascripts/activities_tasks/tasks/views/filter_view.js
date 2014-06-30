ReachActivityTaskApp.module("ActivitiesTasks.Views.Team",function(Team, ReachActivityTaskApp, Backbone, Marionette, $, _, JST) {

  Team.FilterView = Marionette.ItemView.extend({
    tagName: "ul",
    id: "taskListFilter",
    template: JST['templates/team/navigation'],

    events:{
      'click .assigned-to-me': "showAssignedToMeView"
    },

    initialize:function(){
      //by default initialize assigned to me view.
      this.showAssignedToMeView();
    },

    showAssignedToMeView: function(){
      ReachActivityTaskApp.trigger("assigned-to-me-tasks:list");
    }


  });

}, JST);