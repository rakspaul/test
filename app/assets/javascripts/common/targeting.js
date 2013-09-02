(function(Targeting) {
  'use strict';

  Targeting.Targeting = Backbone.Model.extend({
    defaults: {
      selected_key_values: {"Age": [], "Etnicity": [], "Interests": [], "Income": [], "Gender": []},
      selected_dmas: [],
      dmas_list: [],
      selected_zip_codes: []
    },

    toJSON: function() {
      return { targeting: _.clone(this.attributes) };
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
      return data;
    },

    onRender: function() {
      var self = this;
      this.$el.find('.chosen-select').chosen({no_results_text: "Select DMAs here", width: "400px"}).change(function(e, el) {
        var selected = []
        for(var i = 0; i < this.options.length; i++) {
          if(this.options[i].selected) {
            selected.push({id: this.options[i].value, title: this.options[i].text});
          }
        }
        self.model.attributes.selected_dmas = selected;
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
      var dict = { selected_key_values: this.model.attributes.selected_key_values, selected_dmas: this.model.attributes.selected_dmas };
      var html = JST['templates/targeting/selected_targeting'](dict);     
      $('.selected-targeting').html(html);
    },

    _toggleTargeting: function(e) {
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

    events: {
      'click .key-values input:checkbox': '_toggleTargeting',
      'click .nav-tabs > .key-values': '_showKeyValuesTab',
      'click .nav-tabs > .dmas': '_showDMAsTab',
      'click .nav-tabs > .zip-codes': '_showZipCodesTab',
    }
  });
})(ReachUI.namespace("Targeting"));
