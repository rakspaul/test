(function(Targeting) {
  'use strict';

  Targeting.Targeting = Backbone.Model.extend({
    defaults: function() {
      return {
        selected_key_values: [],
        selected_geos: [],
        dmas_list: [],
        audience_groups: [],
        selected_zip_codes: [],
        frequency_caps: [],
        keyvalue_targeting: '',
        type: 'Display'
      }
    },

    toJSON: function() {
      return { targeting: _.clone(_.omit(this.attributes, 'dmas_list', 'audience_groups')) };
    },

    setDirty: function() {
      // we set class flag dirty to reload LineItemList after save
      ReachUI.LineItems.LineItemList.setDirty(true);
    },
  });

  Targeting.TargetingView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/targeting/targeting'],
    className: 'targeting',

    initialize: function() {
      _.bindAll(this, "render");
      this.model.bind('change', this.render);
      this.show_custom_key_values = false;
      this.errors_in_kv = false;
      this.frequencyCapListView = null;
      this.validateKV = true;
    },

    serializeData: function(){
      var data = this.model.toJSON();
      data.dmas_list = this.model.get('dmas_list');
      data.selected_key_values = this.model.get('selected_key_values');
      data.selected_geos = this.model.get('selected_geos');
      data.selected_zip_codes = this.model.get('selected_zip_codes');
      data.audience_groups = this.model.get('audience_groups');
      data.frequency_caps = this.model.get('frequency_caps');
      data.keyvalue_targeting = this.model.get('keyvalue_targeting');
      data.type = this.model.get('type');
      return data;
    },

    onRender: function() {
      var self = this;

      this.show_custom_key_values = false;

      this.$el.find('.tab.geo input').on('keyup', function(ev) {
        $.getJSON('/dmas/search_geo.json?search='+$(this).val(), function(geos) {
          if(geos.length > 0) {
            var geos_html = '';
            for (var i = 0; i < geos.length; i++) {
              var is_checked = false;
              _.each(self.model.get('selected_geos'), function(selected_geo) {
                if(selected_geo.id == geos[i].id && selected_geo.type == geos[i].type) {
                  is_checked = true;
                }
              });

              var title = [];
              title.push(geos[i].name);
              if(geos[i].region_name) {
                title.push(geos[i].region_name);
              }

              geos_html += '<input type="checkbox" name="geo" '+(is_checked ? 'checked="checked"' : '')+' value="'+geos[i].id+'|'+geos[i].type+'|'+title.join('/')+'"/>';
              geos_html += geos[i].name;

              if(geos[i].region_name) {
                geos_html += '<span style="color:grey">, '+geos[i].region_name+'</span>';
              }

              geos_html += ' <span class="'+geos[i].type.toLowerCase()+'_type">'+geos[i].type+'</span> <br/>';
            }
            self.$el.find('.geo-checkboxes-container').html(geos_html);
          } else {
            self.$el.find('.geo-checkboxes-container').html('No Cities/DMA/States where found');
          }
        });
      });

      this.$el.find('.key-values .chosen-select').chosen({no_results_text: "Select Audience Groups here", width: "97%"}).change(function(e, el) {
        // since here we couln't handle unselect option event, must be processed all at once
        var selected_values = $(this).val();
        var selected = []

        for(var i = 0; i < this.options.length; i++) {
          if(this.options[i].selected) {
            var value = this.options[i].value,
                audience_group = _.find(self.model.get('audience_groups'), function(el) {
                  return el.id == value;
                });
            selected.push({id: value, title: this.options[i].text, key_values: audience_group.key_values});
          }
        }

        self.model.attributes.selected_key_values = selected;

        // sync select w/ checkboxes
        self.$el.find('.key-values .key-values-checkboxes-container input:checkbox').each(function(index) {
          if(selected_values != null && selected_values.indexOf(String(this.value)) >= 0) {
            this.checked = true;
          } else {
            this.checked = false;
          }
        });

        self._renderSelectedTargetingOptions();
      });
      this.$el.find('.key-values .chosen-choices input').width('200px');

      this._renderFrequencyCaps();
      this._renderSelectedTargetingOptions();
      this.validateCustomKV();

      this.sel_ag = _.pluck(this.model.get('selected_key_values'), 'title');
    },

    _showKeyValuesTab: function() {
      this.$el.find('.tab').hide();
      this.$el.find('.nav-tabs li').removeClass('active');
      this.$el.find('.nav-tabs li.key-values').addClass('active');
      this.$el.find('.tab.key-values').show();
    },

    _showGEOTab: function() {
      this.$el.find('.tab').hide();
      this.$el.find('.nav-tabs li').removeClass('active');
      this.$el.find('.nav-tabs li.geo').addClass('active');
      this.$el.find('.tab.geo').show();
    },

    _showZipCodesTab: function() {
      this.$el.find('.tab').hide();
      this.$el.find('.nav-tabs li').removeClass('active');
      this.$el.find('.nav-tabs li.zip-codes').addClass('active');
      this.$el.find('.tab.zip-codes').show();
    },

    _showFrequencyCapsTab: function() {
      this.$el.find('.tab').hide();
      this.$el.find('.nav-tabs li').removeClass('active');
      this.$el.find('.nav-tabs li.frequency-caps').addClass('active');
      this.$el.find('.tab.frequency-caps').show();
    },

    _renderSelectedTargetingOptions: function() {
      var frequencyCaps = this.frequencyCapListView ? this.frequencyCapListView.collection : this.model.get('frequency_caps');
      var dict = { selected_key_values: this.model.get('selected_key_values'), selected_geos: this.model.get('selected_geos'), selected_zip_codes: this.model.get('selected_zip_codes'), show_custom_key_values: this.show_custom_key_values, keyvalue_targeting: this.model.get('keyvalue_targeting'), frequency_caps: frequencyCaps, dfp_key_values: this.model.get('dfp_key_values'), reach_custom_kv: this._getReachCustomKV(), isAdPushed: this._getAdPushed() };
      var html = JST['templates/targeting/selected_targeting'](dict);
      this.$el.find('.selected-targeting').html(html);

      this.model.attributes.keyvalue_targeting = this._getReachCustomKV();
      this.model.attributes.isAdPushed = this._getAdPushed();
      this.validateCustomKV();
    },

    _getReachCustomKV: function() {
      if(this.validateKV) {
        var keyvalue_targeting = this.model.get('keyvalue_targeting'),
            dfp_key_values = this.model.get('dfp_key_values'),
            dfp_kv = [],
            reach_cust_kv = [];

        var order_status = this.model.get('order_status');
        if(order_status === '') {
          order_status = 'draft';
        }

        if(dfp_key_values && this._getAdPushed() && order_status === 'Pushed') {
          dfp_kv = dfp_key_values.split(',');
        }

        reach_cust_kv = keyvalue_targeting.split(',');

        if(dfp_kv != '') {
          var dfp_true = _.difference(dfp_kv, reach_cust_kv),
              dfp_false = _.difference(reach_cust_kv, dfp_kv);

          reach_cust_kv = _.difference(reach_cust_kv, dfp_false).concat(dfp_true);
        }

        if(reach_cust_kv.length) {
          reach_cust_kv = reach_cust_kv.join(',');
        }
      } else {
        reach_cust_kv = this.model.get('keyvalue_targeting');
      }

      return reach_cust_kv;
    },

    _getAdPushed: function() {
      var dfp_id = this.model.get('ad_dfp_id');
      if (dfp_id != undefined) {
        return dfp_id.match(/^R/) ? false : true;
      }

      return null;
    },

    _renderFrequencyCaps: function() {
      var frequencyCaps = this.model.get('frequency_caps'),
          collection = frequencyCaps;
      var self = this;

      if (!frequencyCaps.models) {
        collection = new ReachUI.FrequencyCaps.FrequencyCapsList(frequencyCaps);
      }
      if (this.frequencyCapListView) {
        this.frequencyCapListView.updateCollection(frequencyCaps);
      } else {
        this.frequencyCapListView = new Targeting.FrequencyCapListView({
          collection:  collection,
          parent_view: self
        });
      }
      this.ui.frequency_caps.html(this.frequencyCapListView.render().el);
    },

    _addKVToSelectedKeyValues: function(selected) {
      this.model.attributes.selected_key_values.push(selected);
    },

    _removeKVFromSelectedKeyValues: function(audience_group_id) {
      this.model.attributes.selected_key_values = _.filter(this.model.get('selected_key_values'), function(el) {
        if(parseInt(el.id) != audience_group_id) {
          return el;
        }
      });
    },

    _handleKVCheckboxes: function(e) {
      var select = this.$el.find('.key-values .chosen-select')[0],
          checked_value = e.currentTarget.value,
          checked_text;

      for(var i = 0; i < select.options.length; i++) {
        if(select.options[i].value == checked_value) {
          checked_text = select.options[i].text;
          if(e.currentTarget.checked) {
            $(select.options[i]).attr('selected', 'selected'); // sync checkboxes with select
            var audience_group = _.find(this.model.get('audience_groups'), function(el) {
              return el.id == checked_value;
            });

            var is_new_ag = $.inArray( checked_text , this.sel_ag ) > -1 ? false : true;

            this._addKVToSelectedKeyValues({id: checked_value, title: checked_text, key_values: audience_group.key_values, is_new: is_new_ag});
          } else {
            $(select.options[i]).removeAttr('selected'); // sync checkboxes with select
            this._removeKVFromSelectedKeyValues(checked_value);
          }
          break;
        }
      }

      $(select).trigger("chosen:updated");
      this._renderSelectedTargetingOptions();
    },

    _addGeoToSelectedGeos: function(selected) {
      this.model.attributes.selected_geos.push(selected);
    },

    _removeGeoFromSelectedGeos: function(geo_id, geo_type) {
      this.model.attributes.selected_geos = _.filter(this.model.get('selected_geos'), function(el) {
        if(!(parseInt(el.id) == parseInt(geo_id) && el.type == geo_type)) {
          return el;
        }
      });
    },

    _handleGeoCheckboxes: function(e) {
      var val = e.currentTarget.value.split('|');

      if(e.currentTarget.checked) {
        this._addGeoToSelectedGeos({id: val[0], title: val[2], type: val[1]});
      } else {
        this._removeGeoFromSelectedGeos(val[0], val[1]);
      }

      this._renderSelectedTargetingOptions();
    },

    _removeGeoFromSelected: function(e) {
      var geo_id = $(e.currentTarget).data('geo-id'),
          geo_type = $(e.currentTarget).data('geo-type'),
          selected_geos = this.model.get('selected_geos');

      for(var i = 0; i < selected_geos.length; i++) {
        if(selected_geos[i].id == geo_id && selected_geos[i].type == geo_type) {
          this.$el.find('input[value^="'+geo_id+'|'+geo_type+'"]').removeAttr('checked'); // sync w/ checkboxes
          this._removeGeoFromSelectedGeos(parseInt(geo_id), geo_type);
          break;
        }
      }

      this._renderSelectedTargetingOptions();
    },

    _updateZipCodes: function(e) {
      var zip_codes = e.currentTarget.value.split(/\r\n|\r|\n| +|,/mi);
      this.model.attributes.selected_zip_codes = _.compact(_.collect(zip_codes, function(el) { return el.trim() } ));

      this._renderSelectedTargetingOptions();
    },

    validateCustomKV: function(e) {
      var custom_kv = this.model.get('keyvalue_targeting'), self = this;
      this.errors_in_kv = false;

      if(custom_kv.trim() != "") {
        _.each(custom_kv.split(','), function(el) {
          if(el.trim().match(/^(\w+)=([\w\.]+)$/) == null) {
            self.errors_in_kv = "Key value format should be [key]=[value]";
          }
        });

        if(custom_kv.trim().match(/(\w+)=([\w\.]+)\s*[^,]*\s*(\w+)=([\w\.]+)/)) {
          this.errors_in_kv = "Key values should be comma separated";
        }
      }

      if(this.errors_in_kv) {
        this.$el.find('span.custom-kv-errors').html(this.errors_in_kv);
        this.$el.find('.save-targeting-btn').css({backgroundColor: 'grey'});
      } else {
        this.$el.find('span.custom-kv-errors').html('');
        this.$el.find('.save-targeting-btn').css({backgroundColor: '#005c97'})
      }
    },

    _updateCustomKVs: function(e) {
      this.model.attributes.keyvalue_targeting = e.currentTarget.value;
      this.validateCustomKV();
      this.validateKV = false;
    },

    _closeTargetingDialog: function() {
      if(! this.errors_in_kv) {
        if(this.$el.find('.custom-kvs-field').is(':visible'))
          this.$el.find('.custom-regular-keyvalue-btn').trigger('click');

        this.options.parent_view._toggleTargetingDialog();
        this._renderSelectedTargetingOptions();
      }
    },

    _toggleCustomRegularKeyValues: function() {
      this.ui.kv_type_switch.html(this.show_custom_key_values ? '+ Add Custom K/V' : 'Close Custom')
      this.show_custom_key_values = ! this.show_custom_key_values;
      this._renderSelectedTargetingOptions();
      this.$el.find('.custom-targeting').toggle(this.show_custom_key_values);

      // #29 Clicking "+Add Custom K/V" should bring you straight into Edit mode for the custom key value
      if(this.show_custom_key_values && this.model.get('keyvalue_targeting')) {
        this.$el.find('span.keyvalue_targeting').hide();
        this.$el.find('input.custom-kvs-field').show();

      }
      this.validateCustomKV();
    },

    _showRemoveTgtBtn: function(e) {
      $(e.currentTarget).find('.remove-btn').show();
    },

    _hideRemoveTgtBtn: function(e) {
      $(e.currentTarget).find('.remove-btn').hide();
    },

    _removeKVFromSelected: function(e) {
      var audience_group_id = $(e.currentTarget).data('ag-id'),
          select = this.$el.find('.key-values .chosen-select')[0],
          select_check = this.$el.find('.key-values .key-values-checkboxes-container')[0];

      for(var i = 0; i < select.options.length; i++) {
        if(select.options[i].value == audience_group_id) {
          this._removeKVFromSelectedKeyValues(parseInt(audience_group_id));
          $(select_check).find('input[value ='+audience_group_id+']').removeAttr('checked')
          $(select.options[i]).removeAttr('selected'); // sync checkboxes with select
          break;
        }
      }

       $(select).trigger("chosen:updated");
       this._renderSelectedTargetingOptions();
    },

    _removeZipFromSelected: function(e) {
      var zip_code_to_delete = $(e.currentTarget).data('zip');

      this.model.attributes.selected_zip_codes = _.filter(this.model.attributes.selected_zip_codes, function(el) {
        if(el.trim() != zip_code_to_delete) {
          return el.trim();
        }
      });

      this._renderSelectedTargetingOptions();
      this.$el.find('.tab.zip-codes textarea').val(this.model.attributes.selected_zip_codes.join(', '));
    },

    _removeFrequencyCap: function(e) {
      var frequencyCapToDelete = $(e.currentTarget).data('frequency-cap-id');
      var model = this.frequencyCapListView.collection.get(frequencyCapToDelete);

      if (!model) {
        model = model.getByCid(frequencyCapToDelete);
      }
      model.trigger('frequency_cap:remove', model);
      this._renderSelectedTargetingOptions();
    },

    ui: {
      kv_type_switch: '.custom-regular-keyvalue-btn span',
      frequency_caps:  '.tab.frequency-caps'
    },

    _isGeoTargeted: function(e) {
      var attr = this.model.attributes;
      return (attr.selected_geos.length > 0 || attr.selected_zip_codes.length > 0)  ? true : false;
    },

    events: {
      'click .save-targeting-btn': '_closeTargetingDialog',
      'click .tab.geo .geo-checkboxes-container input:checkbox': '_handleGeoCheckboxes',
      'click .key-values .key-values-checkboxes-container input:checkbox': '_handleKVCheckboxes',
      'click .nav-tabs > .key-values': '_showKeyValuesTab',
      'click .nav-tabs > .geo': '_showGEOTab',
      'click .nav-tabs > .zip-codes': '_showZipCodesTab',
      'click .nav-tabs > .frequency-caps': '_showFrequencyCapsTab',
      'keyup .zip-codes textarea': '_updateZipCodes',
      'keyup input.custom-kvs-field': '_updateCustomKVs',
      'click .custom-regular-keyvalue-btn': '_toggleCustomRegularKeyValues',
      'mouseenter .tgt-item-kv-container, .tgt-item-geo-container, .tgt-item-zip-container, .tgt-item-frequency-caps-container': '_showRemoveTgtBtn',
      'mouseleave .tgt-item-kv-container, .tgt-item-geo-container, .tgt-item-zip-container, .tgt-item-frequency-caps-container': '_hideRemoveTgtBtn',
      'click .tgt-item-kv-container .remove-btn': '_removeKVFromSelected',
      'click .tgt-item-geo-container .remove-btn': '_removeGeoFromSelected',
      'click .tgt-item-zip-container .remove-btn': '_removeZipFromSelected',
      'click .tgt-item-frequency-caps-container .remove-btn': '_removeFrequencyCap'
    }
  });

  Targeting.FrequencyCapView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/targeting/frequency_cap'],
    className: 'frequency-cap',
    bindings: {
      '.frequency-impressions': 'impressions',
      '.frequency-time-value':  'time_value',
      '.frequency-time-unit': {
        observe: 'time_unit',
        selectOptions: {
          collection: function() {
            return _.map(ReachUI.FrequencyCaps.FrequencyCap.timeUnits, function(unit, index) {
              return { value: index, label: unit };
            });
          }
        }
      }
    },

    events: {
      'click .remove-btn': '_removeFrequencyCap'
    },

    onRender: function() {
      this.stickit();
    },

    _removeFrequencyCap: function(el) {
      this.model.trigger('frequency_cap:remove', this.model);
    }
  });

  Targeting.FrequencyCapListView = Backbone.Marionette.CompositeView.extend({
    itemView: Targeting.FrequencyCapView,
    itemViewContainer: '.frequency-caps-container',
    template: JST['templates/targeting/frequency_caps_container'],
    className: 'frequency-caps',

    events: {
      'click .add-frequency-cap-link': '_addNewFrequencyCap',
      'change': '_updateParentModel'
    },

    initialize: function() {
      var self = this;

      this.collection.on('frequency_cap:remove', function(el) {
        self.collection.remove(el);
        self._updateParentModel();
        self.options.parent_view._renderSelectedTargetingOptions();
      });
    },

    updateCollection: function(caps) {
      var removeCaps = [],
          self = this;
      if (this.collection.length > 0) {
        _.each(this.collection.models, function(model) {
          var id = model.get('id'), found = false;
          if (id) {
            if (caps.models) {
              found = caps.models.find(function(fc) {
                return fc.get('id') == id;
              });
            } else {
              found = _.find(caps, function(fc) {
                return fc.id == id;
              });
            };
            if (!found) {
              removeCaps.push(id);
            }
          }
        });
        _.each(removeCaps, function(id) {
          self.collection.remove(self.collection.get(id));
        });
      }

      var addCaps = caps.models ? caps.models : caps;
      _.each(addCaps, function(fc) {
        if ((!fc.attributes && !fc.id) || (fc.attributes && !fc.get('id')) ||
            !self.collection.get(fc.id)) {
          var frequencyCap = fc;
          if (!fc.attributes) {
            frequencyCap = new ReachUI.FrequencyCaps.FrequencyCap(fc);
          }
          self.collection.add(frequencyCap);
        }
      });
      this._updateParentModel();
    },

    _addNewFrequencyCap: function() {
      this.collection.add(new ReachUI.FrequencyCaps.FrequencyCap());
      this._updateParentModel();
    },

    _updateParentModel: function() {
      this.options.parent_view.model.set({ 'frequency_caps': this.collection }, { silent: true });
      this._setTargetingAsDirty();
    },

    _setTargetingAsDirty: function() {
      if (this.options.parent_view.model.setDirty) {
        this.options.parent_view.model.setDirty();
      }
    }
  });

})(ReachUI.namespace("Targeting"));
