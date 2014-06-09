ReachActivityTaskApp.module("Entities", function(Entities, ReachActivityTaskApp, Backbone, Marionette, $, _){

  Entities.Task = Backbone.Model.extend({
      defaults: {
        original_filename: null
      },

      url: function() {
      if(this.isNew()) {
        return '/orders/' + ReachActivityTaskApp.order.id + '/tasks';
      } else {
        return '/orders/' + ReachActivityTaskApp.order.id + '/tasks/' + this.get('id');
      }
    }
  });

  Entities.TaskCollection = Backbone.Collection.extend({
    url: function() {
      return '/orders/' + ReachActivityTaskApp.order.id + '/tasks.json';
    },
    model: Entities.Task
  });

  Entities.TaskType = Backbone.Model.extend({
  });

  Entities.TaskTypeCollection = Backbone.Collection.extend({
    url: function() {
      return '/orders/' + ReachActivityTaskApp.order.id + '/task_types.json'
    },

    model: Entities.TaskType
  });

  Entities.TaskComment = Backbone.Model.extend({
    defaults: {
      original_filename: null
    },

    url: function() {
      if(this.isNew()) {
        return '/tasks/' + this.task.id + '/add_comment.json';
      }
    },

    setTask: function(task) {
      this.task = task;
    }

  });

  Entities.TaskCommentList = Backbone.Collection.extend({
    url: function() {
      return '/tasks/' + this.task.id + '/comments.json';
    },

    model: Entities.TaskComment,

    setTask: function(task) {
      this.task = task;
    }
  });

  var API = {
    getTaskEntities: function(offset) {
      var tasks = new Entities.TaskCollection();

      var filter = {};
      //default filter.
      filter["limit"] = Entities.DEF_NO_OF_ROWS_TO_FETCH;
      filter["offset"] = Entities.DEF_OFFSET;

      if(offset){
        filter["offset"] = offset;
      }

      var defer = $.Deferred();
      tasks.fetch({data:$.param(filter),
        success: function(data) {
//            data=[];
          defer.resolve(data);
        },failure:function(data) {
          data=[];
          defer.resolve();
        }
      });
      return defer.promise();
    },

    saveTask: function(task) {
      if(!task) {
        return;
      }
      var defer = $.Deferred();
      task.save({
        success: function() {
          defer.resolve();
        },

        failure: function() {
          defer.resolve();
        }
      });
    },

    getTaskTypes: function() {
      var taskTypes = new Entities.TaskTypeCollection();
      var defer = $.Deferred();
      taskTypes.fetch({
        success: function(data) {
          defer.resolve(data);
        },

        failure: function() {
          defer.resolve();
        }
      });

      return defer.promise();
    },

    getTaskComments: function(task) {
      var taskComments = new Entities.TaskCommentList();
      taskComments.setTask(task);
      var defer = $.Deferred();
      taskComments.fetch({
          success: function(data) {
            defer.resolve(data);
          },
          failure: function() {
            defer.resolve();
          }
      });
      return defer.promise();
    },

    saveTaskComment: function(comment) {
      var defer = $.Deferred();
      comment.save(comment.attributes, {
        success: function() {
          var comments_count = (comment.task.get('comments_size') || 0) + 1;
          comment.task.set('comments_size', comments_count);
          defer.resolve();
        },

        failure: function() {
          defer.resolve();
        }
      });
    }
  };

  ReachActivityTaskApp.reqres.setHandler("task:entities", function(offset){
    return API.getTaskEntities(offset);
  });

  ReachActivityTaskApp.reqres.setHandler("task:save", function(task){
    return API.saveTask(task);
  });

  ReachActivityTaskApp.reqres.setHandler("taskType:entities", function() {
    return API.getTaskTypes();
  });

  ReachActivityTaskApp.reqres.setHandler("taskComment:entities", function(task) {
    return API.getTaskComments(task);
  });

  ReachActivityTaskApp.reqres.setHandler("taskComment:save", function(comment) {
    API.saveTaskComment(comment);
  });
});
