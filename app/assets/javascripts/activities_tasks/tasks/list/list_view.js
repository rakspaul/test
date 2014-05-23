ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){

    List.Task = Marionette.ItemView.extend({
      tagName: 'div',
      template: JST['templates/activities_tasks/tasks/task_list_item'],
      className: 'task-container'
    });

    List.Tasks = Marionette.CollectionView.extend({
      itemView: List.Task,
      className: 'task-list-container',

      initialize: function() {
        this.listenTo(this.collection, "reset", function() {
          this.appendHtml = function(collectionView, itemView, index) {
            collectionView.$el.append(itemView.el);
          }
        });
      },

      onCompositeCollectionRendered: function() {
        this.appendHtml = function(collectionView, itemView, index) {
          collectionView.$el.prepend(itemView.el);
        }
      }
    });

}, JST);