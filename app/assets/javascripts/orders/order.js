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
      'keypress #note_input' : 'saveNote',
      'click #btnSave' : 'saveNote',
      'click .notify-users-switch' : 'toggleNotifyUsersDialog',
      'click .add-user-to-notify-list' : 'showAddUsersSelectBox'
    },

    ui: {
      note_input: '#note_input',
      creatives_fileupload: '#creatives_fileupload'
    },

    initialize: function() {
      _.bindAll(this, '_onSaveSuccess', '_onSaveFailure');
      this.notify_users_dialog_active = false;
      this.user_ids = [];
      this.user_names = [];
    },

    showAddUsersSelectBox: function() {
      $('#add-users-notifications-dialog').modal('show');

      var self = this;

      this.$el.find('.users-to-notify div.typeahead-container').show().html('<input autocomplete="off"/>');
      this.$el.find('.users-to-notify div.typeahead-container input').typeahead({
        name: 'user-names',
        remote: '/users/search.json?search_by=name&search=%QUERY',
        valueKey: 'name',
        limit: 20
      }).on('typeahead:selected', function(ev, el) {
        self.$el.find('.users-to-notify div.typeahead-container').hide();
        //self.$el.find('.users-to-notify div.typeahead-container input').hide();
        self.user_ids.push(el.id);
        self.user_names.push(el.name);
        self.$el.find('.users-to-notify em').html(self.user_names.join(', '));      
      });
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

    onDomRefresh: function() {
      var self = this;
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
    },

    saveNote: function(event) {
      if (event.type === 'keypress' && event.keyCode != 13) {
        return;
      }

      if(this.ui.note_input.val().trim() == "") {
        return;
      }

      var prop = {
        note: this.ui.note_input.val().trim(),
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        username: window.current_user_name,
        notify_users: this.user_ids
      }

      this.model = new ReachUI.Orders.Note(prop);
      this.model.setOrder(this.options.order);
      this.collection.unshift(this.model);

      this.options.order.set('notes', this.collection);
      this.$el.find('.save-note-btn').addClass('spinner');
      this.model.save(prop, {success: this._onSaveSuccess, error: this._onSaveFailure})
    },

    _onSaveSuccess: function(event) {
      this.ui.note_input.val('');
      this.user_ids = [];
      this.user_names = [];
      this.$el.find('.save-note-btn').removeClass('spinner');
      this.render();
    },

    _onSaveFailure: function() {

    }

  });

})(ReachUI.namespace("Orders"));
