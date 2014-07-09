ReachActivityTaskApp.module("ActivitiesTasks.Tasks.Team", function (Team, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  Team.ListView = Marionette.CollectionView.extend({
    itemView: Team.ListItemView
  });

  Team.ListItemView = Marionette.ItemView.extend({

  });
});