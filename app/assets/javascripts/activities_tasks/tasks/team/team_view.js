ReachActivityTaskApp.module("ActivitiesTasks.Tasks.Team", function (Team, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  Team.ListView = Marionette.CollectioView.extend({
    itemView: Team.ListItemView
  });

  Team.ListItemView = Marionette.ItemView.exnted({

  });

  Team.FormView = Marionette.ItemView.extend({

  });
});