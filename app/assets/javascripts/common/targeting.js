(function(Targeting) {
  'use strict';

  Targeting.Targeting = Backbone.Model.extend({
    defaults: function() {
      return {
        selected_key_values: [],
        selected_dmas: [],
        dmas_list: [],
        audience_groups: [],
        selected_zip_codes: []
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
    },

    serializeData: function(){
      var data = this.model.toJSON();
      data.dmas_list = this.model.get('dmas_list');
      data.selected_key_values = this.model.get('selected_key_values');
      data.selected_dmas = this.model.get('selected_dmas');
      data.selected_zip_codes = this.model.get('selected_zip_codes');
      data.audience_groups = this.model.get('audience_groups');
      return data;
    },

    onRender: function() {
      var self = this;

      this.$el.find('.dmas .chosen-select').chosen({no_results_text: "Select DMAs here", width: "97%"}).change(function(e, el) {
        // since here we couln't handle unselect option event, must be processed all at once
        var selected_values = $(this).val();
        var selected = []

        for(var i = 0; i < this.options.length; i++) {
          if(this.options[i].selected) {
            selected.push({id: this.options[i].value, title: this.options[i].text});
          }
        }

        self.model.attributes.selected_dmas = selected;

        // sync select w/ checkboxes
        self.$el.find('.dmas .dmas-checkboxes-container input:checkbox').each(function(index) {
          if(selected_values != null && selected_values.indexOf(String(this.value)) >= 0) {
            this.checked = true;
          } else {
            this.checked = false;
          }
        });
        self._renderSelectedTargetingOptions();
      });

      this.$el.find('.key-values .chosen-select').chosen({no_results_text: "Select Audience Groups here", width: "97%"}).change(function(e, el) {
        // since here we couln't handle unselect option event, must be processed all at once
        var selected_values = $(this).val();
        var selected = []

        for(var i = 0; i < this.options.length; i++) {
          if(this.options[i].selected) {
            selected.push({id: this.options[i].value, title: this.options[i].text});
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

      this._renderSelectedTargetingOptions();
    },

    _showKeyValuesTab: function() {
      this.$el.find('.tab').hide();
      this.$el.find('.nav-tabs li').removeClass('active');
      this.$el.find('.nav-tabs li.key-values').addClass('active');
      this.$el.find('.tab.key-values').show();
    },

    _showDMAsTab: function() {
      this.$el.find('.tab').hide();
      this.$el.find('.nav-tabs li').removeClass('active');
      this.$el.find('.nav-tabs li.dmas').addClass('active');
      this.$el.find('.tab.dmas').show();
    },

    _showZipCodesTab: function() {
      this.$el.find('.tab').hide();
      this.$el.find('.nav-tabs li').removeClass('active');
      this.$el.find('.nav-tabs li.zip-codes').addClass('active');
      this.$el.find('.tab.zip-codes').show();
    },

    _renderSelectedTargetingOptions: function() {
      var dict = { selected_key_values: this.model.get('selected_key_values'), selected_dmas: this.model.get('selected_dmas'), selected_zip_codes: this.model.get('selected_zip_codes') };
      var html = JST['templates/targeting/selected_targeting'](dict);     
      this.$el.find('.selected-targeting').html(html);
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
            this._addKVToSelectedKeyValues({id: checked_value, title: checked_text});
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

    _addDmaToSelectedDmas: function(selected) {
      this.model.attributes.selected_dmas.push(selected);
    },

    _removeDmaFromSelectedDmas: function(dma_id) {
      this.model.attributes.selected_dmas = _.filter(this.model.get('selected_dmas'), function(el) {
        if(parseInt(el.id) != dma_id) {
          return el;
        }
      });
    },

    _handleDmasCheckboxes: function(e) {
      var select = this.$el.find('.dmas .chosen-select')[0],
          checked_value = e.currentTarget.value,
          checked_text;

      for(var i = 0; i < select.options.length; i++) {
        if(select.options[i].value == checked_value) {
          checked_text = select.options[i].text;
          if(e.currentTarget.checked) {
            $(select.options[i]).attr('selected', 'selected'); // sync checkboxes with select
            this._addDmaToSelectedDmas({id: checked_value, title: checked_text});
          } else {
            $(select.options[i]).removeAttr('selected'); // sync checkboxes with select
            this._removeDmaFromSelectedDmas(checked_value);
          }
          break;
        }
      }

      $(select).trigger("chosen:updated");
      this._renderSelectedTargetingOptions();
    },

    /*_toggleKeyValuesTargeting: function(e) {
      var targeting = e.currentTarget.value;
      var kv = this.model.attributes.selected_key_values;

      if(e.currentTarget.checked == true) {
        kv.push(targeting);
      } else {
        var index = kv.indexOf(targeting);
        kv.splice(index, 1);
      }
      
      this._renderSelectedTargetingOptions();
    },*/

    _updateZipCodes: function(e) {
      var zip_codes = e.currentTarget.value.split(/\r\n|\r|\n|,/mi);
      this.model.attributes.selected_zip_codes = _.collect(zip_codes, function(el) { return el.trim() } );
      this._renderSelectedTargetingOptions();
    },

    _closeTargetingDialog: function() {
      this.options.parent_view._toggleTargetingDialog();    
    },

    _toggleCustomRegularKeyValues: function() {
      
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

    _removeDmaFromSelected: function(e) {
      var dma_id = $(e.currentTarget).data('dma-id'),
          select = this.$el.find('.dmas .chosen-select')[0];

      for(var i = 0; i < select.options.length; i++) {
        if(select.options[i].value == dma_id) {  
          $(select.options[i]).removeAttr('selected'); // sync checkboxes with select
          this._removeDmaFromSelectedDmas(parseInt(dma_id));
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

    events: {
      'click .save-targeting-btn': '_closeTargetingDialog',
      'click .dmas .dmas-checkboxes-container input:checkbox': '_handleDmasCheckboxes',
      'click .key-values .key-values-checkboxes-container input:checkbox': '_handleKVCheckboxes',
      'click .nav-tabs > .key-values': '_showKeyValuesTab',
      'click .nav-tabs > .dmas': '_showDMAsTab',
      'click .nav-tabs > .zip-codes': '_showZipCodesTab',
      'keyup .zip-codes textarea': '_updateZipCodes',
      'click .custom-regular-keyvalue-btn': '_toggleCustomRegularKeyValues',
      'mouseenter .tgt-item-kv-container, .tgt-item-dma-container, .tgt-item-zip-container': '_showRemoveTgtBtn',
      'mouseleave .tgt-item-kv-container, .tgt-item-dma-container, .tgt-item-zip-container': '_hideRemoveTgtBtn',
      'click .tgt-item-kv-container .remove-btn': '_removeKVFromSelected',
      'click .tgt-item-dma-container .remove-btn': '_removeDmaFromSelected',
      'click .tgt-item-zip-container .remove-btn': '_removeZipFromSelected'
    }
  });
})(ReachUI.namespace("Targeting"));
