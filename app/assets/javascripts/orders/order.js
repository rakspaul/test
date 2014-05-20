(function(Orders) {
  'use strict';

  Orders.Order = Backbone.Model.extend({
    defaults: {
      start_date: moment().add('days', 1).format("YYYY-MM-DD"),
      end_date: moment().add('days', 15).format("YYYY-MM-DD")
    },

    url: function() {
      if(this.isNew()) {
        return '/orders';
      } else {
        return '/orders/' + this.id + '.json';
      }
    },

    select: function() {
      this.set({selected: true});
    },

    unselect: function() {
      this.set({selected: false});
    },

    toJSON: function() {
      return { order: _.clone(this.attributes) };
    }
  });

  Orders.OrderList = Backbone.Collection.extend({
    model: Orders.Order,
    url: '/orders/search.json'
  });

  Orders.ListItemView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/order_list_item'],
    className: 'order',
    triggers: {
      'click': 'selected'
    }
  });

  Orders.Note = Backbone.Model.extend({
    url: function() {
      if(this.isNew()) {
        return '/orders/' + this.order.id + '/notes';
      }
    },

    setOrder: function(order) {
      this.order = order;
    },

    toJSON: function() {
      return _.clone(this.attributes);
    }
  });

  Orders.NoteList = Backbone.Collection.extend({
    url: function() {
      return '/orders/' + this.order.id + '/notes.json';
    },

    model: Orders.Note,

    setOrder: function(order) {
      this.order = order;
    },

  });

  Orders.EmptyView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/order_search_empty'],
    className: 'no-order-found'
  });

  //Orders.DetailView = Backbone.Marionette.ItemView.extend({
  Orders.DetailView = Orders.BasicDetailView.extend({
    template: JST['templates/orders/order_details'],
    className: 'order-details',

    ui: {
      revised_io_fileupload: '#revised_io_fileupload',
      creatives_fileupload: '#creatives_fileupload'
    },

    initialize: function() {
      _.bindAll(this, '_uploadStarted', '_uploadSuccess', '_uploadFailed');
    },

    events: {
      'click .toggle-general-info-button': '_toggleGeneralInfo'
    },

    triggers: {
      'click .edit-action':'order:edit',
      'click .export-order':'order:export'
    },

    _hideAllDialogs: function(e) {
      $('.revised-dialog').hide();
    },

    onRender: function() {
      // if order is not yet persisted then hide 'Creatives TXT' button
      if (this.model.id == null) {
        $(this.$el.find('.creatives-txt-uploader')[0]).remove();
      }
      $('#order_layout').click(this._hideAllDialogs);
    },

    onDomRefresh: function() {
      var self = this;

      this.ui.revised_io_fileupload.fileupload({
        dataType: 'json',
        url: '/io_import.json',
        formData: {current_order_id: self.model.get('id')},
        dropZone: this.ui.io_fileupload,
        pasteZone: null,
        start: this._uploadStarted,
        done: this._uploadSuccess,
        fail: this._uploadFailed
      });

      this.ui.creatives_fileupload.fileupload({
        dataType: 'json',
        formData: { order_id: self.model.id },
        url: '/creatives_import.json',
        dropZone: this.ui.creatives_fileupload,
        pasteZone: null,
        start: this._uploadStarted,
        disabled: true,
        done: function(e, data) { self._importCreativesCallback(e, data) },
        fail: function(e, data) { self._importCreativesCallback(e, data) }
      });

      // IE double click fix
      if (navigator.userAgent.indexOf("MSIE") > 0 && this.ui.creatives_fileupload) {
        this.ui.creatives_fileupload.bind('mousedown',function(event) {
          if (document.createEvent) {
            var e = document.createEvent('MouseEvents');
            e.initEvent('click', true, true);
            $(this).get(0).dispatchEvent(e);
          } else {
            $(this).trigger("click");
          }
        });
      }
    },

    _uploadStarted: function(e) {
      //this.ui.upload_status.removeClass('alert alert-error');
      //this.ui.upload_status.addClass('alert');
      //this.ui.upload_status.html("<strong>Uploading</strong>");
    },

    _uploadSuccess: function(e, data) {
      //this.ui.upload_status.html("<h4>Successfully uploaded.</h4>");
      var orderModel = new Orders.Order(data.result.order);
      var lineItems  = new ReachUI.LineItems.LineItemList(data.result.lineitems);
      _.each(lineItems.models, function(li, index) {
        li.set('creatives', new ReachUI.Creatives.CreativesList(data.result.lineitems[index].creatives));
      });
      this.trigger('io:uploaded', orderModel, lineItems);
    },

    _uploadFailed: function(e, data) {
      alert("Error processing IO");
      var resp = data.jqXHR.responseJSON,
        messages = [];

      messages.push("<strong>Error processing IO.</strong>");
      messages.push("<ul>");
      if(resp) {
        for(var error in resp.errors) {
          _.each(resp.errors[error], function(msg) {
            messages.push("<li>");
            messages.push(error + " : " + msg);
            messages.push("</li>");
          });
        }
      } else {
        messages.push(data.jqXHR.responseText);
      }
      messages.push("</ul>");
      //this.ui.upload_status.html(messages.join(""));
      //this.ui.upload_status.addClass('alert alert-error');
    },

    _toggleGeneralInfo: function() {
      $('.general-info-container .columns').slideToggle({
        complete: function() {
          var general_info_visible = ($(this).css('display') == 'block');
          $('.toggle-general-info-button').html(general_info_visible ? '^ Hide General Information ^' : 'v Show General Information v');
        }
      });
    },
 
    _reloadPage: function() {
      window.location.href = window.location.href;
    },

    _importCreativesCallback: function(e, data) {
      var self = this;
      $('#import-creatives-dialog').modal('show');
      $('#import-creatives-dialog').on('hidden.bs.modal', function (e) {
        self._reloadPage();
      });


      var resp = data.jqXHR.responseJSON,
        messages = [];

      if(resp.errors.length == 0) {
        messages.push("<h4>All Creatives were imported successfully.</h4>");
      } else {
        messages.push("<h4>" + resp.errors.pop().error + "</h4>");
        messages.push("<ul>");
        if(resp) {      
          _.each(resp.errors, function(msg) {
            messages.push("<li>" + msg.error + "</li>");
          });
        } else {
          messages.push(data.jqXHR.responseText);
        }
        messages.push("</ul>");
      }

      if(resp.imported_creatives.length > 0) {
        var creatives_grouped_by_li_id = _.groupBy(resp.imported_creatives, function(creative){ 
          return creative['io_lineitem_id']; 
        });

        _.each(creatives_grouped_by_li_id, function(li_creatives, li_id) {
          var current_li, current_li_view;

          _.each(self.li_view.children._views, function(li_view, li_key) {
            if(li_id == li_view.model.id) {
              current_li_view = li_view;
              current_li = li_view.model;
            }
          });

          $('.lineitem-'+li_id+' .creatives-container .creative').remove();
          var new_creatives = [];
          _.each(li_creatives, function(li_creative) {
            var creative = new ReachUI.Creatives.Creative(li_creative);
            new_creatives.push(creative);
          });

          current_li.set('creatives', new ReachUI.Creatives.CreativesList(new_creatives));

          current_li_view.renderCreatives();
        });
      }

      $('#import-creatives-dialog .modal-body p').html(messages.join(""));
    },

    setLineItemView: function(li_view) {
      this.li_view = li_view;
      this.ui.creatives_fileupload.fileupload('enable');
      this.ui.creatives_fileupload.removeAttr('disabled');
    }
  });

  Orders.ListView = Backbone.Marionette.CollectionView.extend({
    itemView: Orders.ListItemView,
    emptyView: Orders.EmptyView,

    initialize: function() {
      this.listenTo(this.collection, 'change:selected', this.onModelSelected);
    },

    onBeforeItemAdded: function(itemView) {
      // This will make sure emptyView don't get style change
      if(itemView.model.id) {
        var cls = itemView.model.get('active') ? 'active-order' : 'inactive-order';
        itemView.$el.addClass(cls);
      }
    },

    onModelSelected: function(model, selected) {
      var view = this.children.findByModel(model);
      if(selected) {
        if(this.selectedView) {
          this.selectedView.model.unselect();
        }
        this.selectedView = view;
        view.$el.addClass("order-selected");
      } else {
        view.$el.removeClass("order-selected");
      }
    },

    // This method is only overriden to append newly created order at top.
    appendHtml: function(collectionView, itemView, index) {
      if(index === 0) {
        collectionView.$el.prepend(itemView.el);
      } else {
        collectionView.$el.append(itemView.el);
      }
    }
  });

  ReachUI.Orders.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details .content"
  });

  Orders.OrderDetailLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/orders/order_detail_layout'],

    regions: {
      top: ".top-region",
      bottom: ".bottom-region"
    }
  });

  Orders.UploadView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/upload_order'],

    ui: {
      io_fileupload: '#io_fileupload',
      upload_io_region: '.upload-io-region',
      drop_region: '.drop-region',
      upload_status: '.upload-status'
    },

    initialize: function() {
      _.bindAll(this, '_uploadStarted', '_uploadSuccess', '_uploadFailed');
    },

    onDomRefresh: function() {
      this.ui.io_fileupload.fileupload({
        dataType: 'json',
        url: '/io_import.json',
        dropZone: this.ui.drop_region,
        pasteZone: null,
        start: this._uploadStarted,
        done: this._uploadSuccess,
        fail: this._uploadFailed
      });

      // IE double click fix
      if (navigator.userAgent.indexOf("MSIE") > 0 && this.ui.io_fileupload) {
        this.ui.io_fileupload.bind('mousedown',function(event) {
          if (document.createEvent) {
            var e = document.createEvent('MouseEvents');
            e.initEvent('click', true, true);
            $(this).get(0).dispatchEvent(e);
          } else {
            $(this).trigger("click");
          }
        });
      }
    },

    _uploadStarted: function(e) {
      this.ui.upload_status.removeClass('alert alert-error');
      this.ui.upload_status.addClass('alert');
      this.ui.upload_status.html("<strong>Uploading</strong>");
    },

    _uploadSuccess: function(e, data) {
      this.ui.upload_status.html("<h4>Successfully uploaded.</h4>");
      var orderModel = new Orders.Order(data.result.order);
      var lineItems  = new ReachUI.LineItems.LineItemList(data.result.lineitems);
      _.each(lineItems.models, function(li, index) {
        li.set('creatives', new ReachUI.Creatives.CreativesList(data.result.lineitems[index].creatives));
      });
      this.trigger('io:uploaded', orderModel, lineItems);
    },

    _uploadFailed: function(e, data) {
      alert("Error processing IO");
      var resp = data.jqXHR.responseJSON,
        messages = [];

      messages.push("<strong>Error processing IO.</strong>");
      messages.push("<ul>");
      if(resp) {
        for(var error in resp.errors) {
          _.each(resp.errors[error], function(msg) {
            messages.push("<li>");
            messages.push(error + " : " + msg);
            messages.push("</li>");
          });
        }
      } else {
        messages.push(data.jqXHR.responseText);
      }
      messages.push("</ul>");
      this.ui.upload_status.html(messages.join(""));
      this.ui.upload_status.addClass('alert alert-error');
    }
  });

  /*    Activity logs region and views */
  ReachUI.Orders.ActivityTaskLayout = Backbone.Marionette.Layout.extend({
      template: JST['templates/orders/activity_task_layout'],

      regions: {
          activities: ".activities-region",
          tasks: ".tasks-region"
      }
  });

  ReachUI.Orders.ActivityView = Backbone.Marionette.ItemView.extend({
      tagName: 'div',
      className: 'note-container',
      template: JST['templates/orders/activity_log_item']
  });
  
  ReachUI.Orders.ActivityListView = Backbone.Marionette.CompositeView.extend({
	  template: JST['templates/orders/activity_log_list'],
  	  itemView: ReachUI.Orders.ActivityView,
      itemViewContainer: 'div.activities-list',

      initialize: function(){
         this.originalCollection = this.collection.clone();
         this.isLoadMoreDone = false;
         this.maxId = 7;
      },

      ui: {
          activity_attachment: '#saveAttachment',
          activity_input: '#activity_input',
          task_types_selector: '#task-types-selector',
          task_assignee_selector: '#task-assignee-selector'
      },

      events: {
          'click #loadMoreBtn': 'loadMore',
          'click #loadLessBtn': 'loadLess',
          'click #loadNormalBtn': 'loadNormal',

          'click #btnSaveAlert': 'saveAlertActivity',
          'click #btnSaveComment': 'saveCommentActivity',
          'click #btnSaveAttachment': 'saveAttachment',

          'click #btnFilterComment': 'filterComments',
          'click #btnFilterAlert': 'filterAlerts',

          'change #activity_input': 'activityInputChange',

          'click #btnShowTaskForm': 'showHideTaskForm',

          'click #saveTask': 'saveTask',

        'change #task-types-selector': 'onTaskTypeChanged'
      },

      loadNormal: function(){
          this.collection =  this.originalCollection.clone();
          this.loadLess();
      },

      loadLess: function() {
          //load first 6 items.
          var listLength = this.collection.length;
          while(listLength>5){
              this.collection.remove(this.collection.at(this.collection.length-1));
              listLength = this.collection.length;
          }
          this.render();
          this.$el.find('#loadMoreBtn').show();
          this.$el.find('#loadLessBtn').hide();
      },

      loadMore: function() {
          if(!this.isLoadMoreDone){
              var id = this._getMaxIndex();
              //alert("load more btn clicked.");
              var activity1 = new ReachUI.Orders.Activity();
              activity1.set({id:id++,activity:"note2",created_at:moment().format("YYYY-MM-DD")});


              var activity2 = new ReachUI.Orders.Activity();
              activity2.set({id:id++,activity:"note3",created_at:moment().format("YYYY-MM-DD")});


              var activity3 = new ReachUI.Orders.Activity();
              activity3.set({id:id++,activity:"note4",created_at:moment().format("YYYY-MM-DD")});

              var activity4 = new ReachUI.Orders.Activity();
              activity4.set({id:id++,activity:"note5",created_at:moment().format("YYYY-MM-DD")});


              this.originalCollection.add(activity1);
              this.originalCollection.add(activity2);
              this.originalCollection.add(activity3);
              this.originalCollection.add(activity4);
              this.isLoadMoreDone = true;
          }

          this.collection = this.originalCollection.clone();
          this.render();

          this.$el.find('#loadMoreBtn').hide();
          this.$el.find('#loadLessBtn').show();
      },

      filterComments: function(){
          //alert(JSON.stringify(this.originalCollection));

          var virtualCollection = new Backbone.VirtualCollection(this.originalCollection, {
              filter: function (activity) {
                  return activity.get('type') === 'user-comment';
              }
          });

          this.collection = virtualCollection;
          this.render();

          this.$el.find('#loadMoreBtn').hide();
          this.$el.find('#loadLessBtn').hide();
          this.$el.find('#loadNormalBtn').show();
      },

      filterAlerts: function(){
          var virtual_collection = new Backbone.VirtualCollection(this.originalCollection, {
              filter: function (activity) {
                  return activity.get('type') === 'task-alert';
              }
          });

          this.collection = virtual_collection;
          this.render();

          this.$el.find('#loadMoreBtn').hide();
          this.$el.find('#loadLessBtn').hide();
          this.$el.find('#loadNormalBtn').show();
      },

      saveTask: function(){
          if(this.ui.activity_input.val().trim() == "") {
              return;
          }

//          var maxIndex = this._getMaxIndex();
          var maxIndex = this.maxId++;
          //In save task we suppose to create two comments. One system generated and another task comment
          var prop1 = {
              id : this.maxId++,
              activity: this.ui.activity_input.val().trim().replace(/\n/gm, "<br/>"),
              created_at: moment(this.$el.find('#due-date').val()).format("YYYY-MM-DD"),
              created_by: window.current_user_name,
              task_name: this.ui.task_types_selector.val(),
              assignee: this.ui.task_assignee_selector.val(),
              type:"task-comment"
          }

          var prop2 = {
              id : this.maxId++,
              activity: window.current_user_name+ " created a task",
              created_at: moment(this.$el.find('#due-date').val()).format("YYYY-MM-DD"),
              created_by: "",
              type:"system-comment"
          }

          var system_comment = new ReachUI.Orders.Activity(prop2);
          system_comment.setOrder(this.order);
          this.collection.unshift(system_comment);
          this.originalCollection.unshift(system_comment);
          this.collection.remove(this.collection.at(this.collection.length-1));

          var task = new ReachUI.Orders.Activity(prop1);
          task.setOrder(this.order);
          this.collection.unshift(task);
          this.originalCollection.unshift(task);
          this.collection.remove(this.collection.at(this.collection.length-1));
          this.render();
      },

      showHideTaskForm: function(){
          $(function() {
              $( "#due-date" ).datepicker();
          });
          this.$el.find('#task_form').toggle();
      },

      saveAttachment: function(){

      },

      activityInputChange: function(){

      },

      saveAlertActivity: function(){
//          var maxIndex = this._getMaxIndex();
          if(this.ui.activity_input.val().trim() == "") {
              return;
          }

          var prop = {
              id : this.maxId++,
              activity: this.ui.activity_input.val().trim().replace(/\n/gm, "<br/>"),
//              created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
              created_at: moment().format("YYYY-MM-DD"),
              created_by: window.current_user_name,
              type:"task-alert"
          }

          var add = new ReachUI.Orders.Activity(prop);
          add.setOrder(this.order);
          this.collection.unshift(add);
          this.originalCollection.unshift(add);
          this.collection.remove(this.collection.at(this.collection.length-1));
          this.render();
      },

      saveCommentActivity: function(){
//          var maxIndex = this._getMaxIndex();
          if(this.ui.activity_input.val().trim() == "") {
              return;
          }
          var prop = {
              id : this.maxId++,
              activity: this.ui.activity_input.val().trim().replace(/\n/gm, "<br/>"),
//              created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
              created_at: moment().format("YYYY-MM-DD"),
              created_by: window.current_user_name,
              type:"user-comment"
          }

          var add = new ReachUI.Orders.Activity(prop);
          add.setOrder(this.order);
          this.collection.unshift(add);
          this.originalCollection.unshift(add);
          this.collection.remove(this.collection.at(this.collection.length-1));
          this.render();
          //this.model.save(prop, {success: this._onSaveActivity, error: this._onSaveFailure})
      },

      _getMaxIndex: function(){
          var maxIndex = 0;
          for(var i=0;i<this.originalCollection.length;i++){
              var item = this.originalCollection.at(i);
              if(item.id>maxIndex){
                  maxIndex = item.id;
              }
          }
          return maxIndex;
      },

    onTaskTypeChanged: function(e) {
      var $sel = $(e.target);
      if ($sel.val() == 'pixel_request') {
        $("#pixel-request-subform").show();
      } else {
        $("#pixel-request-subform").hide();
      }
    }

  });

  ReachUI.Orders.NotesRegion = Backbone.Marionette.Region.extend({
    el: "#order-notes"
  });

  ReachUI.Orders.NoteView = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    className: 'note-container',
    template: JST['templates/orders/note_list_item']
  });

  ReachUI.Orders.NoteListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/orders/note_list'],
    itemView: ReachUI.Orders.NoteView,

    events: {
      'click #btnSave' : 'saveNote',
      'click .notify-users-switch' : 'toggleNotifyUsersDialog',
      'click .add-user-to-notify-list, .add-user-to-notify-list-btn' : 'showAddUsersSelectBox',
      'click .close-users-notify-list, .close-users-notify-list-btn': 'hideAddUsersSelectBox',
      'change .users-to-notify div.typeahead-container textarea': 'onChangeEmailsList'
    },

    ui: {
      note_input: '#note_input'
    },

    initialize: function() {
      _.bindAll(this, '_onSaveSuccess', '_onSaveFailure');
      this.notify_users_dialog_active = false;
      this.selected_users = this.defaultUsersToNotify();
      EventsBus.bind('lineitem:logRevision', this.logRevision, this);
    },

    logRevision: function(text) {
      this._saveNote(text);
    },

    displayNotifyUsersList: function() {
      var items = [];
      for (var i = 0; i < this.selected_users.length; i++) {
        items.push(this.selected_users[i]);
      }
      this.$el.find('.notify-users-list .notify-by-email').html('Notify by email: ' + items.join(', '));
    },

    onChangeEmailsList: function(e) {
      var emails = e.currentTarget.value.split(/\r\n|\r|\n|,/mi);
      this.selected_users = _.collect(emails, function(el) { return el.trim() } );
    },

    showAddUsersSelectBox: function() {
      $('#add-users-notifications-dialog').modal('show');
  
      var self = this;
      this.$el.find('.users-to-notify div.typeahead-container').show();
      this.$el.find('.users-to-notify div.typeahead-container div.select2-container').show();
      this.$el.find('.add-user-to-notify-list, .add-user-to-notify-list-btn').hide();
      this.$el.find('.close-users-notify-list, .close-users-notify-list-btn').show();

      this.displayNotifyUsersList();
    },

    hideAddUsersSelectBox: function() {
      this.$el.find('.add-user-to-notify-list, .add-user-to-notify-list-btn').show();
      this.$el.find('.close-users-notify-list, .close-users-notify-list-btn').hide();
      this.$el.find('.users-to-notify div.typeahead-container').hide();
      $('.notify-users-list .notify-by-email').html("Notify by email: " + this.selected_users.join(', '));
    },

    onRender: function() {
      var self = this;

      this.$el.find('textarea#note_input').autosize();

      this.displayNotifyUsersList();

      this.$el.find('.users-to-notify .typeahead-container input').val(this.defaultUsersToNotify().join(','));

      if(this.notify_users_dialog_active) {
        this.$el.find('.notify-users-switch').attr('checked', 'checked');
      }

      this.$el.find('.users-to-notify .typeahead-container input').select2({
        tags: true,
        tokenSeparators: [",", " "],
        initSelection: function (element, callback) {
          var data = [];
          $(element.val().split(',')).each(function () {
            data.push({id: this, text: this});
          });
          callback(data);
        },
        createSearchChoice: function(term) {
          return { id: term, text: term }
        },
        ajax: {
          url: "/users/search",
          dataType: "json",
          data: function(term, page) {
            return {
              search: term
            };
          },
          results: function(data, page) {
            return {
              results: _.map(data, function(result) {
                return { id: result.email, text: result.name+' <'+result.email+'>' }
              })
            }
          }
        }
      });

      this.$el.find('.users-to-notify .typeahead-container input').on("change", function(e)  {
        self.selected_users = e.currentTarget.value.split(',');
        self.displayNotifyUsersList();
      });
    },

    onDomRefresh: function() {
      //TODO remove self
      var self = this;

      $('.notify-users-list .notify-by-email').html("Notify by email: " + self.selected_users.join(', '));
    },

    appendHtml: function(collectionView, itemView){
      collectionView.$("div.notes-list").append(itemView.el);
    },

    toggleNotifyUsersDialog: function() {
      this.notify_users_dialog_active = !this.notify_users_dialog_active;
      var color = this.notify_users_dialog_active ? 'black' : 'grey';
      this.$el.find('.notify-users-list').css({'color': color});

      if(this.notify_users_dialog_active) {
        this.showAddUsersSelectBox();
      } else {
        this.hideAddUsersSelectBox();
      }
    },

    _saveNote: function(text) {
      var prop = {
        note: text,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        sent: this.notify_users_dialog_active,
        username: window.current_user_name,
        notify_users: (this.notify_users_dialog_active ? this.selected_users : null)
      }

      this.model = new ReachUI.Orders.Note(prop);
      this.model.setOrder(this.options.order);
      this.collection.unshift(this.model);

      this.options.order.set('notes', this.collection);
      this.render();
      //this.$el.find('.save-note-btn').addClass('spinner');
      //this.model.save(prop, {success: this._onSaveSuccess, error: this._onSaveFailure})
    },

    saveNote: function(event) {
      if(this.ui.note_input.val().trim() == "") {
        return;
      }

      if(this.options.order.id == null) {
        alert("The order is not persisted yet, so the note couldn't be added");
        return;
      }

      var text = this.ui.note_input.val().trim().replace(/\n/gm, "<br/>");
      this._saveNote(text);
    },

    defaultUsersToNotify: function() {
      var default_values = [];
      if(window.current_trafficker_email)
        default_values.push(window.current_trafficker_email);
      if(window.current_am_email)
        default_values.push(window.current_am_email);

      return default_values;
    },

    _onSaveSuccess: function(event) {
      this.ui.note_input.val('');

      this.selected_users = this.defaultUsersToNotify();
      this.$el.find('.save-note-btn').removeClass('spinner');
      this.render();
      this.showAddUsersSelectBox();
    },

    _onSaveFailure: function() {

    }
  });

  /*ReachUI.Orders.TasksRegion = Backbone.Marionette.Region.extend({
    el: "#order-tasks"
  });*/

  Orders.Task = Backbone.Model.extend({
    url: function() {
      if(this.isNew()) {
        return '/orders/' + this.order.id + '/tasks.json';
      }
	},

    setOrder: function(order) {
      this.order = order;
    },

    toJSON: function() {
      return _.clone(this.attributes);
    }
  });

  Orders.TaskList = Backbone.Collection.extend({
    url: function() {
      return '/orders/' + this.order.id + '/tasks.json';
    },

    model: Orders.Task,

    setOrder: function(order) {
      this.order = order;
    }

  });

  Orders.TaskComment = Backbone.Model.extend({
    url: function() {
      return '/tasks/' + this.task.id + (this.isNew() ? '/add_comment.json' : '/update_comment.json');
    },

    setTask: function(task) {
      this.task = task;
    },

    toJSON: function() {
      return _.clone(this.attributes);
    }
  });

  Orders.TaskCommentList = Backbone.Collection.extend({
    url: function() {
      return '/tasks/' + this.task.id + '/comments.json';
    },

    model: Orders.TaskComment,

    setTask: function(task) {
      this.task = task;
    }
  });

  Orders.TaskCommentView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/task_comment_item'],

    className: 'task-comment-container',

    model: Orders.TaskComment
  });

  Orders.TaskCommentListEmptyView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/task_comment_list_empty'],

    className: 'no-tasks-comments-found'
  });

  Orders.TaskCommentListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/orders/task_comment_list'],

    itemView: Orders.TaskCommentView,

    emptyView: Orders.TaskCommentListEmptyView,

    itemViewContainer: 'div.task-comments',

    ui: {
      taskComment: '#task_comment_input',
      btnSaveTaskComment: "#btnSaveTaskComment"
    },

    events: {
      'click #btnSaveTaskComment': 'saveTaskComment'
    },

  saveTaskComment: function() {
      var self = this;

      console.log('Save task button');

      if(this.ui.taskComment.val().trim() == "") {
        return;
      }

      var prop = {
        text: this.ui.taskComment.val().trim().replace(/\n/gm, "<br/>"),
        created_at: moment().format("YYYY-MM-DD"),
        created_by: window.current_user_name
      };
      var model = new ReachUI.Orders.TaskComment(prop);
      model.setTask(this.options.task);

      this.collection.unshift(model);

      this.options.task.set('task_comments', this.collection);
      this.ui.btnSaveTaskComment.addClass('spinner');
      model.save(prop, {
        success: function() {
          self.ui.taskComment.val('');
          self.render();
        },
        error: function() {
          self.$el.find('.save-task-comment-btn').removeClass('spinner');
        }
      });
    }
  });

  Orders.TaskDetailRegion = Backbone.Marionette.Region.extend({
    el: '.task-details-table'
  });

  Orders.TaskCommentRegion = Backbone.Marionette.Region.extend({
    el: '.task-comments-container'
  });

  Orders.TaskDetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/task_detail'],

    model: Orders.Task,

    events: {
      'click .task-detail-view-close' : '_closeTaskDetailView'
    },

    _closeTaskDetailView: function() {
      this.close();
    },

    onShow: function() {
      this.$el.parent().parent().find('.activities-table').hide();
      this.$el.addClass('task-selected');
    },

    onClose: function() {
      this.$el.parent().parent().find('.activities-table').show();
      if(this.model.collection.selectedTask) {
        this.model.collection.selectedTask.$el.removeClass('task-selected');
      }
    }
  });

  Orders.TaskListItemView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/task_list_item'],
    className: 'task-container',

    events: {
      'click' : 'showTaskDetailView'
    },

    showTaskDetailView: function() {
      var taskDetailView = new Orders.TaskDetailView({model: this.model});
      var taskDetailRegion = new Orders.TaskDetailRegion();
      taskDetailRegion.show(taskDetailView);

      var taskCommentRegion = new Orders.TaskCommentRegion();
      var self = this;
      this._fetchTaskComments(this.model).then(function(taskComments) {
        taskCommentRegion.show(new Orders.TaskCommentListView({collection: taskComments, task: self.model}));
      });

      if(this.model.collection.selectedTask) {
        this.model.collection.selectedTask.$el.removeClass('task-selected');
      }

      this.model.collection.selectedTask = this;
      this.$el.addClass('task-selected');
    },

    _fetchTaskComments: function(task) {
      var taskCommentList = new Orders.TaskCommentList();
      taskCommentList.setTask(task);
      var self = this;
      return taskCommentList.fetch().then(
        function(collection, response, options) {
          return taskCommentList;
        },
        function(model, response, options) {
          console.log('Error getting task comments: ' + response);
        }
      );
    }
  });

  Orders.TaskListEmptyView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/task_list_empty'],
    className: 'no-task-found'
  });

  Orders.TaskListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/orders/task_list'],

    itemView: Orders.TaskListItemView,

    emptyView: Orders.TaskListEmptyView,

    initialize: function() {
    }
  });

})(ReachUI.namespace("Orders"));
