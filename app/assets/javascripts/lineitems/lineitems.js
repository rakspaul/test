(function(LineItems) {
  'use strict';

  LineItems.LineItem = Backbone.Model.extend({
    _default_keyvalue_targeting: {
      "Facebook": "fbx=_default",
      "Mobile":   "mob=_default"
    },

    initialize: function() {
      this.ads = [];
      this.creatives = [];
      this.platforms = [];
      this.is_blank_li = false;
      this.revised_targeting = false;
    },

    defaults: function() {
      return {
        volume: 0,
        buffer: 0,
        rate: 0.0,
        start_date: moment().add('days', 1).format("YYYY-MM-DD"),
        end_date: moment().add('days', 15).format("YYYY-MM-DD"),
        type: 'display',
        _delete_creatives: [],
        li_status: 'Draft',
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
      var lineitem = _.clone(this.attributes);
      var frequencyCaps = lineitem['targeting'].get('frequency_caps'),
          uniqFrequencyCaps = [];
      if (frequencyCaps.toNestedAttributes && frequencyCaps.models.length > 0) {
        lineitem['frequency_caps_attributes'] = frequencyCaps.toNestedAttributes();
      } else if (frequencyCaps.length > 0) {
        lineitem['frequency_caps_attributes'] = frequencyCaps;
      }
      _.each(lineitem['frequency_caps_attributes'], function(fc) {
        var exists = _.any(uniqFrequencyCaps, function(u) {
          return u.impressions == fc.impressions &&
                 u.time_value  == fc.time_value  &&
                 u.time_unit   == fc.time_unit;
        });
        if (!exists.id && fc.id) {
          exists.id = fc.id;
        }
        if (fc._destroy || !exists) {
          uniqFrequencyCaps.push(fc);
        }
      });
      if (uniqFrequencyCaps.length > 0) {
        lineitem['frequency_caps_attributes'] = uniqFrequencyCaps;
      }
      delete lineitem['frequency_caps'];
      delete lineitem['selected_zip_codes'];
      return { lineitem: lineitem, ads: this.ads, creatives: this.get('creatives') };
    },

    setBlankLiFlag: function() {
      this.is_blank_li = true;
    },

    pushAd: function(ad) {
      this.ads.push(ad);
    },

    setBuffer: function(buffer) {
      var adImps,
          prevBuffer = (isNaN(this.get('buffer')) ? 0.0 : parseFloat(this.get('buffer'))),
          ratio = (100 + parseFloat(buffer)) / (100 + prevBuffer),
          ads = this.ads.models || this.ads.collection;
      _.each(this.ads, function(ad) {
        adImps = parseInt(String(ad.get('volume')).replace(/,|\./g, ''));
        adImps = adImps * ratio;
        ad.set({ 'volume':  parseInt(adImps) }, { silent: true });
      });
      this.set('buffer', parseFloat(buffer));
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
        var imps = parseInt(String(el.get('volume')).replace(/,|\./g, ''));
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
  }, {
    dirty: false,

    setDirty: function(dirty) {
      this.dirty = dirty;
    },

    isDirty: function() {
      return this.dirty;
    }
  });

  //LineItems.LineItemView = Backbone.Marionette.ItemView.extend({
  LineItems.LineItemView = LineItems.BasicLineItemView.extend({
    tagName: 'div',
    className: 'lineitem pure-g',

    getTemplate: function() {
      var type = this.model.get('type') ? this.model.get('type').toLowerCase() : 'display';
      if (type == 'video') {
        return JST['templates/lineitems/line_item_video_row'];
      } else {
        return JST['templates/lineitems/line_item_row'];
      }
    },

    initialize: function(){
      var self = this;

      _.bindAll(this, "render");
      this.model.bind('change', this.render); // when start/end date is changed we should rerender the view

      this.on('targeting:update', function(targeting) {
        self.model.get('targeting').revised_targeting = false;
        if (this.model.ads && this.model.ads.length > 0) {
          _.each(self.model.ads, function(ad) {
            if (ad.get('type') != 'Companion') {
              var adTargeting = ad.get('targeting');
              _.each(targeting, function(value, key) {
                adTargeting.attributes[key] = value;
              });
            }
          });
          self.render(); // re-render LI and nested ads
        }
      });

      this.creatives_visible = {};
      this.li_notes_collapsed = false;

      if (! this.model.get('targeting')) {
        var targeting = new ReachUI.Targeting.Targeting({type: this.model.get('type'), keyvalue_targeting: this.model.get('keyvalue_targeting'), frequency_caps: this.model.get('frequency_caps')});
        this.model.set({ 'targeting': targeting }, { silent: true });
      }
    },

    setEditableFields: function() {
      var view = this;

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
          startDate: ReachUI.initialStartDate(view.model.get('start_date'))
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
          // https://github.com/collectivemedia/reachui/issues/543
          // When a size is selected, the media type should default to the media type for that size
          // 1x1 = video
          // 300x50 or 320x50 = mobile
          // 100x72 or 99x72 = FB
          // All else = Display
          if(view.model.is_blank_li) {
            switch(newValue[0]) {
              case '1x1':
                view._changeMediaType("Video");
                break;
              case '300x50':
              case '320x50':
                view._changeMediaType("Mobile");
                break;
              case '100x72':
              case '99x72':
                view._changeMediaType("Facebook");
                break;
              default:
                view._changeMediaType("Display");
            }
          }

          if (view.model.get('type') == 'Video') {
            var value = newValue.join(', ');
            view.model.set('companion_ad_size', value);
            view.model.set('ad_sizes', view.model.get('master_ad_size') + (value ? ', ' + value : ''));
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
          var name = $(this).data('name'), value;
          if (name == 'buffer') {
            view.model.setBuffer(parseFloat(newValue));
          } else {
            value = parseInt(String(newValue).replace(/,|\./g, ''));
            view.model.set(name, value); //update backbone model;
            view._recalculateMediaCost();
            view.model.collection._recalculateLiImpressionsMediaCost();
          }
        }
      });

      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          view.model.set($(this).data('name'), newValue.replace(/^\s+|\s+$/g,'')); //update backbone model;
        }
      });
    },

    // after start/end date changed LI is rerendered, so render linked Ads also
    onRender: function() {
      var view = this;
      $.fn.editable.defaults.mode = 'popup';

      this.$el.removeClass('highlighted'); // remove hightlighted state that is set after 'Paste Targeting' btn

      // setting lineitem's id in classname so we could address this li directly
      this.$el.addClass('lineitem-'+this.model.get('id'));

      this.setEditableFields();

      if(this.model.get('revised')) {
        this.$el.find('.li-number').addClass('revised');
        if(this.model.get('id') == null) {
          EventsBus.trigger('lineitem:logRevision', "New Line Item "+this.model.get('alt_ad_id')+" Created");
        }
      }
      this.renderCreatives();
      this.renderTargetingDialog();

      this.ui.ads_list.html('');
      var ads = this.model.ads.models || this.model.ads.collection || this.model.ads;
      _.each(ads, function(ad) {
        if (!ad.get('creatives').length) {
          ad.set({ 'size': view.model.get('ad_sizes') }, { silent: true });
        }
        view.renderAd(ad);
      });
    },

    renderTargetingDialog: function() {
      this.targetingView = new ReachUI.Targeting.TargetingView({model: this.model.get('targeting'), parent_view: this});
      this.ui.targeting.html(this.targetingView.render().el);

      ReachUI.showCondensedTargetingOptions.apply(this);
    },

    renderAd: function(ad) {
      var li_view = this,
          ad_view = new ReachUI.Ads.AdView({model: ad, parent_view: li_view});
      li_view.ui.ads_list.append(ad_view.render().el);
      ReachUI.showCondensedTargetingOptions.apply(ad_view);
      if (0 == ad.get('volume')) {
        ad_view.$el.find('.volume .editable').siblings('.errors_container').html("Impressions must be greater than 0.");
      }
    },

    renderCreatives: function() {
      var view = this, is_cox_creative = false;

      // check whether there are Cox Creatives
      if (this.model.get('creatives')) {
        _.each(this.model.get('creatives').models, function(creative) {
          if (creative.get('html_code')) {
            is_cox_creative = true;
          }
        })
      }

      // rendering template for Creatives Dialog layout
      var creatives_list_view = new ReachUI.Creatives.CreativesListView({parent_view: this, is_cox_creative: is_cox_creative});
      this.ui.creatives_container.html(creatives_list_view.render().el);

      // rendering each Creative
      if (this.model.get('creatives')) {
        _.each(this.model.get('creatives').models, function(creative) {
          creative.set({
            'order_id': view.model.get('order_id'),
            'lineitem_id': view.model.get('id')}, { silent: true });
          var creativeView = new ReachUI.Creatives.CreativeView({model: creative, parent_view: view});
          creatives_list_view.ui.creatives.append(creativeView.render().el);
        });
      }
    },

    recalculateAdsImpressionsMediaCost: function(buffer) {
      var adImps, prevBuffer = parseFloat(this.model.get('buffer')),
          ratio = (100 + buffer) / (100 + prevBuffer),
          ads = this.model.ads.models || this.model.ads.collection || this.model.ads;

      _.each(ads, function(ad) {
        adImps = parseInt(String(ad.get('volume')).replace(/,|\./g, ''));
        adImps = adImps * ratio;
        ad.set('volume', parseInt(adImps));
      });
    },

    showDeleteBtn: function() {
      this.ui.delete_btn.show();
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
      var is_visible = $(this.ui.targeting).is(':visible');

      if(is_visible && !this.targetingView.errors_in_kv && !this.targetingView.errors_in_zip_codes){
        this.$el.find('.toggle-targeting-btn').html('+ Add Targeting');
        if(this.targetingView.show_custom_key_values){
          this.targetingView._toggleCustomRegularKeyValues();
        }
        ReachUI.showCondensedTargetingOptions.apply(this);
        $(this.ui.targeting).hide('slow');
      } else{
        this.$el.find('.toggle-targeting-btn').html('Hide Targeting');
        $(this.ui.targeting).show('slow');
      }
    },

    _hideTargetingDialog: function() {
      ReachUI.showCondensedTargetingOptions.apply(this);
    },

    _addTypedAd: function(ev) {
      var currentTarget = $(ev.currentTarget),
          type       = currentTarget.data('type'),
          platformId = currentTarget.data('platform-id');
      if (platformId) {
          var platforms = this.model.platforms,
              platform = platforms.length > 0 ? platforms.findWhere({ "id": platformId}) : null;
          this.trigger('lineitem:add_ad', { "type": type, "platform": platform });
      } else {
        this.trigger('lineitem:add_ad', { "type": type });
      }
    },

    serializeData: function(){
      var data = this.model.toJSON();
      data.li_notes_collapsed = this.li_notes_collapsed;
      data.platforms = this.model.platforms;
      return data;
    },

    collapseLINotes: function(e) {
      e.stopPropagation();
      this.li_notes_collapsed = true;
      this.$el.find('.name .notes').hide();
      this.$el.find('.expand-notes').show();
      this.render();
    },

    expandLINotes: function(e) {
      e.stopPropagation();
      this.li_notes_collapsed = false;
      this.$el.find('.name .notes').show();
      this.$el.find('.expand-notes').hide();
      this.render();
    },

    _toggleLISelection: function(e) {
      e.stopPropagation();
      if(this.model.get('revised')) {
        $(e.currentTarget).find('.revised-dialog').toggle();
      } else {
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
          $('.copy-targeting-btn li').removeClass('active');
          this.$el.find('.paste-targeting-btn, .cancel-targeting-btn').toggle();
        }
      }
    },

    copyTargeting: function(e) {
      e.stopPropagation();
      e.preventDefault();

      var el = $(e.currentTarget),
          parent = el.parent(),
          type   = el.data('type'),
          active = parent.hasClass('active'),
          li_t   = this.model.get('targeting');

      if (!active) {
        var copiedOptions = {};

        parent.addClass('active');

        switch (type) {
          case 'key_values':
            copiedOptions = {
              selected_key_values: _.clone(li_t.get('selected_key_values')),
              keyvalue_targeting: _.clone(li_t.get('keyvalue_targeting'))
            };
            break;
          case 'geo':
            copiedOptions = {
              selected_geos: _.clone(li_t.get('selected_geos')),
              selected_zip_codes: _.clone(li_t.get('selected_zip_codes'))
            };
            break;
          case 'freq_cap':
            copiedOptions = {
              frequency_caps: ReachUI.omitAttribute(_.clone(li_t.get('frequency_caps')), 'id')
            };
            break;
        };

        if (!window.copied_targeting) {
          window.copied_targeting = {};
        }
        _.each(copiedOptions, function(value, key) {
          window.copied_targeting[key] = value;
        });
      } else {
        if (window.copied_targeting) {
          switch (type) {
          case 'key_values':
            delete window.copied_targeting['selected_key_values'];
            delete window.copied_targeting['keyvalue_targeting'];
            break;
          case 'geo':
            delete window.copied_targeting['selected_geos'];
            delete window.copied_targeting['selected_zip_codes'];
            break;
          case 'freq_cap':
            delete window.copied_targeting['frequency_caps'];
            break;
          }
        }
        el.blur();
        parent.removeClass('active');
      }

      noty({text: 'Targeting copied', type: 'success', timeout: 3000});
      this._deselectAllLIs({ multi: true });
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
        if (!options || !options['multi']) {
          li.$el.find('.copy-targeting-btn, .paste-targeting-btn, .cancel-targeting-btn').hide();
        }
        li.renderTargetingDialog();
      });
      window.selected_lis = [];
    },

    pasteTargeting: function(e) {
      e.stopPropagation();
      noty({text: 'Targeting pasted', type: 'success', timeout: 3000});

      _.each(window.selected_lis, function(li) {
        var liTargeting = li.model.get('targeting'),
            targeting = {};
        _.each(window.copied_targeting, function(value, key) {
          if (key != 'frequency_caps') {
            targeting[key] = _.clone(value);
          }
        });
        if (window.copied_targeting['frequency_caps']) {
          var frequencyCaps = liTargeting.get('frequency_caps');
          var removedCaps = [];
          _.each(frequencyCaps.models, function(fc) {
            if (fc.get('id')) {
              removedCaps.push(fc.get('id'));
            }
          });
          _.each(removedCaps, function(id) {
            frequencyCaps.remove(id);
          });
          _.each(window.copied_targeting['frequency_caps'], function(fc) {
            frequencyCaps.add(fc);
          });
          targeting['frequency_caps'] = frequencyCaps;
        }
        liTargeting.set(targeting, { silent: true });

        li.$el.find('.targeting_options_condensed').eq(0).find('.targeting-options').addClass('highlighted');
      });

      this.cancelTargeting();
    },

    cancelTargeting: function(e) {
      if (e) {
        e.stopPropagation();
      }
      window.copied_targeting = null;
      $('.lineitem').removeClass('copied-targeting-from');
      this._deselectAllLIs();
    },

    _changeMediaType: function(ev_or_type) {
      var type = typeof(ev_or_type) === "string" ? ev_or_type : $(ev_or_type.currentTarget).data('type');

      if (type == 'Video' && !this.model.get('master_ad_size')) {
        this.model.set({ 'master_ad_size': '1x1' }, { silent: true });
      }
      if (type == 'Video') {
        this.model.set({ 'companion_ad_size': this.model.get('ad_sizes') }, { silent: true });
      }

      var targeting = this.model.get('targeting'),
          custom_key_values = targeting.get('keyvalue_targeting'),
          default_key_values = this.model._default_keyvalue_targeting;

      custom_key_values = custom_key_values ? custom_key_values.split(',') : [];
      custom_key_values = _.difference(custom_key_values, _.values(default_key_values));

      if (default_key_values[type]) {
        custom_key_values.push(default_key_values[type]);
      }
      custom_key_values = custom_key_values.join(',');

      _.each(this.model.ads, function(ad) {
        ad.get('targeting').set('keyvalue_targeting', custom_key_values);
        ad.set({ 'type': type }, { silent: true });
      });

      targeting.set('keyvalue_targeting', custom_key_values);

      var targeting_options = [];
      if (custom_key_values) {
        targeting_options.push('<div class="custom-kv-icon" title="Custom Key/Value Targeting"></div>');
        targeting_options.push('<div class="targeting-options">' + custom_key_values + '</div>');
      }
      var toptions = this.$el.find('.targeting_options_condensed')[0];
      $(toptions).html(targeting_options.join(' '));

      this.model.set({ 'type': type });
    },

    templateHelpers:{
      lineitemStatusClass: function(){
        if(this.lineitem.li_status)
          return "lineitem-status-"+this.lineitem.li_status.toLowerCase().split(' ').join('-');
      }
    },

    _duplicateLineitem: function() {
      var li = this.model,
          li_view = this;

      var selected_geos  = li.get('targeting').get('selected_geos') ? _.clone(li.get('targeting').get('selected_geos')) : [];
      var zipcodes       = li.get('targeting').get('selected_zip_codes') ? _.clone(li.get('targeting').get('selected_zip_codes')) : [];
      var kv             = li.get('targeting').get('selected_key_values') ? _.clone(li.get('targeting').get('selected_key_values')) : [];

      var frequency_caps = [];
      var notFilteredFrequencyCaps = li.get('targeting').get('frequency_caps') ? _.clone(li.get('targeting').get('frequency_caps')) : [];
      _.each(notFilteredFrequencyCaps.models, function(fc) {
        frequency_caps.push(_.omit(fc.attributes, 'id'));
      });

      var new_li = new LineItems.LineItem(),
          creatives_list = null,
          omitCreativesAttrs = [ 'id', 'source_id', 'ad_assignment_id', 'io_lineitem_id', 'lineitem_id', 'li_assignment_id' ];
      new_li.setBlankLiFlag();

      if(this.model.get('creatives').length > 0) {
        var creatives = [];
        _.each(this.model.get('creatives').models, function(c) {
          var creativeAttributes = _.omit(_.clone(c.attributes), omitCreativesAttrs);
          creatives.push(new ReachUI.Creatives.Creative(creativeAttributes));
        });
        creatives_list = new ReachUI.Creatives.CreativesList(creatives);
      } else {
        creatives_list = new ReachUI.Creatives.CreativesList([])
      }

      new_li.set({
        start_date: this.model.get('start_date'),
        end_date: this.model.get('end_date'),
        ad_sizes: this.model.get('ad_sizes'),
        name: this.model.get('name'),
        type: this.model.get('type'),
        volume: this.model.get('volume'),
        rate: this.model.get('rate'),
        master_ad_size: this.model.get('master_ad_size'),
        itemIndex: (this.model.collection.length + 1),
        creatives: creatives_list,
        targeting: new ReachUI.Targeting.Targeting({
          selected_zip_codes: zipcodes,
          selected_geos: selected_geos,
          selected_key_values: kv,
          frequency_caps: frequency_caps,
          audience_groups: li.get('audience_groups'),
          keyvalue_targeting: li.get('targeting').get('keyvalue_targeting'),
          type: li.get('type')
        })
      }, { silent: true });
      new_li.platforms = li.platforms;

      _.each(li.ads, function(ad) {
        var adAttributes = _.omit(_.clone(ad.attributes), 'id', 'source_id', 'io_lineitem_id');
        var new_ad = new ReachUI.Ads.Ad(adAttributes), ad_creatives = [];

        if (ad.get('creatives').length > 0) {
          _.each(ad.get('creatives').models, function(c) {
            var creativeAttributes = _.omit(_.clone(c.attributes), omitCreativesAttrs);
            ad_creatives.push(new ReachUI.Creatives.Creative(creativeAttributes));
          });
        }

        new_ad.set({
          start_date: moment(ad.get('start_date')).format("YYYY-MM-DD"),
          end_date: moment(ad.get('end_date')).format("YYYY-MM-DD"),
          creatives: new ReachUI.Creatives.CreativesList(ad_creatives),
          targeting: new ReachUI.Targeting.Targeting({
            selected_zip_codes: ad.get('targeting').get('selected_zip_codes'),
            selected_geos: ad.get('targeting').get('selected_geos'),
            selected_key_values: ad.get('targeting').get('selected_key_values'),
            frequency_caps: ad.get('targeting').get('frequency_caps'),
            audience_groups: li.get('targeting').get('audience_groups'),
            keyvalue_targeting: ad.get('targeting').get('keyvalue_targeting'),
            dfp_key_values: ad.dfp_key_values,
            ad_dfp_id: ad.get('source_id'),
            type: ad.get('type')
          })
        });

        new_li.pushAd(new_ad);
      });

      this.model.collection.add(new_li);
      this.model.collection.trigger('lineitem:added');
    },

    _deleteLineitem: function() {
      this.model.collection.remove(this.model);
    },

    ui: {
      ads_list: '.ads-container',
      targeting: '.targeting-container',
      creatives_container: '.creatives-list-view',
      creatives_content: '.creatives-content',
      lineitem_sizes: '.lineitem-sizes',
      delete_btn: '.li-delete-btn'
    },

    _toggleRevisionDialog: function(e) {
      e.stopPropagation();
      $(e.currentTarget).siblings('.revised-dialog').toggle();
    },

    _checkRevisedStatus: function() {
      if(this.model.get('revised_start_date') || this.model.get('revised_end_date') || this.model.get('revised_name') || this.model.get('revised_volume') || this.model.get('revised_rate')) {
        this.model.attributes['revised'] = true;
      } else {
        this.model.attributes['revised'] = false;
      }
    },

    _acceptAllRevisions: function(e) {
      var self = this,
          elements = {start_date: '.start-date .editable', end_date: '.end-date .editable', name: '.name .editable', volume: '.volume .editable', rate: '.rate .editable'};
      e.stopPropagation();

      this.$el.find('.revision').hide();

      var log_text = "Revised Line Item "+this.model.get('alt_ad_id')+" : ", logs = [];

      _.each(['start_date', 'end_date', 'name', 'volume', 'rate'], function(attr_name) {
        var revision = self.model.get('revised_'+attr_name);
        if(revision != null) {
          switch(attr_name) {
            case 'rate':
              revision = accounting.formatNumber(revision, 2);
              break;
            case 'volume':
              revision = accounting.formatNumber(revision);
              break;
          }
          self.model.attributes[attr_name] = revision;
          self.$el.find(elements[attr_name]).filter('[data-name="'+attr_name+'"]').text(revision).addClass('revision');

          var attr_name_humanized = ReachUI.humanize(attr_name.split('_').join(' '));
          logs.push(attr_name_humanized+" "+self.model.get(attr_name)+" -> "+self.model.get('revised_'+attr_name));
        }
      });

      // log changes
      if(logs.length>0) {
        EventsBus.trigger('lineitem:logRevision', log_text+logs.join('; '));
      }

      this._removeAndHideAllRevisions(e);
      this._recalculateMediaCost();
      this.model.collection._recalculateLiImpressionsMediaCost();
      this.model.attributes['revised'] = null;
    },

    _declineAllRevisions: function(e) {
      this._removeAndHideAllRevisions(e);
      this.model.attributes['revised'] = null;
      this.$el.find('.li-number').removeClass('revised');
      this.$el.find('.revision').remove();
    },

    _removeAndHideAllRevisions: function(e) {
      e.stopPropagation();

      var self = this;
      _.each(['start_date', 'end_date', 'name', 'volume', 'rate'], function(attr_name) {
        self.model.attributes['revised_'+attr_name] = null;
      });

      this.$el.find('.revised-dialog').remove();
    },

    _acceptRevision: function(e) {
      var self = this;
      var $target_parent = $(e.currentTarget).parent(),
          attr_name = $(e.currentTarget).data('name'),
          $editable = $target_parent.siblings('div .editable'),
          revised_value = $target_parent.siblings('.revision').text(),
          original_value = this.model.get(attr_name);

      // add note to ActivityLog to log the changes
      var attr_name_humanized = ReachUI.humanize(attr_name.split('_').join(' '));
      var log_text = "Revised Line Item "+this.model.get('alt_ad_id')+" : "+attr_name_humanized+" "+this.model.get(attr_name)+" -> "+this.model.get('revised_'+attr_name);

      if (this.model.ads.length > 0 && attr_name != 'name') {
        var $apply_ads_dialog = $('#apply-revisions-ads-dialog'),
            apply_text = 'Apply the new ' + attr_name.split('_').join(' ') + ' to ads';

        $apply_ads_dialog.find('.apply-revisions-txt').html(apply_text);
        $apply_ads_dialog.find('.noapply-btn').click(function() {
          $apply_ads_dialog.modal('hide');
        });
        $apply_ads_dialog.find('.apply-btn').click(function() {
          $apply_ads_dialog.find('.apply-btn').off('click');
          $apply_ads_dialog.modal('hide');
          switch (attr_name) {
            case 'start_date':
            case 'end_date':
              _.each(self.model.ads, function(ad) {
                ad.set(attr_name, revised_value);
              });
              break;
            case 'volume':
              var ratio = parseInt(String(revised_value).replace(/,|\./g, '')) / original_value;
              _.each(self.model.ads, function(ad) {
                ad.set('volume', ad.get('volume') * ratio);
              });
              break;
            case 'rate':
              revised_value = accounting.formatNumber(revised_value, 2);
              _.each(self.model.ads, function(ad) {
                ad.set(attr_name, revised_value);
              });
              break;
          }
        });
        $apply_ads_dialog.modal('show');
      }
      EventsBus.trigger('lineitem:logRevision', log_text);

      this.model.attributes[attr_name] = revised_value;
      this.model.attributes['revised_'+attr_name] = null;

      $target_parent.siblings('.revision').hide();
      $editable.filter('[data-name="'+attr_name+'"]').addClass('revision').text(revised_value);

      this.model.collection._recalculateLiImpressionsMediaCost();
      this._recalculateMediaCost();
      this._checkRevisedStatus();
      $target_parent.remove();
    },

    _declineRevision: function(e) {
      var $target_parent = $(e.currentTarget).parent();
      var attr_name = $(e.currentTarget).data('name');

      this.model.attributes['revised_'+attr_name] = null;
      this._checkRevisedStatus();

      $target_parent.siblings('.revision').hide();
      $target_parent.remove();
    },

    events: {
      'click .toggle-targeting-btn': '_toggleTargetingDialog',
      'click .toggle-creatives-btn': '_toggleCreativesDialog',
      'click .li-add-ad-btn': '_addTypedAd',
      'click .name .notes .close-btn': 'collapseLINotes',
      'click .name .expand-notes': 'expandLINotes',
      'click .li-number': '_toggleLISelection',

      // revisions
      'click .start-date .revision, .end-date .revision, .name .revision, .volume .revision, .rate .revision': '_toggleRevisionDialog',

      'click .start-date .revised-dialog .accept-btn, .end-date .revised-dialog .accept-btn, .name .revised-dialog .accept-btn, .volume .revised-dialog .accept-btn, .rate .revised-dialog .accept-btn': '_acceptRevision',
      'click .start-date .revised-dialog .decline-btn, .end-date .revised-dialog .decline-btn, .name .revised-dialog .decline-btn, .volume .revised-dialog .decline-btn, .rate .revised-dialog .decline-btn': '_declineRevision',
      'click .li-number .revised-dialog .accept-all-btn': '_acceptAllRevisions',
      'click .li-number .revised-dialog .decline-all-btn': '_declineAllRevisions',

      'click .copy-targeting-btn .copy-targeting-item': 'copyTargeting',
      'click .paste-targeting-btn': 'pasteTargeting',
      'click .cancel-targeting-btn': 'cancelTargeting',
      'click .change-media-type': '_changeMediaType',
      'click .li-duplicate-btn': '_duplicateLineitem',
      'click .li-delete-btn': '_deleteLineitem'
    },

    triggers: {
      'click .li-command-btn': 'lineitem:add_ad'
    }
  });

  LineItems.LineItemListView = LineItems.BasicLineItemListView.extend({
    itemView: LineItems.LineItemView,
    template: JST['templates/lineitems/line_item_table'],

    initialize: function() {
      var view = this;
      this.collection.bind('lineitem:added', function() {
        var lastLIview = view.children.findByIndex(view.children.length - 1);
        lastLIview._recalculateMediaCost();
        lastLIview.showDeleteBtn();
      });
    },

    onRender: function() {
      if (this.collection.order.get('order_status') == 'Pushing') {
        this.$el.find('.save-order-btn').addClass('disabled');
        this.$el.find('.push-order-btn').addClass('disabled');
      }

      // https://github.com/collectivemedia/reachui/issues/662
      // Remove the “Save Order” button from orders that are in “Revisions Proposed” status.
      if(this.collection.order.get('revisions') && this.collection.order.get('revisions').length > 0) {
        this.$el.find('.save-order-btn').hide();
      }
    },

    serializeData: function(){
      var data = this.collection.order.toJSON();
      data.assignee = this.collection.order.get('assignee');
      data.order_status = this.collection.order.get('order_status');
      return data;
    },

    _saveOrder: function() {
      this._clearAllErrors();
      var lineitems = this.collection;
      var self = this;

      // function that store Order and Lineitems in one POST request
      self.collection.order.save({lineitems: lineitems.models, order_status: (self.status || self.collection.order.get('state')) }, {
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
                      }
                    });

                    if (ad_errors && ad_errors["creatives"]) {
                      $('.lineitems-container .lineitem:nth(' + li_k + ')')
                        .find('.ad:nth(' + ad_k + ') .toggle-ads-creatives-btn').trigger('click', true);
                    }

                    if (ad_errors && ad_errors["targeting"]) {
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
            self._toggleSavePushbuttons({ hide: false });
          } else if(response.status == "success") {
            $('.current-io-status-top .io-status').html(response.order_status);

            // if there are revised IO then show the download link immediately
            if(response.revised_io_asset_id) {
              var revised_io_filename = $('.imported-file-name .revised-io-filename').html(),
                  io_asset_ext = revised_io_filename.substr(revised_io_filename.lastIndexOf('.') + 1) == 'pdf' ? 'pdf' : 'xls';
              $('.imported-file-name .revised-io-filename').html('<a href="/io_assets/'+self.collection.order.get('id')+'/revised_io/'+response.revised_io_asset_id+'.'+io_asset_ext+'">'+revised_io_filename+'</a>');
            }

            if (response.order_status.match(/pushing/i)) {
              self._toggleSavePushbuttons({ hide: true });
              noty({text: "Your order has been saved and is pushing to the ad server", type: 'success', timeout: 5000});
              ReachUI.checkOrderStatus(response.order_id);
              self.trigger('ordernote:reload');
            } else if(response.order_status.match(/draft/i)) {
              self._toggleSavePushbuttons({ hide: false });
              noty({text: "Your order has been saved", type: 'success', timeout: 5000})
            } else if(response.order_status.match(/ready for am/i)) {
              self._toggleSavePushbuttons({ hide: false });
              // update assignee to current account manager
              var assignee = $('.general-info-container .account-contact-name select option:selected').text();
              $('.order-assignee').html('Assignee: '+assignee);
              $('.order-status').html('Status: '+response.state);
              noty({text: "Your order has been saved and is ready for the Account Manager", type: 'success', timeout: 5000});
            } else if(response.order_status.match(/ready for trafficker/i)) {
              self._toggleSavePushbuttons({ hide: false });
              // update assignee to current trafficker
              var assignee = $('.new-order-header .trafficker-container span.typeahead').text();
              $('.order-assignee').html('Assignee: '+assignee);
              $('.order-status').html('Status: '+response.state);
              noty({text: "Your order has been saved and is ready for the Trafficker", type: 'success', timeout: 5000})
            } else if (response.order_status.match(/incomplete push/i)) {
              self._toggleSavePushbuttons({ hide: false });
              noty({text: "Your order has been pushed incompletely", type: 'success', timeout: 5000})
            } else {
              self._toggleSavePushbuttons({ hide: false });
              noty({text: "Your order has been updated correctly", type: 'success', timeout: 5000})
            }
            if (response.order_id) {
              if (ReachUI.LineItems.LineItemList.isDirty()) {
                ReachUI.LineItems.LineItemList.setDirty(false);
                self.collection.setOrder(null);
                Backbone.history.fragment = null;
              }
              ReachUI.Orders.router.navigate('/'+ response.order_id, {trigger: true});
            }
          }
        },
        error: function(model, xhr, options) {
          self._toggleSavePushbuttons({ hide: false });
          noty({text: 'There was an error while saving Order.', type: 'error', timeout: 5000})
          console.log(xhr.responseJSON);
        }
      });
    },

    _pushOrder: function() {
      var self = this;
      var lineitems = this.collection;
      var lineitemsWithoutAds = [];

      lineitems.each(function(li) {
        if (!li.ads.length) {
          lineitemsWithoutAds.push(li.get('alt_ad_id') || li.get('itemIndex'));
        }
      });

      var orderStatus = this.collection.order.get('order_status');
      if(_.include(["Pushed", "Failure", "Incomplete Push"], orderStatus) ||
        (lineitemsWithoutAds.length > 0)) {
        var dialog = $('#push-confirmation-dialog');
        var liList = dialog.find('.li-without-ads');
        if (!isNaN(parseInt(this.collection.order.get('source_id'))) || orderStatus == 'Incomplete Push') {
          dialog.find('.confirm-push-message').show();
        } else {
          dialog.find('.confirm-push-message').hide();
        }
        if (lineitemsWithoutAds.length > 0) {
          dialog.find('.missed-ads-heading').show();
          liList.html(_.map(lineitemsWithoutAds, function(el) { return '<li>Contract LI ' + el + '</li>' }).join(' '));
        } else {
          dialog.find('.missed-ads-heading').hide();
          liList.html('');
        }
        dialog.find('.cancel-btn').click(function() {
          dialog.modal('hide');
        });
        dialog.find('.push-btn').click(function() {
          dialog.find('.push-btn').off('click');
          dialog.modal('hide');
          self._toggleSavePushbuttons({ hide: true });
          self._saveOrderWithStatus('pushing');
        });
        dialog.modal('show');
      } else {
        this._toggleSavePushbuttons({ hide: true });
        this._saveOrderWithStatus('pushing');
      }
    },

    _submitOrderToAm: function() {
      this._saveOrderWithStatus('ready_for_am');
    },

    _submitOrderToTrafficker: function() {
      this._saveOrderWithStatus('ready_for_trafficker');
    },

    _saveOrderWithStatus: function(status) {
      this.status = status;
      this._saveOrder();
    },

    _toggleSavePushbuttons: function(params) {
      if (params.hide) {
        this.$el.find('.save-order-btn').addClass('disabled');
        this.$el.find('.push-order-btn').addClass('disabled');
      } else {
        this.$el.find('.save-order-btn').removeClass('disabled');
        this.$el.find('.push-order-btn').removeClass('disabled');
      }
    },

    _createNewLI: function() {
      var li = new LineItems.LineItem(),
          empty_creatives_list = new ReachUI.Creatives.CreativesList([]),
          itemIndex = this.collection.length + 1;
      li.set({itemIndex: itemIndex, ad_sizes: '', name: '', creatives: empty_creatives_list, start_date: null, end_date: null});
      li.setBlankLiFlag();

      var platforms = [];
      if (this.collection.length > 0) {
        platforms = this.collection[this.collection.length - 1];
        li.platforms = platforms;
        this.collection.add(li);
        this.collection.trigger('lineitem:added');
      } else {
        platforms = new ReachUI.AdPlatforms.PlatformList();
        platforms.fetch().then(function() {
          li.platforms = platforms;
          this.collection.add(li);
          this.collection.trigger('lineitem:added');
        });
      }
    },

    events: {
      'click .save-order-btn:not(.disabled)':        '_saveOrder',
      'click .push-order-btn:not(.disabled)':        '_pushOrder',
      'click .submit-am-btn':         '_submitOrderToAm',
      'click .submit-trafficker-btn': '_submitOrderToTrafficker',
      'click .create-li-btn': '_createNewLI'
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
