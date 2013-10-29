(function(DefaultBlockList) {
  'use strict';

// --------------------/ Region /------------------------------------

  DefaultBlockList.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

// --------------------/ Layout /------------------------------------

  DefaultBlockList.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/default_block_list/default_block_list_layout'],

    regions: {
      siteListView : '#siteListView',
      blockedSiteListView: '#blockedSiteListView'
    },

    triggers:{
      'click #btnSave' : 'Save:SiteBlocks',
      'click #btnExport' : 'Export:SiteBlocks',
    },

    ui: {
      btnSave: '#btnSave',
    },

  });

// --------------------/ Models /-----------------------------------

  DefaultBlockList.Site = Backbone.Model.extend({});

  DefaultBlockList.SiteList = Backbone.Collection.extend({
    url: '/sites/search.json',
    model: DefaultBlockList.Site,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

  DefaultBlockList.BlockedSite = Backbone.Model.extend({
    defaults:{
      status:'',
    },
  });

  DefaultBlockList.BlockedSiteList = Backbone.Collection.extend({
    url: '/admin/default_block_list.json',
    model: DefaultBlockList.BlockedSite,

    comparator: function(model) {
      return model.get('site_name');
    },

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

// --------------------/ Views /------------------------------------

  DefaultBlockList.SiteListItemView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'li',
    className: 'draggble',
    attributes: function() {
      return {value: this.model.id};
    },

    onRender: function(){
      this.$el.draggable({
        revert: 'invalid',
        helper: this._dragHelper,
        appendTo: 'body',
        containment: 'body'
      });
    },

    _dragHelper: function(){
      var selected = $('#sitesList li.selected');
      if (selected.length <= 1) {
        $('#sitesList li').removeClass('selected');
        selected = $(this).addClass('selected');
      }
      var container = $('<ul class="select-keyvals" />');
      container.append(selected.clone());
      return container;
    }

  }),

  DefaultBlockList.SiteListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/default_block_list/site_list_view'],
    itemView: DefaultBlockList.SiteListItemView,

    events: {
      'click #search_button': 'onSearch',
      'keypress #search_input': 'onSearch',
      'click #addSiteBlock' : 'addSiteBlock',
      'click #sitesList li' : '_onSiteItemClick'
    },

    ui:{
      search_input: '#search_input',
      site_list: '#sitesList',
      loading_div: '#loading_div',
    },

    initialize: function() {
      this.collection.fetch({reset: true});
      this.collection.on("fetch", this.onFetch, this);
      this.collection.on("reset", this.onReset, this);
    },

    onFetch: function() {
      this.ui.loading_div.show();
    },

    onReset: function() {
      this.ui.loading_div.hide();
    },

    appendHtml: function(collectionView, itemView){
      collectionView.$("#sitesList").append(itemView.el);
    },

    onSearch: function(event) {
      if (event.type === 'keypress' && event.keyCode != 13) {
        return;
      }
      var searchString = this.ui.search_input.val().trim();
      this.collection.fetch({data:{search: searchString}, reset: true});
    },

    addSiteBlock: function() {
      var selectedSites = this.getSelectedSites();
      if(selectedSites && selectedSites.length>0) {
        this.trigger('Add:Sites', selectedSites);
      }
    },

    getSelectedSites: function() {
      var selectedSites = this.ui.site_list.find('.selected');
      if(selectedSites && selectedSites.length>0) {
        var sites = []
        for (var i = 0; i < selectedSites.length; i++) {
          var site = $(selectedSites[i]).attr('value');
          sites.push(site)
        }
        return sites;
      } else {
        return [];
      }
    },

    _onSiteItemClick: function(event){
      this.curr = $(event.target).index();

      if(event.ctrlKey || event.metaKey){
        this.prev = this.curr;
        $(event.target).toggleClass('selected');
      } else if(event.shiftKey && this.prev > -1){
        this.ui.site_list.find('li').slice(Math.min(this.prev, this.curr), 1 + Math.max(this.prev, this.curr)).addClass('selected');
      } else {
        this.prev = this.curr;
        this.ui.site_list.find('li').removeClass('selected');
        $(event.target).toggleClass('selected');
      }
    },

  });

  DefaultBlockList.BlockedSiteListItemView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= site_name%>'),
    tagName: 'option',

    attributes: function() {
      return {value: this.model.get('site_id')};
    },

    initialize: function() {
      this.model.on('change', this.render, this);
    },

    onRender:function() {
      if (this.model.get('status') === 'deleted') {
        this.$el.addClass('strike');
        this.$el.attr('disabled','disabled');
      }
    }

  }),

  DefaultBlockList.BlockedSiteListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/default_block_list/block_list_view'],
    itemView: DefaultBlockList.BlockedSiteListItemView,
    itemViewContainer: '#blockedSiteList',

    initialize: function() {
      _.bindAll(this);
      this.collection.on('sort', this.render, this);
    },

    events:{
      'click #btnRemove' : 'onRemove',
    },

    ui:{
      blockedSiteList: '#blockedSiteList',
    },

    onRemove: function() {
      var selectedBlockedSites = this.ui.blockedSiteList.val();

      if (selectedBlockedSites) {
        for (var i = 0; i < selectedBlockedSites.length; i++) {
          var item = this.collection.findWhere({site_id: parseInt(selectedBlockedSites[i])});
          if (item) {
            item.set({status: 'deleted'});
          }
        };
      }
    },

    onRender: function(){
      this.$el.droppable({
        accept: ".draggble", tolerance: "pointer", drop: this._onDrop
      });
    },

    _onDrop: function(event, ui){
      var newItems = $(ui.helper).find('li').clone(false),
        dropItems = [];
      $(newItems).each(function(){
        dropItems.push($(this).attr('value'));
      });

      $('#sitesList li.selected').removeClass('selected');
      this._addDropItems(dropItems);
    },

    _addDropItems: function(dropItems) {
      if(dropItems) {
        this.trigger('Add:Sites', dropItems);
      }
    },

  });

