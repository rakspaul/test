(function(LineItems) {
  'use strict';

  LineItems.LineItem = Backbone.Model.extend({
    _default_keyvalue_targeting: {
      "Facebook": "fb=_default",
      "Mobile":   "mob=_default"
    },

    mediaTypeSizes: {
      "1x1":     "Video",
      "300x50":  "Mobile",
      "320x50":  "Mobile",
      "100x72":  "Facebook",
      "99x72":   "Facebook",
      "default": "Display"
    },

    initialize: function() {
      this.ads = [];
      this.creatives = [];
      this.revised_targeting = false;
      this.platforms = [];
      this.is_blank_li = false;
    },

    defaults: function() {
      return {
        volume: 0,
        buffer: 0,
        rate: 0.0,
        start_date: moment().add('days', 1).format("YYYY-MM-DD"),
        end_date: moment().add('days', 15).format("YYYY-MM-DD"),
        type: 'Display',
        _delete_creatives: [],
        li_status: 'Draft',
        uploaded: false
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
        ad.set('volume', parseInt(adImps));
      });
      this.set('buffer', parseFloat(buffer));
    },

    setCreativesDate: function(name, value) {
      var creatives = this.get('creatives').models;
      if (creatives) {
        _.each(creatives, function(creative) {
          creative.set(name, value);
        });
      }
    },
  }, {
    buffer: {
      targeting: null
    },
    selectedItems: {
      li:  [],
      ad: []
    },

    getCopyBuffer: function(key) {
      if (key) {
        return this.buffer[key];
      } else {
        return this.buffer;
      }
    },

    setCopyBuffer: function(key, value) {
      if (key) {
        this.buffer[key] = value;
      } else {
        this.buffer = value;
      }
    },

    getSelectedItem: function(key) {
      return this.selectedItems[key || 'li'];
    },

    setSelectedItem: function(items, key) {
      if (key) {
        this.selectedItems[key] = items;
      } else {
        this.selectedItems = { li: [], ad: [] };
      }
    }
  });

  LineItems.LineItemList = Backbone.Collection.extend({
    model: LineItems.LineItem,
    url: function() {
      return '/orders/' + this.order.id + '/lineitems.json';
    },

    getMinLIDate: function() {
      var dates = _.map(this.models, function(li) { return li.get('start_date'); } ), minDate = dates[0];
      _.each(dates, function(el) { if (el < minDate) { minDate = el; } });
      return minDate;
    },

    getMaxLIDate: function() {
      var dates = _.map(this.models, function(li) { return li.get('end_date'); }), maxDate = dates[0];
      _.each(dates, function(el) { if (el > maxDate) { maxDate = el; } });
      return maxDate;
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

    ui: {
      ads_list:             '.ads-container',
      targeting:            '.targeting-container',
      creatives_container:  '.creatives-list-view',
      creatives_content:    '.creatives-content',
      lineitem_sizes:       '.lineitem-sizes',
      start_date_editable:  '.start-date-editable',
      end_date_editable:    '.end-date-editable',
      name_editable:        '.name-editable',
      volume_editable:      '.volume-editable',
      rate_editable:        '.rate-editable',
      buffer_editable:      '.buffer-editable',
      dup_btn:              '.li-duplicate-btn',
      delete_btn:           '.li-delete-btn',
      item_selection:       '.item-number',
      copy_targeting_btn:   '.copy-targeting-btn',
      paste_targeting_btn:  '.paste-targeting-btn',
      cancel_targeting_btn: '.cancel-targeting-btn'
    },

    events: {
      'click .toggle-targeting-btn': '_toggleTargetingDialog',
      'click .toggle-creatives-btn': '_toggleCreativesDialog',
      'click .li-add-ad-btn': '_addTypedAd',
      'click .name .notes .close-btn': 'collapseLINotes',
      'click .name .expand-notes': 'expandLINotes',
      'click .li-number': '_toggleLISelection',

      // revisions
      'click .start-date .revision, .end-date .revision, .lineitem-sizes .revision, .name .revision, .volume .revision, .rate .revision': '_toggleRevisionDialog',

      'click .start-date .revised-dialog .accept-btn, .end-date .revised-dialog .accept-btn, .lineitem-sizes .revised-dialog .accept-btn, .name .revised-dialog .accept-btn, .volume .revised-dialog .accept-btn, .rate .revised-dialog .accept-btn': '_acceptRevision',
      'click .start-date .revised-dialog .decline-btn, .end-date .revised-dialog .decline-btn, .lineitem-sizes .revised-dialog .decline-btn, .name .revised-dialog .decline-btn, .volume .revised-dialog .decline-btn, .rate .revised-dialog .decline-btn': '_declineRevision',
      'click .li-number .revised-dialog .accept-all-btn': '_acceptAllRevisions',
      'click .li-number .revised-dialog .decline-all-btn': '_declineAllRevisions',

      'click .copy-targeting-btn .copy-targeting-item': 'copyTargeting',
      'click .paste-targeting-btn': 'pasteTargeting',
      'click .cancel-targeting-btn': 'cancelTargeting',
      'click .change-media-type': '_changeMediaType',
      'click .li-duplicate-btn': '_duplicateLineitem',
      'click .li-delete-btn': '_deleteLineitem'
    },

    modelEvents: {
      'change:type': 'render'
    },

    triggers: {
      'click .li-command-btn': 'lineitem:add_ad'
    },

    bindings: {
      '.start-date-editable': {
        observe: 'start_date',
        onSet: function(val) {
          return moment(val).format("YYYY-MM-DD");
        }
      },
      '.end-date-editable':   'end_date',
      '.name-editable': {
        observe: 'name',
        onSet: function(val) {
          return val.replace(/^\s+|\s+$/g, '');
        }
      },
      '.volume-editable': {
        observe: 'volume',
        onGet: function(val) {
          return accounting.formatNumber(val, '');
        }
      },
      '.rate-editable': {
        observe: 'rate',
        onGet: function(val) {
          return accounting.formatMoney(val, '');
        }
      },
      '.buffer-editable': {
        observe: 'buffer',
        onGet: function(val) {
          return accounting.formatNumber(val, 2);
        }
      }
    },

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
      //this.model.bind('change', this.render); // when start/end date is changed we should rerender the view

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

    _alignOrderStartDate: function() {
      var minDate = this.model.collection.getMinLIDate();
      $('.order-details .start-date .date').html(minDate).editable('option', 'value', moment(minDate)._d);
      this.model.collection.order.set('start_date', minDate);
    },

    _alignOrderEndDate: function() {
      var maxDate = this.model.collection.getMaxLIDate();
      $('.order-details .end-date .date').html(maxDate).editable('option', 'value', moment(maxDate)._d);
      this.model.collection.order.set("end_date", maxDate);
    },

    setEditableFields: function() {
      var view = this, model = view.model, collection = model.collection;

      this.ui.start_date_editable.editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD");

          model.setCreativesDate('start_date', date);
          model.set('start_date', date);

          // order's start date should be lowest of all related LIs
          view._alignOrderStartDate();

          view._changeEditable($(this), newValue);

          if(moment(ReachUI.currentTimeWithOffset("-5h")).format("YYYY-MM-DD") > date) {
            var error_message = 'Start date cannot be in the past';
            view.$el.find('.start-date').addClass('field_with_errors');
          } else {
            var error_message = '';
            view.$el.find('.start-date').removeClass('field_with_errors');
          }
          view.$el.find('.start-date .errors_container').html(error_message);
        },
        datepicker: {
          startDate: ReachUI.initialStartDate(model.get('start_date'))
        }
      });

      this.ui.end_date_editable.editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD");

          model.setCreativesDate('end_date', date);
          model.set('end_date', date);

          // order's end date should be highest of all related LIs
          view._alignOrderEndDate();

          view._changeEditable($(this), newValue);

          if(moment(ReachUI.currentTimeWithOffset("-5h")).format("YYYY-MM-DD") > date) {
            var error_message = 'End date cannot be in the past';
            view.$el.find('.end-date').removeClass('field_with_errors');
          } else {
            var error_message = '';
            view.$el.find('.end-date').removeClass('field_with_errors');
          }
          view.$el.find('.end-date .errors_container').html(error_message);
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
          var size = newValue[0];
          if (model.is_blank_li) {
            if (model.mediaTypeSizes[size]) {
              view._changeMediaType(model.mediaTypeSizes[size]);
            } else {
              view._changeMediaType(model.  mediaTypeSizes['default']);
            }
          }

          if (model.get('type') == 'Video') {
            var value = newValue.join(', ');
            model.set('companion_ad_size', value);
            model.set('ad_sizes', model.get('master_ad_size') + (value ? ', ' + value : ''));
          } else {
            model.set('ad_sizes', newValue.join(', '));
          }
        }
      });

      // select Creative size from the drop-down autocomplete
      this.$el.find('.size .editable.custom').editable({
        source: '/ad_sizes.json',
        typeahead: {
          minLength: 1,
          remote:    '/ad_sizes.json?search=%QUERY',
          valueKey:  'size'
        },
        validate: function(value) {
          if ($(this).data('name') == 'master_ad_size' &&
              !value.match(/^\d+x\d+$/i)) {
            return 'Only one master ad size is allowed';
          }
        }
      });
      this.$el.find('.size').on('typeahead:selected', function(ev, el) {
        var name = $(this).find('.editable').data('name');
        model.set(name, el.size);
        if (view.model.get('type') == 'Video') {
          model.set('ad_sizes', model.get('master_ad_size') + ', ' + model.get('companion_ad_size'));
        }
      });

      this.ui.rate_editable.editable({
        success: function(response, newValue) {
          model.set('rate', newValue);
          view._recalculateMediaCost();
          collection._recalculateLiImpressionsMediaCost();
        },
        display: function(value) {
          return accounting.formatMoney(value, '');
        }
      });
      //this.ui.rate_editable.editable({});

      this.ui.volume_editable.editable({
        success: function(response, newValue) {
          var value = parseFloat(String(newValue).replace(/,/g, ''));
          value = Math.round(Number(value));
          model.set('volume', value);
          view._recalculateMediaCost();
          collection._recalculateLiImpressionsMediaCost();
        },
        display: function(value) {
          return accounting.formatNumber(value, '');
        }
      });

      this.ui.buffer_editable.editable({
        success: function(response, newValue) {
          model.setBuffer(parseFloat(newValue));
        },
        display: function(value) {
          return accounting.formatNumber(value, 2);
        }
      });

      this.ui.name_editable.editable({
        success: function(response, newValue) {
          view._changeEditable($(this), newValue);
        }
      });
    },

    onRender: function() {
      this.stickit();

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
      var showDeleteBtn = !this.model.get('uploaded');
      _.each(ads, function(ad) {
        if (!ad.get('creatives').length) {
          ad.set({ 'size': view.model.get('ad_sizes') }, { silent: true });
        }
        if (showDeleteBtn && !isNaN(parseInt(ad.get('source_id')))) {
          showDeleteBtn = false;
        }

        view.renderAd(ad);
      });

      if (showDeleteBtn) {
        this.showDupDeleteBtn();
      }
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

        // if there are removed ad_sizes in uploaded revision => strike-through corresponding creatives
        if(this.model.get('revised_removed_ad_sizes')) {
          _.each(this.model.get('revised_removed_ad_sizes'), function(ad_size) {
            _.map(view.model.get('creatives').models, function(c) {
              if(c.get('ad_size') == ad_size) { 
                c.set('removed_with_revision', true);
              }
            });          
          });
        }
      }

      // collect an array of ad_sizes attributes of added creatives to know the number of them
      var already_created_from_revision = _.compact(_.map(view.model.get('creatives').models, function(c) {
        if(c.get('added_with_revision')) {
          return c.get('ad_size');
        }
      }));

      // if there are added ad_sizes in uploaded revision => add creative
      if(this.model.get('revised_added_ad_sizes')) {
        _.each(this.model.get('revised_added_ad_sizes'), function(ad_size) {
          // if there are no such creative added yet
          if(already_created_from_revision.length == 0) {
            // then create one
            var creative = new ReachUI.Creatives.Creative({
              'ad_size': ad_size,
              'order_id': view.model.get('order_id'),
              'added_with_revision': true,
              'lineitem_id': view.model.get('id')}, { silent: true });
            view.model.get('creatives').add(creative);
          }
        });
      }
    },

    // method trigger change event to process contenteditable element by stickit
    _changeEditable: function(el, value, callback) {
        var val = callback ? callback(value) : value;
        el.editable('setValue', value, callback);
        el.trigger('change');
        el.addClass('editable-unsaved');
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

    showDupDeleteBtn: function(options) {
      if (options && options.hide) {
        if (this.model.get('uploaded')) {
          this.ui.dup_btn.hide();
        } else {
          this.ui.dup_btn.show();  
        }
        this.ui.delete_btn.hide();
      } else {
        this.ui.dup_btn.show();
        this.ui.delete_btn.show();
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

    //  This method will open or close targeting dialog box
    //  hideTargeting() will give call to server for validating key value and zipcodes
    _toggleTargetingDialog: function() {
      var is_visible = $(this.ui.targeting).is(':visible');

      if(is_visible){
        this.targetingView.hideTargeting();
      } else{
        this.$el.find('.toggle-targeting-btn').html('Hide Targeting');
        $(this.ui.targeting).show('slow');
      }
    },

    // after validating zipcode and key values this function will get call
    onTargetingDialogToggle: function() {
      this.$el.find('.toggle-targeting-btn').html('+ Add Targeting');
    },

    // for lineitem
    // this function will update the key values and zipcodes after validating
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
      if (this.model.get('revised')) {
        $(e.currentTarget).find('.revised-dialog').toggle();
      } else {
        ReachUI.toggleItemSelection.call(this, e, 'li');
      }
    },

    copyTargeting: function(e) {
      ReachUI.copyTargeting.call(this, e, 'li');
    },

    _deselectAllItems: function(options) {
      ReachUI.deselectAllItems.call(this, options, 'li');
    },

    pasteTargeting: function(e) {
      ReachUI.pasteTargeting.call(this, e, 'li');
    },

    cancelTargeting: function(e) {
      ReachUI.cancelTargeting.call(this, e, 'li');
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
        uploaded: false,
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

        var adFrequencyCaps = [];
        var notFilteredAdFrequencyCaps = ad.get('targeting').get('frequency_caps');
        _.each(notFilteredAdFrequencyCaps.models, function(fc) {
          adFrequencyCaps.push(_.omit(fc.attributes, 'id'));
        });

        new_ad.set({
          start_date: moment(ad.get('start_date')).format("YYYY-MM-DD"),
          end_date: moment(ad.get('end_date')).format("YYYY-MM-DD"),
          creatives: new ReachUI.Creatives.CreativesList(ad_creatives),
          targeting: new ReachUI.Targeting.Targeting({
            selected_zip_codes: _.clone(ad.get('targeting').get('selected_zip_codes')),
            selected_geos: _.clone(ad.get('targeting').get('selected_geos')),
            selected_key_values: _.clone(ad.get('targeting').get('selected_key_values')),
            frequency_caps: adFrequencyCaps,
            audience_groups: _.clone(li.get('targeting').get('audience_groups')),
            keyvalue_targeting: _.clone(ad.get('targeting').get('keyvalue_targeting')),
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

    // ***********************************************************************************************
    // REVISION FUNCTIONS
    // 
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
      var li_id = this.model.get('id');

      if (this.model.ads.length > 0) {
        var $apply_ads_dialog = $('#apply-revisions-ads-dialog');

        $apply_ads_dialog.find('.apply-revisions-txt').html('Apply all new revisions to ads');
        $apply_ads_dialog.find('.noapply-btn').click(function() {
          $apply_ads_dialog.modal('hide');
          self._removeAndHideAllRevisions(e);
        });

        $apply_ads_dialog.find('.apply-btn').click(function() {
          $apply_ads_dialog.find('.apply-btn').off('click');
          $apply_ads_dialog.modal('hide');
          $('.save-order-btn').hide();

          _.each(['start_date', 'end_date', 'ad_sizes', 'name', 'volume', 'rate'], function(attr_name) {
            var revision = self.model.get('revised_'+attr_name),
                original_value = self.model.get(attr_name);

            if(attr_name == 'ad_sizes') {
              if(self.model.get('revised_added_ad_sizes') && self.model.get('revised_added_ad_sizes').length == 0) {
                revision = self.model.get('revised_common_ad_sizes').join(', ');
              } else {
                revision = [self.model.get('revised_common_ad_sizes'), self.model.get('revised_added_ad_sizes')].join(', ');
              }
            }

            if(revision != null) {
              self._applyChangeToAd(attr_name, revision, original_value);
            }
          });
          self._removeAndHideAllRevisions(e);
        });

        $apply_ads_dialog.modal('show');
      }

      _.each(['start_date', 'end_date', 'ad_sizes', 'name', 'volume', 'rate'], function(attr_name) {
        var revision = self.model.get('revised_'+attr_name);

        if(attr_name == 'ad_sizes') {
          if(self.model.get('revised_added_ad_sizes') && self.model.get('revised_added_ad_sizes').length == 0) {
            revision = self.model.get('revised_common_ad_sizes').join(', ');
          } else {
            revision = [self.model.get('revised_common_ad_sizes'), self.model.get('revised_added_ad_sizes')].join(', ');
          }
        }

        if(revision != null) {
          // only li sizes have differently names data attr 
          var data_attr = (attr_name == 'ad_sizes' ? 'lineitem-sizes' : attr_name);

          switch(attr_name) {
            case 'rate':
              revision = accounting.formatNumber(revision, 2);
              break;
            case 'volume':
              revision = accounting.formatNumber(revision);
              break;
            case 'ad_sizes':
              //$editable.filter('[data-name="'+data_attr+'"]').editable('setValue', revised_value);

              // need to delete striked-through creatives and remove 'added_by_revision' flag in added creatives
              if(self.model.get('creatives')) {
                _.map(self.model.get('creatives').models, function(c) {
                  if(c.get('added_with_revision')) {
                    c.attributes['added_with_revision'] = null;
                  }
                });
                var creatives_to_delete = _.select(self.model.get('creatives').models, function(c) {
                  if(c.get('removed_with_revision')) {
                    return c;
                  }
                });
                _.each(creatives_to_delete, function(c) { 
                  var delete_creatives = _.clone(self.model.get('_delete_creatives'));
                  delete_creatives.push(c.get('id'));
                  self.model.set('_delete_creatives', delete_creatives);
                  c.destroy();
                });
                self.renderCreatives();
              }
              break;
          }

          self.model.attributes[attr_name] = revision;
          self.$el.find(elements[attr_name]).filter('[data-name="'+data_attr+'"]').text(revision).addClass('revision');

          var attr_name_humanized = ReachUI.humanize(attr_name.split('_').join(' '));
          logs.push(attr_name_humanized+" "+self.model.get(attr_name)+" -> "+revision);
        }
      });

      // log changes
      if(logs.length>0) {
        EventsBus.trigger('lineitem:logRevision', log_text+logs.join('; '));
      }

      this._removeAndHideAllRevisions(e);
      this._recalculateMediaCost();
      this._alignOrderStartDate();
      this._alignOrderEndDate();
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
      _.each(['start_date', 'end_date', 'added_ad_sizes', 'removed_ad_sizes', 'common_ad_sizes', 'name', 'volume', 'rate'], function(attr_name) {
        self.model.attributes['revised_'+attr_name] = null;
      });

      this.$el.find('.revised-dialog').remove();
    },

    _applyChangeToAd: function(attr_name, revised_value, original_value) {
      var self = this;

      switch (attr_name) {
        case 'start_date':
        case 'end_date':
          _.each(self.model.ads, function(ad) {
            ad.set(attr_name, revised_value);
          });
          break;
        case 'ad_sizes':
          _.each(self.model.ads, function(ad) {
          // need to delete striked-through creatives and remove 'added_by_revision' flag in added creatives for each ad
            if(ad.get('creatives')) {
              _.map(ad.get('creatives').models, function(c) {
                if(c.get('added_with_revision')) {
                  c.attributes['added_with_revision'] = null;
                }
              });
              var creatives_to_delete = _.select(ad.get('creatives').models, function(c) {
                if(c.get('removed_with_revision')) {
                  return c;
                }
              });
              _.each(creatives_to_delete, function(c) { 
                var delete_creatives = _.clone(ad.get('_delete_creatives'));
                delete_creatives.push(c.get('id'));
                ad.set('_delete_creatives', delete_creatives);
                c.destroy();
              });
            }
            ad.set('size', revised_value);
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
      //this.recalculateUnallocatedImps();
    },

    _acceptRevision: function(e) {
      var self = this;
      var $target_parent = $(e.currentTarget).parent(),
          attr_name = $(e.currentTarget).data('name'),
          $editable = $target_parent.siblings('div .editable'),
          revised_value = $target_parent.siblings('.revision').text(),
          original_value = this.model.get(attr_name);

      if(attr_name == 'ad_sizes') {
        if(this.model.get('revised_added_ad_sizes').length == 0) {
          revised_value = this.model.get('revised_common_ad_sizes').join(', ');
        } else {
          revised_value = [this.model.get('revised_common_ad_sizes'), this.model.get('revised_added_ad_sizes')].join(', ');
        }
      }

      // add note to ActivityLog to log the changes
      var attr_name_humanized = ReachUI.humanize(attr_name.split('_').join(' '));
      var log_text = "Revised Line Item "+this.model.get('alt_ad_id')+" : "+attr_name_humanized+" "+this.model.get(attr_name)+" -> "+revised_value;

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
          $('.save-order-btn').hide();
          self._applyChangeToAd(attr_name, revised_value, original_value);
        });
        $apply_ads_dialog.modal('show');
      }
      EventsBus.trigger('lineitem:logRevision', log_text);

      this.model.attributes[attr_name] = revised_value;
      this.model.attributes['revised_'+attr_name] = null;

      $target_parent.siblings('.revision').hide();

      // only li sizes have differently names data attr 
      var data_attr = (attr_name == 'ad_sizes' ? 'lineitem-sizes' : attr_name);
      if(attr_name == 'ad_sizes') {
        $editable.filter('[data-name="'+data_attr+'"]').editable('setValue', revised_value);
        this.model.attributes['revised_removed_ad_sizes'] = null;
        this.model.attributes['revised_added_ad_sizes'] = null;
        this.model.attributes['revised_common_ad_sizes'] = null;

        // need to delete striked-through creatives and remove 'added_by_revision' flag in added creatives
        if(this.model.get('creatives')) {
          _.each(this.model.get('creatives').models, function(c) {
            if(c.get('added_with_revision')) {
              c.attributes['added_with_revision'] = null;
            }
          });
          var creatives_to_delete = _.select(this.model.get('creatives').models, function(c) {
            if(c.get('removed_with_revision')) {
              return c;
            }
          });
          _.each(creatives_to_delete, function(c) { 
            var delete_creatives = _.clone(self.model.get('_delete_creatives'));
            delete_creatives.push(c.get('id'));
            self.model.set('_delete_creatives', delete_creatives);
            c.destroy();
          });
          self.renderCreatives();
        }
      }
      $editable.filter('[data-name="'+data_attr+'"]').addClass('revision').text(revised_value);

      this.model.collection._recalculateLiImpressionsMediaCost();
      this._recalculateMediaCost();
      this._checkRevisedStatus();
      this._alignOrderStartDate();
      this._alignOrderEndDate();
      $target_parent.remove();
    },

    _declineRevision: function(e) {
      var $target_parent = $(e.currentTarget).parent(),
        attr_name = $(e.currentTarget).data('name'),
        self = this;

      this.model.attributes['revised_'+attr_name] = null;

      if(attr_name == 'ad_sizes') {
        this.model.attributes['revised_removed_ad_sizes'] = null;
        this.model.attributes['revised_added_ad_sizes'] = null;
        this.model.attributes['revised_common_ad_sizes'] = null;

        // need to remove striked-through from creatives and remove added creatives
        if(this.model.get('creatives')) {
          _.map(this.model.get('creatives').models, function(c) {
            if(c.get('added_with_revision')) {
              c.destroy();
              self.renderCreatives();
            } else if(c.get('removed_with_revision')) {
              c.set('removed_with_revision', null);
              self.renderCreatives();
            }
          });
        }
      }

      this._checkRevisedStatus();

      $target_parent.siblings('.revision').hide();
      $target_parent.remove();
    }
  });

  LineItems.LineItemListView = LineItems.BasicLineItemListView.extend({
    itemView: LineItems.LineItemView,
    template: JST['templates/lineitems/line_item_table'],

    initialize: function() {
      var view = this;
      this.listenTo(this.collection, 'lineitem:added', function() {
        var lastLIView = view.children.findByIndex(view.children.length - 1);
        lastLIView._recalculateMediaCost();
        lastLIView.showDupDeleteBtn();
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

      this.$el.find('[data-toggle="tooltip"]').tooltip();
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
                    $('.lineitems-container .lineitem:nth(' + li_k + ') .name .errors_container').first().html(li_errors["targeting"]);
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
                      $('.lineitems-container .lineitem:nth(' + li_k + ')').find('.ad:nth(' + ad_k + ') .name .errors_container').html(ad_errors["targeting"]);
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
m
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
          itemIndex = this.collection.length + 1,
          view = this;
      var lastLIView = view.children.length > 0 ? view.children.findByIndex(view.children.length - 1) : null;
      li.set({
        uploaded:  false,
        itemIndex: itemIndex,
        ad_sizes: '',
        name: '',
        creatives: empty_creatives_list,
        start_date: null,
        end_date: null,
        targeting: new ReachUI.Targeting.Targeting({
          audience_groups: lastLIView ? lastLIView.model.get('targeting').get('audience_groups') : []
        })
      });
      li.setBlankLiFlag();

      var platforms = [];
      if (this.collection.length > 0) {
        var lastLI = this.collection.at(this.collection.length - 1);
        li.platforms = lastLI.platforms;
        this.collection.add(li);
        this.collection.trigger('lineitem:added');
      } else {
        platforms = new ReachUI.AdPlatforms.PlatformList();
        platforms.fetch().then(function() {
          li.platforms = platforms;
          view.collection.add(li);
          view.collection.trigger('lineitem:added');
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
