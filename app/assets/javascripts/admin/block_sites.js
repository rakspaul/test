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

    triggers: {
      'click #btnSave' : 'Save:SiteBlock',
      'click #btnCommit' : 'Commit:SiteBlock',
    },

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

  BlockSites.BlockedAdvertiser = Backbone.Model.extend({
    addAdvertiser: function(item) {
      this.get('advertisers').add(item);
    },

    getAdvertiser: function() {
      return this.get('advertisers');
    },

    hasAdvertiser: function(advertiser_id) {
      return this.get('advertisers').findWhere({advertiser_id: advertiser_id}) != undefined ? true : false;
    },
  });

  //BlockedAdvertiserList will hold the data in tree format like
  // [
  //   {
  //     site_id
  //     site_name
  //     advertisers:[
  //       {
  //         id
  //         advertiser_id
  //         advertiser_name
  //         site_id
  //       }
  //     ]
  //   }
  // ]

  BlockSites.BlockedAdvertiserList = Backbone.Collection.extend({
    model: BlockSites.BlockedAdvertiser,
    url: function() {
      return '/admin/blocked_advertiser.json?site_id='+ this.sites.join(',');
    },

    setSites: function(sites) {
      this.sites = sites;
    },

    // parse method will convert the data in tree format
    parse: function(response) {
      this.reset();
      for (var i = 0; i < response.length; i++) {
        if (response[i] != undefined) {
          var site = this._createSite(response[i]);
            for (var k = 0; k < response.length; k++) {
              if (response[k] != undefined) {
                if(site.site_id === response[k].site_id) {
                  site.advertisers.add(this._createAdvertiser(response[k]));
                  delete response[k];
                }
              }
            }
          this.push(site);
        }
      }
      return this.models;
    },

    _createSite: function(site) {
      return {
        site_id: site.site_id,
        site_name: site.site_name,
        advertisers: new BlockSites.BlockedAdvertiserList()
      }
    },

    _createAdvertiser: function(advertiser) {
      return {
        id: advertiser.id,
        advertiser_id: advertiser.advertiser_id,
        advertiser_name: advertiser.advertiser_name,
        site_id: advertiser.site_id
      }
    },

  });

  BlockSites.BlockedAdvertiserBlock = Backbone.Model.extend({
    addAdvertiserBlock: function(item) {
      this.get('advertiserBlocks').add(item);
    },

    getAdvertiserBlocks: function() {
      return this.get('advertiserBlocks');
    },

    hasAdvertiserBlock: function(advertiser_block_id) {
      return this.get('advertiserBlocks').findWhere({advertiser_block_id: advertiser_block_id}) != undefined ? true : false;
    },
  });

  //BlockedAdvertiserBlockList will hold the data in tree format like
  // [
  //   {
  //     site_id
  //     site_name
  //     advertiserBlocks:[
  //       {
  //         id
  //         advertiser_block_id
  //         advertiser_block_name
  //         site_id
  //       }
  //     ]
  //   }
  // ]

  BlockSites.BlockedAdvertiserBlockList = Backbone.Collection.extend({
    model: BlockSites.BlockedAdvertiserBlock,
    url: function() {
      return '/admin/blocked_advertiser_blocks.json?site_id='+ this.sites.join(',');
    },

    setSites: function(sites) {
      this.sites = sites;
    },

    parse: function(response) {
      this.reset();
      for (var i = 0; i < response.length; i++) {
        if (response[i] != undefined) {
          var site = this._createSite(response[i]);
            for (var k = 0; k < response.length; k++) {
              if (response[k] != undefined) {
                if(site.site_id === response[k].site_id) {
                  site.advertiserBlocks.add(this._createAdvertiserBlock(response[k]));
                  delete response[k];
                }
              }
            }
          this.push(site);
        }
      }
      return this.models;
    },

    _createSite: function(site) {
      return {
        site_id: site.site_id,
        site_name: site.site_name,
        advertiserBlocks: new BlockSites.BlockedAdvertiserBlockList()
      }
    },

    _createAdvertiserBlock: function(advertiser_block) {
      return{
        id: advertiser_block.id,
        advertiser_block_id: advertiser_block.advertiser_group_id,
        advertiser_block_name: advertiser_block.advertiser_group_name,
        site_id: advertiser_block.site_id
      }
    },

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
      'keypress #search_input': 'onSearch',
      'change #sitesList' : 'onSiteListChange',
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

    onSiteListChange: function(event) {
      var selectedSites = this.ui.site_list.val();
      if(selectedSites && selectedSites.length>0) {
        this.trigger('Get:SiteBlocks', selectedSites)
      }
    }

  });

  BlockSites.BlockedAdvertiserView = Backbone.Marionette.ItemView.extend({
    tagName:'option',
    template: _.template('<%= advertiser_name%>'),
    attributes: function() {
      return {value: this.model.get('advertiser_id')};
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
    },

  });

  BlockSites.BlockedAdvertiserBlockView = Backbone.Marionette.ItemView.extend({
    tagName:'option',
    template: _.template('<%= advertiser_block_name%>'),
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
      _.bindAll(this, '_onSuccess');
    },

    _initializeLayout: function() {
      this.detailRegion = new BlockSites.DetailRegion();

      this.layout = new BlockSites.Layout();
      this.layout.on('Save:SiteBlock', this._onSaveSiteBlock, this);
      this.layout.on('Commit:SiteBlock', this._onCommitSiteBlock, this);

      this.detailRegion.show(this.layout);
      this.layout.addRegions({'modal': new BlockSites.ModalRegion({el:'#modal'})});
    },

    _initializeSiteListView: function() {
      this.siteListView = new BlockSites.SiteListView();
      this.siteListView.on('Get:SiteBlocks', this._getSiteBlocks, this);
      this.layout.siteListView.show(this.siteListView);
    },

    _initializeBlockedAdvertiserListView: function() {
      this.blockedAdvertiserList = new BlockSites.BlockedAdvertiserList();
      this.blockedAdvertiserListView = new BlockSites.BlockedAdvertiserListView({collection: this.blockedAdvertiserList});
      this.blockedAdvertiserListView.on('Show:AdvertiserListModalView', this._showAdvertiserModalView, this);
      this.layout.blockedAdvertiserListView.show(this.blockedAdvertiserListView);
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

    // When user selects the site this method will fetch the blocked advertisers and advertiser blocks
    _getSiteBlocks: function(sites) {
      this.blockedAdvertiserList.setSites(sites);
      this.blockedAdvertiserBlockList.setSites(sites);
      this.blockedAdvertiserList.fetch({reset:true});
      this.blockedAdvertiserBlockList.fetch({reset:true});
    },

    _showAdvertiserModalView: function() {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        this.advertiserListModalView = new BlockSites.AdvertiserListModalView();
        this.advertiserListModalView.on('Block:Advertiser', this._onBlockAdvertiser, this);
        this.layout.modal.show(this.advertiserListModalView);
      }
    },

    // When user selects advertiser to block
    // First check if that site exists in the list
    // If No create new object and add it to the list
    // If Yes add selected advertiser to the list

    _onBlockAdvertiser: function(vos) {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        for (var i = 0; i < selectedSites.length; i++) {
          // check for the site exist in block site list
          var selectedSite = selectedSites[i],
          blockedAdvertisers = this._createAdvertiserModelArray(vos, selectedSite.id),
          site = this.blockedAdvertiserList.findWhere({site_id: selectedSite.id});

          if(!site) {
            // site is not there add to blockedAdvertiserList collection
            var blockedAdvertiser = this._createNewBlockedAdvertiser(selectedSite.id, selectedSite.get('name'), blockedAdvertisers)
            this.blockedAdvertiserList.add(blockedAdvertiser);
          } else {
            // site exist need to check if user is adding same advertisers or new one
            blockedAdvertisers.each(function(blockedAdvertiser) {
              if(!site.hasAdvertiser(blockedAdvertiser.get('advertiser_id'))) {
                site.addAdvertiser(blockedAdvertiser);
              }
            }, this);
          }
        }
      }
    },

    _createNewBlockedAdvertiser: function(site_id, site_name, advertisers) {
      var newBlockedAdvertiser = new BlockSites.BlockedAdvertiser({
        site_id: site_id,
        site_name: site_name,
        advertisers: advertisers
      });
      return newBlockedAdvertiser;
    },

    _createAdvertiserModelArray: function(vos, site_id) {
      var advertisers = new BlockSites.AdvertiserList();
      for (var i = 0; i < vos.length; i++) {
        var advertiser = this._createAdvertiserModel(vos[i], site_id);
        advertisers.add(advertiser);
      }
      return advertisers;
    },

    _createAdvertiserModel: function(advertiser, site_id) {
      var advertiser_id = advertiser.id,
      name = advertiser.get('name');

      return new BlockSites.Advertiser({site_id: site_id, advertiser_id: advertiser_id, advertiser_name: name})
    },

    // When user selects advertiser block to block
    // First check if that site exists in the list
    // If No create new object and add it to the list
    // If Yes add selected advertiser block to the list

    _onBlockAdvertiserBlock: function(vos) {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        for (var i = 0; i < selectedSites.length; i++) {
          // check for the site exist in block site list
          var selectedSite = selectedSites[i],
          blockedAdvertiserBlocks = this._createAdvertiserBlockModelArray(vos, selectedSite.id),
          site = this.blockedAdvertiserBlockList.findWhere({site_id: selectedSite.id});

          if(!site) {
            // site is not there add to blockedAdvertiserBlockList collection
            var blockedAdvertiserBlock = this._createNewBlockedAdvertiserBlock(selectedSite.id, selectedSite.get('name'), blockedAdvertiserBlocks);
            this.blockedAdvertiserBlockList.add(blockedAdvertiserBlock);
          } else {
            // site exist need to check if user is adding same advertisers or new one
            blockedAdvertiserBlocks.each(function(blockedAdvertiserBlock) {
              if(!site.hasAdvertiserBlock(blockedAdvertiserBlock.get('advertiser_block_id'))) {
                site.addAdvertiserBlock(blockedAdvertiserBlock);
              }
            }, this);
          }
        }
      }
    },

    _createNewBlockedAdvertiserBlock: function(site_id, site_name, blockedAdvertiserBlocks) {
      var newBlockedAdvertiserBlock = new BlockSites.BlockedAdvertiserBlock({
        site_id: site_id,
        site_name: site_name,
        advertiserBlocks: blockedAdvertiserBlocks
      });
      return newBlockedAdvertiserBlock;
    },

    _createAdvertiserBlockModelArray: function(vos, site_id) {
      var blockedAdvertiserBlocks = new BlockSites.BlockedAdvertiserBlockList();
      for (var i = 0; i < vos.length; i++) {
        var blockedAdvertiserBlock = this._createAdvertiserBlockModel(vos[i], site_id);
        blockedAdvertiserBlocks.push(blockedAdvertiserBlock);
      }
      return blockedAdvertiserBlocks;
    },

    _createAdvertiserBlockModel: function(advertiser_block, site_id) {
      var advertiser_block_id = advertiser_block.id,
      name = advertiser_block.get('name');

      return new BlockSites.AdvertiserBlock({site_id: site_id, advertiser_block_id: advertiser_block_id, advertiser_block_name: name})
    },


    // Check the collection for new object using backbone's isNew() method
    _onSaveSiteBlock: function(event) {
      // find out newly added advertisers
      var newBlockedAdvertisers = [],
      newBlockedAdvertiserBlocks = [],
      para = {};

      this.blockedAdvertiserList.each(function(site) {
        site.getAdvertiser().each(function(advertiser) {
          if(advertiser.isNew()) {
            newBlockedAdvertisers.push(advertiser.toJSON());
          }
        })
      }, this);

      if (newBlockedAdvertisers.length > 0) {
        para.blocked_advertisers = JSON.stringify(newBlockedAdvertisers)
      }

      this.blockedAdvertiserBlockList.each(function(site) {
        site.getAdvertiserBlocks().each(function(advertiser_block) {
          if(advertiser_block.isNew()) {
            newBlockedAdvertiserBlocks.push(advertiser_block.toJSON());
          }
        })
      }, this);

      if (newBlockedAdvertiserBlocks.length > 0) {
        para.blocked_advertiser_blocks = JSON.stringify(newBlockedAdvertiserBlocks)
      }

      if(newBlockedAdvertisers.length > 0 || newBlockedAdvertiserBlocks.length > 0) {
        $.ajax({type: "POST", url: '/admin/block_sites', data: para, success: this._onSuccess, dataType: 'json'});
      }
    },

    _onSuccess: function(event) {
      this.blockedAdvertiserList.fetch({reset:true});
      this.blockedAdvertiserBlockList.fetch({reset:true});
    },

    _onCommitSiteBlock: function(event) {

    },

  });

})(ReachUI.namespace("BlockSites"));