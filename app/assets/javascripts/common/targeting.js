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
    }
  });

  Targeting.TargetingView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/targeting/targeting'],
    className: 'targeting',

    initialize: function() {
      _.bindAll(this, "render");
      this.model.bind('change', this.render);
      this.show_custom_key_values = false;
      this.errors_in_kv = false;
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
      var dict = { selected_key_values: this.model.get('selected_key_values'), selected_geos: this.model.get('selected_geos'), selected_zip_codes: this.model.get('selected_zip_codes'), show_custom_key_values: this.show_custom_key_values, keyvalue_targeting: this.model.get('keyvalue_targeting') };
      var html = JST['templates/targeting/selected_targeting'](dict);
      this.$el.find('.selected-targeting').html(html);

      this.validateCustomKV();
    },

    _renderFrequencyCaps: function() {
      var frequencyCaps = this.model.get('frequency_caps');
      var self = this;

      var view = new Targeting.FrequencyCapListView({
        collection:  new ReachUI.FrequencyCaps.FrequencyCapsList(frequencyCaps),
        parent_view: self
      });
      this.ui.frequency_caps.html(view.render().el);
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
            this._addKVToSelectedKeyValues({id: checked_value, title: checked_text, key_values: audience_group.key_values});
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
          select = this.$el.find('.key-values .chosen-select')[0];

      for(var i = 0; i < select.options.length; i++) {
        if(select.options[i].value == audience_group_id) {
          $(select.options[i]).removeAttr('selected'); // sync checkboxes with select
          this._removeKVFromSelectedKeyValues(parseInt(audience_group_id));
          break;
        }
      }

      $(select).trigger("chosen:updated");
      $(select).trigger("change");
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

    ui: {
      kv_type_switch: '.custom-regular-keyvalue-btn span',
      frequency_caps:  '.tab.frequency-caps'
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
      'mouseenter .tgt-item-kv-container, .tgt-item-geo-container, .tgt-item-zip-container': '_showRemoveTgtBtn',
      'mouseleave .tgt-item-kv-container, .tgt-item-geo-container, .tgt-item-zip-container': '_hideRemoveTgtBtn',
      'click .tgt-item-kv-container .remove-btn': '_removeKVFromSelected',
      'click .tgt-item-geo-container .remove-btn': '_removeGeoFromSelected',
      'click .tgt-item-zip-container .remove-btn': '_removeZipFromSelected'
    }
  });

  Targeting.FrequencyCapView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/targeting/frequency_cap'],
    className: 'frequency-cap',
    bindings: {
      '.frequency-impressions': 'impressions',
      '.frequency-time-value':  'time_value',
      '.frequency-time-unit':   'time_unit'
    },

    events: {
      'click .remove-btn': '_removeFrequencyCap'
    },

    onRender: function() {
      this.stickit();
    },

    _removeFrequencyCap: function(el) {
      this.model.destroy();
    }
  });

  Targeting.FrequencyCapListView = Backbone.Marionette.CompositeView.extend({
    itemView: Targeting.FrequencyCapView,
    itemViewContainer: '.frequency-caps-container',
    template: JST['templates/targeting/frequency_caps_container'],
    className: 'frequency-caps',

    events: {
      'click .add-frequency-cap-link': '_addNewFrequencyCap'
    },

    _addNewFrequencyCap: function() {
      this.collection.add(new ReachUI.FrequencyCaps.FrequencyCap());
      this.options.parent_view.model.set({ 'frequency_caps': this.collection }, { silent: true });
      /*var imp = [];
      _.map(this.options.parent_view.model.get('frequency_caps').models, function(el) {
        imp.push(el.get('impressions'));
      });
      console.log(imp.join(' - '));*/
    }
  });

})(ReachUI.namespace("Targeting"));
