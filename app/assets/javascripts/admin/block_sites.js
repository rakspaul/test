(function(BlockSites) {
  'use strict';

// --------------------/ Region /------------------------------------

  BlockSites.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

  BlockSites.ModalRegion = Backbone.Marionette.Region.extend({

    constructor: function(){
      _.bindAll(this);
      this.ensureEl();
      Marionette.Region.prototype.constructor.apply(this, arguments);
    },

    getEl: function(selector){
      var $el = $(selector);
      $el.on("hidden", this.close);
      return $el;
    },

    onShow: function(view){
      view.on("close", this.hideModal, this);
      this.$el.modal('show');
    },

    hideModal: function(){
      this.$el.modal('hide');
    }
  })

// --------------------/ Layout /------------------------------------

  BlockSites.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/block_sites/block_sites_layout'],

    regions: {
      siteListView: '#siteListView',
      blockedAdvertiserListView: '#blockedAdvertiserListView',
      blockedAdvertiserBlockListView: '#blockedAdvertiserBlockListView',
    },
  });

// --------------------/ Models /------------------------------------

  BlockSites.Site = Backbone.Model.extend({});

  BlockSites.SiteList = Backbone.Collection.extend({
    url: '/sites/search.json',
    model: BlockSites.Site,
  });

  BlockSites.Advertiser = Backbone.Model.extend({});

  BlockSites.AdvertiserList = Backbone.Collection.extend({
    url: '/advertisers/search.json',
    model: BlockSites.Advertiser,
  });

  BlockSites.AdvertiserBlock = Backbone.Model.extend({});

  BlockSites.AdvertiserBlockList = Backbone.Collection.extend({
    url: '/advertiser_blocks/search.json',
    model: BlockSites.AdvertiserBlock,
  });

// --------------------/ Views /------------------------------------

  BlockSites.SiteListItemView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'option',
  }),

  BlockSites.SiteListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/site_list_view'],
    itemView: BlockSites.SiteListItemView,

    events: {
      'click #search_button': 'onSearch',
      'keypress #search_input': 'onSearch'
    },

    ui:{
      search_input: '#search_input',
    },

    initialize: function() {
      this.collection = new BlockSites.SiteList();
      this.collection.fetch();
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
  });

  BlockSites.BlockedAdvertiserView = Backbone.Marionette.ItemView.extend({
    template: _.template('<option><%= name%></option>'),
  });

  BlockSites.BlockedAdvertiserListItemView = Backbone.Marionette.CollectionView.extend({
    tagName: 'optgroup',
    itemView: BlockSites.BlockedAdvertiserView,
  });

  BlockSites.BlockedAdvertiserListView  = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/blocked_advertiser_list_view'],
    itemView: BlockSites.BlockedAdvertiserListItemView,

    events: {
      'click #btnAdd' : '_onAddAdvertiserClick',
    },

    initialize: function() {

    },

    appendHtml: function(collectionView, itemView){

    },

    _onAddAdvertiserClick: function(event) {
      this.trigger('Show:AdvertiserListModalView');
    },

  });

  BlockSites.BlockedAdvertiserBlockView = Backbone.Marionette.ItemView.extend({
    template: _.template('<option><%= name%></option>'),
  });

  BlockSites.BlockedAdvertiserBlockListItemView = Backbone.Marionette.CollectionView.extend({
    tagName: 'optgroup',
    itemView: BlockSites.BlockedAdvertiserGroupView,
  });

  BlockSites.BlockedAdvertiserBlockListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/blocked_advertiser_block_list_view'],
    itemView: BlockSites.BlockedAdvertiserBlockListItemView,

    events: {
      'click #btnAdd' : '_onAddAdvertiserBlockClick',
    },

    initialize: function() {

    },

    appendHtml: function(collectionView, itemView){

    },

    _onAddAdvertiserBlockClick: function(event) {
      this.trigger('Show:AdvertiserBlockModalView');
    },

  });

  BlockSites.AdvertiserView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'option',
  });

  BlockSites.AdvertiserListModalView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_list_modal_view'],
    className: 'modal',
    itemView: BlockSites.AdvertiserView,

    events: {
      'click #search_button': 'onSearch',
      'keypress #search_input': 'onSearch'
    },

    ui:{
      search_input: '#search_input',
    },

    initialize: function() {
      this.collection = new BlockSites.AdvertiserList();
      this.collection.fetch();
    },

    appendHtml: function(collectionView, itemView){
      collectionView.$("#advertiserList").append(itemView.el);
    },

    onSearch: function(event) {
      if (event.type === 'keypress' && event.keyCode != 13) {
        return;
      }
      var searchString = this.ui.search_input.val().trim();
      this.collection.fetch({data:{search: searchString}, reset: true});
    },

  });

  BlockSites.AdvertiserBlockView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'option',
  });

  BlockSites.AdvertiserBlockListModalView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_block_list_modal_view'],
    className: 'modal',
    itemView: BlockSites.AdvertiserBlockView,

    events: {
      'click #search_button': 'onSearch',
      'keypress #search_input': 'onSearch'
    },

    ui:{
      search_input: '#search_input',
    },

    initialize: function() {
      this.collection = new BlockSites.AdvertiserBlockList();
      this.collection.fetch();
    },

    appendHtml: function(collectionView, itemView){
      collectionView.$("#advertiserBlockList").append(itemView.el);
    },

    onSearch: function(event) {
      if (event.type === 'keypress' && event.keyCode != 13) {
        return;
      }
      var searchString = this.ui.search_input.val().trim();
      this.collection.fetch({data:{search: searchString}, reset: true});
    },

  });

// --------------------/ Controller /------------------------------------

  BlockSites.BlockSitesController = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
      this._initializeSiteListView();
      this._initializeBlockedAdvertiserListView();
      this._initializeBlockedAdvertiserBlockListView();
    },

    _initializeLayout: function() {
      this.detailRegion = new BlockSites.DetailRegion();

      this.layout = new BlockSites.Layout();
      this.detailRegion.show(this.layout);
      this.layout.addRegions({'modal': new BlockSites.ModalRegion({el:'#modal'})});
    },

    _initializeSiteListView: function() {
      this.siteListView = new BlockSites.SiteListView();
      this.layout.siteListView.show(this.siteListView);
    },

    _initializeBlockedAdvertiserListView: function() {
      this.blockedAdvertiserListView = new BlockSites.BlockedAdvertiserListView();
      this.blockedAdvertiserListView.on('Show:AdvertiserListModalView', this._showAdvertiserModalView, this);
      this.layout.blockedAdvertiserListView.show(this.blockedAdvertiserListView);
    },

    _showAdvertiserModalView: function() {
      this.advertiserListModalView = new BlockSites.AdvertiserListModalView();
      this.layout.modal.show(this.advertiserListModalView);
    },

    _initializeBlockedAdvertiserBlockListView: function() {
      this.blockedAdvertiserBlockListView = new BlockSites.BlockedAdvertiserBlockListView();
      this.blockedAdvertiserBlockListView.on('Show:AdvertiserBlockModalView', this._showAdvertiserBlockModalView, this);
      this.layout.blockedAdvertiserBlockListView.show(this.blockedAdvertiserBlockListView);
    },

    _showAdvertiserBlockModalView:function() {
      this.advertiserBlockListModalView = new BlockSites.AdvertiserBlockListModalView();
      this.layout.modal.show(this.advertiserBlockListModalView);
    },


  });

})(ReachUI.namespace("BlockSites"));