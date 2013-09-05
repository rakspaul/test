(function(Targeting) {
  'use strict';

  Targeting.Targeting = Backbone.Model.extend({
    defaults: function() {
      return {
        selected_key_values: {"Age": [], "Etnicity": [], "Interests": [], "Income": [], "Gender": []},
        selected_dmas: [],
        dmas_list: [],
        selected_zip_codes: []
      }
    },

    toJSON: function() {
      return { targeting: _.clone(_.omit(this.attributes, 'dmas_list')) };
    }
  });

  Targeting.TargetingView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/targeting/targeting'],
    className: 'targeting',

    initialize: function() {
      _.bindAll(this, "render");
      this.model.bind('change', this.render); // when start/end date is changed we should rerender the view
    },

    serializeData: function(){
      var data = this.model.toJSON();
      data.dmas_list = this.model.attributes.dmas_list;
      data.selected_key_values = this.model.attributes.selected_key_values;
      data.selected_dmas = this.model.attributes.selected_dmas;
      data.selected_zip_codes = this.model.attributes.selected_zip_codes;
      return data;
    },

    onRender: function() {
      var self = this;
      this.$el.find('.chosen-select').chosen({no_results_text: "Select DMAs here", width: "400px"}).change(function(e, el) {
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
          if(selected_values.indexOf(String(this.value)) >= 0) {
            this.checked = true;
          } else {
            this.checked = false;
          }
        });

        self._renderSelectedTargetingOptions();
      });
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

    _renderSelectedTargetingOptions: function(e) {
      var dict = { selected_key_values: this.model.attributes.selected_key_values, selected_dmas: this.model.attributes.selected_dmas, selected_zip_codes: this.model.attributes.selected_zip_codes };
      var html = JST['templates/targeting/selected_targeting'](dict);     
      $('.selected-targeting').html(html);
    },

    _addDmaToSelectedDmas: function(selected) {
      this.model.attributes.selected_dmas.push(selected);
    },

    _removeDmaFromSelectedDmas: function(dma_id) {
      this.model.attributes.selected_dmas = _.filter(this.model.attributes.selected_dmas, function(el) {
        if(parseInt(el.id) != dma_id) {
          return el;
        }
      });
    },

    _handleDmasCheckboxes: function(e) {
      var select = this.$el.find('.chosen-select')[0],
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

    _toggleKeyValuesTargeting: function(e) {
      var targeting = e.currentTarget.value.split('.');
      var kv = this.model.attributes.selected_key_values;

      if(e.currentTarget.checked == true) {
        kv[targeting[0]].push(targeting[1]);
      } else {
        var index = kv[targeting[0]].indexOf(targeting[1]);
        kv[targeting[0]].splice(index, 1);
      }
      
      this._renderSelectedTargetingOptions();
    },

    _updateZipCodes: function(e) {
      this.model.attributes.selected_zip_codes = e.currentTarget.value.split(',');
      this._renderSelectedTargetingOptions();
    },

    _closeTargetingDialog: function() {
      this.options.parent_view._toggleTargetingDialog();    
    },

    events: {
      'click .save-targeting-btn': '_closeTargetingDialog',
      'click .dmas .dmas-checkboxes-container input:checkbox': '_handleDmasCheckboxes',
      'click .key-values input:checkbox': '_toggleKeyValuesTargeting',
      'click .nav-tabs > .key-values': '_showKeyValuesTab',
      'click .nav-tabs > .dmas': '_showDMAsTab',
      'click .nav-tabs > .zip-codes': '_showZipCodesTab',
      'keyup .zip-codes textarea': '_updateZipCodes'
    }
  });
})(ReachUI.namespace("Targeting"));
