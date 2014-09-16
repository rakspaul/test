ReachActivityTaskApp.module("ActivitiesTasks.Tasks.Team", function (Team, ReachActivityTaskApp, Backbone, Marionette, $, _, JST) {

  Team.Layout = Marionette.Layout.extend({
    template: JST['templates/team/team_tasks_content'],

    regions: {
      taskFormRegion: '.team-task-form-container',
      teamHeaderRegion: '.team-header',
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

    initialize: function (options) {
      this.options = options;
    },

    serializeData: function () {
      return this.options;
    },

    onDomRefresh: function () {
      // Initialize available team list
      var teamListHolder = $("#teamSwitch > .menu");
      _.each(this.options.teams, function(team) {
        teamListHolder.append($('<div class="item" data-value="' + team.id + '">' + team.name + '</div>'));
      });

      // Utilize semantic-ui's dropdown module
      $("#teamSwitch").dropdown({
        namespace: "teamswitch-dropdown",
        transition: "fade",
        onChange: function (newValue) {
          if (newValue) {
            ReachActivityTaskApp.trigger('team-view:list', {teamId: newValue});
          }
        }
      });
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
      teamName: teamTasks.get('team').name,
      teams: teamTasks.get('teams')
    });
    teamLayout.teamHeaderRegion.show(teamHeaderView);

    var teamTasksLayout = new ReachActivityTaskApp.ActivitiesTasks.Tasks.Layout({
      template: JST['templates/team/task_list'],
      context: ReachActivityTaskApp.Entities.TaskPageContext.VIEW.TEAM,
      teamId: teamTasks.get('team').id
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