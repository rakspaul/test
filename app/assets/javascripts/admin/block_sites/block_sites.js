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
      'click #btnExport' : 'Export:SiteBlock',
    },

    ui: {
      'saveBlock' : '#btnSave',
    },

    regions: {
      siteListView: '#siteListView',
      blockedAdvertiserListView: '#blockedAdvertiserListView',
      blockedAdvertiserGroupListView: '#blockedAdvertiserBlockListView',
    },

  });

  BlockSites.AdvertiserListModalLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/block_sites/advertiser_list_modal_layout'],
    className: 'modal block-sites-modal',

    regions: {
      advertiserSearchView: '#advertiserSearchView',
      advertiserPasteView: '#advertiserPasteView',
    },

    events:{
      'click #advertisersTab' : '_onTabClick',
    },

    _onTabClick: function(event) {
       event.preventDefault();
      $(event.target).tab('show');
    },

  });

  BlockSites.SiteLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/block_sites/site_layout'],

    regions: {
      blacklistedSitesSearchView : '#blacklistedSitesSearchView',
      whitelistedSitesSearchView : '#whitelistedSitesSearchView'
    },

    events:{
      'click #sitesTab' : '_onTabClick',
    },

    _onTabClick: function(event) {
      event.preventDefault();
      $(event.target).tab('show');
      this.trigger('Change:SiteTab', event.target.id);
    },

  });

