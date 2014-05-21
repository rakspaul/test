ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){


    List.Task = Marionette.ItemView.extend({
        tagName: 'div',
        template: JST['templates/activities_tasks/tasks/task_list_item']
    });

  /*  var NoActivityView = Marionette.ItemView.extend({
        template: "#contact-list-none",
        tagName: "tr",
        className: "alert"
    }); */

    List.Tasks = Marionette.CompositeView.extend({
        template: JST['templates/activities_tasks/tasks/task_list'],
        itemView: List.Task,

        initialize: function(){
            this.listenTo(this.collection, "reset", function(){
                this.appendHtml = function(collectionView, itemView, index){
                    collectionView.$el.append(itemView.el);
                }
            });
        },

        onCompositeCollectionRendered: function(){
            this.appendHtml = function(collectionView, itemView, index){
                collectionView.$el.prepend(itemView.el);
            }
        }
    });

},JST);