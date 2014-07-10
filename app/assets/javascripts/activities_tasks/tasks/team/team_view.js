ReachActivityTaskApp.module("ActivitiesTasks.Tasks.Team", function (Team, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  Team.TaskView = Marionette.ItemView.extend({
    tagName: 'div',
    template: JST['templates/team/task_list_item'],
    className: 'task-container',

    ui: {
      taskAssigneeSelector: '#assigneeSelector'
    },

    events: {
      'click .order-name': 'onOrderNameClick',
      'change #assigneeSelector': 'setAssignee'
    },

    onDomRefresh: function() {
      var self = this;
      $('.' + this.model.get('id') + '-order-name .typeahead').editable({
        source: '/orders/search.json',
        typeahead: {
          minLength: 2,
          remote: '/orders/search.json?search=%QUERY',
          valueKey: 'name'
        },
        success: function(response, newValue) {
          self.model.save({order_id: self.model.get('order_id')}, {
            error: function() {
              console.log('task type update failed!')
            },
            patch: true});
        }

      });
      $('.' + this.model.get('id') + '-order-name').on('typeahead:selected', function(event, el) {
        self.model.set('order_id', el.id);
        self.model.set('order_name', el.name);
      });
    },

    onRender: function() {
      // Selectize the task-assignee-selector
      this.assigneeSelector = this.ui.taskAssigneeSelector.selectize({
        valueField: 'id',
        labelField: 'name',
        searchField: 'name',
        sortField: 'group',
        optgroups: [
          { value: 'team', label: 'Default Team' },
          { value: 'team_users', label: 'Team Members' },
          { value: 'users_all', label: 'Users' },
          { value: 'default_user', label: 'Default User' }
        ],
        optgroupField: 'group',
        create: false,
        load: function(query, callback) {
          if (!query.length) return callback();
          $.ajax({
            url: '/users/search.js',
            type: 'GET',
            dataType: 'jsonp',
            data: {
              search: query,
              search_by: 'name'
            },
            error: function () {
              callback();
            },
            success: function (res) {
              var allUsers = [];

              if (res !== 'undefined') {
                for (var i = 0; i < res.length; i++) {
                  allUsers.push({ group: 'users_all', id: res[i].id, name: res[i].name });
                }
              }

              callback(allUsers);
            }
          });
        }
      });
    },

    serializeData: function(data) {
          return _.extend(this.model.toJSON(), {context: this.model.collection.context});
      },


    setAssignee: function() {
      var assigneeList = this.assigneeSelector[0].selectize;
      var currentAssigneeId = parseInt(assigneeList.getValue());

      // Dont do anything if val is NaN
      if (isNaN(currentAssigneeId)) {
        return;
      }

      this.model.set('assignable_id', currentAssigneeId);

      var selectedOption = _.findWhere(assigneeList.options, {id: currentAssigneeId});
      var assigneeType = selectedOption && selectedOption.group == 'team' ? 'Team' : 'User';
      this.model.set('assignable_type', assigneeType);

      this.model.save({assignable_id: currentAssigneeId, assignable_type: assigneeType}, {
        error: function() {
          console.log('task type update failed!')
        },
        patch: true});
    },

    onOrderNameClick: function() {
      console.log('onOrderNameClick clicked');
    }
  });

    Team.TaskListView = Marionette.CollectionView.extend({
        tagName: 'div',
        itemView: Team.TaskView,
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
                collectionView.$el.append(itemView.el);
            }
        }
    });


  Team.UserTasksLayout = ReachActivityTaskApp.ActivitiesTasks.Tasks.Layout.extend({
    template: JST['templates/team/user_task_list'],

    regions: {
      tasksListRegion: ".tasks-list",
      userHeaderRegion: ".user-header"
    }
  });
});
