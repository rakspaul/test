ReachActivityTaskApp.module("Entities", function(Entities, ReachActivityTaskApp, Backbone, Marionette, $, _) {

    Entities.UserTasks = Backbone.Model.extend({
        tasks: function() {
            return new Entities.TaskCollection(
                this.get('tasks'),
                {
                    context: ReachActivityTaskApp.Entities.TaskPageContext.VIEW.TEAM_USER,
                    userId: this.get('user').id
                });
        }
    });

    Entities.UserTasksCollection = Backbone.Collection.extend({
        initialize: function(models, options) {
            this.context = options.context;
            this.teamId = options.teamId;
        },

        url: function() {
            return '/tasks/team_user_tasks.json';
        },

        model: Entities.UserTasks
    });

  Entities.TeamTasks = Backbone.Model.extend({

    initialize: function(options) {
      this.context = options.context;
      this.teamId = options.teamId;
    },

    url: '/tasks/team_tasks.json',

    tasks: function() {
      return new Entities.TaskCollection(
        this.get('tasks'),
        {
          context: ReachActivityTaskApp.Entities.TaskPageContext.VIEW.TEAM,
          teamId: this.get('team').id
        });
    }
  });

  var API = {
    getUserTaskEntities: function(offset, teamLayout) {
      var userTasks = new Entities.UserTasksCollection([],
        {
          context: teamLayout.options.context,
          teamId: teamLayout.options.teamId,
          userId: teamLayout.options.userId
        }),
        filter = {},
        defer = $.Deferred();

          // default filter.
        filter["limit"] = Entities.DEF_NO_OF_ROWS_TO_FETCH;
        filter["offset"] = Entities.DEF_OFFSET;

        if(offset) {
          filter["offset"] = offset;
        }

        if(teamLayout.options.teamId) {
          filter["team_id"] = teamLayout.options.teamId;
        }

        userTasks.fetch({
          data: $.param(filter),
          success: function(data) {
            defer.resolve(data);
          },
          error: function() {
            defer.resolve();
          }
        });

          return defer.promise();
      },

    getTeamTaskEntities: function(offset, teamLayout) {
      var teamTasks = new Entities.TeamTasks(
        {
          context: teamLayout.options.context,
          teamId: teamLayout.options.teamId
        }),
        filter = {},
        defer = $.Deferred();

          // default filter.
        filter["limit"] = Entities.DEF_NO_OF_ROWS_TO_FETCH;
        filter["offset"] = Entities.DEF_OFFSET;

        if(offset) {
          filter["offset"] = offset;
        }

        if(teamLayout.options.teamId) {
          filter["team_id"] = teamLayout.options.teamId;
        }

        teamTasks.fetch({
          data: $.param(filter),
          success: function(data) {
            defer.resolve(data);
          },
          error: function() {
            defer.resolve();
          }
        });

        return defer.promise();
      }

  };


  ReachActivityTaskApp.reqres.setHandler("user-task:entities", function(offset, teamLayout) {
    return API.getUserTaskEntities(offset, teamLayout);
  });

  ReachActivityTaskApp.reqres.setHandler("team-task:entities", function(offset, teamLayout) {
    return API.getTeamTaskEntities(offset, teamLayout);
  });


});