// --------------------/ Models /------------------------------------

  BlockSites.Site = Backbone.Model.extend({
    defaults:{
      selected: false,
    }
  });

  BlockSites.SiteList = Backbone.Collection.extend({
    url: '/sites/search.json',
    model: BlockSites.Site,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

  BlockSites.BlacklistedSiteList = Backbone.Collection.extend({
    url: '/sites/blacklisted_sites.json',
    model: BlockSites.Site,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

  BlockSites.WhitelistedSiteList = Backbone.Collection.extend({
    url: '/admin/default_block_list/whitelisted_sites.json',
    model: BlockSites.Site,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

  BlockSites.Advertiser = Backbone.Model.extend({
    defaults:{
      state: 'PENDING_BLOCK',
      default_block: false,
      isModified: false,
      isDeleted: false,
    },

    isPendingBlock: function() {
      return this.get('state') === 'PENDING_BLOCK';
    },

    isCommitBlock: function() {
      return this.get('state') === 'COMMIT_BLOCK';
    },

    isBlocked: function() {
      return this.get('state') === 'BLOCK';
    },

    isPendingUnBlock: function() {
      return this.get('state') === 'PENDING_UNBLOCK';
    },

    isCommitUnBlock: function() {
      return this.get('state') === 'COMMIT_UNBLOCK';
    },

    isUnBlocked: function() {
      return this.get('state') === 'UNBLOCK';
    },

    isDeleted: function() {
      return this.get('isDeleted');
    },

    isModified: function() {
      return this.get('isModified');
    }

  });

  BlockSites.AdvertiserList = Backbone.Collection.extend({
    url: '/advertisers/search.json',
    model: BlockSites.Advertiser,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },

  });

  BlockSites.AdvertiserGroup = Backbone.Model.extend({
    defaults:{
      state: 'PENDING_BLOCK',
      status: '',
      isModified: false,
      isDeleted: false,
    },

    isPendingBlock: function() {
      return this.get('state') === 'PENDING_BLOCK';
    },

    isCommitBlock: function() {
      return this.get('state') === 'COMMIT_BLOCK';
    },

    isBlocked: function() {
      return this.get('state') === 'BLOCK';
    },

    isPendingUnBlock: function() {
      return this.get('state') === 'PENDING_UNBLOCK';
    },

    isCommitUnBlock: function() {
      return this.get('state') === 'COMMIT_UNBLOCK';
    },

    isUnBlocked: function() {
      return this.get('state') === 'UNBLOCK';
    },

    isDeleted: function() {
      return this.get('isDeleted');
    },

    isModified: function() {
      return this.get('isModified');
    }

  });

  BlockSites.AdvertiserGroupList = Backbone.Collection.extend({
    url: '/advertiser_blocks/search.json',
    model: BlockSites.AdvertiserGroup,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

  BlockSites.AdvertiserBlock = Backbone.Model.extend({

    addAdvertiser: function(item) {
      this.get('advertisers').add(item);
    },

    getAdvertisers: function() {
      return this.get('advertisers');
    },

    getAdvertiser: function(advertiser_id) {
      var model = this.getAdvertisers().findWhere({advertiser_id: advertiser_id});
      return model;
    },

    removeAdvertiser: function(advertiser_id) {
      var model = this.getAdvertisers().findWhere({advertiser_id: advertiser_id});

      if(model) {
        this.get('advertisers').remove(model);
      }
      return model;
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

  BlockSites.AdvertiserBlockList = Backbone.Collection.extend({
    model: BlockSites.AdvertiserBlock,

    url: function() {
      return this._url + this.sites.join(',');
    },

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },

    fetchBlacklistedAdvertisers: function() {
      this._url = '/admin/block_sites/blacklisted_advertisers.json?site_id=';
      return this.fetch({reset:true});
    },

    fetchWhitelistedAdvertisers: function() {
      this._url = '/admin/block_sites/whitelisted_advertisers.json?site_id=';
      return this.fetch({reset:true});
    },

    setSites: function(sites) {
      this.sites = sites;
    },

    removeSite:function(site_id) {
      var model = this.findWhere({site_id: site_id});
      if (model) {
        this.remove(model);
      }
      return model;
    },

    comparator: function(model) {
      return model.get('site_name').toLowerCase();
    },

    // parse method will convert the data in tree format
    parse: function(response) {
      this.reset();
      for (var i = 0; i < response.length; i++) {
        if (response[i] != undefined) {
          var site = this._createSite(response[i]);
            for (var k = 0; k < response.length; k++) {
              if (response[k] != undefined) {
                if(site.site_id === response[k].site_id && response[k].id !== null) {
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
      var object = {
        site_id: site.site_id,
        site_name: site.site_name,
        advertisers: new BlockSites.AdvertiserBlockList()
      }

      object.advertisers.comparator = function(model) {
        return model.get('advertiser_name').toLowerCase();
      };

      return object;
    },

    _createAdvertiser: function(advertiser) {
      return new BlockSites.Advertiser({
              id: advertiser.id,
              advertiser_id: advertiser.advertiser_id,
              advertiser_name: advertiser.advertiser_name,
              site_id: advertiser.site_id,
              state: advertiser.state,
            });
    },

  });

  BlockSites.AdvertiserGroupBlock = Backbone.Model.extend({
    addAdvertiserGroup: function(item) {
      this.get('advertiserGroups').add(item);
    },

    getAdvertiserGroups: function() {
      return this.get('advertiserGroups');
    },

    getAdvertiserGroup: function(advertiser_group_id) {
      var model = this.getAdvertiserGroups().findWhere({advertiser_group_id: advertiser_group_id});
      return model;
    },

    removeAdvertiserGroup: function(advertiser_group_id) {
      var model = this.getAdvertiserGroups().findWhere({advertiser_group_id: advertiser_group_id});

      if(model) {
        this.get('advertiserGroups').remove(model);
      }
      return model;
    },

    hasAdvertiserGroup: function(advertiser_group_id) {
      return this.get('advertiserGroups').findWhere({advertiser_group_id: advertiser_group_id}) != undefined ? true : false;
    },
  });

  //BlockedAdvertiserBlockList will hold the data in tree format like
  // [
  //   {
  //     site_id
  //     site_name
  //     advertiserGroups:[
  //       {
  //         id
  //         advertiser_group_id
  //         advertiser_group_name
  //         site_id
  //       }
  //     ]
  //   }
  // ]

  BlockSites.AdvertiserGroupBlockList = Backbone.Collection.extend({
    model: BlockSites.AdvertiserGroupBlock,
    url: function() {
      return '/admin/block_sites/blacklisted_advertiser_groups.json?site_id='+ this.sites.join(',');
    },

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },

    setSites: function(sites) {
      this.sites = sites;
    },

    removeSite:function(site_id) {
      var model = this.findWhere({site_id: site_id});
      if (model) {
        this.remove(model);
      }
      return model;
    },

    comparator: function(model) {
      return model.get('site_name').toLowerCase();
    },

    parse: function(response) {
      this.reset();
      for (var i = 0; i < response.length; i++) {
        if (response[i] != undefined) {
          var site = this._createSite(response[i]);
            for (var k = 0; k < response.length; k++) {
              if (response[k] != undefined) {
                if(site.site_id === response[k].site_id && response[k].id !== null) {
                  site.advertiserGroups.add(this._createAdvertiserGroup(response[k]));
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
      var object = {
        site_id: site.site_id,
        site_name: site.site_name,
        advertiserGroups: new BlockSites.AdvertiserGroupBlockList()
      };

      object.advertiserGroups.comparator = function(model) {
        return model.get('advertiser_group_name').toLowerCase();
      };

      return object;
    },

    _createAdvertiserGroup: function(advertiser_group) {
      return new BlockSites.AdvertiserGroup({
              id: advertiser_group.id,
              advertiser_group_id: advertiser_group.advertiser_group_id,
              advertiser_group_name: advertiser_group.advertiser_group_name,
              site_id: advertiser_group.site_id,
              state: advertiser_group.state,
              status:'',
            })
    },

  });

  BlockSites.SelectedItems = Backbone.Collection.extend({})


// --------------------/ Views /------------------------------------

  BlockSites.BlockedAdvertiserView = Backbone.Marionette.ItemView.extend({
    tagName:'li',
    template: _.template('<%= pending_block_indicator %> <%= advertiser_name%> <%= default_block_indicator %>'),

    attributes: function() {
      return {
        value: this.model.get('advertiser_id'),
        site_id: this.model.get('site_id')
      };
    },

    initialize: function() {
      this._isBlacklistedSiteMode = this.options.isBlacklistedSiteMode;
      this.model.on('change', this.render, this);
    },

    events:{
      'click' : '_onClick',
    },

    className: function() {
      if (this.model.get('default_block')) {
        return 'italics';
      }
    },

    serializeData: function() {
      var data = {};

      if (this._isBlacklistedSiteMode && this.model.isPendingBlock()) {
        data.pending_block_indicator = ' + ';
      } else if(this._isBlacklistedSiteMode && this.model.isPendingUnBlock()) {
        data.pending_block_indicator = ' - ';
      } else if(!this._isBlacklistedSiteMode && this.model.isPendingUnBlock()) {
        data.pending_block_indicator = ' + ';
      } else if(!this._isBlacklistedSiteMode && this.model.isPendingBlock()) {
        data.pending_block_indicator = ' - ';
      } else if (this.model.isCommitBlock() || this.model.isCommitUnBlock()) {
        data.pending_block_indicator = ' * ';
      } else {
        data.pending_block_indicator = ''
      }

      data.default_block_indicator = this.model.get('default_block') ? '(Default Block)' : '';
      data.advertiser_name = this.model.get('advertiser_name');

      return data;
    },

    onRender: function() {
      if (this.model.get('selected')) {
        this.$el.addClass('selected');
      } else {
        this.$el.removeClass('selected');
      }

      // if (this.model.get('status') === 'deleted') {
      //   this.$el.removeClass('selected');
      // }
      this._applyCssClass();
    },

    _onClick:function() {
      if (!this.model.isDeleted()) {
        this.trigger('selected');
      }
    },

    _applyCssClass: function() {
      if (this._isBlacklistedSiteMode && this.model.isPendingBlock()) {
        this.$el.addClass('greenText');
      } else if(this._isBlacklistedSiteMode && this.model.isPendingUnBlock()) {
        this.$el.addClass('redText');
      } else if(!this._isBlacklistedSiteMode && this.model.isPendingUnBlock()) {
        this.$el.addClass('greenText');
      } else if(!this._isBlacklistedSiteMode && this.model.isPendingBlock()) {
        this.$el.addClass('redText');
      } else if (this.model.isDeleted()) {
        this.$el.addClass('disabled');
      } else {
        this.$el.removeClass('redText');
        this.$el.removeClass('greenText');
      }
    },
  });

  BlockSites.BlockedAdvertiserListItemView = Backbone.Marionette.CompositeView.extend({
    template: _.template('<label title="<%= site_name %>"><%= site_name %></label><ul></ul>'),
    itemView: BlockSites.BlockedAdvertiserView,
    itemViewContainer: 'ul',
    tagName: 'li',
    itemViewOptions: function(model, index) {
      return {
        isBlacklistedSiteMode: this.options.isBlacklistedSiteMode
      };
    },

    initialize: function() {
      this.collection = this.model.get('advertisers');
      this.collection.on('sort', this.render, this);
      this.selectedItems = new BlockSites.SelectedItems();
      this.on('itemview:selected', this._onItemClick, this);
      this.collection.on("reset", this.onReset, this);
    },

    serializeData: function(){
      return {
        'site_name': this.model.get('site_name')
      }
    },

    onReset: function(){
      this.setSelectedItems(true);
    },

    _onItemClick: function(event){
      var selectedItem = event.model,
      vo = this.selectedItems.findWhere({advertiser_id: event.model.get('advertiser_id'), site_id: event.model.get('site_id')});

      if (vo) {
        this.selectedItems.remove(vo);
        selectedItem.set({selected: false});
      } else {
        this.selectedItems.add(event.model);
        selectedItem.set({selected: true});
      }
    },

    setSelectedItems: function(value) {
      this.selectedItems.each(function(item) {
        var vo = this.collection.get(item.id);
        if(vo) {
          vo.set({selected: value});
        }
      }, this);
    },

  });

  BlockSites.BlockedAdvertiserListView  = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/blocked_advertiser_list_view'],
    itemView: BlockSites.BlockedAdvertiserListItemView,
    itemViewOptions: function(model, index) {
      return {
        isBlacklistedSiteMode: this._isBlacklistedSiteMode,
      };
    },

    events: {
      'click #btnAdd' : '_onAddAdvertiserClick',
      'click #btnRemove' : '_onRemoveAdvertiserClick',
    },

    ui: {
      blocked_advertiser_list: '#blockedAdvertiserList',
      lblTabName: '#lblTabName',
      loading_div: '#loading_div'
    },

    initialize: function() {
      this.tab_name = 'Blacklisted Advertisers'
      this.collection.on('sort', this.render, this);

      this.collection.on("fetch", this._onFetch, this);
      this.collection.on("reset", this._onReset, this);
      this.collection.on("renderAdvertisers", this.render, this);
      this._isBlacklistedSiteMode = this.options.isBlacklistedSiteMode;
    },

    appendHtml: function(collectionView, itemView){
      collectionView.$("#blockedAdvertiserList").append(itemView.el);
    },

    onRender: function() {
      this.ui.lblTabName.text(this.tab_name);
    },

    setSiteMode: function(isBlacklistedSiteMode) {
      this._isBlacklistedSiteMode = isBlacklistedSiteMode;
      this.render();
    },

    setText: function(tab_name) {
      this.tab_name = tab_name;
      this.ui.lblTabName.text(this.tab_name);
    },

    _onAddAdvertiserClick: function(event) {
      this.trigger('Show:AdvertiserListView');
    },

    _onRemoveAdvertiserClick: function(event) {
      var self = this;

      if (this._isAdvertiserSelected()) {
        $( "#blockedAdvertiserList li.selected" ).each(function() {
          var site_id = parseInt($( this ).attr('site_id')),
          advertiser_id = parseInt($( this ).val()),
          site = self.collection.findWhere({site_id: site_id});
          if (site) {
            var advertiser = site.getAdvertiser(advertiser_id);
            if(advertiser) {
              advertiser.set({selected: false});
              if(self._isBlacklistedSiteMode) {
                if (advertiser.isBlocked()) {
                  advertiser.set({state: 'PENDING_UNBLOCK'});
                  advertiser.set({isModified: true});
                } else if(advertiser.isPendingBlock()) {
                  site.removeAdvertiser(advertiser.get('advertiser_id'));
                  self.trigger('Delete:Advertiser', advertiser);
                } else if (advertiser.isPendingUnBlock()) {
                  advertiser.set({state: 'BLOCK'});
                  advertiser.set({isModified: true});
                }
              } else {
                if (advertiser.isUnBlocked()) {
                  advertiser.set({state: 'PENDING_BLOCK'});
                  advertiser.set({isModified: true});
                } else if(advertiser.isPendingUnBlock()) {
                  site.removeAdvertiser(advertiser.get('advertiser_id'));
                  self.trigger('Delete:Advertiser', advertiser);
                } else if (advertiser.isPendingBlock()) {
                  advertiser.set({state: 'UNBLOCK'});
                  advertiser.set({isModified: true});
                }
              }
            }
          }
        });
      }
    },

    _isAdvertiserSelected: function() {
      return (this.ui.blocked_advertiser_list.find('.selected').length > 0);
    },

    _onFetch: function() {
      this.ui.loading_div.show();
    },

    _onReset: function() {
      this.ui.loading_div.hide();
    },

  });

  BlockSites.GroupAdvertiserView = Backbone.Marionette.CompositeView.extend({
    template: _.template('<%= name%>'),
    tagName:'li',
    triggers : {
      'click' : 'selected'
    }
  });

  BlockSites.BlockedAdvertiserGroupView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/blocked_advertiser_group_view'],
    tagName:'li',
    itemViewContainer: 'ul',
    itemView: BlockSites.GroupAdvertiserView,


    attributes: function() {
      return {
        value: this.model.get('advertiser_group_id'),
        site_id: this.model.get('site_id')
      }
    },

    serializeData: function() {
      var data = {};

      if (this.model.isPendingBlock()) {
        data.pending_block_indicator = ' + ';
      } else if(this.model.isPendingUnBlock()) {
        data.pending_block_indicator = ' - ';
      } else if (this.model.isCommitBlock() || this.model.isCommitUnBlock()) {
        data.pending_block_indicator = ' * ';
      } else {
        data.pending_block_indicator = ''
      }

      data.expand_indicator = this.isExpanded ? 'icon-sort-down' : 'icon-sort-up';

      data.advertiser_group_name = this.model.get('advertiser_group_name');

      return data;
    },

    ui: {
      advertiserList: '#advertiserList',
      expand_indicator: '#expand_indicator'
    },

    initialize: function() {
      this.collection = new BlockSites.AdvertiserList();
      this.model.on('change', this.render, this);
      this.on('itemview:selected', this._onItemClick, this);
      this.isExpanded = false;
    },

    events:{
      'click #advertiser_group_name' : '_onClick',
      'click #expand_indicator' : '_onExpandClick'
    },

    onRender: function() {
      if (this.model.get('selected')) {
        this.$el.addClass('selected');
      } else {
        this.$el.removeClass('selected');
      }

      if (!this.isExpanded) {
        this.ui.advertiserList.hide();
      } else {
        this.ui.advertiserList.show();
      }

      this._applyCssClass();
    },

    _applyCssClass: function() {
      if (this.model.isPendingBlock()) {
        this.$el.addClass('greenText');
      } else if(this.model.isPendingUnBlock()) {
        this.$el.addClass('redText');
      } else if (this.model.isDeleted()) {
        this.$el.addClass('disabled');
      } else {
        this.$el.removeClass('redText');
        this.$el.removeClass('greenText');
      }
    },

    _onClick:function() {
      if (!this.model.isDeleted()) {
        this.trigger('selected');
      }
    },

    _onExpandClick: function(event) {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.ui.expand_indicator.removeClass('icon-sort-up').addClass('icon-sort-down')
        if(this.collection.length < 1) {
          this.collection.url = '/advertiser_blocks/'+this.model.get('advertiser_group_id')+'.json'
          this.collection.fetch();
        }
        this.ui.advertiserList.slideDown();
      } else {
        this.ui.expand_indicator.removeClass('icon-sort-down').addClass('icon-sort-up')
        this.ui.advertiserList.slideUp();
      }
    },

    _onItemClick: function() {
      if (!this.model.isDeleted()) {
        this.trigger('selected');
      }
    },

  });

  BlockSites.BlockedAdvertiserGroupListItemView = Backbone.Marionette.CompositeView.extend({
    template: _.template('<label title="<%= site_name %>"><%= site_name %></label><ul class="admin-list-inner"></ul>'),
    itemView: BlockSites.BlockedAdvertiserGroupView,
    itemViewContainer: 'ul',
    tagName: 'li',

    initialize: function() {
      this.collection = this.model.get('advertiserGroups');
      this.collection.on('sort', this.render, this);
      this.selectedItems = new BlockSites.SelectedItems();
      this.on('itemview:selected', this._onItemClick, this);
      this.collection.on("reset", this.onReset, this);
    },

    serializeData: function(){
      return {
        'site_name': this.model.get('site_name')
      }
    },

    onReset: function(){
      this.setSelectedItems(true);
    },

    _onItemClick: function(event){
      var selectedItem = event.model,
      vo = this.selectedItems.findWhere({advertiser_group_id: event.model.get('advertiser_group_id'), site_id: event.model.get('site_id')});

      if (vo) {
        this.selectedItems.remove(vo);
        selectedItem.set({selected: false});
      } else {
        this.selectedItems.add(event.model);
        selectedItem.set({selected: true});
      }
    },

    setSelectedItems: function(value) {
      this.selectedItems.each(function(item) {
        var vo = this.collection.get(item.id);
        if(vo) {
          vo.set({selected: value});
        }
      }, this);
    },

  });

  BlockSites.BlockedAdvertiserGroupListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/blocked_advertiser_group_list_view'],
    itemView: BlockSites.BlockedAdvertiserGroupListItemView,

    events: {
      'click #btnAdd' : '_onAddAdvertiserGroupClick',
      'click #btnRemove' : '_onRemoveAdvertiserGroupClick',
    },

    ui: {
      blocked_advertiser_group_list: '#blockedAdvertiserGroupList',
      lblTabName: '#lblTabName',
      loading_div: '#loading_div'
    },

    initialize: function() {
      this.tab_name = 'Blacklisted Advertiser Groups';
      this.collection.on('sort', this.render, this);

      this.collection.on("fetch", this._onFetch, this);
      this.collection.on("reset", this._onReset, this);
      this.collection.on("renderAdvertiserGroups", this.render, this);
    },

    appendHtml: function(collectionView, itemView){
     collectionView.$("#blockedAdvertiserGroupList").append(itemView.el);
    },

    onRender: function() {
      this.ui.lblTabName.text(this.tab_name);
      this.$el.find('*').attr('disabled', this.disabled);
    },

    setText: function(tab_name) {
      this.tab_name = tab_name;
      this.ui.lblTabName.text(this.tab_name);
    },

    hide: function() {
      this.$el.hide();
    },

    show: function() {
      this.$el.show();
    },

    _onAddAdvertiserGroupClick: function(event) {
      this.trigger('Show:AdvertiserGroupModalView');
    },

    _onRemoveAdvertiserGroupClick: function(event) {
      var self = this;

      if (this._isAdvertiserGroupSelected()) {
        $( "#blockedAdvertiserGroupList li.selected").each(function() {
          var site_id = parseInt($( this ).attr('site_id')),
          advertiser_group_id = parseInt($( this ).val()),
          site = self.collection.findWhere({site_id: site_id});
          if (site) {
            var advertiser_group = site.getAdvertiserGroup(advertiser_group_id);
            if (advertiser_group) {
              advertiser_group.set({selected: false});
              if (advertiser_group.isBlocked()) {
                advertiser_group.set({state: 'PENDING_UNBLOCK'});
                advertiser_group.set({isModified: true});
              } else if(advertiser_group.isPendingBlock()) {
                site.removeAdvertiserGroup(advertiser_group.get('advertiser_group_id'));
                self.trigger('Delete:AdvertiserGroup', advertiser_group);
              } else if (advertiser_group.isPendingUnBlock()) {
                advertiser_group.set({state: 'BLOCK'});
                advertiser_group.set({isModified: true});
              }
            }
          }
        });
      }
    },

    _isAdvertiserGroupSelected: function() {
      return (this.ui.blocked_advertiser_group_list.find('.selected').length > 0 )
    },

    _onFetch: function() {
      this.ui.loading_div.show();
    },

    _onReset: function() {
      this.ui.loading_div.hide();
    },

  });

  BlockSites.AdvertiserView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'li',
    attributes: function() {
      return {value: this.model.id}
    },

    triggers:{
      'click' : 'selected'
    },

    initialize: function() {
      this.model.on('change:selected', this.render, this);
    },

    onRender: function() {
      if (this.model.get('selected')) {
        this.$el.addClass('selected');
      } else {
        this.$el.removeClass('selected');
      }
    },

  });

  BlockSites.AdvertiserListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_list_view'],
    itemView: BlockSites.AdvertiserView,

    events: {
      'click #search_button' : 'onSearch',
      'keypress #search_input' : 'onSearch',
      'click #btnBlock' : 'onBlock',
      'click #reset_button' : '_onResetClick'
    },

    ui:{
      search_input: '#search_input',
      advertiser_list: '#advertiserList',
      loading_div: '#loading_div',
      btnBlock: '#btnBlock'
    },

    initialize: function() {
      this.collection = new BlockSites.AdvertiserList();
      this.collection.fetch({reset: true});
      this._isBlacklistedSiteMode = this.options.isBlacklistedSiteMode;

      this.selectedItems = new BlockSites.SelectedItems();
      this.on('itemview:selected', this._onItemClick, this);

      this.collection.on("fetch", this.onFetch, this);
      this.collection.on("reset", this.onReset, this);
      _.bindAll(this, '_onSuccess', '_onError');
    },

    onFetch: function() {
      this.ui.loading_div.show();
    },

    onReset: function() {
      this.ui.loading_div.hide();
      this.setSelectedItems(true);
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
      var selectedAdvertiserIds = this.selectedItems.pluck('id');
      if(selectedAdvertiserIds && selectedAdvertiserIds.length >0 ) {
        if (this._isBlacklistedSiteMode) {
          var para = {};
          this.ui.btnBlock.text('Adding...').attr('disabled','disabled');
          para.advertiser_id = selectedAdvertiserIds.join(',')
          $.ajax({type: "GET", url: '/admin/block_sites/advertisers_with_default_blocks.json', data: para, success: this._onSuccess, error: this._onError});
        } else {
          this.trigger('AdvertiserListView:Block:Advertiser', this.selectedItems.models);
          $('#close_modal').trigger('click');
        }
      }
    },

    _onSuccess: function(event) {
      this.ui.btnBlock.text('Add').removeAttr('disabled');
      var selectedAdvertiserIds = this.selectedItems.pluck('id');
      if(selectedAdvertiserIds && selectedAdvertiserIds.length >0 ) {
        var vos = this.selectedItems.models;

        if(event.default_block && event.default_block.length > 0) {
          var default_blocks = event.default_block;
          for (var i = 0; i < default_blocks.length; i++) {
            for (var k = 0; k < vos.length; k++) {
              if (default_blocks[i] == vos[k].id) {
                vos[k].set({default_block: true});
                break;
              }
            }
          }
        }

        this.trigger('AdvertiserListView:Block:Advertiser', vos);
        $('#close_modal').trigger('click');
      }
    },

    _onError: function(event) {
      this.ui.btnBlock.text('Add').removeAttr('disabled');
      alert('An error occurred while saving your changes.');
    },

    _getSelectedAdvertiserModels: function(advertiser_ids) {
      if(advertiser_ids && advertiser_ids.length >0 ) {
        var vos = [];
        for (var i = 0; i < advertiser_ids.length; i++) {
          var item = this.collection.get(advertiser_ids[i]);
          vos.push(item);
        }
        return vos;
      }
    },

    _onItemClick: function(event){
      var selectedItem = event.model,
      vo = this.selectedItems.get(event.model.id);

      if (vo) {
        this.selectedItems.remove(vo);
        selectedItem.set({selected: false});
      } else {
        this.selectedItems.add(event.model);
        selectedItem.set({selected: true});
      }
    },

    setSelectedItems: function(value) {
      this.selectedItems.each(function(item) {
        var vo = this.collection.get(item.id);
        if(vo) {
          vo.set({selected: value});
        }
      }, this);
    },

    _onResetClick:function(){
      this.resetSelection();
    },

     resetSelection: function() {
      this.setSelectedItems(false)
      this.selectedItems.reset();
    },

  });

  BlockSites.PasteAdvertiserView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/block_sites/paste_advertiser_view'],
    events:{
      'click #btnBlock' : 'onBlock',
      'click #btnValidate' : 'onValidate',
    },

    ui:{
      textAreaAdvertiser: '#textAreaAdvertiser',
      advertisers_error: '#advertisers_error',
      btnBlock: '#btnBlock',
      btnValidate: '#btnValidate',

    },

    initialize: function() {
      this._isBlacklistedSiteMode = this.options.isBlacklistedSiteMode;
      _.bindAll(this, '_onSuccess', '_onError', '_onValidateAdvertiserSuccess', '_onValidateAdvertiserError');
    },

    onBlock: function(event) {
      var str = this.ui.textAreaAdvertiser.val();
      if(str && str.trim() != "" && this._advertisers && this._advertisers.length > 0) {
        if (this._isBlacklistedSiteMode === 'Blacklisted_Site_Mode') {
          var para = {};
          this.ui.btnBlock.text('Adding...').attr('disabled','disabled');
          para.advertiser_id = _.pluck(this._advertisers, 'id').join(',')
          $.ajax({type: "GET", url: '/admin/block_sites/advertisers_with_default_blocks.json', data: para, success: this._onSuccess, error: this._onError});
        } else {
          this.trigger('PasteAdvertiserView:Block:Advertiser', this._advertisers);
          $('#close_modal').trigger('click');
        }
      }
    },

    _onSuccess: function(event) {
      this.ui.btnBlock.text('Add').removeAttr('disabled');
      var str = this.ui.textAreaAdvertiser.val();
      if(str && str.trim() != "" && this._advertisers && this._advertisers.length > 0) {

        if(event.default_block && event.default_block.length > 0) {
          var default_blocks = event.default_block;
          for (var i = 0; i < default_blocks.length; i++) {
            for (var k = 0; k < this._advertisers.length; k++) {
              if (default_blocks[i] == this._advertisers[k].id) {
                this._advertisers[k].set({default_block: true});
                break;
              }
            }
          }
        }

        this.trigger('PasteAdvertiserView:Block:Advertiser', this._advertisers);
        $('#close_modal').trigger('click');
      }
    },

    _onError: function(event) {
      this.ui.btnBlock.text('Add').removeAttr('disabled');
      alert('An error occurred while saving your changes.');
    },

    onValidate: function(event) {
      var str = this.ui.textAreaAdvertiser.val();
      if(str && str.trim() != "") {
        this.ui.btnValidate.text('Validating...').attr('disabled','disabled');
        this._validateAdvertisers(str);
      }
    },

    _validateAdvertisers: function(advertisers) {
      var para = {advertisers: advertisers},
      ui = this.ui;

      _.keys(ui)
        .filter(function(val) {
          return /_error$/.test(val);
      })
      .forEach(function(val) {
        ui[val].text("");
      });

      $.ajax({type: "POST", url: '/advertisers/validate', data: para, success: this._onValidateAdvertiserSuccess, error: this._onValidateAdvertiserError});
    },

    _onValidateAdvertiserSuccess: function(event) {
      var advertisers = event.advertisers,
      advertiserNames = [];
      this._advertisers = [];


      for (var i = 0; i < advertisers.length; i++) {
        var vo = new BlockSites.Advertiser({id: advertisers[i].id, name: advertisers[i].name});
        advertiserNames.push(advertisers[i].name);
        this._advertisers.push(vo);
      }

      if (this._advertisers && this._advertisers.length > 0) {
        this.ui.btnBlock.removeAttr('disabled');
      }

      this.ui.btnValidate.text('Validate').removeAttr('disabled');
      this.ui.textAreaAdvertiser.val(advertiserNames.join('\n'));
      this.ui.advertisers_error.html(event.missing_advertisers)
    },

    _onValidateAdvertiserError: function(event) {
      this.ui.btnValidate.text('Validate').removeAttr('disabled');
      if(event.responseJSON && event.responseJSON.errors) {
        alert('An error occurred while saving your changes.');
      }
    },

  });

  BlockSites.AdvertiserGroupView = Backbone.Marionette.ItemView.extend({
    tagName: 'li',
    template: _.template('<%= name%>'),
    attributes: function() {
      return {value: this.model.id};
    },

    triggers:{
      'click' : 'selected'
    },

    initialize: function() {
      this.model.on('change:selected', this.render, this);
    },

    onRender: function() {
      if (this.model.get('selected')) {
        this.$el.addClass('selected');
      } else {
        this.$el.removeClass('selected');
      }
    },

  });

  BlockSites.AdvertiserGroupListModalView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_group_list_modal_view'],
    className: 'modal',
    itemView: BlockSites.AdvertiserGroupView,

    events: {
      'click #search_button': 'onSearch',
      'keypress #search_input': 'onSearch',
      'click #btnBlock': 'onBlock',
      'click #reset_button' : '_onResetClick'
    },

    ui:{
      search_input: '#search_input',
      blocked_advertiser_group_list: '#advertiserGroupList',
      loading_div: '#loading_div'
    },

    initialize: function() {
      this.collection = new BlockSites.AdvertiserGroupList();
      this.collection.fetch({reset: true});

      this.selectedItems = new BlockSites.SelectedItems();
      this.on('itemview:selected', this._onItemClick, this);

      this.collection.on("fetch", this.onFetch, this);
      this.collection.on("reset", this.onReset, this);
    },

    onFetch: function() {
      this.ui.loading_div.show();
    },

    onReset: function() {
      this.ui.loading_div.hide();
      this.setSelectedItems(true);
    },

    appendHtml: function(collectionView, itemView){
      collectionView.$("#advertiserGroupList").append(itemView.el);
    },

    onSearch: function(event) {
      if (event.type === 'keypress' && event.keyCode != 13) {
        return;
      }
      var searchString = this.ui.search_input.val().trim();
      this.collection.fetch({data:{search: searchString}, reset: true});
    },

    onBlock: function(event) {
      var selectedAdvertiserGroups = this.selectedItems.pluck('id');
      if(selectedAdvertiserGroups && selectedAdvertiserGroups.length >0 ) {
        var vos = [];
        for (var i = 0; i < selectedAdvertiserGroups.length; i++) {
          var item = this.collection.get(selectedAdvertiserGroups[i]);
          vos.push(item);
        }
      this.trigger('Block:AdvertiserGroup', vos);
      $('#close_modal').trigger('click');
      }
    },

    _onItemClick: function(event){
      var selectedItem = event.model,
      vo = this.selectedItems.get(event.model.id);

      if (vo) {
        this.selectedItems.remove(vo);
        selectedItem.set({selected: false});
      } else {
        this.selectedItems.add(event.model);
        selectedItem.set({selected: true});
      }
    },

    setSelectedItems: function(value) {
      this.selectedItems.each(function(item) {
        var vo = this.collection.get(item.id);
        if(vo) {
          vo.set({selected: value});
        }
      }, this);
    },

    _onResetClick:function(){
      this.resetSelection();
    },

     resetSelection: function() {
      this.setSelectedItems(false)
      this.selectedItems.reset();
    },

  });

})(ReachUI.namespace("BlockSites"));