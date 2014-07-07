ReachActivityTaskApp.module("ActivitiesTasks.Tasks.Team", function (Team, ReachActivityTaskApp, Backbone, Marionette, $, _, JST) {

  Team.Layout = Marionette.Layout.extend({
    template: JST['templates/team/team_tasks_content'],

    regions: {
      teamHeaderRegion: '.team-header',
      teamTaskFormRegion: '.team-task-form-container',
      teamTasksListRegion: '.team-task-list-container'
    },

    initialize: function(options) {
      this.options = options;
    }
  });

  Team.UserHeaderView = Marionette.ItemView.extend({
    template: JST['templates/team/user_header'],

    initialize: function(options) {
      this.options = options;
    },

    serializeData: function() {
      return this.options;
    }
  });

  Team.TeamHeaderView = Marionette.ItemView.extend({
    template: JST['templates/team/team_header'],

    initialize: function(options) {
      this.options = options;
    },

    serializeData: function() {
      return this.options;
    }
  });

  var API = {
    fetchTeamUserTasks: function (teamLayout) {
      var fetchUserTasks = ReachActivityTaskApp.request("user-task:entities", 0, teamLayout);
      $.when(fetchUserTasks)
        .done(function (userTasks) {
          renderUserTasks(teamLayout, userTasks);
        })
        .fail(function (model, response) {
          console.log("Error: ", response);
        });
    },

    fetchTeamTasks: function(teamLayout) {
      var fetchTeamTasks = ReachActivityTaskApp.request("team-task:entities", 0, teamLayout);

      $.when(fetchTeamTasks)
        .done(function(teamTasks) {
          renderTeamTasks(teamLayout, teamTasks)
        })
        .fail(function(model, response) {
          console.log("Error: ", response);
        });
    }
  };

  function renderUserTasks(teamLayout, userTasks) {
    for(var i = 0; i < userTasks.length; i++) {
      var userTask = userTasks.models[i];
      var userTasksRegion = teamLayout.addRegion('user_task_list_region_' + i, '#user_task_list_' + i);

      var userTasksLayout = new ReachActivityTaskApp.ActivitiesTasks.Tasks.Team.UserTasksLayout({
        context: ReachActivityTaskApp.Entities.TaskPageContext.VIEW.TEAM_USER,
        userId: userTask.get('user').id
      });
      userTasksRegion.show(userTasksLayout);

      var userHeaderView = new ReachActivityTaskApp.ActivitiesTasks.Tasks.Team.UserHeaderView({
        userId: userTask.get('user').id,
        userName: userTask.get('user').name
      });
      userTasksLayout.userHeaderRegion.show(userHeaderView);

      Team.Controller.showTasks(userTasksLayout, userTask.tasks());
    }
  }

  function renderTeamTasks(teamLayout, teamTasks) {
    var teamHeaderView = new ReachActivityTaskApp.ActivitiesTasks.Tasks.Team.TeamHeaderView({
      teamId: teamTasks.get('team').id,
      teamName: teamTasks.get('team').name
    });
    teamLayout.teamHeaderRegion.show(teamHeaderView);

//    teamLayout.teamTaskFormRegion.show();

    var teamTasksLayout = new ReachActivityTaskApp.ActivitiesTasks.Tasks.Layout({
      template: JST['templates/team/task_list'],
      context: ReachActivityTaskApp.Entities.TaskPageContext.VIEW.TEAM
    });
    teamLayout.teamTasksListRegion.show(teamTasksLayout);
    Team.Controller.showTasks(teamTasksLayout, teamTasks.tasks());
  }

  ReachActivityTaskApp.on("team-tasks:list", function(teamLayout) {
    return API.fetchTeamTasks(teamLayout);
  });

  ReachActivityTaskApp.on("team-user-tasks:list", function(teamLayout) {
    return API.fetchTeamUserTasks(teamLayout);
  });

}, JST);
