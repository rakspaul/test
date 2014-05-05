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

  Platform.AdType = Backbone.Model.extend();

  Platform.AdPriority = Backbone.Model.extend();

// --------------------/ Collection /----------------------------------

  Platform.PlatformList = Backbone.Collection.extend({
    model: Platform.PlatformModel,

    url: '/admin/platforms/search.json',
  });

  Platform.MediaTypeList = Backbone.Collection.extend({
    model: Platform.PlatformModel,

    url: '/media_types/media_types.json'
  });

  Platform.AdTypeList = Backbone.Collection.extend({
    model: Platform.AdType,

    url: '/ads/ad_types.json'
  });

  Platform.AdPriorityList = Backbone.Collection.extend({
    model: Platform.AdPriority,

    url: '/ads/ad_priorities.json'
  });

// --------------------/ View /----------------------------------------

  Platform.PlatformDetailsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/platforms/platform_details'],

    initialize: function() {
      var self = this;

      this.platformsList = new Platform.PlatformList();
      this.mediaTypeList = new Platform.MediaTypeList();
      this.adTypeList = new Platform.AdTypeList();
      this.adPriorityList = new Platform.AdPriorityList();

      this.platformsList.fetch().then(function() {
        self.render();
      });

      this.mediaTypeList.fetch().then(function() {
        self.render();
      });

      this.adTypeList.fetch().then(function() {
        self.render();
      });

      this.adPriorityList.fetch().then(function() {
        self.render();
      });

      _.bindAll(this, '_onSaveSuccess', '_onSaveFailure');
    },

    serializeData: function() {
      return{
        platform: this.model,
        platformsList: this.platformsList,
        mediaTypes: this.mediaTypeList,
        adTypes: this.adTypeList,
        adPriorities: this.adPriorityList
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

      name_error: '#platform_name_error',
      media_type_id_error: '#media_type_error',
      dfp_key_error: '#dfp_key_error',
      site_id_error: '#dfp_site_name_error',
      naming_convention_error: '#naming_convention_error',
      ad_type_error: '#ad_type_error',
      priority_error: '#priority_error',

      save_platform: '#save_platform',
      close_platform: '#close_platform'
    },

    events: {
      'click #new_platform_btn' : '_show_platform_input',
      'click #save_platform' : '_onSave'
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

      var self = this;

      $('#dfp_site_name').on('typeahead:selected', function(ev, el){
        self.site_id = el.id;
      });

    },

    _onSave: function(e) {
      e.preventDefault();

      var para = {
        name: this.ui.platform_name.val(),
        media_type_id: parseInt(this.ui.media_type.val()),
        dfp_key: this.ui.dfp_key.val(),
        site_id: this.site_id,
        naming_convention: this.ui.naming_convention.val(),
        ad_type: this.ui.ad_type.val(),
        priority: parseInt(this.ui.priority.val()),
        enabled: this.ui.enabled_checkbox.is(':checked')
      }

      if(this.ui.platform_name_input.is(':visible'))
        para.name = this.ui.platform_name_input.val()

      var self = this;

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
      this.ui.platform_name.toggle();
      this.ui.platform_name_input.toggle();
      var txt = this.ui.platform_name.is(':visible') ? 'New Platform' : 'Select Platform';
      this.ui.new_platform_btn.html(txt)
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