/*
    List module is responsible for rendering composite view of activities.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){

    // TODO: Prepare separate item views for corresponding activity type as their view representation is different.
    List.Activity = Marionette.ItemView.extend({
        tagName: 'div',
        template: JST['templates/activities_tasks/activities/activity_log_item']
    });

    // Represents composite view.
    List.Activities = Marionette.CompositeView.extend({
        itemViewContainer: 'div.activities-list',
        template: JST['templates/activities_tasks/activities/activity_log_list'],
        itemView: List.Activity,

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