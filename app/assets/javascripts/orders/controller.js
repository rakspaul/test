ReachUI.Orders.DetailRegion = Backbone.Marionette.Region.extend({
  el: "#details .content"
});

ReachUI.Orders.OrderController = Marionette.Controller.extend({
  initialize: function() {
    this.orderDetailRegion = new ReachUI.Orders.DetailRegion();
    this.orderDetailsLayout = new ReachUI.Orders.OrderDetailLayout();
    this.orderList = new ReachUI.Orders.OrderList();
    this.lineItemList = new ReachUI.LineItems.LineItemList();

    this.orderDetailRegion.show(this.orderDetailsLayout);

    var search = new ReachUI.Search.SearchQuery(),
      searchView = new ReachUI.Search.SearchQueryView({model: search}),
      searchOrderListView = new ReachUI.Orders.ListView({el: '.order-search-result', collection: this.orderList});

    search.on('change:query', function(model) {
      this.orderList.fetch({data: {search: model.get('query')}});
    }, this);

    searchView.bindShortcutKey('s');

    searchOrderListView.on("itemview:selected", function(view) {
      ReachUI.Orders.router.navigate('/' + view.model.id, {trigger: true});
    });

    searchOrderListView.listenTo(this.orderList, 'change', function(model) {
      // update the order view in list when order is edited and saved.
      var view = searchOrderListView.children.findByModel(model);
      view.render();
    });

    $(".order-new").click(function() {
      ReachUI.Orders.router.navigate('/new', {trigger: true});
    });

    _.bindAll(this, '_showOrderDetailsAndLineItems', '_showNewLineItemView');
    this._bindKeys();
  },

  _bindKeys: function() {
    var self = this;
    Mousetrap.bind(['c o'], function(e) {
      ReachUI.Orders.router.navigate('/new', {trigger: true});
      return false;
    });

    Mousetrap.bind(['e o'], function(e) {
      if(self.selectedOrder) {
        ReachUI.Orders.router.navigate('/' + self.selectedOrder.id + '/edit', {trigger: true});
        return false;
      }
    });

    Mousetrap.bind(['c l'], function(e) {
      if(self.selectedOrder) {
        ReachUI.Orders.router.navigate('/' + self.selectedOrder.id + '/lineitems/new', {trigger: true});
        return false;
      }
    });

    Mousetrap.bind(['?'], function(e) {
      $("#shortcut_help_modal").modal("show");
    });
  },

  index: function() {
    var order = new ReachUI.Orders.Order();
    var uploadView = new ReachUI.Orders.UploadView();

    if(this.selectedOrder) {
      this.selectedOrder.unselect();
    }

    uploadView.on('io:uploaded', this._ioUploaded, this);
    this.orderDetailsLayout.top.show(uploadView);
    this.orderDetailsLayout.bottom.reset();
  },

  newOrder: function() {
    var order = new ReachUI.Orders.Order();
    var view = new ReachUI.Orders.EditView({model: order});
    var uploadView = new ReachUI.Orders.UploadView();

    if(this.selectedOrder) {
      this.selectedOrder.unselect();
    }

    uploadView.on('io:uploaded', this._ioUploaded, this);
    this.orderDetailsLayout.top.show(uploadView);
    this.orderDetailsLayout.bottom.show(view);
    view.on('order:save', this._saveOrder, this);
  },

  editOrder: function(id) {
    this.selectedOrder = this.orderList.get(id);
    if(!this.selectedOrder) {
      var promise = this._fetchOrder(id);
      promise.then(this._showEditOrder);
    } else {
      this._showEditOrder(this.selectedOrder);
    }
  },

  _showEditOrder: function(order) {
    order.select();

    var view = new ReachUI.Orders.EditView({model: order});
    this.orderDetailsLayout.top.close();
    this.orderDetailsLayout.bottom.show(view);
  },

  _ioUploaded: function(orderModel, lineItems) {
    this.orderList.unshift(orderModel);
    // view order
    if(orderModel.id) {
      ReachUI.Orders.router.navigate('/' + orderModel.id, {trigger: true});
    } else {
      // just uploaded model (w/o id, source_id)
      orderModel.lineItemList = lineItems;
      this._showOrderDetails(orderModel);
      lineItems.setOrder(orderModel);
      this._liSetCallbacksAndShow(lineItems);
    }
  },

  orderDetails: function(id) {
    this.selectedOrder = this.orderList.get(id);
    if(!this.selectedOrder) {
      var promise = this._fetchOrder(id);
      promise.then(this._showOrderDetailsAndLineItems);
    } else {
      this._showOrderDetailsAndLineItems(this.selectedOrder);
    }
  },

  newLineItem: function(id) {
    this.selectedOrder = this.orderList.get(id);
    if(!this.selectedOrder) {
      this._fetchOrder(id).then(this._showNewLineItemView);
    } else {
      this._showNewLineItemView(this.selectedOrder);
    }
  },

  showLineItem: function(orderId, lineItemId) {
    this.selectedOrder = this.orderList.get(orderId);
    if(!this.selectedOrder) {
      var self = this;
      this._fetchOrder(orderId).then(function(order) {
        order.select();
        self._showOrderDetails(order);
        self._fetchLineitem(lineItemId, order).then(function(lineitem) {
          self.lineItemController.show(lineitem);
        });
      });
    } else {
      this.selectedOrder.select();
      this._showOrderDetails(this.selectedOrder);

      var lineitem = this.lineItemList.get(lineItemId);
      if(!lineitem) {
        var self = this;
        this._fetchLineitem(lineItemId, this.selectedOrder).then(function(lineitem) {
          self.lineItemController.show(lineitem);
        });
      } else {
        this.lineItemController.show(lineitem);
      }
    }
  },

  _fetchOrder: function(id) {
    var self = this;
    this.selectedOrder = new ReachUI.Orders.Order({'id': id});

    return this.selectedOrder.fetch().then(
      function() {
        self.orderList.add(self.selectedOrder);
        return self.selectedOrder;
      },
      function(error) {
        alert("Order not found. Id: " + id);
      });
  },

  _fetchLineitem: function(id, order) {
    var lineitem = new ReachUI.LineItems.LineItem({'id': id, 'order_id': order.id});
    return lineitem.fetch().then(
      function() {
        return lineitem;
      },
      function() {
        alert('Lineitem not found. Id: ' + id);
      });
  },

  _showOrderDetailsAndLineItems: function(order) {
    order.select();
    this._showOrderDetails(order);
    this._showLineitemList(order);
  },

  _showNewLineItemView: function(order) {
    order.select();
    this._showOrderDetails(order);
    var newLineItem = new ReachUI.LineItems.LineItem({'order_id': order.id});
    this.lineItemController.show(newLineItem);
  },

  _setupOrderDateFields: function(order) {
    $('.order-details .start-date .editable.date').editable({
      success: function(response, newValue) {
        var start_date = moment(newValue).format("YYYY-MM-DD");
        _.each(order.lineItemList.models, function(li) {
          li.set("start_date", start_date);
          _.each(li.ads.models || li.ads, function(ad) {
            ad.set("start_date", start_date);
          });
        });
        order.set("start_date", start_date); //update backbone model
        $('.order-details .start-date .errors_container').html('');
        $('.order-details .start-date').removeClass('field_with_errors');
      },
      datepicker: {
        startDate: moment().subtract('days', 1).format("YYYY-MM-DD")
      }
    });

    $('.order-details .end-date .editable.date').editable({
      success: function(response, newValue) {
        var end_date = moment(newValue).format("YYYY-MM-DD");
        _.each(order.lineItemList.models, function(li) {
          li.set("end_date", end_date);
          _.each(li.ads.models || li.ads, function(ad) {
            ad.set("end_date", end_date);
          });
        });
        order.set("end_date", end_date); //update backbone model
        $('.order-details .end-date .errors_container').html('');
        $('.order-details .end-date').removeClass('field_with_errors');
      },
      datepicker: {
        startDate: moment().subtract('days', 1).format("YYYY-MM-DD")
      }
    });
  },

  _clearErrorsOn: function(field_class) {
    $(field_class + ' .errors_container').html('');
    $(field_class).removeClass('field_with_errors');
  },

  _setupTypeaheadFields: function(order) {
    var ordersController = this;

    $('.billing-contact-company .typeahead').editable({
      source: "/reach_clients/search.json",
      typeahead: {
        minLength: 1,
        remote: '/reach_clients/search.json?search=%QUERY',
        valueKey: 'name'
      }
    });
    $('.billing-contact-company').on('typeahead:selected', function(ev, el) {
      order.set("reach_client_name", el.name);//update backbone model
      order.set("reach_client_id", el.id);
    });

    $('.salesperson-name .typeahead').editable({
      source: "/users/search.json?search_by=name&sales=true",
      typeahead: {
        minLength: 1,
        remote: '/users/search.json?search=%QUERY&search_by=name&sales=true',
        valueKey: 'name'
      }
    });
    $('.salesperson-name').on('typeahead:selected', function(ev, el) {
      order.set("sales_person_name", el.name);//update backbone model
      order.set("sales_person_email", el.email);
      order.set("sales_person_id", el.id);
      order.set("sales_person_phone", el.phone);
      $('.salesperson-phone span').removeClass('editable-empty').html(el.phone);
      $('.salesperson-email span').removeClass('editable-empty').html(el.email);

      ordersController._clearErrorsOn(".salesperson-name");
    });

    $('.media-contact-name .typeahead').editable({
      success: function(response, newValue) {
        order.set("media_contact_name", newValue); //update backbone model
      },
      source: "/media_contacts/search.json?search_by=name",
      typeahead: {
        minLength: 1,
        remote: '/media_contacts/search.json?search=%QUERY&search_by=name',
        valueKey: 'name'
      }
    });
    $('.media-contact-name').on('typeahead:selected', function(ev, el) {
      $('.media-contact-phone span').removeClass('editable-empty').html(el.phone);
      $('.media-contact-email span').removeClass('editable-empty').html(el.email);
      order.set("media_contact_name", el.name);//update backbone model
      order.set("media_contact_email", el.email);
      order.set("media_contact_id", el.id);
      order.set("media_contact_phone", el.phone);
    });

    $('.billing-contact-name .typeahead').editable({
      success: function(response, newValue) {
        order.set("billing_contact_name", newValue); //update backbone model
      },
      source: "/billing_contacts/search.json?search_by=name",
      typeahead: {
        minLength: 1,
        remote: '/billing_contacts/search.json?search=%QUERY&search_by=name',
        valueKey: 'name'
      }
    });
    $('.billing-contact-name').on('typeahead:selected', function(ev, el) {
      $('.billing-contact-phone span').removeClass('editable-empty').html(el.phone);
      $('.billing-contact-email span').removeClass('editable-empty').html(el.email);
      order.set("billing_contact_name", el.name);//update backbone model
      order.set("billing_contact_email", el.email);
      order.set("billing_contact_phone", el.phone);
      order.set("billing_contact_id", el.id);
    });

    //-------------------------------------------------------------------------------
    // trafficking contact
    $('.trafficker-container .typeahead').editable({
      success: function(response, newValue) {
        order.set("trafficking_contact_name", newValue); //update backbone model
      },
      source: "/users/search.json?search_by=name",
      typeahead: {
        minLength: 1,
        remote: '/users/search.json?search=%QUERY&search_by=name',
        valueKey: 'name'
      }
    });
    $('.trafficker-container').on('typeahead:selected', function(ev, el) {
      $('.trafficker-container span').removeClass('editable-empty');
      ordersController._clearErrorsOn(".trafficker-container");
      order.set("trafficking_contact_id", el.id);//update backbone model
      order.set("trafficking_contact_name", el.name);
    });

    //--------------------------------------------------------------------------------
    // account contact
    $('.account-contact-name .typeahead').editable({
      success: function(response, newValue) {
        order.set("account_contact_name", newValue); //update backbone model
      },
      source: "/users/search.json?search_by=name",
      typeahead: {
        minLength: 1,
        remote: '/users/search.json?search=%QUERY&search_by=name',
        valueKey: 'name'
      }
    });
    $('.account-contact-name').on('typeahead:selected', function(ev, el) {
      order.set("account_contact_name", el.name);//update backbone model
      order.set("account_contact_email", el.email);
      order.set("account_contact_phone", el.phone);
      $('.account-contact-phone span').removeClass('editable-empty').html(el.phone);
      $('.account-contact-email span').removeClass('editable-empty').html(el.email);

      ordersController._clearErrorsOn(".account-contact-name");
    });

    $('.media-contact-email .typeahead').editable({
      source: "/media_contacts/search.json?search_by=email",
      typeahead: {
        minLength: 1,
        remote: '/media_contacts/search.json?search=%QUERY&search_by=email',
        valueKey: 'email'
      }
    });

    $('.billing-contact-email .typeahead').editable({
      source: "/billing_contacts/search.json?search_by=email",
      typeahead: {
        minLength: 1,
        remote: '/billing_contacts/search.json?search=%QUERY&search_by=email',
        valueKey: 'email'
      }
    });
    $('.advertiser-name input').typeahead({
      name: 'advertiser-names',
      remote: '/advertisers.json?search=%QUERY',
      valueKey: 'name'
    });
    $('.advertiser-name input').on('typeahead:selected', function(ev, el) {
      $('.advertiser-name span.advertiser-unknown').toggleClass('advertiser-unknown');
      order.set("advertiser_id", el.id);
      order.set("advertiser_name", el.name);
    });
  },

  _showOrderDetails: function(order) {
    var detailOrderView = new ReachUI.Orders.DetailView({model: order});
    this.orderDetailsLayout.top.show(detailOrderView);

    //turn x-editable plugin to inline mode
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editable.defaults.ajaxOptions = {type: "PATCH", dataType: 'json'};

    $('.general-info-container .total-media-cost .editable.custom').editable({
      success: function(response, newValue) {
        order.set("total_media_cost", newValue); //update backbone model
      },
      validate: function(value) {
        if(value.match(/[^\d\.,]+/)) {
          return 'This field should contain only digits';
        }
      }
    });
    $('.general-info-container .order-name .editable').editable({
      success: function(response, newValue) {
        order.set(this.dataset['name'], newValue); //update backbone model;
        $('.new-order-header .heading').html(newValue);
      }
    });
    $('.general-info-container .editable:not(.typeahead):not(.custom)').editable({
      success: function(response, newValue) {
        order.set(this.dataset['name'], newValue); //update backbone model;
      }
    });
    this._setupTypeaheadFields(order);
    this._setupOrderDateFields(order);
  },

  _showLineitemList: function(order) {
    var self = this;
    if(!this.lineItemList.getOrder() || this.lineItemList.getOrder().id !== order.id) {
      this.lineItemList.reset();
      this.lineItemList.setOrder(order);
      this.lineItemList.fetch().then(
        function(collection, response, options) {
          _.each(self.lineItemList.models, function(li, index) {
            li.set('creatives', new ReachUI.Creatives.CreativesList(collection[index].creatives));
          });
          order.lineItemList = self.lineItemList;
          self._liSetCallbacksAndShow(self.lineItemList);
          self._showNotesView(order);
        },
        function(model, response, options) {
          console.log('error while getting lineitems list');
          console.log(response);
        }
      );
    } else {
      this.lineItemList.setOrder(order);
      this._liSetCallbacksAndShow(this.lineItemList);
      this._showNotesView(order);
    }
  },

  // Ad name should be in this format:
  // Client Abbreviated Name + Advertiser Name (C18) + Quarter (Q2) + Year + Ad Sizes
  // Example: RE TW LA Sinus MD - Dr. Kayem Q213 300x250,728x90,160x600
  _generateAdName: function(li) {
    var start_date = new Date(li.attributes.start_date);
    var start_quarter = ReachUI.getQuarter(start_date);
    var start_year = start_date.getFullYear() % 100;
    return li.collection.order.attributes.client_advertiser_name+' Q'+start_quarter+ start_year +' '+li.attributes.ad_sizes;
  },

  /////////////////////////////////////////////////////////////////////////////////////////
  // the main function dealing with lineitems/ads/creatives
  _liSetCallbacksAndShow: function(lineItemList) {
    var lineItemListView = new ReachUI.LineItems.LineItemListView({collection: lineItemList});
    var ordersController = this;

    // adding Ad under certain lineitem
    lineItemListView.on('itemview:lineitem:add_ad', function(li_view) {
      var li = li_view.model;

      var ad_name = ordersController._generateAdName(li);
      var attrs = _.extend(_.omit(li.attributes, 'id', 'name', 'ad_sizes', 'targeting', 'targeted_zipcodes'), {description: ad_name, io_lineitem_id: li.get('id'), size: li.get('ad_sizes')});
      var ad = new ReachUI.Ads.Ad(attrs);

      var li_targeting = new ReachUI.Targeting.Targeting({
        selected_key_values: li.get('targeting').get('selected_key_values'),
        selected_dmas: li.get('targeting').get('selected_dmas'),
        dmas_list: li.get('targeting').get('dmas_list'),
        selected_zip_codes: li.get('targeting').get('selected_zip_codes'),
        audience_groups: li.get('targeting').get('audience_groups')
      });

      ad.set('targeting', li_targeting);

      var li_creatives = [];
      _.each(li.get('creatives').models, function(li_creative) {
        var cloned_creative = new ReachUI.Creatives.Creative({
          source_ui_creative_id: li_creative.get('source_ui_creative_id'),
          ad_size: li_creative.get('ad_size'),
          end_date: li_creative.get('end_date'),
          redirect_url: li_creative.get('redirect_url'),
          start_date: li_creative.get('start_date')
        });
        li_creatives.push(cloned_creative);
      });

      ad.set('creatives', new ReachUI.Creatives.CreativesList(li_creatives))

      li.pushAd(ad);
      li_view.renderAd(ad);
    });

    this.orderDetailsLayout.bottom.show(lineItemListView);

    // only if `show` action
    if(lineItemList.order.id) {
      // set targeting for existing Order

      _.each(lineItemListView.children._views, function(li_view, li_name) {
        var li            = li_view.model;
        var selected_dmas = li.get('selected_dmas') ? li.get('selected_dmas') : [];
        var zipcodes      = li.get('targeted_zipcodes') ? li.get('targeted_zipcodes').split(',') : [];
        var kv            = li.get('selected_key_values') ? li.get('selected_key_values') : [];

        var dmas = new ReachUI.DMA.List();
        var ags = new ReachUI.AudienceGroups.AudienceGroupsList();

        ags.fetch().done(dmas.fetch({
          success: function(collection, response, options) {
            var dmas_list = _.map(collection.models, function(el) { return {code: el.attributes.code, name: el.attributes.name} });

            li.set('targeting', new ReachUI.Targeting.Targeting({selected_zip_codes: zipcodes, selected_dmas: selected_dmas, selected_key_values: kv, dmas_list: dmas_list, audience_groups: ags.attributes}));
   
            li_view.renderTargetingDialog();
          }
        }))
      })

      // show Ads for each LI
      _.each(lineItemListView.children._views, function(li_view, li_name) {
        li_view.model.ads = new ReachUI.Ads.AdList();
        li_view.model.ads.setOrder(lineItemList.order);

        // show condensed targeting options
        ReachUI.showCondensedTargetingOptions.apply(li_view);

        // fetch ads for each lineitem and append then to the view of this lineitem
        li_view.model.ads.fetch().then(
          function(collection, response, options) {
            li_view.model.ads = [];
            _.each(collection, function(attrs) {
              // push and render Ad only under particular lineitem
              if(li_view.model.get('id') == attrs.ad.io_lineitem_id) {
                attrs.ad.start_date = moment(attrs.ad.start_date).format("YYYY-MM-DD");
                attrs.ad.end_date = moment(attrs.ad.end_date).format("YYYY-MM-DD");

                var ad = new ReachUI.Ads.Ad(attrs.ad);

                ad.set('creatives', new ReachUI.Creatives.CreativesList(attrs.creatives));
                ad.set('targeting', new ReachUI.Targeting.Targeting({selected_zip_codes: attrs.ad.targeted_zipcodes, selected_dmas: attrs.selected_dmas, selected_key_values: attrs.selected_key_values, dmas_list: li_view.model.get('targeting').get('dmas_list'), audience_groups: li_view.model.get('targeting').get('audience_groups')}));

                li_view.model.pushAd(ad);
                li_view.renderAd(ad);
              }
            });
          },
          function(model, response, options) {
            console.log('error while getting ads list');
            console.log(response);
          }
        );
      });
    } else { // not persisted Order/Lineitems
      _.each(lineItemListView.children._views, function(li_view, li_name) {
        var li   = li_view.model;
        var dmas = new ReachUI.DMA.List();
        var ags  = new ReachUI.AudienceGroups.AudienceGroupsList();

        ags.fetch().done(dmas.fetch({
          success: function(collection, response, options) {
            var dmas_list = _.map(collection.models, function(el) { return {code: el.attributes.code, name: el.attributes.name} });
            li.set('targeting', new ReachUI.Targeting.Targeting({dmas_list: dmas_list, audience_groups: ags.attributes}));
            li_view.renderTargetingDialog();
          }
        }));
      });
    }

    lineItemList._recalculateLiImpressionsMediaCost();
  },

  _showNotesView: function(order) {
    this.notesRegion = new ReachUI.Orders.NotesRegion();
    this.noteList = new ReachUI.Orders.NoteList();
    this.noteList.setOrder(order)
    this.notesRegion.show(new ReachUI.Orders.NoteListView({collection: this.noteList, order: order}));
    this.noteList.fetch();
  },
});
