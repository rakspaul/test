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

    events: {
      'click .toggle-general-info-button': '_toggleGeneralInfo'
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
        li.creatives = new ReachUI.Creatives.CreativesList(data.result.lineitems[index].creatives);
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
})(ReachUI.namespace("Orders"));
