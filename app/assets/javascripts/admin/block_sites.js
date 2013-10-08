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

  BlockSites.BlockedAdvertiser = Backbone.Model.extend({});

  BlockSites.BlockedAdvertiserList = Backbone.Collection.extend({
    model: BlockSites.BlockedAdvertiser,
  });

  BlockSites.BlockedAdvertiserBlock = Backbone.Model.extend({});

  BlockSites.BlockedAdvertiserBlockList = Backbone.Collection.extend({
    model: BlockSites.BlockedAdvertiserBlock,
  });

// --------------------/ Views /------------------------------------

  BlockSites.SiteListItemView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'option',
    attributes: function() {
      return {value: this.model.id};
    },
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
      site_list: '#sitesList'
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

    getSelectedSites: function() {
      var selectedSites = this.ui.site_list.val();
      if(selectedSites && selectedSites.length>0) {
        var sites = []
        for (var i = 0; i < selectedSites.length; i++) {
          var site = this.collection.get(selectedSites[i]);
          sites.push(site)
        }
        return sites;
      } else {
        return [];
      }
    },
  });

  BlockSites.BlockedAdvertiserView = Backbone.Marionette.ItemView.extend({
    tagName:'option',
    template: _.template('<%= name%>'),
    attributes: function() {
      return {value: this.model.get('id')};
    },
  });

  BlockSites.BlockedAdvertiserListItemView = Backbone.Marionette.CollectionView.extend({
    tagName: 'optgroup',
    itemView: BlockSites.BlockedAdvertiserView,
    attributes: function() {
      return {label: this.model.get('site_name')};
    },

    initialize: function() {
      this.collection = this.model.get('advertisers');
    },

  });

  BlockSites.BlockedAdvertiserListView  = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/blocked_advertiser_list_view'],
    itemView: BlockSites.BlockedAdvertiserListItemView,

    events: {
      'click #btnAdd' : '_onAddAdvertiserClick',
      'click #btnRemove' : '_onRemoveAdvertiserClick',
    },

    ui: {
      blocked_advertiser_list: '#blockedAdvertiserList',
    },

    appendHtml: function(collectionView, itemView){
      collectionView.$("#blockedAdvertiserList").append(itemView.el);
    },

    _onAddAdvertiserClick: function(event) {
      this.trigger('Show:AdvertiserListModalView');
    },

    _onRemoveAdvertiserClick: function(event) {
      console.log(this.ui.blocked_advertiser_list.val());
    },

  });

  BlockSites.BlockedAdvertiserBlockView = Backbone.Marionette.ItemView.extend({
    tagName:'option',
    template: _.template('<%= name%>'),
    attributes: function() {
      return {value: this.model.id};
    },
  });

  BlockSites.BlockedAdvertiserBlockListItemView = Backbone.Marionette.CollectionView.extend({
    tagName: 'optgroup',
    itemView: BlockSites.BlockedAdvertiserBlockView,
    attributes: function() {
      return {label: this.model.get('site_name')};
    },

    initialize: function() {
      this.collection = this.model.get('advertiserBlocks');
    },
  });

  BlockSites.BlockedAdvertiserBlockListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/blocked_advertiser_block_list_view'],
    itemView: BlockSites.BlockedAdvertiserBlockListItemView,

    events: {
      'click #btnAdd' : '_onAddAdvertiserBlockClick',
    },

    ui: {
      blocked_advertiser_block_list: '#blockedAdvertiserBlockList',
    },

    appendHtml: function(collectionView, itemView){
     collectionView.$("#blockedAdvertiserBlockList").append(itemView.el);
    },

    _onAddAdvertiserBlockClick: function(event) {
      this.trigger('Show:AdvertiserBlockModalView');
    },

  });

  BlockSites.AdvertiserView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'option',
    attributes: function() {
      return {value: this.model.id}
    },
  });

  BlockSites.AdvertiserListModalView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_list_modal_view'],
    className: 'modal',
    itemView: BlockSites.AdvertiserView,

    events: {
      'click #search_button' : 'onSearch',
      'keypress #search_input' : 'onSearch',
      'click #btnBlock' : 'onBlock',
    },

    ui:{
      search_input: '#search_input',
      advertiser_list: '#advertiserList'
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

    onBlock: function(event) {
      var selectedAdvertiser = this.ui.advertiser_list.val();
      if(selectedAdvertiser && selectedAdvertiser.length >0 ) {
        var vos = [];
        for (var i = 0; i < selectedAdvertiser.length; i++) {
          var item = this.collection.get(selectedAdvertiser[i]);
          vos.push(item);
        }
      this.trigger('Block:Advertiser', vos);
      $('#close_modal').trigger('click');
      }
    },

  });

  BlockSites.AdvertiserBlockView = Backbone.Marionette.ItemView.extend({
    tagName: 'option',
    template: _.template('<%= name%>'),
    attributes: function() {
      return {value: this.model.id};
    },
  });

  BlockSites.AdvertiserBlockListModalView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_block_list_modal_view'],
    className: 'modal',
    itemView: BlockSites.AdvertiserBlockView,

    events: {
      'click #search_button': 'onSearch',
      'keypress #search_input': 'onSearch',
      'click #btnBlock': 'onBlock',
    },

    ui:{
      search_input: '#search_input',
      blocked_advertiser_list: '#advertiserBlockList'
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

    onBlock: function(event) {
      var selectedAdvertiserBlocks = this.ui.blocked_advertiser_list.val();
      if(selectedAdvertiserBlocks && selectedAdvertiserBlocks.length >0 ) {
        var vos = [];
        for (var i = 0; i < selectedAdvertiserBlocks.length; i++) {
          var item = this.collection.get(selectedAdvertiserBlocks[i]);
          vos.push(item);
        }
      this.trigger('Block:AdvertiserBlock', vos);
      $('#close_modal').trigger('click');
      }
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
      this.blockedAdvertiserList = new BlockSites.BlockedAdvertiserList();
      this.blockedAdvertiserListView = new BlockSites.BlockedAdvertiserListView({collection: this.blockedAdvertiserList});
      this.blockedAdvertiserListView.on('Show:AdvertiserListModalView', this._showAdvertiserModalView, this);
      this.layout.blockedAdvertiserListView.show(this.blockedAdvertiserListView);
    },

    _showAdvertiserModalView: function() {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        this.advertiserListModalView = new BlockSites.AdvertiserListModalView();
        this.advertiserListModalView.on('Block:Advertiser', this._onBlockAdvertiser, this);
        this.layout.modal.show(this.advertiserListModalView);
      }
    },

    _onBlockAdvertiser: function(vos) {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        for (var i = 0; i < selectedSites.length; i++) {
          // check for the site exist in block site list
          var item = selectedSites[i];
          var site = this.blockedAdvertiserList.findWhere({site_id: item.id});
          if(!site) {
            // site is not there add to blockedAdvertiserList collection
            var blockedAdvertiser = new BlockSites.AdvertiserList(vos)
            var newBlockedAdvertiser = new BlockSites.BlockedAdvertiser({site_id: item.id, site_name: item.get('name'), advertisers: blockedAdvertiser});
            this.blockedAdvertiserList.add(newBlockedAdvertiser);
          } else {
            // site exist need to check if user is adding same advertisers or new one
            for (var k = 0; k < vos.length; k++) {
              if(site.get('advertisers').get({id:vos[k].id}) == null)
                site.get('advertisers').add(vos[k]);
            }
          }
        }
      }
    },

    _initializeBlockedAdvertiserBlockListView: function() {
      this.blockedAdvertiserBlockList = new BlockSites.BlockedAdvertiserBlockList();
      this.blockedAdvertiserBlockListView = new BlockSites.BlockedAdvertiserBlockListView({collection: this.blockedAdvertiserBlockList});
      this.blockedAdvertiserBlockListView.on('Show:AdvertiserBlockModalView', this._showAdvertiserBlockModalView, this);
      this.layout.blockedAdvertiserBlockListView.show(this.blockedAdvertiserBlockListView);
    },

    _showAdvertiserBlockModalView:function() {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        this.advertiserBlockListModalView = new BlockSites.AdvertiserBlockListModalView();
        this.advertiserBlockListModalView.on('Block:AdvertiserBlock', this._onBlockAdvertiserBlock, this);
        this.layout.modal.show(this.advertiserBlockListModalView);
      }
    },

    _onBlockAdvertiserBlock: function(vos) {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        for (var i = 0; i < selectedSites.length; i++) {
          // check for the site exist in block site list
          var item = selectedSites[i];
          var site = this.blockedAdvertiserBlockList.findWhere({site_id: item.id});
          if(!site) {
            // site is not there add to blockedAdvertiserBlockList collection
            var blockedAdvertiserBlocks = new BlockSites.AdvertiserBlockList(vos)
            var newAdvertiserBlock = new BlockSites.BlockedAdvertiserBlock({site_id: item.id, site_name: item.get('name'), advertiserBlocks: blockedAdvertiserBlocks});
            this.blockedAdvertiserBlockList.add(newAdvertiserBlock);
          } else {
            // site exist need to check if user is adding same advertisers or new one
            for (var k = 0; k < vos.length; k++) {
              if(site.get('advertiserBlocks').get({id:vos[k].id}) == null)
                site.get('advertiserBlocks').add(vos[k]);
            }
          }
        }
      }
    },

  });

})(ReachUI.namespace("BlockSites"));