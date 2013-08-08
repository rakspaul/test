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

  Orders.EditView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/edit_order'],
    className: 'edit-order-region',
    ui: {
      name: "#name",
      active: "#active",
      flight: '#flight',
      flight_container: '.flight-input',
      start_date: '#start_date',
      end_date: '#end_date',
      advertiser_id: '#advertiser_id',
      sales_person_id: '#sales_person_id',
      network_advertiser_id_error: '#network_advertiser_id_error',
      name_error: '#name_error',
      sales_person_id_error: '#sales_person_id_error'
    },

    triggers: {
      'click .save-order': 'order:save',
      'click .close-order': 'order:close'
    },

    initialize: function() {
      _.bindAll(this, '_close_form');
      Mousetrap.bind(['esc'], this._close_form);
    },

    onDomRefresh: function() {
      // initial flight values
      this.ui.start_date.val(this.model.get("start_date"));
      this.ui.end_date.val(this.model.get("end_date"));

      var self = this;
      this.ui.flight_container.daterangepicker({
          format: 'YYYY-MM-DD',
          separator: ' to ',
          startDate: this.ui.start_date.val(),
          endDate: this.ui.end_date.val()
        },
        function(start, end) {
          if(start) {
            self.ui.start_date.val(start.format("YYYY-MM-DD"));
            self.ui.end_date.val(end.format("YYYY-MM-DD"));
            self.ui.flight.text(self.ui.start_date.val() + " to " + self.ui.end_date.val());
          }
        });

      this.ui.flight.text(this.ui.start_date.val() + " to " + this.ui.end_date.val());
      this._initialize_advertiser();
      this._initialize_sales_person();
    },

    onClose: function() {
      Mousetrap.unbind('esc');
    },

    _close_form: function() {
      this.trigger('order:close');
    },

    _initialize_advertiser: function() {
      var advertiser_data = [],
        self = this;
      this.$('#advertiser_name').typeahead({
        source: function (query, process) {
          return $.get('/advertisers.json', { search: query }, function (data) {
            advertiser_data = data;
            return process(_.pluck(data, 'id'));
          });
        },

        updater: function(item) {
          var adv = _.find(advertiser_data, function(adv) { return adv.id == item; });
          self.$('#advertiser_id').val(item);
          return adv.name;
        },

        sorter: function(items) {
          return items;
        },

        matcher: function (item) {
          var adv = _.find(advertiser_data, function(adv) { return adv.id == item; });
          return ~adv.name.toLowerCase().indexOf(this.query.toLowerCase())
        },

        highlighter: function (item) {
          var adv = _.find(advertiser_data, function(adv) { return adv.id == item; });
          var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
          return adv.name.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
            return '<strong>' + match + '</strong>'
          })
        },
        minLength: 1
      });
    },

    _initialize_sales_person: function() {
      var sales_person_data = [],
        self = this;
      this.$('#sales_person_name').typeahead({
        source: function (query, process) {
          return $.get('/sales_people.json', { search: query }, function (data) {
            sales_person_data = data;
            return process(_.pluck(data, 'id'));
          });
        },

        updater: function(item) {
          var sp = _.find(sales_person_data, function(sp) { return sp.id == item; });
          self.$('#sales_person_id').val(item);
          return sp.name;
        },

        sorter: function(items) {
          return items;
        },

        matcher: function (item) {
          var sp = _.find(sales_person_data, function(sp) { return sp.id == item; });
          return ~sp.name.toLowerCase().indexOf(this.query.toLowerCase())
        },

        highlighter: function (item) {
          var sp = _.find(sales_person_data, function(sp) { return sp.id == item; });
          var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
          return sp.name.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
            return '<strong>' + match + '</strong>'
          })
        },
        minLength: 1
      });
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
      var orderModel = new Orders.Order(data.result);
      this.trigger('io:uploaded', orderModel);
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
