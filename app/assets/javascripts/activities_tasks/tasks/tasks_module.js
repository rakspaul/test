ReachActivityTaskApp.module("ActivitiesTasks.Tasks",function(Tasks,ReachActivityTaskApp,BackBone,Marionette,$,_,JST){

  //by default, all sub-modules will start when parent module starts, this field will restrict module to start with parent start.
  this.startWithParent = false,

    Tasks.Layout = Marionette.Layout.extend({
      template: JST['templates/activities_tasks/tasks/task_content'],

      regions: {
        tasksListRegion: ".tasks-list"
      },

      ui: {
       "loadMoreBtn": "#loadMoreBtn"
      },

      events:{
        "click #loadMoreBtn": "loadMoreTasks"
      },

      loadMoreTasks: function(){
        Tasks.List.Controller.loadMoreTasks();
      },

      showHideLoadMoreControl:function(show){
        if(show){
          $(this.ui.loadMoreBtn).show();
        } else {
          $(this.ui.loadMoreBtn).hide();
        }
      }
    });

  Tasks.CommentsLayout = Marionette.Layout.extend({
    template: JST['templates/activities_tasks/tasks/task_comment_list'],

    regions: {
      taskCommentsRegion: '.task-comments-container'
    }
  });

  Tasks.TaskCommentRegion = Backbone.Marionette.Region.extend({
    el: '.task-comments-container'
  });

  /*
   API to fetch tasks.
   */
  var API = {
    fetchAllTasks: function () {
      var fetchTasks = ReachActivityTaskApp.request("task:entities:all");
      $.when(fetchTasks)
          .done(function(tasks) {
            renderAllTasks(tasks);
          })
          .fail(function (model, response) {
            console.log("Error happened...", response);
          });
    },

    fetchOrderTasks: function () {
      var fetchTasks = ReachActivityTaskApp.request("task:entities");
      $.when(fetchTasks)
          .done(function(tasks) {
            console.log("Tasks data from server:"+ JSON.stringify(tasks));
            renderTasks(tasks);
          })
          .fail(function (model, response) {
            console.log("Error happened...", response);
          });
    },

    fetchMoreTasks: function (offset) {
      var fetchTasks = ReachActivityTaskApp.request("task:entities",offset);
      $.when(fetchTasks).done(function(tasks) {
        console.log("Tasks data from server:"+ JSON.stringify(tasks));
        renderMoreTasks(tasks);
      });
    },

    fetchTaskComments: function(task) {
      var fetchTaskComments = ReachActivityTaskApp.request("taskComment:entities", task);
      $.when(fetchTaskComments).done(function(comments) {
        console.log('taskComments ' + JSON.stringify(comments));
        renderTaskComments(comments);
      });
    }


  };

  /*
   After tasks fetch, this will render header and tasks list.
   */
  function renderTasks(tasks) {
    Tasks.List.Controller.showTasks(tasks);
  }

  function renderMoreTasks(tasks) {
    Tasks.List.Controller.showMoreTasks(tasks);
  }

  function renderAllTasks(tasks) {
    Tasks.List.Controller.showAllTasks(tasks);
  }

  function renderTaskComments(taskComments) {
    Tasks.List.Controller.showTaskComments(taskComments);
  }

  /*
   Listens to "include:tasks" event, this can be triggered by any part of application using trigger method on App object.
   */
  ReachActivityTaskApp.on("include:tasks", function() {
    Tasks.taskLayout = new Tasks.Layout();
    console.log("including tasks region");
    ReachActivityTaskApp.ActivitiesTasks.activitiesTasksLayout.tasksRegion.show(Tasks.taskLayout);
    ReachActivityTaskApp.trigger("tasks:list");
  });

  /*
   Listens to "tasks:list"
   */
  ReachActivityTaskApp.on("tasks:list", function() {
    API.fetchOrderTasks();
  });

  ReachActivityTaskApp.on("tasks:list:all", function() {
    API.fetchAllTasks();
  });

  ReachActivityTaskApp.on("include:taskDetails", function(options) {
    var taskDetailView = new ReachActivityTaskApp.ActivitiesTasks.Tasks.List.TaskDetailView({
      model: options.task,
      parentRegion: options.aRegion,
      task: options.task
    });
    options.aRegion.show(taskDetailView);

    ReachActivityTaskApp.trigger("taskComments:list", options);
  });

  ReachActivityTaskApp.on("taskComments:list", function(options) {
    API.fetchTaskComments(options.task);
  });

  ReachActivityTaskApp.on("load-more-tasks:list", function(offset) {
    return API.fetchMoreTasks(offset);
  });

  ReachActivityTaskApp.commands.setHandler("orderList:include:tasks", function () {
    Tasks.taskLayout = new Tasks.Layout();
    ReachActivityTaskApp.holdingLayout.taskListRegion.show(Tasks.taskLayout);
    ReachActivityTaskApp.trigger("tasks:list:all");
  });

}, JST);