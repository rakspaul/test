(function(LineItems) {
  'use strict';

  LineItems.LineItem = Backbone.Model.extend({
    initialize: function() {
      this.ads = [];
      this.creatives = [];
    },

    defaults: function() {
      return {
        volume: 0,
        rate: 0.0,
        start_date: moment().add('days', 1).format("YYYY-MM-DD"),
        end_date: moment().add('days', 15).format("YYYY-MM-DD"),
        _delete_creatives: []
      }
    },

    url: function() {
      if(this.isNew()) {
        return '/orders/' + this.get("order_id") + '/lineitems.json';
      } else {
        return '/orders/' + this.get("order_id") + '/lineitems/' + this.id + '.json';
      }
    },

    toJSON: function() {
      return { lineitem: _.clone(this.attributes), ads: this.ads, creatives: this.get('creatives') };
    },

    pushAd: function(ad) {
      this.ads.push(ad);
    }
  });

  LineItems.LineItemList = Backbone.Collection.extend({
    model: LineItems.LineItem,
    url: function() {
      return '/orders/' + this.order.id + '/lineitems.json';
    },

    setOrder: function(order) {
      this.order = order;
    },

    getOrder: function() {
      return this.order;
    },

    _recalculateLiImpressionsMediaCost: function() {
      var sum_impressions = _.inject(this.models, function(sum, el) {
        var imps = parseInt(String(el.get('volume')).replace(/,|\./, ''));
        sum += imps;
        return sum;
      }, 0);

      var sum_media_cost = _.inject(this.models, function(sum, el) {
        sum += Math.round(parseFloat(el.get('value')) * 100) / 100;
        return sum;
      }, 0.0);

      var cpm_total = (sum_media_cost / sum_impressions) * 1000;

      $('.lineitems-summary-container .total-impressions').html(accounting.formatNumber(sum_impressions));
      $('.lineitems-summary-container .total-media-cost').html(accounting.formatMoney(sum_media_cost));
      $('.lineitems-summary-container .total-cpm').html(accounting.formatMoney(cpm_total));
      $('.total-media-cost span').html(accounting.formatMoney(sum_media_cost));
    }
  });

  LineItems.LineItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    className: 'lineitem pure-g',

    getTemplate: function() {
      var type = this.model.get('type') ? this.model.get('type').toLowerCase() : 'display';
      if (type == 'display') {
        return JST['templates/lineitems/line_item_row'];
      } else {
        return JST['templates/lineitems/line_item_' + type + '_row'];
      }
    },

    initialize: function(){
      _.bindAll(this, "render");
      this.model.bind('change', this.render); // when start/end date is changed we should rerender the view

      this.creatives_visible = {};
      this.li_notes_collapsed = false;

      if(! this.model.get('targeting')) {
        var targeting = new ReachUI.Targeting.Targeting({type: this.model.get('type'), keyvalue_targeting: this.model.get('keyvalue_targeting')});
        this.model.set('targeting', targeting);
      }
    },

    _recalculateMediaCost: function() {
      var imps = parseInt(String(this.model.get('volume')).replace(/,|\./, ''));
      var cpm  = parseFloat(this.model.get('rate'));

      var media_cost = (imps / 1000.0) * cpm;
      this.model.set('value', media_cost);
      var $li_media_cost = this.$el.find('.pure-u-1-12.media-cost span');
      $($li_media_cost[0]).html(accounting.formatMoney(media_cost, ''));
    },

    // after start/end date changed LI is rerendered, so render linked Ads also
    onRender: function() {
      var view = this;
      $.fn.editable.defaults.mode = 'popup';

      this.$el.removeClass('highlighted'); // remove hightlighted state that is set after 'Paste Targeting' btn

      this.$el.find('.start-date .editable.custom').editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD");

          // update creatives start date
          if (view.model.get('creatives').models) {
            _.each(view.model.get('creatives').models, function(creative) {
              creative.set('start_date', date);
            });
          }

          view.model.set($(this).data('name'), date); //update backbone model;

          // order's start date should be lowest of all related LIs
          var start_dates = _.map(view.model.collection.models, function(el) { return el.attributes.start_date; }), min_date = start_dates[0];
          _.each(start_dates, function(el) { if(el < min_date) { min_date = el; } });

          $('.order-details .start-date .date').html(min_date).editable('option', 'value', moment(min_date)._d);
          view.model.collection.order.set('start_date', min_date); //update order backbone model
        },
        datepicker: {
          startDate: moment().format("YYYY-MM-DD")
        }
      });

      this.$el.find('.end-date .editable.custom').editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD");

          // update creatives end date
          if (view.model.get('creatives').models) {
            _.each(view.model.get('creatives').models, function(creative) {
              creative.set('end_date', date);
            });
          }

          view.model.set($(this).data('name'), date); //update backbone model;

          // order's end date should be highest of all related LIs
          var end_dates = _.map(view.model.collection.models, function(el) { return el.attributes.end_date; }), max_date = end_dates[0];
          _.each(end_dates, function(el) { if(el > max_date) { max_date = el; } })
          $('.order-details .end-date .date').html(max_date).editable('option', 'value', moment(max_date)._d);
          view.model.collection.order.set("end_date", max_date); //update backbone model
        },
        datepicker: {
          startDate: moment().format("YYYY-MM-DD")
        }
      });

      this.$el.find('.lineitem-sizes .editable').editable({
        inputclass: 'input-large',
        select2: {
          tags: true,
          tokenSeparators: [",", " "],
          initSelection : function (element, callback) {
              var data = [];
              $(element.val().split(",")).each(function () {
                  data.push({id: this, text: this});
              });
              callback(data);
          },
          ajax: {
            url: "/ad_sizes.json",
            dataType: "json",
            data: function(term, page) {
              return {
                search: term
              };
            },
            results: function(data, page) {
              return {
                results: _.map(data, function(result) {
                  return { id: result.size, text: result.size }
                })
              }
            }
          },
        },
        success: function(response, newValue) {
          if (view.model.get('type') == 'Video') {
            var value = newValue.join(', ');
            view.model.set('companion_ad_size', value);
            view.model.set('ad_sizes', view.model.get('master_ad_size') + ', ' + value);
          } else {
            view.model.set('ad_sizes', newValue.join(', '));
          }
        }
      });

      // select Creative size from the drop-down autocomplete
      this.$el.find('.size .editable.custom').editable({
        source: '/ad_sizes.json',
        typeahead: {
          minLength: 1,
          remote: '/ad_sizes.json?search=%QUERY',
          valueKey: 'size'
        },
        validate: function(value) {
          var name = $(this).data('name');
          var size = value;
          if (name == 'master_ad_size' &&
              !value.match(/^\d+x\d+$/i)) {
            return 'Only one master ad size is allowed';
          }
        }
      });
      this.$el.find('.size').on('typeahead:selected', function(ev, el) {
        var name = $(this).find('.editable').data('name');
        view.model.set(name, el.size);
        var type = view.model.get('type');
        if (type == 'Video') {
          var companion_ad_size = view.model.get('companion_ad_size');
          view.model.set('ad_sizes', view.model.get('master_ad_size') + ', ' + companion_ad_size);
        }
      });

      this.$el.find('.rate .editable.custom').editable({
        success: function(response, newValue) {
          view.model.set($(this).data('name'), newValue); //update backbone model;
          view._recalculateMediaCost();
          view.model.collection._recalculateLiImpressionsMediaCost();
        }
      });

      this.$el.find('.volume .editable.custom').editable({
        success: function(response, newValue) {
          view.model.set($(this).data('name'), newValue); //update backbone model;
          view._recalculateMediaCost();
          view.model.collection._recalculateLiImpressionsMediaCost();
        }
      });

      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          view.model.set($(this).data('name'), newValue); //update backbone model;
        }
      });

      this.renderCreatives();
      this.renderTargetingDialog();
      ReachUI.alignLINumberDiv();

      this.ui.ads_list.html('');
      var ads = this.model.ads.models || this.model.ads.collection || this.model.ads;
      _.each(ads, function(ad) {
        if (!ad.get('creatives').length) {
          ad.set('size', view.model.get('ad_sizes'));
        }
        view.renderAd(ad);
      });
    },

    renderTargetingDialog: function() {
      var targetingView = new ReachUI.Targeting.TargetingView({model: this.model.get('targeting'), parent_view: this});
      this.ui.targeting.html(targetingView.render().el);

      ReachUI.showCondensedTargetingOptions.apply(this);
    },

    renderAd: function(ad) {
      var li_view = this,
          ad_view = new ReachUI.Ads.AdView({model: ad, parent_view: li_view});
      li_view.ui.ads_list.append(ad_view.render().el);
      ReachUI.showCondensedTargetingOptions.apply(ad_view);
      ReachUI.alignAdsDivs();
    },

    renderCreatives: function() {
      var view = this, is_cox_creative = false;
      
      // check whether there are Cox Creatives
      if(this.model.get('creatives')) {
        _.each(this.model.get('creatives').models, function(creative) {
          if(creative.get('html_code')) {
            is_cox_creative = true;
          }
        })
      }

      // rendering template for Creatives Dialog layout
      var creatives_list_view = new ReachUI.Creatives.CreativesListView({parent_view: this, is_cox_creative: is_cox_creative});
      this.ui.creatives_container.html(creatives_list_view.render().el);

      // rendering each Creative
      if(this.model.get('creatives')) {
        _.each(this.model.get('creatives').models, function(creative) {
          creative.set('order_id', view.model.get('order_id'));
          creative.set('lineitem_id', view.model.get('id'));
          var creativeView = new ReachUI.Creatives.CreativeView({model: creative, parent_view: view});
          creatives_list_view.ui.creatives.append(creativeView.render().el);
        });
      }
    },

    ///////////////////////////////////////////////////////////////////////////////
    // Toggle Creatives div (could be called both from LI level and from Creatives level: 'Done' button)
    _toggleCreativesDialog: function(e, showed) {
      var self = this,
          creatives = this.model.get('creatives').models;

      //this._updateCreativesCaption();

      var is_visible = ($(this.ui.creatives_container).css('display') == 'block');
      var edit_creatives_title = '<span class="pencil-icon"></span>Edit Creatives (' + creatives.length + ')';
      if (showed) {
        if (!is_visible) {
          this.ui.creatives_container.show('slow', function() {
            self.$el.find('.toggle-creatives-btn').html(edit_creatives_title);
          });
        }
      } else {
        this.ui.creatives_container.toggle('slow', function() {
          self.$el.find('.toggle-creatives-btn').html(is_visible ? edit_creatives_title : 'Hide Creatives');
        });
      }
    },

    _toggleTargetingDialog: function() {
      var is_visible = ($(this.ui.targeting).css('display') == 'block');
      this.$el.find('.toggle-targeting-btn').html(is_visible ? '+ Add Targeting' : 'Hide Targeting');
      $(this.ui.targeting).toggle('slow');

      if(is_visible) {
        ReachUI.showCondensedTargetingOptions.apply(this);
        ReachUI.alignLINumberDiv()
      }
    },

    _addTypedAd: function(ev) {
      var type = $(ev.currentTarget).data('type');
      this.trigger('lineitem:add_ad', { "type": type });
    },

    serializeData: function(){
      var data = this.model.toJSON();
      data.li_notes_collapsed = this.li_notes_collapsed;
      return data;
    },

    collapseLINotes: function(e) {
      this.li_notes_collapsed = true;
      this.$el.find('.name .notes').hide();
      this.$el.find('.expand-notes').show();
      this.render();
    },

    expandLINotes: function(e) {
      this.li_notes_collapsed = false;
      this.$el.find('.name .notes').show();
      this.$el.find('.expand-notes').hide();
      this.render();
    },

    _toggleLISelection: function() {
      // if there is no copied targeting then exclusive select, otherwise accumulative
      if(!window.copied_targeting) {
        this._deselectAllLIs({'except_current': true});
      }

      this.$el.find('.li-number .number').toggleClass('selected');
      this.selected = this.$el.find('.li-number .number').hasClass('selected');
      this.$el.find('.copy-targeting-btn').toggle();

      if(window.selected_lis === undefined) {
        window.selected_lis = [];
      }
      if(this.selected) {
        window.selected_lis.push(this); // add current LI to selected LIs
      } else {
        window.selected_lis.splice(this, 1); // remove current LI from selected LIs
      }

      if(window.copied_targeting) {
        $('.copy-targeting-btn, .paste-targeting-btn, .cancel-targeting-btn').hide();
        this.$el.find('.paste-targeting-btn, .cancel-targeting-btn').toggle();
      }
    },

    copyTargeting: function(e) {
      e.stopPropagation();
      var li_t = this.model.get('targeting');
      window.copied_targeting = new ReachUI.Targeting.Targeting({
        selected_key_values: _.clone(li_t.get('selected_key_values')),
        selected_dmas: _.clone(li_t.get('selected_dmas')),
        dmas_list: _.clone(li_t.get('dmas_list')),
        selected_zip_codes: _.clone(li_t.get('selected_zip_codes')),
        audience_groups: _.clone(li_t.get('audience_groups')),
        keyvalue_targeting: _.clone(li_t.get('keyvalue_targeting'))
      });
      noty({text: 'Targeting copied', type: 'success', timeout: 3000});
      this._deselectAllLIs();
      this.$el.addClass('copied-targeting-from');
    },

    _deselectAllLIs: function(options) {
      var self = this;
      if(options && options['except_current']) {
        var lis_to_deselect = _.filter(window.selected_lis, function(el) {return el != self});
      } else {
        var lis_to_deselect = window.selected_lis;
      }

      _.each(lis_to_deselect, function(li) {
        li.selected = false;
        li.$el.find('.li-number .number').removeClass('selected');
        li.$el.find('.copy-targeting-btn, .paste-targeting-btn, .cancel-targeting-btn').hide();
        li.renderTargetingDialog();
      });
      window.selected_lis = [];
    },

    pasteTargeting: function(e) {
      e.stopPropagation();
      noty({text: 'Targeting pasted', type: 'success', timeout: 3000});
      _.each(window.selected_lis, function(li) {
        li.model.set('targeting', window.copied_targeting);
        li.renderTargetingDialog();
        li.$el.find('.targeting_options_condensed').eq(0).find('.targeting-options').addClass('highlighted');
      });
    },

    cancelTargeting: function(e) {
      e.stopPropagation();
      window.copied_targeting = null;
      $('.lineitem').removeClass('copied-targeting-from');
      this._deselectAllLIs();
    },

    _changeMediaType: function(ev) {
      var type = $(ev.currentTarget).data('type');
      if (type == 'Video' && !this.model.get('master_ad_size')) {
        this.model.set('master_ad_size', '1x1');
      }
      if (type == 'Video') {
        this.model.set('companion_ad_size', this.model.get('ad_sizes'));
      }
      this.model.set('type', type);
      _.each(this.model.ads, function(ad) {
        ad.set('type', type);
      });
    },

    ui: {
      ads_list: '.ads-container',
      targeting: '.targeting-container',
      creatives_container: '.creatives-list-view',
      creatives_content: '.creatives-content',
      lineitem_sizes: '.lineitem-sizes'
    },

    events: {
      'click .toggle-targeting-btn': '_toggleTargetingDialog',
      'click .toggle-creatives-btn': '_toggleCreativesDialog',
      'click .li-add-ad-btn': '_addTypedAd',
      'click .name .notes .close-btn': 'collapseLINotes',
      'click .name .expand-notes': 'expandLINotes',
      'click .li-number': '_toggleLISelection',
      'click .copy-targeting-btn': 'copyTargeting',
      'click .paste-targeting-btn': 'pasteTargeting',
      'click .cancel-targeting-btn': 'cancelTargeting',
      'click .change-media-type': '_changeMediaType'
    },

    triggers: {
      'click .li-command-btn': 'lineitem:add_ad'
    }
  });

  LineItems.LineItemListView = Backbone.Marionette.CompositeView.extend({
    itemView: LineItems.LineItemView,
    itemViewContainer: '.lineitems-container',
    template: JST['templates/lineitems/line_item_table'],
    className: 'lineitems-container',

    _saveOrder: function() {
      this._clearAllErrors();
      var lineitems = this.collection;
      var self = this;

      // store Order and Lineitems in one POST request
      this.collection.order.save({lineitems: lineitems.models, order_status: self.status}, {
        success: function(model, response, options) {
          // error handling
          var errors_fields_correspondence = {
            reach_client: '.order-details .billing-contact-company',
            name: '.order-details .order-name',
            start_date: '.order-details .start-date',
            end_date: '.order-details .end-date',
            billing_contact: '.order-details .billing-contact-name',
            media_contact: '.order-details .media-contact-name',
            sales_person: '.order-details .salesperson-name',
            account_manager: '.order-details .account-contact-name',
            trafficking_contact: '.order-details .trafficker-container',
            lineitems: {
              start_date: 'div > .start-date',
              end_date:   'div > .end-date',
              name:       ' .name',
              volume:     ' .volume',
              ad_sizes:   ' .li-sizes, .lineitem-sizes'
            },
            ads: {
              start_date:  ' .start-date',
              end_date:    ' .end-date',
              description: ' .name',
              volume:      ' .volume'
            },
            creatives: {
              start_date:  ' .start-date',
              end_date:    ' .end-date'
            }
          };
          if(response.status == "error") {
            _.each(response.errors, function(error, key) {
              if(key == 'lineitems') {
                _.each(error, function(li_errors, li_k) {
                  _.each(li_errors.lineitems, function(errorMsg, fieldName) {
                    var fieldSelector = errors_fields_correspondence.lineitems[fieldName];
                    var field = $('.lineitems-container .lineitem:nth(' + li_k + ')').find(fieldSelector);

                    field.addClass('field_with_errors');
                    field.find(' .errors_container:first').html(ReachUI.humanize(errorMsg));
                  });

                  if (li_errors["creatives"]) {// && li_errors["creatives"][li_k]) {
                    $('.lineitems-container .lineitem:nth(' + li_k + ') .toggle-creatives-btn').trigger('click', true);
                  }

                  if (li_errors["targeting"]) {
                    $('.lineitems-container .lineitem:nth(' + li_k + ') .custom-kv-errors.errors_container').first().html(li_errors["targeting"]);
                  }

                  _.each(li_errors["creatives"], function(creative_errors, creative_k) {
                    _.each(creative_errors, function(errorMsg, fieldName) {
                      var fieldSelector = errors_fields_correspondence.creatives[fieldName];
                      var field = $('.lineitems-container .lineitem:nth(' + li_k + ')')
                                    .find('.creative:nth(' + creative_k + ') ' + fieldSelector);

                      field.addClass('field_with_errors');
                      field.find('.errors_container').html(errorMsg);
                    });
                  });

                  _.each(li_errors["ads"], function(ad_errors, ad_k) {
                    _.each(ad_errors, function(errorMsg, fieldName) {
                      if (fieldName != 'creatives') {
                        var fieldSelector = errors_fields_correspondence.ads[fieldName];
                        var field = $('.lineitems-container .lineitem:nth(' + li_k + ')')
                                    .find('.ad:nth(' + ad_k + ') ' + fieldSelector);
                        field.addClass('field_with_errors');
                        field.find('.errors_container').html(ReachUI.humanize(errorMsg));
                        ReachUI.alignAdsDivs();
                      }
                    });

                    if (ad_errors && ad_errors["creatives"]) {
                      $('.lineitems-container .lineitem:nth(' + li_k + ')')
                        .find('.ad:nth(' + ad_k + ') .toggle-ads-creatives-btn').trigger('click', true);
                    }

                    if (ad_errors["targeting"]) {
                      $('.lineitems-container .lineitem:nth(' + li_k + ')').find('.ad:nth(' + ad_k + ') .custom-kv-errors.errors_container').html(ad_errors["targeting"]);
                    }

                    if (ad_errors && ad_errors["creatives"]) {
                      _.each(ad_errors["creatives"], function(creative_errors, creative_k) {
                        _.each(creative_errors, function(errorMsg, fieldName) {
                          var fieldSelector = errors_fields_correspondence.creatives[fieldName];
                          var field = $('.lineitems-container .lineitem:nth(' + li_k + ')')
                                    .find('.ad:nth(' + ad_k + ') .creative:nth(' + creative_k + ') ' + fieldSelector);
                            field.addClass('field_with_errors');
                          field.find('.errors_container').html(errorMsg);
                        });
                      });
                    }
                  });
                });
              } else {
                var field_class = errors_fields_correspondence[key];
                $(field_class + ' .errors_container').html(ReachUI.humanize(error));
                $(field_class).addClass('field_with_errors');
              }
            });
            noty({text: 'There was an error while saving an order', type: 'error', timeout: 5000});
          } else if(response.status == "success") {
            $('.current-io-status-top .io-status').html(response.state);
            if (response.state.match(/pushing/i)) {
              noty({text: "Your order has been saved and is pushing to the ad server", type: 'success', timeout: 5000});
              ReachUI.checkOrderStatus(response.order_id);
              self.trigger('ordernote:reload');
            } else if(response.state.match(/draft/i)) {
              noty({text: "Your order has been saved", type: 'success', timeout: 5000})
            } else if(response.state.match(/ready for am/i)) {
              noty({text: "Your order has been saved and is ready for the Account Manager", type: 'success', timeout: 5000});
            } else if(response.state.match(/ready for trafficker/i)) {
              noty({text: "Your order has been saved and is ready for the Trafficker", type: 'success', timeout: 5000})
            } else if (response.state.match(/incomplete_push/i)) {
              noty({text: "Your order has been pushed incompletely", type: 'success', timeout: 5000})
            }
            if (response.order_id) {
              ReachUI.Orders.router.navigate('/'+ response.order_id, {trigger: true});
            }
          }
        },
        error: function(model, xhr, options) {
          noty({text: 'There was an error while saving Order.', type: 'error', timeout: 5000})
          console.log(xhr.responseJSON);
        }
      });
    },

    _pushOrder: function() {
      var self = this;

      if(_.include(["Pushed", "Failure"], this.collection.order.get('order_status'))) {
        $('#push-confirmation-dialog .cancel-btn').click(function() {
          $('#push-confirmation-dialog').modal('hide');
        });
        $('#push-confirmation-dialog .push-btn').click(function() {
          $('#push-confirmation-dialog').modal('hide');
          self._saveOrderWithStatus('pushing');
        });
        $('#push-confirmation-dialog').modal('show');
      } else {
        this._saveOrderWithStatus('pushing');
      }
    },

    _submitOrderToAm: function() {
      this._saveOrderWithStatus('ready_for_am');
    },

    _submitOrderToTrafficker: function() {
      this._saveOrderWithStatus('ready_for_trafficker');
    },

    _saveOrderDraft: function() {
      this._saveOrderWithStatus('draft');
    },

    _saveOrderWithStatus: function(status) {
      this.status = status;
      this._saveOrder();
    },

    events: {
      'click .save-order-btn':        '_saveOrderDraft',
      'click .push-order-btn':        '_pushOrder',
      'click .submit-am-btn':         '_submitOrderToAm',
      'click .submit-trafficker-btn': '_submitOrderToTrafficker'
    },

    triggers: {
      'click .create': 'lineitem:create'
    },

    _clearAllErrors: function() {
      $('.errors_container').html('');
      $('.field, .lineitems-container .field_with_errors').removeClass('field_with_errors');
    }
  });

})(ReachUI.namespace("LineItems"));
