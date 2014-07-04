ReachActivityTaskApp.module("ActivitiesTasks.Tasks", function (Tasks, ReachActivityTaskApp, BackBone, Marionette, $, _, JST) {

  // by default, all sub-modules will start when parent module starts, this field will restrict module to start with parent start.
  this.startWithParent = false,

  Tasks.Layout = Marionette.Layout.extend({
    template: JST['templates/activities_tasks/tasks/task_content'],

    options: {},

    initialize: function(options) {
      this.options = options;
    },

    regions: {
      tasksListRegion: ".tasks-list"
    },

    ui: {
      "loadMoreBtn": "#loadMoreBtn"
    },

    events: {
      "click #loadMoreBtn": "showMoreTasks"
    },

    showMoreTasks: function () {
      Tasks.List.Controller.loadMoreTasks(this);
    },

    showHideMoreTasks: function (show) {
      if (show) {
        $(this.ui.loadMoreBtn).show();
      } else {
        $(this.ui.loadMoreBtn).hide();
      }
    }
  });

  Tasks.TaskDetailsLayout = Marionette.Layout.extend({
    template: JST['templates/activities_tasks/tasks/task_details'],

    regions: {
      taskDetailRegion: '.task-detail-container',
      taskCommentsRegion: '.task-comments-container',
      taskCommentInputRegion: '.task-comment-input-control'
    },

    events: {
      "click #loadMoreCommentsBtn" : "onMoreTaskComments"
    },

    onMoreTaskComments: function(e) {
      e.preventDefault();
      ReachActivityTaskApp.ActivitiesTasks.Tasks.List.Controller.showMoreTaskComments(this.options.task);
    }
  });

  Tasks.TaskCommentsRegion = Backbone.Marionette.Region.extend({
    el: '.task-comments-container'
  });

  /*
   API to fetch tasks.
   */
  var API = {
    fetchTasks: function (taskLayout) {
      var fetchTasks = ReachActivityTaskApp.request("task:entities", 0, taskLayout);
      $.when(fetchTasks)
        .done(function (tasks) {
          renderTasks(taskLayout, tasks);
        })
        .fail(function (model, response) {
          console.log("Error happened...", response);
        });
    },

    fetchMoreTasks: function (offset, taskLayout) {
      var fetchTasks = ReachActivityTaskApp.request("task:entities", offset, taskLayout);
      $.when(fetchTasks).done(function (tasks) {
        renderMoreTasks(taskLayout, tasks);
      });
    },

    fetchTaskComments: function (task, offset) {
      var fetchTaskComments = ReachActivityTaskApp.request("taskComment:entities", task, offset);
      $.when(fetchTaskComments).done(function (comments) {
        if (offset && offset > 0)
          appendTaskComments(comments);
        else
          renderTaskComments(comments);
      });
    },

    tasksAssignedToMe: function () {
      ReachActivityTaskApp.ActivitiesTasks.Tasks.List.Controller.assignedToMe();
    },

    tasksTeam: function () {
      ReachActivityTaskApp.ActivitiesTasks.Tasks.List.Controller.teamView();
    },

    tasksFollowed: function () {
      console.log("Tasks Followed Fired!");
    }
  };

  /*
   After tasks fetch, this will render header and tasks list.
   */
  function renderTasks(taskLayout, tasks) {
    Tasks.List.Controller.showTasks(taskLayout, tasks);
  }

  function renderMoreTasks(taskLayout, tasks) {
    Tasks.List.Controller.showMoreTasks(taskLayout, tasks);
  }

  function appendTaskComments(taskComments) {
    Tasks.List.Controller.appendTaskComments(taskComments);
  }

  function renderTaskComments(taskComments) {
    Tasks.List.Controller.showTaskComments(taskComments);
  }

  /*
   Listens to "include:tasks" event, this can be triggered by any part of application using trigger method on App object.
   */
  ReachActivityTaskApp.on("include:tasks", function () {
    var taskLayout = new Tasks.Layout({context: ReachActivityTaskApp.Entities.TaskPageContext.VIEW.INSIDE_ORDER});
    ReachActivityTaskApp.ActivitiesTasks.activitiesTasksLayout.tasksRegion.show(taskLayout);
    ReachActivityTaskApp.trigger("tasks:list", taskLayout);
  });

  /*
   Listens to "tasks:list"
   */
  ReachActivityTaskApp.on("tasks:list", function (taskLayout) {
    API.fetchTasks(taskLayout);
  });

  ReachActivityTaskApp.on("include:taskDetails", function (options) {

    var taskDetailsLayout = new ReachActivityTaskApp.ActivitiesTasks.Tasks.TaskDetailsLayout(options);
    options.aRegion.show(taskDetailsLayout);

    Tasks.taskDetailView = new ReachActivityTaskApp.ActivitiesTasks.Tasks.List.TaskDetailView({
      model: options.task,
      parentRegion: options.aRegion,
      taskView: options.taskView
    });

    ReachActivityTaskApp.trigger("taskComments:list", options);
    taskDetailsLayout.taskDetailRegion.show(Tasks.taskDetailView);
    Tasks.List.Controller.showTaskCommentInput(_.extend(options, {myRegion: taskDetailsLayout.taskCommentInputRegion}));
  });

  ReachActivityTaskApp.on("taskComments:list", function (options) {
    API.fetchTaskComments(options.task, options.offset);
  });

  ReachActivityTaskApp.on("load-more-tasks:list", function (offset, taskLayout) {
    return API.fetchMoreTasks(offset, taskLayout);
  });

  ReachActivityTaskApp.on("assigned-to-me-tasks:list", function () {
    return API.tasksAssignedToMe();
  });

  ReachActivityTaskApp.on("team-view:list", function () {
    return API.tasksTeam();
  });

  Tasks.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'tasks/assigned_to_me': 'tasksAssignedToMe',
      'tasks/followed': 'tasksFollowed',
      'tasks/team': 'tasksTeam'
    }
  });

  // Let our app use router for tasks
  ReachActivityTaskApp.addInitializer(function(){
    new Tasks.Router({
      controller: API
    });
  });

}, JST);
