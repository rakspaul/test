/*
    List module is responsible for rendering composite view of activities.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){

    List.Activity = Marionette.ItemView.extend({
        tagName: 'div',
        template: function(serialized_model){
            var headerModule = ReachActivityTaskApp.ActivitiesTasks.Activities.Header;
            console.log("Serialized Model:"+JSON.stringify(serialized_model));
            //console.log("Type:"+headerModule.ACTIVITY_TYPES.SYSTEM+"-"+headerModule.ACTIVITY_TYPES.USER)
            //Returning specific template for specific activity type as their respective UI representation different among them.
            if(serialized_model!=null){
                var type = serialized_model.activity_type;
                if(type == headerModule.ACTIVITY_TYPES.SYSTEM)
                    return JST['templates/activities_tasks/common/system_comment'](serialized_model);
                else if(type == headerModule.ACTIVITY_TYPES.COMMENT)
                    return JST['templates/activities_tasks/common/user_comment'](serialized_model);
                else if(type == headerModule.ACTIVITY_TYPES.ATTACHMENT)
                    return JST['templates/activities_tasks/common/attachment_comment'](serialized_model);
                else if(type == headerModule.ACTIVITY_TYPES.TASK)
                    return JST['templates/activities_tasks/common/task_comment'](serialized_model);
            }
            return JST['templates/activities_tasks/common/user_comment'](serialized_model);
        }
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