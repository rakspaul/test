/*
 List module is responsible for rendering composite view of activities.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.List", function (List, ReachActivityTaskApp, Backbone, Marionette, $, _, JST) {

  List.Activity = Marionette.ItemView.extend({
    tagName: 'div',
    template: function (serialized_model) {
      var headerModule = ReachActivityTaskApp.ActivitiesTasks.Activities.Header,
          tplc; // compiled JS template
      console.log("Serialized Model:" + JSON.stringify(serialized_model));

      // Returning specific template for specific activity type
      // as their respective UI representation different among them
      if (serialized_model != null) {
        switch (serialized_model.activity_type) {
          case headerModule.ACTIVITY_TYPES.SYSTEM:
            tplc = JST['templates/activities_tasks/common/system_comment'];
            break;
          case headerModule.ACTIVITY_TYPES.COMMENT:
            tplc = JST['templates/activities_tasks/common/user_comment'];
            break;
          case headerModule.ACTIVITY_TYPES.ATTACHMENT:
            tplc = JST['templates/activities_tasks/common/attachment_comment'];
            break;
          case headerModule.ACTIVITY_TYPES.TASK:
            tplc = JST['templates/activities_tasks/common/task_comment'];
            break;
          default:
            tplc = JST['templates/activities_tasks/common/user_comment'];
            break;
        }
      }

      return tplc(serialized_model);
    }
  });

  // Represents composite view.
  List.Activities = Marionette.CompositeView.extend({
    itemViewContainer: 'div.activities-list',
    template: JST['templates/activities_tasks/activities/activity_log_list'],
    itemView: List.Activity,

    events:{
        "click #loadMoreBtn" : "showFullLog"
    },

    showFullLog: function(e){
        e.preventDefault();
        var header =  ReachActivityTaskApp.ActivitiesTasks.Activities.Header;
        header.Controller.fetchActivities(header.ACTIVITY_TYPES.ALL);
    },

    initialize: function () {
      this.listenTo(this.collection, "reset", function () {
        this.appendHtml = function (collectionView, itemView, index) {
          collectionView.$el.append(itemView.el);
        }
      });
    },

    onCompositeCollectionRendered: function () {
      this.appendHtml = function (collectionView, itemView, index) {
        collectionView.$el.prepend(itemView.el);
      }
    }
  });

}, JST);