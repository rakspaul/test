(function(Targeting) {
  'use strict';

  Targeting.Targeting = Backbone.Model.extend({
    defaults: function() {
      return {
        selected_key_values: [],
        selected_geos: [],
        audience_groups: [],
        selected_zip_codes: [],
        frequency_caps: [],
        keyvalue_targeting: '',
        type: 'Display'
      }
    },

    toJSON: function() {
      return { targeting: _.clone(_.omit(this.attributes, 'audience_groups')) };
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
      _.bindAll(this, "render", "_onSuccessCloseTargeting", "_onSuccessHideCustomKeyValues", "_onValidateCustomKeyValuesFailure", "_onZipcodeSuccess");
      this.model.bind('change', this.render);
      this.show_custom_key_values = false;
      this.errors_in_kv = false;
      this.frequencyCapListView = null;
      this.errors_in_zip_codes = false;
      this.isCustomKeyValueValid = true;
      this.isZipcodesValid = true;
      this.reachCustomKeyValues = this.model.get('keyvalue_targeting') || '';
      this.updatedZipcodes = this.model.get('selected_zip_codes') || '';
    },

    serializeData: function(){
      var data = this.model.toJSON();
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
        $.getJSON('/dmas/search.json?search='+$(this).val(), function(geos) {
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
      var dict = { selected_key_values: this.model.get('selected_key_values'),
                   selected_geos: this.model.get('selected_geos'),
                   selected_zip_codes: this.updatedZipcodes,
                   show_custom_key_values: this.show_custom_key_values,
                   keyvalue_targeting: this.model.get('keyvalue_targeting'),
                   dfp_key_values: this.model.get('dfp_key_values'),
                   frequency_caps: this.model.get('frequency_caps'),
                   reach_custom_kv: this._getReachCustomKV(),
                   isAdPushed: this._getAdPushed(),
                   invalid_zip_codes: this.invalid_zips || []
                 };

      var html = JST['templates/targeting/selected_targeting'](dict);
      this.$el.find('.selected-targeting').html(html);

      this.model.attributes.isAdPushed = this._getAdPushed();
    },

    _getReachCustomKV: function() {
      return this.reachCustomKeyValues;
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
      zip_codes = _.compact(_.collect(zip_codes, function(el) { return el.trim() } ));

      this.validateZipCodes(zip_codes);

      this.updatedZipcodes = _.compact(_.collect(zip_codes, function(el) { return el.trim() } ));
      this.isZipcodesValid = false;
      this._renderSelectedTargetingOptions();
    },

    validateZipCodes: function(zip_codes){
      this.errors_in_zip_codes = false;
      this.isZipcodesValid = true;

      for (var i = 0; i < zip_codes.length; i++) {
        if(zip_codes[i].match(/^\s*$/) == null) {
          var is_current_zip_code_valid = zip_codes[i].match(/^\s*(\d{5})\s*$/);
          this.errors_in_zip_codes = is_current_zip_code_valid ? false : true;
        }
      }

      this._toogleDoneBtn();
    },

    // this function will get called from ad or lineitem
    hideTargeting: function() {
      this._onSave();
    },

    _toogleDoneBtn: function(){
      if(this.errors_in_zip_codes) {
        this.$el.find('span.custom-kv-errors').html(this.errors_in_kv);
        this.$el.find('.save-targeting-btn').addClass('disabled');
      } else {
        this.$el.find('span.custom-kv-errors').html('');
        this.$el.find('.save-targeting-btn').removeClass('disabled');
      }
    },

    _onCustomKeyValueChange: function(event) {
      this.reachCustomKeyValues = event.target.value
      this.isCustomKeyValueValid = false;
    },

    _updateCustomKVs: function(e) {
      this.isCustomKeyValueValid = true;
      this.model.attributes.keyvalue_targeting = this.reachCustomKeyValues;
    },

    _onSave: function() {
      if(!this.$el.find('.save-targeting-btn').hasClass('disabled')){
        this._validateCustomKeyValuesOnDone();
        this._validateZipcodesOnDone();
      }
    },

    // if the key value is invalid then validate them
    // else if key value is valid close targeting dialog box
    // else key value is blank update them and close the targeting dialog box
    _validateCustomKeyValuesOnDone: function() {
      var customKeyValue = this.$el.find(".custom-kvs-field").val();
      if (customKeyValue && customKeyValue != '' && !this.isCustomKeyValueValid) {
        this._validateCustomKeyValues(customKeyValue, this._onSuccessCloseTargeting, this._onValidateCustomKeyValuesFailure);
      } else if (this.isCustomKeyValueValid && this.isZipcodesValid) {
        this._closeTargetingDialog();
      } else {
        this._closeTargeting();
      }
    },

    _validateZipcodesOnDone: function() {
      var zipcodes = this.updatedZipcodes;

      if(zipcodes && zipcodes != ''  && !this.isZipcodesValid) {
        this._validateZipcodes(zipcodes);
      } else if (zipcodes == ''){
        this.model.attributes.selected_zip_codes = []
        this._closeTargetingDialog();
      } else {
        this._closeTargetingDialog();
      }
    },

    _validateZipcodes:function(zipcodes) {
      var self = this;
      $.ajax({type: "POST", url: '/zipcode/validate', data: {zipcodes: zipcodes}, success: this._onZipcodeSuccess});
    },

    _onZipcodeSuccess: function(data) {
      var zipcodes = this.updatedZipcodes;

      this.invalid_zips = _.difference(zipcodes, data.message);

      if(this.invalid_zips.length > 0) {
        this.isZipcodesValid = false;
      }
      else {
        this.isZipcodesValid = true;
        this.model.attributes.selected_zip_codes = data.message;
        this._closeTargetingDialog();
      }

      this._renderSelectedTargetingOptions();
      //this.model.attributes.selected_zip_codes = data.message;
    },

    _onSuccessCloseTargeting: function(event) {
      this._closeTargeting();
    },

    _closeTargeting: function() {
      this._updateCustomKVs();
      this._closeTargetingDialog();
    },

    // if the key value is valid then close the targeting dialog box
    _closeTargetingDialog: function() {
      if(this.isCustomKeyValueValid && this.isZipcodesValid) {
        if(this.$el.find('.custom-kvs-field').is(':visible')) {
          this.$el.find('.custom-regular-keyvalue-btn').trigger('click');
        }
        this._renderSelectedTargetingOptions();
        this.options.parent_view._hideTargetingDialog();
        this.options.parent_view.onTargetingDialogToggle();
        this.$el.parent().hide('slow');
      }
    },

    _validateCustomKeyValues: function(customKeyValue, onSuccess, onFailure) {
      this.errors_in_kv = ""
      this.$el.find('span.custom-kv-errors').html(this.errors_in_kv);
      $.ajax({type: "POST", url: '/key_values/validate', data: {kv_expr: customKeyValue}, success: onSuccess, error: onFailure});
    },

    // if the key values are not valid then validate the key values
    // else hide the custom key value component
    _toggleCustomRegularKeyValues: function() {
      var customKeyValue = this.$el.find(".custom-kvs-field").val();
      if (customKeyValue && customKeyValue != '' && !this.isCustomKeyValueValid) {
        this._validateCustomKeyValues(customKeyValue, this._onSuccessHideCustomKeyValues, this._onValidateCustomKeyValuesFailure);
      } else {
        this._hideCustomKeyValues();
      }
    },

    _onSuccessHideCustomKeyValues: function(event) {
      this._hideCustomKeyValues();
    },

    _hideCustomKeyValues: function() {
      if (this.show_custom_key_values) {
        this._updateCustomKVs();
      }
      this.ui.kv_type_switch.html(this.show_custom_key_values ? '+ Add Custom K/V' : 'Close Custom')
      this.show_custom_key_values = ! this.show_custom_key_values;
      this._renderSelectedTargetingOptions();
      this.$el.find('.custom-targeting').toggle(this.show_custom_key_values);

      // #29 Clicking "+Add Custom K/V" should bring you straight into Edit mode for the custom key value
      if(this.show_custom_key_values && this.model.get('keyvalue_targeting')) {
        this.$el.find('span.keyvalue_targeting').hide();
        this.$el.find('input.custom-kvs-field').show();
      }
    },

    _onValidateCustomKeyValuesFailure: function(event) {
      this.isCustomKeyValueValid = false;
      this.errors_in_kv = "Please enter valid key value(s).";
      this.$el.find('span.custom-kv-errors').html(this.errors_in_kv);
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

      this.updatedZipcodes = _.filter(this.updatedZipcodes, function(el) {
        if(el.trim() != zip_code_to_delete) {
          return el.trim();
        }
      });

      this._renderSelectedTargetingOptions();
      this.$el.find('.tab.zip-codes textarea').val(this.updatedZipcodes.join(', '));
      this.validateZipCodes(this.updatedZipcodes);
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
      frequency_caps:  '.tab.frequency-caps',
    },

    _isGeoTargeted: function(e) {
      var attr = this.model.attributes;
      return (attr.selected_geos.length > 0 || attr.selected_zip_codes.length > 0)  ? true : false;
    },

    events: {
      'click .save-targeting-btn': '_onSave',
      'click .tab.geo .geo-checkboxes-container input:checkbox': '_handleGeoCheckboxes',
      'click .key-values .key-values-checkboxes-container input:checkbox': '_handleKVCheckboxes',
      'click .nav-tabs > .key-values': '_showKeyValuesTab',
      'click .nav-tabs > .geo': '_showGEOTab',
      'click .nav-tabs > .zip-codes': '_showZipCodesTab',
      'click .nav-tabs > .frequency-caps': '_showFrequencyCapsTab',
      'keyup .zip-codes textarea': '_updateZipCodes',
      'input input.custom-kvs-field': '_onCustomKeyValueChange',
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
      this._updateParentModel();

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

    // overwrite for IE bug fix
    appendHtml: function(cv, iv, index) {
      var $container = this.$el.find('.frequency-caps-container');
      $container.append(iv.el);
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
