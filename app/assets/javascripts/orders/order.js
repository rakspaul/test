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

  Orders.DetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/order_details'],
    className: 'order-details',

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

    events: {
      'click .toggle-general-info-button': '_toggleGeneralInfo',
      'click .import-creatives-border a': '_reloadPage'
    },

    triggers: {
      'click .edit-action':'order:edit',
      'click .export-order':'order:export'
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
      if (navigator.userAgent.indexOf("MSIE") > 0) {
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
      note_input: '#note_input',
      creatives_fileupload: '#creatives_fileupload'
    },

    initialize: function() {
      _.bindAll(this, '_onSaveSuccess', '_onSaveFailure');
      this.notify_users_dialog_active = false;
      this.selected_users = this.defaultUsersToNotify();
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

    _importCreativesCallback: function(e, data) {
      $('#import-creatives-dialog').modal('show');

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

      $('#import-creatives-dialog .modal-body p').html(messages.join(""));
    },

    onRender: function() {
      var self = this;

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
      var self = this;

      $('.notify-users-list .notify-by-email').html("Notify by email: " + self.selected_users.join(', '));

      this.ui.creatives_fileupload.fileupload({
        dataType: 'json',
        formData: {order_id: self.options.order.id},
        url: '/creatives_import.json',
        dropZone: this.ui.creatives_fileupload,
        pasteZone: null,
        start: this._uploadStarted,
        done: this._importCreativesCallback,
        fail: this._importCreativesCallback
      });

      // IE double click fix
      if (navigator.userAgent.indexOf("MSIE") > 0) {
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

    saveNote: function(event) {
      if(this.ui.note_input.val().trim() == "") {
        return;
      }

      if(this.options.order.id == null) {
        alert("The order is not persisted yet, so the note couldn't be added");
        return;
      }

      var prop = {
        note: this.ui.note_input.val().trim(),
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        sent: this.notify_users_dialog_active,
        username: window.current_user_name,
        notify_users: (this.notify_users_dialog_active ? this.selected_users : null)
      }

      this.model = new ReachUI.Orders.Note(prop);
      this.model.setOrder(this.options.order);
      this.collection.unshift(this.model);

      this.options.order.set('notes', this.collection);
      this.$el.find('.save-note-btn').addClass('spinner');
      this.model.save(prop, {success: this._onSaveSuccess, error: this._onSaveFailure})
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

})(ReachUI.namespace("Orders"));
