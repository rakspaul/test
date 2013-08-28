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

    this._initializeLineItemController();

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

    _.bindAll(this, '_showOrderDetailsAndLineItems', '_showNewLineItemView', '_onSaveOrderSuccess');
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
    //this.orderList.fetch();
    //this.orderDetailsLayout.top.close();
    //this.orderDetailsLayout.bottom.close();
    var order = new ReachUI.Orders.Order();
    var uploadView = new ReachUI.Orders.UploadView();

    if(this.selectedOrder) {
      this.selectedOrder.unselect();
    }

    uploadView.on('io:uploaded', this._ioUploaded, this);
    this.orderDetailsLayout.top.show(uploadView);
    //this.orderDetailsLayout.bottom.show(view);
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
    view.on('order:close', function() {
      window.history.back();
    });
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

    view.on('order:save', this._saveOrder, this);
    view.on('order:close', function() {
      window.history.back();
    });
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

  _saveOrder: function(args) {
    var model = args.model,
      view = args.view,
      isNew = model.isNew();;

    var _order = {
      name: view.ui.name.val(),
      start_date: view.ui.start_date.val(),
      end_date: view.ui.end_date.val(),
      advertiser_id: view.ui.advertiser_id.val(),
      sales_person_id: view.ui.sales_person_id.val()
    };

    // get all the error labels and clear them
    _.keys(view.ui)
      .filter(function(val) {
        return /_error$/.test(val);
      })
      .forEach(function(val) {
        view.ui[val].text("");
      });

    var self = this;

    model.save(_order, {
      success: this._onSaveOrderSuccess,
      error: this._onSaveOrderFailure,
      view: view,
      isNew: isNew
    });
  },

  _onSaveOrderSuccess: function(model, response, options) {
    // add order at beginning
    this.orderList.unshift(model);
    if(options.isNew) {
      // view order
      ReachUI.Orders.router.navigate('/' + model.id, {trigger: true});
    } else {
      window.history.back();
    }
  },

  _onSaveOrderFailure: function(model, xhr, options) {
    if(xhr.responseJSON && xhr.responseJSON.errors) {
      var formErrors = [];

      _.each(xhr.responseJSON.errors, function(value, key) {
        var errorLabel = options.view.ui[key + "_error"];
        if(errorLabel) {
          errorLabel.text(value[0]);
        } else {
          formErrors.push(value);
        }
      });

      alert("Error saving order. \n" + formErrors.join("\n"));
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

  _initializeLineItemController: function() {
    this.lineItemController = new ReachUI.LineItems.LineItemController({
                                    mainRegion: this.orderDetailsLayout.bottom
                                  });
    this.lineItemController.on("lineitem:saved", this._navigateToSelectedOrder, this);
    this.lineItemController.on("lineitem:close", this._navigateToSelectedOrder, this);
  },

  _navigateToSelectedOrder: function(lineitem) {
    if(lineitem) {
      this.lineItemList.add(lineitem);
    }

    ReachUI.Orders.router.navigate('/'+ this.selectedOrder.id, {trigger: true});
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

  _setupTypeaheadFields: function(order) {
    $('.billing-contact-company .typeahead').editable({
      source: "/reach_clients/search.json",
      typeahead: {
        minLength: 2,
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
        minLength: 2,
        remote: '/users/search.json?search=%QUERY&search_by=name&sales=true',
        valueKey: 'name'
      }
    });
    $('.salesperson-name').on('typeahead:selected', function(ev, el) {
      order.set("sales_person_name", el.name);//update backbone model
      order.set("sales_person_email", el.email);
      order.set("sales_person_phone", el.phone);
      $('.salesperson-phone span').removeClass('editable-empty').html(el.phone);
      $('.salesperson-email span').removeClass('editable-empty').html(el.email);
    });

    $('.media-contact-name .typeahead').editable({
      success: function(response, newValue) {
        order.set("media_contact_name", newValue); //update backbone model
      },
      source: "/media_contacts/search.json?search_by=name",
      typeahead: {
        minLength: 2,
        remote: '/media_contacts/search.json?search=%QUERY&search_by=name',
        valueKey: 'name'
      }
    });
    $('.media-contact-name').on('typeahead:selected', function(ev, el) {
      $('.media-contact-phone span').removeClass('editable-empty').html(el.phone);
      $('.media-contact-email span').removeClass('editable-empty').html(el.email);
      order.set("media_contact_name", el.name);//update backbone model
      order.set("media_contact_email", el.email);
      order.set("media_contact_phone", el.phone);
    });

    $('.billing-contact-name .typeahead').editable({
      success: function(response, newValue) {
        order.set("billing_contact_name", newValue); //update backbone model
      },
      source: "/billing_contacts/search.json?search_by=name",
      typeahead: {
        minLength: 2,
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
    });

    $('.account-contact-name .typeahead').editable({
      success: function(response, newValue) {
        order.set("account_contact_name", newValue); //update backbone model
      },
      source: "/users/search.json?search_by=name",
      typeahead: {
        minLength: 2,
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
    });

    $('.media-contact-email .typeahead').editable({
      source: "/media_contacts/search.json?search_by=email",
      typeahead: { 
        minLength: 2,
        remote: '/media_contacts/search.json?search=%QUERY&search_by=email',
        valueKey: 'email'
      }
    });
    $('.billing-contact-email .typeahead').editable({
      source: "/billing_contacts/search.json?search_by=email",
      typeahead: { 
        minLength: 2,
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
    detailOrderView.on('order:edit', function(args) {
      var order = args.model;
      ReachUI.Orders.router.navigate('/'+ order.id +'/edit', {trigger: true});
    });
    detailOrderView.on('order:export', function(args) {
      var order = args.model;
      window.location.href = '/orders/'+ order.id +'/export.xls';
    });
    this.orderDetailsLayout.top.show(detailOrderView);

    //turn x-editable plugin to inline mode
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editable.defaults.ajaxOptions = {type: "PATCH", dataType: 'json'};
    
    $('.total-media-cost .editable.custom').editable({
      success: function(response, newValue) {
        order.set("total_media_cost", newValue); //update backbone model
      },
      validate: function(value) {
        if(value.match(/[^\d\.,]+/)) {
          return 'This field should contain only digits';
        }
      }
    });
    $('.editable:not(.typeahead):not(.custom)').editable({
      success: function(response, newValue) {
        order.set(this.dataset['name'], newValue); //update backbone model;
      }
    });
    this._setupTypeaheadFields(order);
    this._setupOrderDateFields(order);
  },

  _showLineitemList: function(order) {
    if(!this.lineItemList.getOrder() || this.lineItemList.getOrder().id !== order.id) {
      this.lineItemList.reset();
      this.lineItemList.setOrder(order);
      this.lineItemList.fetch();
    }

    this.lineItemList.setOrder(order);
    this._liSetCallbacksAndShow(this.lineItemList);
  },

  _liSetCallbacksAndShow: function(lineItemList) {
    var lineItemListView = new ReachUI.LineItems.LineItemListView({collection: lineItemList});

    lineItemListView.on('lineitem:create', function(args) {
      ReachUI.Orders.router.navigate('/'+ order.id +'/lineitems/new', {trigger: true});
    }, this);

    lineItemListView.on('itemview:lineitem:add_ad', function(view) {
      // Ad name should be this format: 
      // Client Abbreviated Name + Advertiser Name (C18) + Quarter (Q2) + Year + Ad Sizes
      // Example: RE TW LA Sinus MD - Dr. Kayem Q213 300x250,728x90,160x600

      var start_date = new Date(view.model.attributes.start_date);
      var start_quarter = ReachUI.getQuarter(start_date);
      var start_year = start_date.getFullYear() % 100;

      var ad_name = view.model.collection.order.attributes.client_advertiser_name+' Q'+start_quarter+ start_year +' '+view.model.attributes.ad_sizes;
      var attrs = _.extend(view.model.attributes, {name: ad_name});
      var ad = new ReachUI.Ads.Ad(attrs);
      var adsView = new ReachUI.Ads.AdView({model: ad});
      view.ui.ads_list.append(adsView.render().el);

      $('.editable:not(.typeahead):not(.custom)').editable();
      /*$('.ad .editable').click(function(ev) {
        //ev.stopPropagation();
        $('.ad .editable').not(this).editable('toggle');
      });*/
    });

    this.orderDetailsLayout.bottom.show(lineItemListView);
  }
});
