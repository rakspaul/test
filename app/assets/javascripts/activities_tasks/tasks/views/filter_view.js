ReachActivityTaskApp.module("ActivitiesTasks.Views.Team",function(Team, ReachActivityTaskApp, Backbone, Marionette, $, _, JST) {

  Team.FilterView = Marionette.ItemView.extend({
    tagName: "ul",
    id: "taskListFilter",
    template: JST['templates/team/navigation'],

    events:{
      'click .navbar-link': 'switchView'
    },

    // Default value for selected menu
    lastSelected: "assigned_to_me",

    initialize:function() {
      // retrieve last state from localStorage and show this to the user
      this.lastSelected = localStorage.getItem("order_task_switch_view") || this.lastSelected;
    },

    onShow: function () {
      // NOTE: by default "assigned to me" view will be initialized.
      this.switchView();
    },

    _markActiveItem: function () {
      this.$(".navbar-link").removeClass("active");
      this.$("[data-switch-view='" + this.lastSelected + "']").addClass("active");
    },

    switchView: function(e) {
      var event_name = "assigned-to-me-tasks:list",
          $this;

      if (!_.isUndefined(e)) {
        $this = $(e.currentTarget);
        this.lastSelected = $this.data("switch-view");
      }

      switch (this.lastSelected) {
        case "team":
          event_name = "team-view:list";
        break;
      }

      this._markActiveItem();
      localStorage.setItem("order_task_switch_view", this.lastSelected);

      ReachActivityTaskApp.trigger(event_name);
    }
  });

}, JST);