// --------------------/ Controller /-------------------------------

  DefaultBlockList.Controller = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
      this._initializeSiteListView();
      this._initializeBlockedSiteListView();
      _.bindAll(this, '_onSuccess', '_onError');
    },

    _initializeLayout: function() {
      this.detailRegion = new DefaultBlockList.DetailRegion();

      this.layout = new DefaultBlockList.Layout();
      this.layout.on('Save:SiteBlocks', this._onSaveSiteBlocks, this);
      this.layout.on('Export:SiteBlocks', this._onExportSiteBlocks, this);
      this.detailRegion.show(this.layout);
    },

    _initializeSiteListView: function() {
      this.siteList = new DefaultBlockList.SiteList();
      this.siteListView = new DefaultBlockList.SiteListView({collection: this.siteList});
      this.siteListView.on('Add:Sites', this._blockSites, this);
      this.layout.siteListView.show(this.siteListView);
    },

    _initializeBlockedSiteListView: function() {
      this.blockedSiteList = new DefaultBlockList.BlockedSiteList();
      this.blockedSiteList.fetch({reset:true});
      this.blockedSiteListView = new DefaultBlockList.BlockedSiteListView({collection: this.blockedSiteList});
      this.blockedSiteListView.on('Add:Sites', this._blockSites, this);
      this.layout.blockedSiteListView.show(this.blockedSiteListView);
    },

    _blockSites: function(sites){
      for (var i = 0; i < sites.length; i++) {
        var site = this.siteList.get({ id: sites[i] });
        var found = this.blockedSiteList.findWhere({site_id: site.id});
        if(!found) {
          this.blockedSiteList.add(this._createBlockedSiteVO(site));
        }
      }
    },

    _createBlockedSiteVO: function(site) {
      return new DefaultBlockList.BlockedSite({site_id: site.id, site_name: site.get('name')})
    },

    _onSaveSiteBlocks: function() {
      var newSiteBlocks = [],
      siteBlocksToDelete = [],
      para = {};

      this.blockedSiteList.each(function(site) {
        if (site.isNew() && site.get('status') !== 'deleted') {
          newSiteBlocks.push(site);
        } else if (!site.isNew() && site.get('status') === 'deleted') {
          siteBlocksToDelete.push(site);
        }
      });

      if (newSiteBlocks.length > 0) {
        para.newSiteBlocks = JSON.stringify(newSiteBlocks);
      }

      if (siteBlocksToDelete.length > 0) {
        para.siteBlocksToDelete = JSON.stringify(siteBlocksToDelete);
      }

      if (newSiteBlocks.length > 0 || siteBlocksToDelete.length > 0 ) {
        this.layout.ui.btnSave.text('Saving...').attr('disabled','disabled');
        $.ajax({type: "POST", url: '/admin/default_block_list', data: para, success: this._onSuccess, error: this._onError, dataType: 'json'});
      } else {
        this.blockedSiteList.fetch({reset:true});
      }

    },

    _onSuccess: function(event) {
      this.layout.ui.btnSave.text('Save').removeAttr('disabled');
      this.blockedSiteList.fetch({reset:true});
      alert('Your changes were successfully saved.');
    },

    _onError: function(event) {
      this.layout.ui.btnSave.text('Save').removeAttr('disabled');
      alert('An error occurred while saving your changes.');
    },

    _onExportSiteBlocks: function() {
      window.location = '/admin/default_block_list/export';
    }

  });

})(ReachUI.namespace("DefaultBlockList"));