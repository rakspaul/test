(function(Platform) {
  'use strict';

  // --------------------/ Region /------------------------------------

  Platform.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

  // --------------------/ Layout /------------------------------------

  Platform.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/platforms/platforms_layout'],

    regions: {
      content: '#content'
    },
  });

// --------------------/ Model /---------------------------------------

  Platform.PlatformModel = Backbone.Model.extend({
    url: function() {
      if(this.isNew()) {
        return '/admin/platforms';
      } else {
        return '/admin/platforms/' + this.id + '.json';
      }
    },

    toJSON: function() {
      return { platform: _.clone(this.attributes) };
    },
  });

  Platform.MediaType = Backbone.Model.extend();


// --------------------/ Collection /----------------------------------

  Platform.PlatformList = Backbone.Collection.extend({
    model: Platform.PlatformModel,

    url: '/admin/platforms/search.json',
  });

  Platform.MediaTypeList = Backbone.Collection.extend({
    model: Platform.PlatformModel,

    url: '/media_types/media_types.json'
  });


// --------------------/ View /----------------------------------------

  Platform.PlatformDetailsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/platforms/platform_details'],

    initialize: function() {
      var self = this;
      this.modelId = this.model.id;

      this.platformsList = new Platform.PlatformList();
      this.mediaTypeList = new Platform.MediaTypeList();

      this.platformsList.fetch().then(function() {
        self.render();
      });

      this.mediaTypeList.fetch().then(function() {
        self.render();
      });

      _.bindAll(this, '_onSaveSuccess', '_onSaveFailure');
    },

    serializeData: function() {
      return{
        platform: this.model,
        platformsList: this.platformsList,
        mediaTypes: this.mediaTypeList
      }
    },

    ui:{
      platform_name: '#platform_name',
      platform_name_input: '#platform_name_input',
      media_type: '#media_type',
      dfp_key: '#dfp_key',
      dfp_site_name: '#dfp_site_name',
      naming_convention: '#naming_convention',
      ad_type: '#ad_type',
      priority: '#priority',
      enabled_checkbox: '#enabled_checkbox',
      new_platform_btn: '#new_platform_btn',
      tag_template: '#tag_template',
      tag_template_text: '#tag_template_text',
      tag_tooltip: '#tag_tooltip',

      name_error: '#platform_name_error',
      media_type_id_error: '#media_type_error',
      dfp_key_error: '#dfp_key_error',
      dfp_site_name_error: '#dfp_site_name_error',
      naming_convention_error: '#naming_convention_error',
      ad_type_error: '#ad_type_error',
      priority_error: '#priority_error',
      tag_template_error: '#tag_template_error',

      save_platform: '#save_platform',
      close_platform: '#close_platform'
    },

    events: {
      'click #new_platform_btn' : '_show_platform_input',
      'click #save_platform' : '_onSave',
      'click #enabled_checkbox' : '_changeLabel',
      'input #tag_template' : '_showTemplate'
    },

    onRender: function(){
      this._showTemplate();
    },

    onDomRefresh: function(){
      $('#dfp_site_name').typeahead({
        name: 'site-names',
        remote: {
          url: '/sites/search.json?search=%QUERY'
        },
        valueKey: 'name',
        limit: 100
      });

      this.ui.tag_tooltip.popover({
        html : true,
        trigger: 'hover',
        placement: 'top',
        title: 'When a tag is generated, the following tokens are replaced:',
        content: function() {
          return $('#tag_tooltip_content').html();
        },
      });
    },

    _onSave: function(e) {
      e.preventDefault();
      var self = this;

      var para = {
        name: this.ui.platform_name.val(),
        media_type_id: parseInt(this.ui.media_type.val()),
        dfp_key: this.ui.dfp_key.val(),
        dfp_site_name: this.ui.dfp_site_name.val(),
        naming_convention: this.ui.naming_convention.val(),
        ad_type: this.ui.ad_type.val(),
        priority: parseInt(this.ui.priority.val()),
        enabled: this.ui.enabled_checkbox.is(':checked'),
        tag_template: this.ui.tag_template.val()
      }

      if(this.ui.platform_name_input.is(':visible')){
         para.name = this.ui.platform_name_input.val();
      }

      _.keys(this.ui)
        .filter(function(val) {
          return /_error$/.test(val);
        })
        .forEach(function(val) {
          self.ui[val].text("");
        });

      this.ui.save_platform.text('Saving...').attr('disabled','disabled');
      this.ui.close_platform.attr('disabled','disabled');

      this.model.save(para, {
        success: this._onSaveSuccess,
        error: this._onSaveFailure
      });

    },

    _onSaveSuccess: function(model, response, options) {
      this.ui.save_platform.text('Save').removeAttr('disabled');
      this.ui.close_platform.removeAttr('disabled');
      alert("Platform saved successfully.");
      window.location.href = '/admin/platforms';
    },

    _onSaveFailure: function(model, xhr, options) {
      if(xhr.responseJSON && xhr.responseJSON.errors) {
        var formErrors = [];

        _.each(xhr.responseJSON.errors, function(value, key) {
          var errorLabel = this.ui[key + "_error"];
          if(errorLabel) {
            errorLabel.text(value[0]);
          } else {
            formErrors.push(value);
          }
        }, this);
      }
      this.ui.save_platform.text('Save').removeAttr('disabled');
      this.ui.close_platform.removeAttr('disabled');
    },

    _show_platform_input: function(e){
      e.preventDefault();
      var isNewPlatform = this.ui.platform_name.is(':visible');
      var txt = isNewPlatform ? 'Select Platform' : 'New Platform';
      var header = isNewPlatform ? 'Add Platform Media Type' : 'Edit Platform Media Type';

      this.model.id = isNewPlatform ? null : this.modelId;

      this.ui.platform_name.toggle();
      this.ui.platform_name_input.toggle();

      this.ui.new_platform_btn.html(txt);
      $('.platforms-header legend').html(header);
    },

    _changeLabel: function(e){
      if ($(e.currentTarget).is(':checked')) {
        $('.enabled-text').html('Yes');
      } else {
        $('.enabled-text').html('No');
      }
    },

    _showTemplate: function(e){
      var text = this.ui.tag_template.val();
      var textString =  this.ui.tag_template_text.text(text).html();

      textString = textString.replace('!ZONE_NAME!', '<span>!ZONE_NAME!</span>').replace('!KEY_VALUE!', '<span>!KEY_VALUE!</span>').replace('!SIZE!','<span>!SIZE!</span>').replace('!NETWORK_ID!','<span>!NETWORK_ID!</span>');
      this.ui.tag_template_text.html(textString);
    }
  });

// --------------------/ Controller /----------------------------------

  Platform.PlatformController = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
    },

    _initializeLayout: function() {
      this.detailRegion = new Platform.DetailRegion();

      this.layout = new Platform.Layout();
      this.detailRegion.show(this.layout);
    },

    initializeForCreateNewPlatform: function() {
      var model = new Platform.PlatformModel();
      this.platformDetailsView = new Platform.PlatformDetailsView({model: model})
      this.layout.content.show(this.platformDetailsView);
    },

    initializeForEditPlatform: function(id) {
      var self = this;

      this.model = new Platform.PlatformModel({id: id});
      this.model.fetch().then(function(){
        self.platformDetailsView = new Platform.PlatformDetailsView({model: self.model})
        self.layout.content.show(self.platformDetailsView);
      });
    },

  });


})(ReachUI.namespace("Platforms"));