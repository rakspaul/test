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

// --------------------/ Models /------------------------------------

  BlockSites.Site = Backbone.Model.extend({});

  BlockSites.SiteList = Backbone.Collection.extend({
    url: '/sites/search.json',
    model: BlockSites.Site,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

  BlockSites.Advertiser = Backbone.Model.extend({
    defaults:{
      state: 'PENDING_BLOCK'
    },
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
      state: 'PENDING_BLOCK'
    },
  });

  BlockSites.AdvertiserGroupList = Backbone.Collection.extend({
    url: '/advertiser_blocks/search.json',
    model: BlockSites.AdvertiserGroup,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    },
  });

  BlockSites.BlockedAdvertiser = Backbone.Model.extend({

    addAdvertiser: function(item) {
      this.get('advertisers').add(item);
    },

    getAdvertisers: function() {
      return this.get('advertisers');
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

  BlockSites.BlockedAdvertiserList = Backbone.Collection.extend({
    model: BlockSites.BlockedAdvertiser,
    url: function() {
      return '/admin/blocked_advertiser.json?site_id='+ this.sites.join(',');
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
        site_id: advertiser.site_id,
        state: advertiser.state,
      }
    },

  });

  BlockSites.BlockedAdvertiserGroup = Backbone.Model.extend({
    addAdvertiserGroup: function(item) {
      this.get('advertiserGroups').add(item);
    },

    getAdvertiserGroups: function() {
      return this.get('advertiserGroups');
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

  BlockSites.BlockedAdvertiserGroupList = Backbone.Collection.extend({
    model: BlockSites.BlockedAdvertiserGroup,
    url: function() {
      return '/admin/blocked_advertiser_groups.json?site_id='+ this.sites.join(',');
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

    parse: function(response) {
      this.reset();
      for (var i = 0; i < response.length; i++) {
        if (response[i] != undefined) {
          var site = this._createSite(response[i]);
            for (var k = 0; k < response.length; k++) {
              if (response[k] != undefined) {
                if(site.site_id === response[k].site_id) {
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
      return {
        site_id: site.site_id,
        site_name: site.site_name,
        advertiserGroups: new BlockSites.BlockedAdvertiserGroupList()
      }
    },

    _createAdvertiserGroup: function(advertiser_group) {
      return{
        id: advertiser_group.id,
        advertiser_group_id: advertiser_group.advertiser_group_id,
        advertiser_group_name: advertiser_group.advertiser_group_name,
        site_id: advertiser_group.site_id,
        state: advertiser_group.state,
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
      site_list: '#sitesList',
      loading_div: '#loading_div'
    },

    initialize: function() {
      this.collection = new BlockSites.SiteList();
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
    },

    getSelectedSiteIds: function() {
      var selectedSites = this.ui.site_list.val();
      return selectedSites;
    },

  });

  BlockSites.BlockedAdvertiserView = Backbone.Marionette.ItemView.extend({
    tagName:'option',
    template: _.template('<% if(state == "PENDING_BLOCK"){%> * <%}%> <%= advertiser_name%>'),

    attributes: function() {
      return {
        value: this.model.get('advertiser_id'),
        site_id: this.model.get('site_id')
      };
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
      this.trigger('Show:AdvertiserListView');
    },

    _onRemoveAdvertiserClick: function(event) {
      var selectedAdvertisers = [],
      unblockedAdvertisers = [];

      if (this._isAdvertiserSelected()) {

        $( "#blockedAdvertiserList option:selected" ).each(function() {
          var site_id = parseInt($( this ).attr('site_id')),
          advertiser_id = parseInt($( this ).val());
          selectedAdvertisers.push({site_id: site_id, advertiser_id: advertiser_id});
        });

        for (var i = 0; i < selectedAdvertisers.length; i++) {
          var site = this.collection.findWhere({site_id: selectedAdvertisers[i].site_id}),
          advertiser = site.removeAdvertiser(selectedAdvertisers[i].advertiser_id);
          unblockedAdvertisers.push(advertiser);
        }

        if(site.getAdvertisers().size() < 1) {
          this.collection.removeSite(site.get('site_id'));
        }

        this.trigger('UnBlock:Advertiser', unblockedAdvertisers);
      }

    },

    _isAdvertiserSelected: function() {
      return (this.ui.blocked_advertiser_list.val() && this.ui.blocked_advertiser_list.val().length > 0);
    }

  });

  BlockSites.BlockedAdvertiserGroupView = Backbone.Marionette.ItemView.extend({
    tagName:'option',
    template: _.template(' <% if(state == "PENDING_BLOCK"){%> * <%}%> <%= advertiser_group_name%>'),
    attributes: function() {
      return {
        value: this.model.get('advertiser_group_id'),
        site_id: this.model.get('site_id')
      }
    },
  });

  BlockSites.BlockedAdvertiserGroupListItemView = Backbone.Marionette.CollectionView.extend({
    tagName: 'optgroup',
    itemView: BlockSites.BlockedAdvertiserGroupView,
    attributes: function() {
      return {label: this.model.get('site_name')};
    },

    initialize: function() {
      this.collection = this.model.get('advertiserGroups');
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
    },

    appendHtml: function(collectionView, itemView){
     collectionView.$("#blockedAdvertiserGroupList").append(itemView.el);
    },

    _onAddAdvertiserGroupClick: function(event) {
      this.trigger('Show:AdvertiserGroupModalView');
    },

    _onRemoveAdvertiserGroupClick: function(event) {
      var selectedAdvertiserGroups = [],
      unblockedAdvertiserGroups = [];

      if (this._isAdvertiserGroupSelected()) {

        $( "#blockedAdvertiserGroupList option:selected" ).each(function() {
          var site_id = parseInt($( this ).attr('site_id')),
          advertiser_group_id = parseInt($( this ).val());
          selectedAdvertiserGroups.push({site_id: site_id, advertiser_group_id: advertiser_group_id});
        });

        for (var i = 0; i < selectedAdvertiserGroups.length; i++) {
          var site = this.collection.findWhere({site_id: selectedAdvertiserGroups[i].site_id}),
          advertiser_group = site.removeAdvertiserGroup(selectedAdvertiserGroups[i].advertiser_group_id);
          unblockedAdvertiserGroups.push(advertiser_group);
        }

        if(site.getAdvertiserGroups().size() < 1) {
          this.collection.removeSite(site.get('site_id'));
        }

        this.trigger('UnBlock:AdvertiserGroups', unblockedAdvertiserGroups);
      }

    },

    _isAdvertiserGroupSelected: function() {
      return (this.ui.blocked_advertiser_group_list.val() && this.ui.blocked_advertiser_group_list.val().length > 0 )
    }

  });

  BlockSites.AdvertiserView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'option',
    attributes: function() {
      return {value: this.model.id}
    },
  });

  BlockSites.AdvertiserListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_list_view'],
    itemView: BlockSites.AdvertiserView,

    events: {
      'click #search_button' : 'onSearch',
      'keypress #search_input' : 'onSearch',
      'click #btnBlock' : 'onBlock',
    },

    ui:{
      search_input: '#search_input',
      advertiser_list: '#advertiserList',
      loading_div: '#loading_div'
    },

    initialize: function() {
      this.collection = new BlockSites.AdvertiserList();
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
      this.trigger('AdvertiserListView:Block:Advertiser', vos);
      $('#close_modal').trigger('click');
      }
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
      _.bindAll(this, '_onSuccess', '_onError');
    },

    onBlock: function(event) {
      var str = this.ui.textAreaAdvertiser.val();
      if(str && str.trim() != "" && this._advertisers && this._advertisers.length > 0) {
        this.trigger('PasteAdvertiserView:Block:Advertiser', this._advertisers);
        $('#close_modal').trigger('click');
      }
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

      $.ajax({type: "POST", url: '/advertisers/validate', data: para, success: this._onSuccess, error: this._onError});
    },

    _onSuccess: function(event) {
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

    _onError: function(event) {
      this.ui.btnValidate.text('Validate').removeAttr('disabled');
      if(event.responseJSON && event.responseJSON.errors) {
      }
    },

  });

  BlockSites.AdvertiserGroupView = Backbone.Marionette.ItemView.extend({
    tagName: 'option',
    template: _.template('<%= name%>'),
    attributes: function() {
      return {value: this.model.id};
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
    },

    ui:{
      search_input: '#search_input',
      blocked_advertiser_group_list: '#advertiserGroupList',
      loading_div: '#loading_div'
    },

    initialize: function() {
      this.collection = new BlockSites.AdvertiserGroupList();
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
      var selectedAdvertiserGroups = this.ui.blocked_advertiser_group_list.val();
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

  });

// --------------------/ Controller /------------------------------------

  BlockSites.AdvertiserListModalController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      this._initializeLayout();
      this._initializeAdvertiserSearchView();
      this._initializeAdvertiserPasteView();
    },

    _initializeLayout: function() {
      this.layout = new BlockSites.AdvertiserListModalLayout();
      this.mainRegion.show(this.layout);
    },

    _initializeAdvertiserSearchView: function() {
      this.advertiserListView = new BlockSites.AdvertiserListView();
      this.advertiserListView.on('AdvertiserListView:Block:Advertiser', this._onBlockAdvertiser , this)
      this.layout.advertiserSearchView.show(this.advertiserListView);
    },

    _initializeAdvertiserPasteView: function() {
      this.pasteAdvertiserView = new BlockSites.PasteAdvertiserView();
      this.pasteAdvertiserView.on('PasteAdvertiserView:Block:Advertiser', this._onBlockAdvertiser, this)
      this.layout.advertiserPasteView.show(this.pasteAdvertiserView);
    },

    _onBlockAdvertiser: function(vos) {
      this.trigger('Block:Advertiser', vos);
    }

  });

  BlockSites.BlockSitesController = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
      this._initializeSiteListView();
      this._initializeBlockedAdvertiserListView();
      this._initializeBlockedAdvertiserGroupListView();
      _.bindAll(this, '_onSuccess', '_onError', '_onCommitSuccess', '_onCommitError');
    },

    _initializeLayout: function() {
      this.detailRegion = new BlockSites.DetailRegion();

      this.layout = new BlockSites.Layout();
      this.layout.on('Save:SiteBlock', this._onSaveSiteBlock, this);
      this.layout.on('Commit:SiteBlock', this._onCommitSiteBlock, this);
      this.layout.on('Export:SiteBlock', this._onExportSiteBlock, this);

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
      this.blockedAdvertiserListView.on('Show:AdvertiserListView', this._showAdvertiserModalView, this);
      this.blockedAdvertiserListView.on('UnBlock:Advertiser', this._onUnblockAdvertiser, this);
      this.layout.blockedAdvertiserListView.show(this.blockedAdvertiserListView);
    },

    _initializeBlockedAdvertiserGroupListView: function() {
      this.blockedAdvertiserGroupList = new BlockSites.BlockedAdvertiserGroupList();
      this.blockedAdvertiserGroupListView = new BlockSites.BlockedAdvertiserGroupListView({collection: this.blockedAdvertiserGroupList});
      this.blockedAdvertiserGroupListView.on('Show:AdvertiserGroupModalView', this._showAdvertiserGroupModalView, this);
      this.blockedAdvertiserGroupListView.on('UnBlock:AdvertiserGroups', this._onUnblockAdvertiserGroup, this);
      this.layout.blockedAdvertiserGroupListView.show(this.blockedAdvertiserGroupListView);
    },

    _showAdvertiserGroupModalView:function() {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        this.advertiserGroupListModalView = new BlockSites.AdvertiserGroupListModalView();
        this.advertiserGroupListModalView.on('Block:AdvertiserGroup', this._onBlockAdvertiserGroup, this);
        this.layout.modal.show(this.advertiserGroupListModalView);
      }
    },

    // When user selects the site this method will fetch the blocked advertisers and advertiser blocks
    _getSiteBlocks: function(sites) {
      this.blockedAdvertiserList.setSites(sites);
      this.blockedAdvertiserGroupList.setSites(sites);
      this._fetchSiteBlocks();
    },

    _fetchSiteBlocks: function() {
      this.siteToUnblock = [];
      this.blockedAdvertiserList.fetch({reset:true});
      this.blockedAdvertiserGroupList.fetch({reset:true});
    },

    _showAdvertiserModalView: function() {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        this.advertiserListModalController = new BlockSites.AdvertiserListModalController({
          mainRegion: this.layout.modal
        });

        this.advertiserListModalController.on('Block:Advertiser', this._onBlockAdvertiser, this);
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

    _onUnblockAdvertiser: function(advertisers) {
      this.siteToUnblock = this.siteToUnblock.concat(advertisers);
    },

    _onUnblockAdvertiserGroup: function(advertiser_groups) {
      this.siteToUnblock = this.siteToUnblock.concat(advertiser_groups);
    },

    // When user selects advertiser block to block
    // First check if that site exists in the list
    // If No create new object and add it to the list
    // If Yes add selected advertiser block to the list

    _onBlockAdvertiserGroup: function(vos) {
      var selectedSites = this.siteListView.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        for (var i = 0; i < selectedSites.length; i++) {
          // check for the site exist in block site list
          var selectedSite = selectedSites[i],
          blockedAdvertiserGroups = this._createAdvertiserGroupModelArray(vos, selectedSite.id),
          site = this.blockedAdvertiserGroupList.findWhere({site_id: selectedSite.id});

          if(!site) {
            // site is not there add to blockedAdvertiserBlockList collection
            var blockedAdvertiserGroup = this._createNewBlockedAdvertiserGroup(selectedSite.id, selectedSite.get('name'), blockedAdvertiserGroups);
            this.blockedAdvertiserGroupList.add(blockedAdvertiserGroup);
          } else {
            // site exist need to check if user is adding same advertisers or new one
            blockedAdvertiserGroups.each(function(blockedAdvertiserGroup) {
              if(!site.hasAdvertiserGroup(blockedAdvertiserGroup.get('advertiser_group_id'))) {
                site.addAdvertiserGroup(blockedAdvertiserGroup);
              }
            }, this);
          }
        }
      }
    },

    _createNewBlockedAdvertiserGroup: function(site_id, site_name, blockedAdvertiserGroups) {
      var newBlockedAdvertiserGroup = new BlockSites.BlockedAdvertiserGroup({
        site_id: site_id,
        site_name: site_name,
        advertiserGroups: blockedAdvertiserGroups
      });
      return newBlockedAdvertiserGroup;
    },

    _createAdvertiserGroupModelArray: function(vos, site_id) {
      var blockedAdvertiserGroups = new BlockSites.BlockedAdvertiserGroupList();
      for (var i = 0; i < vos.length; i++) {
        var blockedAdvertiserGroup = this._createAdvertiserGroupModel(vos[i], site_id);
        blockedAdvertiserGroups.push(blockedAdvertiserGroup);
      }
      return blockedAdvertiserGroups;
    },

    _createAdvertiserGroupModel: function(advertiser_group, site_id) {
      var advertiser_group_id = advertiser_group.id,
      name = advertiser_group.get('name');

      return new BlockSites.AdvertiserGroup({site_id: site_id, advertiser_group_id: advertiser_group_id, advertiser_group_name: name})
    },


    // Check the collection for new object using backbone's isNew() method
    _onSaveSiteBlock: function(event) {
      var para = {};
      var blockedAdvertisers = this._blockAdvertiser(),
      blockedAdvertiserGroups = this._blockAdvertiserGroup(),
      unblockedSites = this._unblockedSites();

      if (blockedAdvertisers.length > 0 ) {
        para.blocked_advertisers = JSON.stringify(blockedAdvertisers);
      }

      if (blockedAdvertiserGroups.length > 0) {
        para.blocked_advertiser_groups = JSON.stringify(blockedAdvertiserGroups);
      }

      if (unblockedSites.length > 0) {
        para.unblocked_sites = JSON.stringify(unblockedSites);
      }

      if (blockedAdvertisers.length > 0 || blockedAdvertiserGroups.length > 0 || unblockedSites.length > 0) {
        this.layout.ui.saveBlock.text('Saving...').attr('disabled','disabled');
        $.ajax({type: "POST", url: '/admin/block_sites', data: para, success: this._onSuccess, error: this._onError, dataType: 'json'});
      }

    },

    _blockAdvertiser: function() {
      var newBlockedAdvertisers = [];

      this.blockedAdvertiserList.each(function(site) {
        site.getAdvertisers().each(function(advertiser) {
          if(advertiser.isNew()) {
            newBlockedAdvertisers.push(advertiser.toJSON());
          }
        })
      }, this);

      return newBlockedAdvertisers;
    },

    _blockAdvertiserGroup: function(fetch_records) {
      // find out newly added advertisers
      var newBlockedAdvertiserGroup = [];

      this.blockedAdvertiserGroupList.each(function(site) {
        site.getAdvertiserGroups().each(function(advertiser_group) {
          if(advertiser_group.isNew()) {
            newBlockedAdvertiserGroup.push(advertiser_group.toJSON());
          }
        })
      }, this);

      return newBlockedAdvertiserGroup;
    },

    _unblockedSites: function() {
      var array = this.siteToUnblock,
      unblock = [];

      if (array && array.length > 0) {
        for (var i = 0; i < array.length; i++) {
          if (!array[i].isNew()) {
            unblock.push(array[i]);
          }
        }
      }

      return unblock;
    },

    _onSuccess: function(event) {
      this.layout.ui.saveBlock.text('Save').removeAttr('disabled');
      this._fetchSiteBlocks();
      alert('Your changes were successfully saved.');
    },

    _onError: function(event) {
      this.layout.ui.saveBlock.text('Save').removeAttr('disabled');
      alert('An error occurred while saving your changes.');
    },

    _onCommitSiteBlock: function(event) {
      $.ajax({type: "POST", url: '/admin/block_sites/commit.json', success: this._onCommitSuccess, error: this._onCommitError, dataType: 'json'});
    },

    _onExportSiteBlock: function(event) {
      var selectedSiteIds = this.siteListView.getSelectedSiteIds();
      if (selectedSiteIds && selectedSiteIds.length > 0) {
        window.location = '/admin/block_sites/export_sites.xls?site_ids='+selectedSiteIds.join(',');
      }
    },

    _onCommitSuccess: function(event) {
      alert(event.message);
    },

    _onCommitError: function(event) {
      alert('An error occurred while committing your changes.');
    },

  });

})(ReachUI.namespace("BlockSites"));