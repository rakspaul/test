(function(AudienceGroup) {
  'use strict';

  AudienceGroup.AudienceGroupModel = Backbone.Model.extend({
    defaults: {
      name: "test1"
    },
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

  AudienceGroup.AudienceKeyValModel = Backbone.Model.extend();

  AudienceGroup.AudienceKeyValList = Backbone.Collection.extend({
    url: '/',
    model: AudienceGroup.AudienceKeyValModel,
  });

  AudienceGroup.SelectedAudienceKeyValList = Backbone.Collection.extend({
    url: '/',
    model: AudienceGroup.AudienceKeyValModel,
  });

  AudienceGroup.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

  AudienceGroup.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/audience_groups/audience_groups_layout'],

    regions: {
      content: '#audience_groups'
    },

    triggers: {
      'click #save_audience_groups': 'save:audience_groups'
    }
  });

  AudienceGroup.AudienceGroupController = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
    },

    _initializeLayout: function() {
      this.detailRegion = new AudienceGroup.DetailRegion();
      this.layout = new AudienceGroup.Layout();
      this.detailRegion.show(this.layout);
      this.layout.on('save:audience_groups', this._saveAudienceGroups, this);
    },

    initializeForCreateNewAudienceGroup: function() {
      var model = new AudienceGroup.AudienceGroupModel();
      this.audienceGroupsView = new AudienceGroup.AudienceGroupsView({model: model});
      this.layout.content.show(this.audienceGroupsView);
    },

    initializeForEditReachClient: function(id){
      var model = new AudienceGroup.AudienceGroupModel({
        name: 'edit1'
      });
      // var model = new AudienceGroup.AudienceGroupModel({id: id});
      this.audienceGroupsView = new AudienceGroup.AudienceGroupsView({model: model});
      this.layout.content.show(this.audienceGroupsView);
    },

    _saveAudienceGroups: function(){
      var prop = {
        name: this.audienceGroupsView.ui.group_name_input.val(),
        keyval: this.audienceGroupsView.ui.selected_keyvals_textarea.val()
      }
      console.log(prop);
    }
  });

  AudienceGroup.AudienceGroupsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/audience_groups/audience_groups'],

    initialize: function() {
      //Collections for key-value list and selected key-val list
      var keyValList = [{keyval: "btg=cm.adf"}, {keyval: "btg=cm.dfg"}, {keyval: "btg=cm.ty3"}, {keyval: "btg=cm.ty4"}];
      var selectedKeyVal = [{keyval: "btg=cm.adf"}, {keyval: "btg=cm.dfg"}];

      this.audienceKeyValList = new AudienceGroup.AudienceKeyValList(keyValList);
      this.selectedAudienceKeyValList = new AudienceGroup.SelectedAudienceKeyValList(selectedKeyVal);

      _.bindAll(this);
      this.bindUIElements();
    },

    ui: {
      group_name_input: '#group_name_input',
      select_keyvals_list: '#select_keyvals_list',
      search_keyvals_input: '#search_keyvals_input',
      selected_keyvals_textarea: '#selected_keyvals_textarea',
    },

    events: {

    },

    serializeData: function() {
      return{
        audienceGroup: this.model,
        audienceKeyVal: this.audienceKeyValList,
        selectedAudienceKeyVal: this.selectedAudienceKeyValList
      }
    },

    onRender: function() {
      var self = this;

      this.ui.select_keyvals_list.find('li').draggable({
        revert: 'invalid',
        helper: 'clone',
      });

      this.ui.selected_keyvals_textarea.droppable({ accept: ".droppable", drop: this.onDrop });
    },

    onDrop: function(event, ui){
      ui.draggable.remove();
      var dropItem = $(ui.draggable).text(),
        defaultVals = $.trim(this.ui.selected_keyvals_textarea.val());

      if(defaultVals === ''){
        this.ui.selected_keyvals_textarea.val(dropItem);
      }
      else{
        this.ui.selected_keyvals_textarea.val(defaultVals+','+dropItem);
      }
    },

  });


})(ReachUI.namespace("AudienceGroups"));