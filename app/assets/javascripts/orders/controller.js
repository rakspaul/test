/*ReachUI.Orders.DetailRegion = Backbone.Marionette.Region.extend({
  el: "#details .content"
});*/

ReachUI.Orders.OrderController = Marionette.Controller.extend({
  initialize: function() {
    this.orderDetailRegion = new ReachUI.Orders.DetailRegion();
    this.orderDetailsLayout = new ReachUI.Orders.OrderDetailLayout();
    this.orderList = new ReachUI.Orders.OrderList();
    this.lineItemList = new ReachUI.LineItems.LineItemList();

    this.orderDetailRegion.show(this.orderDetailsLayout);

    _.bindAll(this, '_showOrderDetailsAndLineItems', '_showNewLineItemView');
    this.on('lineitems:buffer_update', this._liUpdateBuffer);
  },

  index: function() {
    var order = new ReachUI.Orders.Order();
    var uploadView = new ReachUI.Orders.UploadView();

    this._unselectOrder();
    uploadView.on('io:uploaded', this._ioUploaded, this);
    this.orderDetailsLayout.top.show(uploadView);
    this.orderDetailsLayout.bottom.reset();
  },

  newOrder: function() {
    var order = new ReachUI.Orders.Order();
    // TODO We don't have EditView view and probably we don't need new Order functionality
    var uploadView = new ReachUI.Orders.UploadView();

    this._unselectOrder();
    uploadView.on('io:uploaded', this._ioUploaded, this);
    
    this.orderDetailsLayout.top.show(uploadView);
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

  _unselectOrder: function() {
    if (this.selectedOrder) {
      this.selectedOrder.unselect();
    }
  },

  _showEditOrder: function(order) {
    order.select();
    var view = new ReachUI.Orders.EditView({model: order});
    this.orderDetailsLayout.top.close();
    this.orderDetailsLayout.bottom.show(view);
  },

  _ioUploaded: function(orderModel, lineItems) {
    // just uploaded model (w/o id, source_id)
    orderModel.lineItemList = lineItems;

    // removing zombie views and callbacks
    if(orderModel.get('is_existing_order') {
      if(this.detailOrderView) {
        this.detailOrderView.remove();
        this.detailOrderView.unbind();
      }

      if(this.notes_list_view) {
        this.notes_list_view.remove();
        this.notes_list_view.unbind();

        // unbinding logRevision event so logging wouldn't be done twice (or more times)
        EventsBus.unbind('lineitem:logRevision', this.notes_list_view.logRevision, this.notes_list_view);
      }

      if(this.lineItemListView) {
        this.lineItemListView.remove();
        this.lineItemListView.unbind();
      }
    }

    this._showOrderDetails(orderModel);

    // set default AM's and Trafficker's emails and names (in order to show emails in Notify Users box)
    window.current_am_email         = orderModel.get('account_contact_email');
    window.current_am_name          = orderModel.get('account_contact_name');
    window.current_trafficker_email = orderModel.get('trafficking_contact_email');
    window.current_trafficker_name  = orderModel.get('trafficking_contact_name');

    lineItems.setOrder(orderModel);

    // set revisions for every lineitem
    if(orderModel.get('revisions')) {
      _.each(orderModel.get('revisions'), function(revisions, index) {
        lineItems.models[index].set('revised_start_date', revisions.start_date);
        lineItems.models[index].set('revised_end_date', revisions.end_date);
        lineItems.models[index].set('revised_name', revisions.name);
        lineItems.models[index].set('revised_volume', revisions.volume);
        lineItems.models[index].set('revised_rate', revisions.rate);
        lineItems.models[index].set('revised', ((revisions.start_date || revisions.end_date || revisions.name || revisions.volume || revisions.rate) ? true : false));
      });
    }

    this.lineItemList = lineItems;
    this._liSetCallbacksAndShow(lineItems);

    if(orderModel.get('is_existing_order')) {
      ReachUI.checkOrderStatus(orderModel.id);
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
    if (!this.selectedOrder) {
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
    ReachUI.checkOrderStatus(order.id);
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
        order.set("start_date", start_date); //update backbone model
        $('.order-details .start-date .errors_container').html('');
        $('.order-details .start-date').removeClass('field_with_errors');
      },
      datepicker: {
        startDate: moment().format("YYYY-MM-DD")
      }
    });

    $('.order-details .end-date .editable.date').editable({
      success: function(response, newValue) {
        var end_date = moment(newValue).format("YYYY-MM-DD");
        order.set("end_date", end_date); //update backbone model
        $('.order-details .end-date .errors_container').html('');
        $('.order-details .end-date').removeClass('field_with_errors');
      },
      datepicker: {
        startDate: moment().format("YYYY-MM-DD")
      }
    });
  },

  _clearErrorsOn: function(field_class) {
    $(field_class + ' .errors_container').html('');
    $(field_class).removeClass('field_with_errors');
  },

  // fill media/billing contact selects with usernames related to the selected ReachClient
  _changeBillingAndMediaContacts: function(reach_client_id) {
    $.getJSON("/billing_contacts/for_reach_client?client_id="+reach_client_id, function(response) {
      var billing_contact_options = ['<option value=""></option>'];
      _.each(response, function(el) {
        billing_contact_options.push('<option value="'+el.id+'|'+el.email+'|'+el.phone+'">'+el.name+'</option>');
      });
      $('.billing-contact-name select').html(billing_contact_options);
    });
    $.getJSON("/media_contacts/for_reach_client?client_id="+reach_client_id, function(response) {
      var media_contact_options = ['<option value=""></option>'];
      _.each(response, function(el) {
        media_contact_options.push('<option value="'+el.id+'|'+el.email+'|'+el.phone+'">'+el.name+'</option>');
      });
      $('.media-contact-name select').html(media_contact_options);
    });
  },

  _setupTypeaheadFields: function(order) {
    var ordersController = this;

    $('.billing-contact-company .typeahead, .media-contact-company .typeahead').editable({
      source: "/reach_clients/search.json",
      typeahead: {
        minLength: 1,
        remote: '/reach_clients/search.json?search=%QUERY',
        valueKey: 'name'
      },
      success: function() {
        ordersController.trigger('lineitems:buffer_update', order.get('reach_client_buffer'));
      }
    });
    $('.billing-contact-company, .media-contact-company').on('typeahead:selected', function(ev, el) {
      order.set("reach_client_name", el.name);//update backbone model
      order.set("reach_client_id", el.id);
      order.set("reach_client_abbr", el.abbr);
      if (order.get('reach_client_buffer') != el.client_buffer) {
        order.set('reach_client_buffer', el.client_buffer);
      }

      ordersController._changeBillingAndMediaContacts(el.id);
      ordersController._clearErrorsOn(".billing-contact-company");
      ordersController._clearErrorsOn(".media-contact-company");
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
    }).on('change', function(e) {
      var sc_name = $('.salesperson-name option:selected').text();
      var sc_parts = e.target.value.split('|');
      var sc_id = sc_parts[0], sc_email = sc_parts[1], sc_phone = sc_parts[2];
      $('.salesperson-phone span').removeClass('editable-empty').html(sc_phone);
      $('.salesperson-email span').removeClass('editable-empty').html(sc_email);
      order.set("sales_person_name", sc_name); //update backbone model
      order.set("sales_person_email", sc_email);
      order.set("sales_person_phone", sc_phone);
      order.set("sales_person_id", sc_id);

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

      ordersController._clearErrorsOn(".media-contact-name");
    }).on('change', function(e) {
      var mc_name = $('.media-contact-name option:selected').text();
      var mc_parts = e.target.value.split('|');
      var mc_id = mc_parts[0], mc_email = mc_parts[1], mc_phone = mc_parts[2];
      $('.media-contact-phone span').removeClass('editable-empty').html(mc_phone);
      $('.media-contact-email span').removeClass('editable-empty').html(mc_email);
      order.set("media_contact_name", mc_name); //update backbone model
      order.set("media_contact_email", mc_email);
      order.set("media_contact_phone", mc_phone);
      order.set("media_contact_id", mc_id);

      ordersController._clearErrorsOn(".media-contact-name");
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

      ordersController._clearErrorsOn(".billing-contact-name");
    }).on('change', function(e) {
      var bc_name = $('.billing-contact-name option:selected').text();
      var bc_parts = e.target.value.split('|');
      var bc_id = bc_parts[0], bc_email = bc_parts[1], bc_phone = bc_parts[2];
      $('.billing-contact-phone span').removeClass('editable-empty').html(bc_phone);
      $('.billing-contact-email span').removeClass('editable-empty').html(bc_email);
      order.set("billing_contact_name", bc_name);//update backbone model
      order.set("billing_contact_email", bc_email);
      order.set("billing_contact_phone", bc_phone);
      order.set("billing_contact_id", bc_id);

      ordersController._clearErrorsOn(".billing-contact-name");
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

      // update current trafficker's email and name so info in 'Notify users by email' dialog would be up-to-date
      window.current_trafficker_email = el.email;
      window.current_trafficker_name = el.name;
    });

    //--------------------------------------------------------------------------------
    // account contact
    $('.account-contact-name').on('change', function(e) {
      var ac_name = $('.account-contact-name option:selected').text();
      var ac_parts = e.target.value.split('|');
      var ac_id = ac_parts[0], ac_email = ac_parts[1], ac_phone = ac_parts[2];

      $('.account-contact-phone span').removeClass('editable-empty').html(ac_phone);
      $('.account-contact-email span').removeClass('editable-empty').html(ac_email);
      order.set("account_contact_name", ac_name); //update backbone model
      order.set("account_contact_email", ac_email);
      order.set("account_contact_phone", ac_phone);
      order.set("account_contact_id", ac_id);

      // update current AM's email and name so info in 'Notify users by email' dialog would be up-to-date
      window.current_am_email = ac_email;
      window.current_am_name = ac_name;

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

    if(!order.get("source_id")){
      $('.advertiser-name input').typeahead({
        name: 'advertiser-names',
        remote: {
          url: '/advertisers.json?search=%QUERY',
          filter: function(parsedResponse){
            if(parsedResponse.length == 0){
              parsedResponse.push({
                name: "Advertiser not found"
              });
            }

            return parsedResponse;
          }
        },
        valueKey: 'name',
        limit: 100,
        footer: '<div class="create-advertiser"><a href="#" id="create_advertiser" >Create Advertiser</a></div>'
      });
    }

    $('.advertiser-name input').on('typeahead:selected', function(ev, el) {
      if(el.name != 'Advertiser not found'){
        $('.advertiser-name span.advertiser-unknown').toggleClass('advertiser-unknown');
        order.set("advertiser_id", el.id);
        order.set("advertiser_name", el.name);
      }
      else{
        $(this).typeahead('setQuery',order.get("advertiser_name"));
      }
    });

    $('.advertiser-name').on('click','#create_advertiser', function(ev){
      ev.preventDefault();
      var name = $('.advertiser-name input.tt-query').val();
      var createAdvertiserInput = '<div class="input-append">';
          createAdvertiserInput += '<input type="text" placeholder="Create Advertiser" id="create_advertiser_input" value='+name+'>';
          createAdvertiserInput += '<a class="btn add-on" id="create_advertiser_btn">Create</a>';
          createAdvertiserInput += '</div>';
      $('.advertiser-name').find('.create-advertiser').html(createAdvertiserInput);
      $('#create_advertiser_input').val(name);

      var advertiser_input = $('#create_advertiser_input');
      advertiser_input.focus();
      advertiser_input[0].setSelectionRange(name.length, name.length);
    });

    $('.advertiser-name input').on('typeahead:closed', function(ev, el) {
      $('.advertiser-name').find('.create-advertiser').html('<a href="#" id="create_advertiser" >Create Advertiser</a>');
      $('.advertiser-name').find('.tt-dropdown-menu').hide();
    });

    $('.advertiser-name').on('click', '#create_advertiser_btn', function(ev){
      var advertiserName = $('#create_advertiser_input').val().replace(/^\s+|\s+$/g,'');
      var para = { name: advertiserName };
      $('.advertiser-name span.advertiser-unknown').toggleClass('advertiser-unknown');
      $('.advertiser-name input').val(advertiserName);
      $('.advertiser-name input').trigger('typeahead:closed');
      order.set("advertiser_name", advertiserName);
    });

    $('.advertiser-name input').on('keyup', function(ev){
      if(ev.which === 27 || ev.keyCode === 27)
        $(this).typeahead('setQuery',order.get("advertiser_name"));
      else
        $('#create_advertiser_input').val($(this).val());
    });

    $('.advertiser-name').on('keyup', '#create_advertiser_input', function(ev){
      if(ev.which === 27 || ev.keyCode === 27){
        $('.advertiser-name').find('.create-advertiser').html('<a href="#" id="create_advertiser" >Create Advertiser</a>');
        $('.advertiser-name input').focus();
      }
    });
  },

  _showOrderDetails: function(order) {
    this.detailOrderView = new ReachUI.Orders.DetailView({model: order});
    this.detailOrderView.on('io:uploaded', this._ioUploaded, this);

    var ordersController = this;
    this.orderDetailsLayout.top.show(this.detailOrderView);

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
        var value = newValue.replace(/^\s+|\s+$/g,'');
        order.set($(this).data('name'), value); //update backbone model;
        $('.new-order-header .heading').html(value);
        $(this).parent().removeClass('field_with_errors');
        $(this).siblings('.errors_container').html('');
      }
    });
    $('.general-info-container .order-name .editable').on('hidden', function(e, reason) {
      var value = $(e.currentTarget).editable('getValue');
      $(e.currentTarget).editable('setValue', value.name.replace(/^\s+|\s+$/g,''));
    });

    $('.general-info-container .editable:not(.typeahead):not(.custom)').editable({
      success: function(response, newValue) {
        order.set($(this).data('name'), newValue); //update backbone model;
      }
    });
    this._setupTypeaheadFields(order);
    this._setupOrderDateFields(order);
  },

  _showPushErrors: function(errors_list, order) {
    _.each(errors_list, function(error) {
      if("order" == error.type) {
        $('.pushing-errors-order-level').html(error.message);
      } else if("ad" == error.type) {
        $('.ad-'+error.ad_id+'.pushing-status').html('<div class="push-failed pull-left"></div> <span class="failed">Push Failed</span> <span class="reason">Why?</span>');
        $('.ad-'+error.ad_id+'.pushing-status span.reason').attr('title', error.message).click(function() { alert(error.message) });
        $('.pushing-errors-order-level').html("[Ad]: "+error.message);
      } else if("creative" == error.type) {
        $('.creative-'+error.creative_id+'.pushing-status').html('<div class="push-failed pull-left"></div> <span class="failed">Push Failed</span> <span class="reason">Why?</span>');
        $('.creative-'+error.creative_id+'.pushing-status span.reason').attr('title', error.message).click(function() { alert(error.message) });
        $('.pushing-errors-order-level').html("[Creative]: "+error.message);
      } else if("assignment" == error.type) {
        $('.assignment-'+error.assignment_id+'.pushing-status').html('<div class="push-failed pull-left"></div> <span class="failed">Push Failed</span> <span class="reason">Why?</span>');
        $('.assignment-'+error.assignment_id+'.pushing-status span.reason').attr('title', error.message).click(function() { alert(error.message) });
        $('.pushing-errors-order-level').html("[Creative]: "+error.message);
      }
    });
  },

  _showLineitemList: function(order) {
    var self = this;

    if (!this.lineItemList.getOrder() || this.lineItemList.getOrder().id !== order.id) {
      this.lineItemList.reset();
      this.lineItemList.setOrder(order);
      this.lineItemList.fetch().then(
        function(collection, response, options) {
          _.each(self.lineItemList.models, function(li, index) {
            li.set('creatives', new ReachUI.Creatives.CreativesList(collection[index].creatives));
          });
          order.lineItemList = self.lineItemList;
          self._liSetCallbacksAndShow(self.lineItemList);
        },
        function(model, response, options) {
          console.log('error while getting lineitems list');
          console.log(response);
        }
      );
    } else {
      this.lineItemList.setOrder(order);
      this._liSetCallbacksAndShow(this.lineItemList);
    }
  },

  _calculateRemainingImpressions: function(li) {
    var remaining_impressions = li.get('volume') * (100 + parseFloat(li.get('buffer'))) / 100;

    _.each(li.ads, function(ad) {
      remaining_impressions -= ad.get('volume');
      if (remaining_impressions < 0) {
        remaining_impressions = 0;
      }
    });

    return remaining_impressions;
  },

  // Ad name should be in this format [https://github.com/collectivemedia/reachui/issues/269] [previous #89]
  // Client Abbreviation + Advertiser Name + GEO + BT/CT or RON + QuarterYear + Ad Sizes (300x250 160x600 728x90)
  // Example:  RE TW Rodenbaugh's Q413 GEO BTCT 728x90, 300x250, 160x600
  _generateAdName: function(li, ad_type) {
    var start_date = new Date(li.attributes.start_date);
    var start_quarter = ReachUI.getQuarter(start_date);
    var start_year = start_date.getFullYear() % 100;

    var isGeo = (li.get('targeting').get('selected_zip_codes').length != 0) || (li.get('targeting').get('selected_geos').length != 0);
    var hasCustomKeyValues = li.get('targeting').get('keyvalue_targeting').length > 0;
    var hasKeyValues       = li.get('targeting').get('selected_key_values').length > 0;

    var ad_name_parts = [];

    var reach_client_abbr = li.collection.order.get("reach_client_abbr") || li.collection.order.attributes.reach_client_abbr;

    if(reach_client_abbr == "TWC") {
      ad_name_parts.push(reach_client_abbr);
      ad_name_parts.push(li.collection.order.attributes.client_advertiser_name);
    } else if (reach_client_abbr == "RE CD" || li.collection.order.attributes.reach_client_abbr == "RE TW") {
      ad_name_parts.push(reach_client_abbr);
      ad_name_parts.push(li.collection.order.attributes.client_advertiser_name);
    } else {
      ad_name_parts.push(li.collection.order.attributes.name);
    }

    if (isGeo) {
      ad_name_parts.push("GEO");
    }
    if (hasCustomKeyValues || hasKeyValues) {
      ad_name_parts.push("BT/CT");
    } else {
      ad_name_parts.push("RON");
    }

    if(reach_client_abbr == "TWC" || reach_client_abbr == "RE CD" || reach_client_abbr == "RE TW") {
      ad_name_parts.push('Q'+start_quarter+start_year);
    }

    if ("Companion" == ad_type) {
      ad_name_parts.push("Companion");
    } else if("Video" == ad_type) {
      ad_name_parts.push("Preroll");
    } else if("Mobile" == ad_type) {
      ad_name_parts.push("^Mob");
    }

    if ("Video" == ad_type) {
      ad_name_parts.push(li.get('master_ad_size'));
    } else if("Companion" == ad_type) {
      ad_name_parts.push(li.get('companion_ad_size'));
    } else {
      ad_name_parts.push(li.get('ad_sizes').replace(/,/g, ' '));
    }

    if ("Facebook" == ad_type) {
      ad_name_parts.push("FBX");
    }
    ad_name = ad_name_parts.join(' ');

    // add "(2)" or "(n)" at the end of ad description (if there are more then 1 such descriptions)
    var same_ad_names = 1;
    _.each(li.ads, function(ad) {
      var name_regexp = new RegExp("^"+RegExp.escape(ad_name));
      if(ad.get('description').match(name_regexp)) {
        same_ad_names += 1;
      }
    });

    if(same_ad_names > 1) {
      ad_name += " ("+same_ad_names+")";
    }

    var notes = li.get('notes');
    var extracted_li_id = notes ? notes.match(/Proposal Line Item ID: (\d+)/) : '';
    var li_id = li.get('li_id') ? li.get('li_id') : (extracted_li_id ? extracted_li_id[1] : '');

    var is_cox = false;
    if (li.collection.order.attributes.reach_client_abbr == "RE CD") {
      is_cox = true;
    }

    return ad_name + (li_id ? (is_cox ? ' - ' : ' ') + li_id : '');
  },

  /////////////////////////////////////////////////////////////////////////////////////////
  // the main function dealing with lineitems/ads/creatives
  _liSetCallbacksAndShow: function(lineItemList) {
    this.lineItemListView = new ReachUI.LineItems.LineItemListView({collection: lineItemList});

    var ordersController = this;

    // adding Ad under certain lineitem
    this.lineItemListView.on('itemview:lineitem:add_ad', function(li_view, args) {
      var li = li_view.model;
      var type = args.type || li.get('type');
      var ad_name = ordersController._generateAdName(li, type);

      var buffer = 1 + li.get('buffer') / 100;
      var remaining_impressions = parseInt(ordersController._calculateRemainingImpressions(li)); 
      var attrs = _.extend(_.omit(li.attributes, 'id', '_delete_creatives', 'name', 'alt_ad_id', 'itemIndex', 'ad_sizes', 'targeting', 'targeted_zipcodes', 'master_ad_size', 'companion_ad_size', 'notes', 'li_id', 'buffer'), {description: ad_name, io_lineitem_id: li.get('id'), size: li.get('ad_sizes'), volume: remaining_impressions, type: type});
      var frequencyCaps = ReachUI.omitAttribute(li.get('targeting').get('frequency_caps'), 'id');

      var ad = new ReachUI.Ads.Ad(attrs);

      var li_targeting = new ReachUI.Targeting.Targeting({
        selected_key_values: li.get('targeting').get('selected_key_values'),
        selected_geos: li.get('targeting').get('selected_geos'),
        dmas_list: li.get('targeting').get('dmas_list'),
        selected_zip_codes: li.get('targeting').get('selected_zip_codes'),
        audience_groups: li.get('targeting').get('audience_groups'),
        keyvalue_targeting: li.get('targeting').get('keyvalue_targeting'),
        frequency_caps: frequencyCaps,
        type: type
      });

      if (type != 'Companion') {
        ad.set('targeting', li_targeting);
      }

      var li_creatives = [];
      _.each(li.get('creatives').models, function(li_creative) {
        var cloned_creative = new ReachUI.Creatives.Creative({
          id: li_creative.get('id'),
          parent_cid: li_creative.cid, // need to identify same Creative on both Ad and LI levels
          client_ad_id: li_creative.get('client_ad_id'),
          ad_size: li_creative.get('ad_size'),
          end_date: li_creative.get('end_date'),
          redirect_url: li_creative.get('redirect_url'),
          html_code: li_creative.get('html_code'),
          html_code_excerpt: li_creative.get('html_code_exceprt'),
          start_date: li_creative.get('start_date'),
          creative_type: li_creative.get('creative_type')
        });
        li_creatives.push(cloned_creative);
      });

      ad.set('creatives', new ReachUI.Creatives.CreativesList(li_creatives))

      li.pushAd(ad);
      li_view.renderAd(ad);
    });

    // only if `show` action
    if (lineItemList.order.id) {
      var dmas = new ReachUI.DMA.List();
      var ags = new ReachUI.AudienceGroups.AudienceGroupsList();

      var order_ads = new ReachUI.Ads.AdList();
      order_ads.setOrder(lineItemList.order);

      $.when( order_ads.fetch(), dmas.fetch(), ags.fetch() ).done(function(adsResult, dmasResult, agsResult) {
        var li_ads = {};
        _.each(adsResult[0], function(attrs) {
          if (!li_ads[attrs.ad.io_lineitem_id]) {
            li_ads[attrs.ad.io_lineitem_id] = [];
          }
          li_ads[attrs.ad.io_lineitem_id].push(attrs);
        });

        // set targeting for existing Order
        var itemIndex = 1;
        _.each(ordersController.lineItemListView.children._views, function(li_view, li_name) {
          var li            = li_view.model;

          var selected_geos  = li.get('selected_geos') ? li.get('selected_geos') : [];
          var zipcodes       = li.get('targeted_zipcodes') ? li.get('targeted_zipcodes').split(',') : [];
          var kv             = li.get('selected_key_values') ? li.get('selected_key_values') : [];
          var frequency_caps = li.get('frequency_caps') ? li.get('frequency_caps') : [];

          li.set({
            'itemIndex': itemIndex,
            'targeting': new ReachUI.Targeting.Targeting({
            selected_zip_codes: zipcodes,
            selected_geos: selected_geos,
            selected_key_values: kv,
            dmas_list: dmasResult[0],
            frequency_caps: frequency_caps,
            audience_groups: ags.attributes,
            keyvalue_targeting: li.get('keyvalue_targeting'),
            type: li.get('type') })
          }, { silent: true });

          li_view.renderTargetingDialog();

          itemIndex += 1;

          li_view.model.ads = [];
          _.each(li_ads[li_view.model.get('id')], function(attrs) {
            attrs.ad.start_date = moment(attrs.ad.start_date).format("YYYY-MM-DD");
            attrs.ad.end_date = moment(attrs.ad.end_date).format("YYYY-MM-DD");

            var ad = new ReachUI.Ads.Ad(attrs.ad);

            ad.set({
              'creatives': new ReachUI.Creatives.CreativesList(attrs.creatives),
              'targeting': new ReachUI.Targeting.Targeting({
              selected_zip_codes: attrs.ad.targeted_zipcodes,
              selected_geos: attrs.selected_geos,
              selected_key_values: attrs.selected_key_values,
              frequency_caps: attrs.frequency_caps,
              dmas_list: li_view.model.get('targeting').get('dmas_list'),
              audience_groups: li_view.model.get('targeting').get('audience_groups'),
              keyvalue_targeting: attrs.ad.keyvalue_targeting,
              dfp_key_values: attrs.ad.dfp_key_values,
              ad_dfp_id: attrs.ad.source_id,
              type: li_view.model.get('type')})});

            li_view.model.pushAd(ad);
            li_view.renderAd(ad);
          });
        });

        lineItemList._recalculateLiImpressionsMediaCost();
        if(lineItemList.order.get('pushing_errors').length > 0) {
          ordersController._showPushErrors(lineItemList.order.get('pushing_errors'), lineItemList.order);
        }
      });
    } else { // not persisted Order/Lineitems
      var dmas = new ReachUI.DMA.List();
      var ags = new ReachUI.AudienceGroups.AudienceGroupsList();

      $.when.apply($, [ dmas.fetch(), ags.fetch() ]).done(function() {
        var dmas_list = _.map(dmas.models, function(el) { return {code: el.attributes.code, name: el.attributes.name} });
        var itemIndex = 1;

        _.each(ordersController.lineItemListView.children._views, function(li_view, li_name) {
          var li   = li_view.model;

          li.set({
            'itemIndex': itemIndex,
            'targeting': new ReachUI.Targeting.Targeting({
              dmas_list: dmas_list,
              audience_groups: ags.attributes,
              keyvalue_targeting: li_view.model.get('keyvalue_targeting'),
              type: li_view.model.get('type')})
          }, { silent: true });

          li_view.renderTargetingDialog();
          li_view._recalculateMediaCost();

          itemIndex += 1;
        });
        lineItemList._recalculateLiImpressionsMediaCost();
      });
    }
    this.orderDetailsLayout.bottom.show(this.lineItemListView);

    // order note reload
    this.lineItemListView.on('ordernote:reload', function(){
      ordersController.noteList.fetch({reset: true});
    });

    this._showNotesView(lineItemList.order, this.lineItemListView);

    var orderDetailsView = this.orderDetailsLayout.top.currentView;
    orderDetailsView.setLineItemView(this.lineItemListView);
  },

  _liUpdateBuffer: function(buffer) {
    if (this.lineItemList && this.lineItemList.length > 0) {
      _.each(this.lineItemList.models, function(li) {
        li.setBuffer(buffer);
      });
    }
  },

  _showNotesView: function(order, li_view) {
    this.notesRegion = new ReachUI.Orders.NotesRegion();
    this.noteList = new ReachUI.Orders.NoteList(order.get('notes'));
    this.noteList.setOrder(order);
    this.notes_list_view = new ReachUI.Orders.NoteListView({collection: this.noteList, order: order, li_view: li_view});
    this.notesRegion.show(this.notes_list_view);
  },
});
