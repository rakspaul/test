(function(AudienceGroup) {
  'use strict';

  AudienceGroup.AudienceGroupModel = Backbone.Model.extend({
    url: function() {
      if(this.isNew()) {
        return '/admin/audience_groups';
      } else {
        return '/admin/audience_groups/' + this.id + '.json';
      }
    },

    toJSON: function() {
      return { audienceGroup: _.clone(this.attributes) };
    }
  });

  AudienceGroup.AudienceGroupsList = Backbone.Model.extend({
    model: AudienceGroup.AudienceGroupModel,

    url: function() {
      return '/admin/audience_groups.json';
    },

    toJSON: function() {
      return { audienceGroup: _.clone(this.attributes) };
    }
  });

  AudienceGroup.Segmant = Backbone.Model.extend({});

  AudienceGroup.Context = Backbone.Model.extend({});

  AudienceGroup.SegmantList = Backbone.Collection.extend({
    url: '/segments/search.json',
    model: AudienceGroup.Segmant,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

  AudienceGroup.ContextList = Backbone.Collection.extend({
    url: '/contexts/search.json',
    model: AudienceGroup.Context,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

  AudienceGroup.AudienceGroupDetailsLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/audience_groups/audience_groups_details_layout'],

    regions: {
      name_view: '#name_view',
      search_segments_view: '#search_segments_view',
      search_contexts_view: '#search_contexts_view',
      selected_segments_view: '#selected_segments_view',
    },

    triggers: {
      'click #save_audience_groups': 'save',
    },

    ui: {
      save_audience_groups: '#save_audience_groups',
      close_audience_groups: '#close_audience_groups'
    }
  });

  AudienceGroup.NameView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/audience_groups/name_view'],

    ui: {
      name: '#group_name_input',
      name_error: '#name_error'
    },

  });

  AudienceGroup.SearchSegmentItem = Backbone.Marionette.ItemView.extend({
    tagName:'li',
    className: 'draggble',
    template: _.template('<%= full_name %>'),

    attributes: function() {
      return {
        "data-name" : 'btg='+this.model.get("name"),
      }
    },

    onRender: function(){
      this.$el.draggable({
        revert: 'invalid',
        helper: this._dragHelper,
        appendTo: 'body',
        containment: '.content'
      });
    },

    _dragHelper: function(){
      var selected = $('#search_segments_results li.selected');
      if (selected.length <= 1) {
        $('#search_segments_results li').removeClass('selected');
        selected = $(this).addClass('selected');
      }
      var container = $('<ul class="select-keyvals" />');
      container.append(selected.clone());
      return container;
    }

  });

  AudienceGroup.SearchSegmentsView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/audience_groups/search_segments_view'],
    itemViewContainer: '#search_segments_results',
    itemView: AudienceGroup.SearchSegmentItem,

    events:{
      'click #add_keyvals_button_segment' : '_onAddKeyValsClick',
      'click #search_segments_results li' : '_onListItemClick',
      'click #search_keyvals_button_segment': 'onSearch',
      'keypress #search_keyvals_input_segment': 'onSearch'
    },

    ui:{
      loading_div: '#loading_div',
      searchResultsList: '#search_segments_results',
      search_input: '#search_keyvals_input_segment'
    },

    initialize: function() {
      this.collection.on("fetch", this.onFetch, this);
      this.collection.on("reset", this.onReset, this);
      this.prev = -1;
      this.curr = null;
    },

    onFetch: function() {
      this.ui.loading_div.show();
    },

    onReset: function() {
      this.ui.loading_div.hide();
    },

    onSearch: function(event) {
      if (event.type === 'keypress' && event.keyCode != 13) {
        return;
      }
      this.trigger('search', this.ui.search_input.val().trim());
    },

    _onAddKeyValsClick: function(){
      var selectedKeyVals = $('#search_segments_results li.selected'),
        selectedKeyValsNames = [];

      $(selectedKeyVals).each(function(){
        selectedKeyValsNames.push($(this).attr('data-name'));
      })
      this.trigger('addKeyVals', selectedKeyValsNames);
    },

    _onListItemClick: function(event){
      this.curr = $(event.target).index();

      if(event.ctrlKey || event.metaKey){
        this.prev = this.curr;
        $(event.target).toggleClass('selected');
      } else if(event.shiftKey && this.prev > -1){
        this.ui.searchResultsList.find('li').slice(Math.min(this.prev, this.curr), 1 + Math.max(this.prev, this.curr)).addClass('selected');
      } else {
        this.prev = this.curr;
        this.ui.searchResultsList.find('li').removeClass('selected');
        $(event.target).toggleClass('selected');
      }
    },

  });

  AudienceGroup.SearchContextItem = Backbone.Marionette.ItemView.extend({
    tagName:'li',
    className: 'draggble',
    template: _.template('<%= full_name %>'),

    attributes: function() {
      return {
        "data-name" : 'contx='+this.model.get("name"),
      }
    },

    onRender: function(){
      this.$el.draggable({
        revert: 'invalid',
        helper: this._dragHelper,
        appendTo: 'body',
        containment: '.content',
      });
    },

    _dragHelper: function(){
      var selected = $('#search_contexts_results li.selected');
      if (selected.length <= 1) {
        $('#search_contexts_results li').removeClass('selected');
        selected = $(this).addClass('selected');
      }
      var container = $('<ul class="select-keyvals" />');
      container.append(selected.clone());
      return container;
    }

  });

  AudienceGroup.SearchContextsView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/audience_groups/search_contexts_view'],
    itemViewContainer: '#search_contexts_results',
    itemView: AudienceGroup.SearchContextItem,

    events:{
      'click #add_keyvals_button_context' : '_onAddKeyValsClick',
      'click #search_contexts_results li' : '_onListItemClick',
      'click #search_keyvals_button_context': 'onSearch',
      'keypress #search_keyvals_input_context': 'onSearch'
    },

    ui:{
      loading_div: '#loading_div',
      searchResultsList: '#search_contexts_results',
      search_input: '#search_keyvals_input_context'
    },

    initialize: function() {
      this.collection.on("fetch", this.onFetch, this);
      this.collection.on("reset", this.onReset, this);
      this.prev = -1;
      this.curr = null;
    },

    onFetch: function() {
      this.ui.loading_div.show();
    },

    onReset: function() {
      this.ui.loading_div.hide();
    },

    onSearch: function(event) {
      if (event.type === 'keypress' && event.keyCode != 13) {
        return;
      }
      this.trigger('search', this.ui.search_input.val().trim());
    },

    _onAddKeyValsClick: function(){
      var selectedKeyVals = $('#search_contexts_results li.selected'),
        selectedKeyValsNames = [];

      $(selectedKeyVals).each(function(){
        selectedKeyValsNames.push($(this).attr('data-name'));
      })
      this.trigger('addKeyVals', selectedKeyValsNames);
    },

    _onListItemClick: function(event){
      this.curr = $(event.target).index();

      if(event.ctrlKey || event.metaKey){
        this.prev = this.curr;
        $(event.target).toggleClass('selected');
      } else if(event.shiftKey && this.prev > -1){
        this.ui.searchResultsList.find('li').slice(Math.min(this.prev, this.curr), 1 + Math.max(this.prev, this.curr)).addClass('selected');
      } else {
        this.prev = this.curr;
        this.ui.searchResultsList.find('li').removeClass('selected');
        $(event.target).toggleClass('selected');
      }
    },

  });

  AudienceGroup.SelectedSegmentsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/audience_groups/selected_segments_view'],

    initialize: function() {
      _.bindAll(this);
    },

    ui: {
      key_values: '#key_values',
      key_values_error: '#key_values_error'
    },

    onRender: function(){
      this.$el.droppable({
        accept: ".draggble", tolerance: "pointer", drop: this._onDrop
      });
    },

    addKeyVals: function(keyvals){
      $('#search_segments_results li.selected').removeClass('selected');
      $('#search_contexts_results li.selected').removeClass('selected');
      if(this.ui.key_values.val() === ''){
        this.ui.key_values.val(keyvals.join(','));
      } else {
        var str = this.ui.key_values.val();
        this.ui.key_values.val(str + ',' + keyvals.join(','));
      }
    },

    _onDrop: function(event, ui){
      var newItems = $(ui.helper).find('li').clone(false),
        dropItems = [];
      $(newItems).each(function(){
        dropItems.push($(this).attr('data-name'));
      });

      this.addKeyVals(dropItems);
    },

  });

  AudienceGroup.AudienceGroupController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      this._initializeLayout();
       _.bindAll(this, '_onSaveSuccess', '_onSaveFailure');
    },

    _initializeLayout: function() {
      this.layout = new AudienceGroup.AudienceGroupDetailsLayout();
      this.mainRegion.show(this.layout);
      this.layout.on('save', this._saveAudienceGroups, this);
    },

    initializeForCreateNewAudienceGroup: function() {
      this.model = new AudienceGroup.AudienceGroupModel();
      this._initializeViews();
    },

    initializeForEditAudienceGroup: function(model){
      this.model = model;
      this._initializeViews();
    },

    _initializeViews: function() {
      this.nameView = new AudienceGroup.NameView({model: this.model});
      this.layout.name_view.show(this.nameView);

      this.searchSegmentList = new AudienceGroup.SegmantList();
      this.searchContextList = new AudienceGroup.ContextList();

      this.searchSegmentsView = new AudienceGroup.SearchSegmentsView({collection: this.searchSegmentList})
      this.layout.search_segments_view.show(this.searchSegmentsView);
      this.searchSegmentsView.on('addKeyVals', this._onAddKeyVals, this);
      this.searchSegmentsView.on('search', this._onSearch, this);

      this.searchContextsView = new AudienceGroup.SearchContextsView({collection: this.searchContextList})
      this.layout.search_contexts_view.show(this.searchContextsView);
      this.searchContextsView.on('addKeyVals', this._onAddKeyVals, this);
      this.searchContextsView.on('search', this._onSearch, this);

      this.searchSegmentList.fetch({reset: true});
      this.searchContextList.fetch({reset: true});

      this.selectedSegmentsView = new AudienceGroup.SelectedSegmentsView({model: this.model});
      this.layout.selected_segments_view.show(this.selectedSegmentsView);
    },

    _onSearch: function(search_string) {
      this.searchSegmentList.fetch({data:{search: search_string}, reset: true})
      this.searchContextList.fetch({data:{search: search_string}, reset: true})
    },

    _onAddKeyVals: function(selectedKeyVals){
      if(selectedKeyVals.length){
        $('#searchResults li').removeClass('selected');
        this.selectedSegmentsView.addKeyVals(selectedKeyVals);
      }
    },

    _saveAudienceGroups: function(){
      var prop = {
        name: this.nameView.ui.name.val().trim(),
        key_values: this.selectedSegmentsView.ui.key_values.val().replace(/\s/g, '')
      }

      var uiControls = {};
        uiControls = $.extend(this.nameView.ui, this.selectedSegmentsView.ui);

      _.keys(uiControls)
        .filter(function(val) {
          return /_error$/.test(val);
        })
        .forEach(function(val) {
          uiControls[val].text("");
        });

      this.layout.ui.save_audience_groups.text('Saving...').attr('disabled','disabled');
      this.layout.ui.close_audience_groups.attr('disabled','disabled');
      this.model.save(prop, {success: this._onSaveSuccess, error: this._onSaveFailure})
    },

    _onSaveSuccess: function(model, response, options) {
      this.layout.ui.save_audience_groups.text('Save').removeAttr('disabled');
      this.layout.ui.close_audience_groups.removeAttr('disabled');
      alert("Group saved successfully.");
      window.location.href = '/admin/audience_groups';
    },

    _onSaveFailure: function(model, xhr, options) {
      this.layout.ui.save_audience_groups.text('Save').removeAttr('disabled');
      this.layout.ui.close_audience_groups.removeAttr('disabled');
      if(xhr.responseJSON && xhr.responseJSON.errors) {
        var formErrors = [],
        uiControls = {};
        uiControls = $.extend(this.nameView.ui, this.selectedSegmentsView.ui);

        _.each(xhr.responseJSON.errors, function(value, key) {
          var errorLabel = uiControls[key + "_error"];
          if(errorLabel) {
            errorLabel.text(value[0]);
          } else {
            formErrors.push(value);
          }
        }, this);
        alert("Error saving Audience Group. \n" + formErrors.join("\n"));
      }
    }

  });

})(ReachUI.namespace("AudienceGroups"));
