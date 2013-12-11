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

  BlockSites.CommitOverviewLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/block_sites/commit_overview_layout'],
    className: 'modal',

    events: {
      'click #btnCommit' : 'onCommit',
    },

    regions: {
      blacklistedAdvertisersOverviewView : '#blacklistedAdvertisersOverviewView',
      blacklistedAdvertiserGroupsOverviewView : '#blacklistedAdvertiserGroupsOverviewView',
      whitelistedAdvertisersOverviewView : '#whitelistedAdvertisersOverviewView',
      whitelistedAdvertiserGroupsOverviewView : '#whitelistedAdvertiserGroupsOverviewView',
    },

    onCommit: function() {
      this.trigger('Commit:SiteBlock');
      $('#close_modal').trigger('click');
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
      default_block: false
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

    comparator: function(model) {
      return model.get('site_name');
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
        advertisers: new BlockSites.BlockedAdvertiserList()
      }

      object.advertisers.comparator = function(model) {
        return model.get('advertiser_name')
      };

      return object;
    },

    _createAdvertiser: function(advertiser) {
      return {
        id: advertiser.id,
        advertiser_id: advertiser.advertiser_id,
        advertiser_name: advertiser.advertiser_name,
        site_id: advertiser.site_id,
        state: advertiser.state,
        default_block: false
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

    comparator: function(model) {
      return model.get('site_name')
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
        advertiserGroups: new BlockSites.BlockedAdvertiserGroupList()
      };

      object.advertiserGroups.comparator = function(model) {
        return model.get('advertiser_group_name');
      };

      return object;
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

  BlockSites.AdvertiserCommitSummary = Backbone.Collection.extend({
    url: function() {
      return '/admin/blocked_advertiser/commit_summary.json?state=' + this.state
    },

    setState: function(state) {
      this.state = state;
    },
  });

    BlockSites.AdvertiserGroupCommitSummary = Backbone.Collection.extend({
    url: function() {
      return '/admin/blocked_advertiser_groups/commit_summary.json?state=' + this.state
    },

    setState: function(state) {
      this.state = state;
    },
  });

// --------------------/ Views /------------------------------------

  BlockSites.SiteListItemView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'li',
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

    }
  }),

  BlockSites.SiteListView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/site_list_view'],
    itemView: BlockSites.SiteListItemView,
    itemViewContainer: '#sitesList',

    events: {
      'click #search_button': 'onSearch',
      'keypress #search_input': 'onSearch',
      'click #reset_button' : 'onResetClick',
    },

    ui:{
      search_input: '#search_input',
      site_list: '#sitesList',
      loading_div: '#loading_div'
    },

    initialize: function() {
      this.selectedSites = new BlockSites.SiteList();
      this.collection.fetch({reset: true});

      this.collection.on("fetch", this.onFetch, this);
      this.collection.on("reset", this.onReset, this);
      this.on('itemview:selected', this.onSiteItemClick, this);
    },

    onFetch: function() {
      this.ui.loading_div.show();
    },

    onReset: function() {
      this.ui.loading_div.hide();
      this.setSelectedItems(true);
    },

    onSearch: function(event) {
      if (event.type === 'keypress' && event.keyCode != 13) {
        return;
      }
      var searchString = this.ui.search_input.val().trim();
      this.collection.fetch({data:{search: searchString}, reset: true});
    },

    onResetClick: function() {
      this.resetSelection();
    },

    resetSelection: function() {
      this.setSelectedItems(false)
      this.selectedSites.reset();
      this.trigger('Get:SiteBlocks', []);
    },

    getSelectedSites: function() {
      if(this.selectedSites && this.selectedSites.length > 0) {
        return this.selectedSites.models
      } else {
        return [];
      }
    },

    onSiteItemClick: function(event){
      var selectedItem = event.model,
      vo = this.selectedSites.get(event.model.id);

      if (vo) {
        this.selectedSites.remove(vo);
        selectedItem.set({selected: false});
      } else {
        this.selectedSites.add(event.model);
        selectedItem.set({selected: true});
      }

      if(this.selectedSites) {
        this.trigger('Get:SiteBlocks', this.selectedSites.pluck('id'))
      }
    },

    setSelectedItems: function(value) {
      this.selectedSites.each(function(site) {
        var vo = this.collection.get(site.id);
        if(vo) {
          vo.set({selected: value});
        }
      }, this);
    },

    getSelectedSiteIds: function() {
      if(this.selectedSites && this.selectedSites.length > 0) {
        return this.selectedSites.pluck('id');
      } else {
        return [];
      }
    },

  });

  BlockSites.BlockedAdvertiserView = Backbone.Marionette.ItemView.extend({
    tagName:'option',
    template: _.template('<%= pending_block_indicator %> <%= advertiser_name%> <%= default_block_indicator %>'),

    attributes: function() {
      return {
        value: this.model.get('advertiser_id'),
        site_id: this.model.get('site_id')
      };
    },

    className: function() {
      if (this.model.get('default_block')) {
        return 'italics'
      }
    },

    serializeData: function() {
      return {
        pending_block_indicator : this.model.get('state') == "PENDING_BLOCK" ? ' * ': '',
        default_block_indicator : this.model.get('default_block') ? '(Default Block)' : '',
        advertiser_name : this.model.get('advertiser_name')
      }
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
      this.collection.on('sort', this.render, this);
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
      lblTabName: '#lblTabName',
    },

    initialize: function() {
      this.tab_name = 'Blacklisted Advertisers'
      this.collection.on('sort', this.render, this);
    },

    appendHtml: function(collectionView, itemView){
      collectionView.$("#blockedAdvertiserList").append(itemView.el);
    },

    onRender: function() {
      this.ui.lblTabName.text(this.tab_name);
    },

    setText: function(tab_name) {
      this.tab_name = tab_name;
      this.ui.lblTabName.text(this.tab_name);
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
      this.collection.on('sort', this.render, this);
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
      lblTabName: '#lblTabName'
    },

    initialize: function() {
      this.tab_name = 'Blacklisted Advertiser Groups';
      this.collection.on('sort', this.render, this);
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
      loading_div: '#loading_div',
      btnBlock: '#btnBlock'
    },

    initialize: function() {
      this.collection = new BlockSites.AdvertiserList();
      this.collection.fetch({reset: true});

      this.collection.on("fetch", this.onFetch, this);
      this.collection.on("reset", this.onReset, this);
      _.bindAll(this, '_onSuccess', '_onError');
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
        var para = {};
        this.ui.btnBlock.text('Adding...').attr('disabled','disabled');
        para.advertiser_id = selectedAdvertiser.join(',')
        $.ajax({type: "GET", url: '/admin/block_sites/advertisers_with_default_blocks.json', data: para, success: this._onSuccess, error: this._onError});
      }
    },

    _onSuccess: function(event) {
      this.ui.btnBlock.text('Add').removeAttr('disabled');
      var selectedAdvertiser = this.ui.advertiser_list.val();
      if(selectedAdvertiser && selectedAdvertiser.length >0 ) {
        var vos = [];
        for (var i = 0; i < selectedAdvertiser.length; i++) {
          var item = this.collection.get(selectedAdvertiser[i]);
          vos.push(item);
        }

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
      _.bindAll(this, '_onSuccess', '_onError', '_onValidateAdvertiserSuccess', '_onValidateAdvertiserError');
    },

    onBlock: function(event) {
      var str = this.ui.textAreaAdvertiser.val();
      if(str && str.trim() != "" && this._advertisers && this._advertisers.length > 0) {
        var para = {};
        this.ui.btnBlock.text('Adding...').attr('disabled','disabled');
        para.advertiser_id = _.pluck(this._advertisers, 'id').join(',')
        $.ajax({type: "GET", url: '/admin/block_sites/advertisers_with_default_blocks.json', data: para, success: this._onSuccess, error: this._onError});
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

  BlockSites.EmptyView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: _.template('<td colspan="4" style="text-align:center;"> No records found. </td>'),
  });

  BlockSites.AdvertisersOverviewItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: JST['templates/admin/block_sites/advertiser_overview_row_view'],
  });

  BlockSites.AdvertiserGroupsOverviewItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: JST['templates/admin/block_sites/advertiser_group_overview_row_view'],
  });

  BlockSites.AdvertisersOverviewView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_overview_view'],
    itemView: BlockSites.AdvertisersOverviewItemView,
    itemViewContainer: 'tbody',
    emptyView: BlockSites.EmptyView
  });

  BlockSites.AdvertiserGroupsOverviewView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_group_overview_view'],
    itemView: BlockSites.AdvertiserGroupsOverviewItemView,
    itemViewContainer: 'tbody',
    emptyView: BlockSites.EmptyView
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

  BlockSites.SitesController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      this._initializeLayout();
      this._initializeBlacklistedSitesSearchView();
      this._initializeWhitelistedSitesSearchView();
    },

    getSelectedSites: function() {
      var selectedblacklistedSites = this.blacklistedSitesSearchView.getSelectedSites(),
      selectedwhitelistedSites = this.whitelistedSitesSearchView.getSelectedSites();

      if (selectedblacklistedSites && selectedblacklistedSites.length > 0) {
        return selectedblacklistedSites;
      } else if(selectedwhitelistedSites && selectedwhitelistedSites.length > 0) {
        return selectedwhitelistedSites;
      }
    },

    getSelectedSiteIds: function() {
      var selectedblacklistedSiteIds = this.blacklistedSitesSearchView.getSelectedSiteIds(),
      selectedwhitelistedSiteIds = this.whitelistedSitesSearchView.getSelectedSiteIds();

      if (selectedblacklistedSiteIds && selectedblacklistedSiteIds.length > 0) {
        return selectedblacklistedSiteIds;
      } else if(selectedwhitelistedSiteIds && selectedwhitelistedSiteIds.length > 0) {
        return selectedwhitelistedSiteIds;
      }
    },

    _initializeLayout: function() {
      this.layout = new BlockSites.SiteLayout();
      this.layout.on('Change:SiteTab',this._onSiteTabChange, this);
      this.mainRegion.show(this.layout);
    },

    _initializeBlacklistedSitesSearchView: function() {
      this.blacklistedSitesCollection = new BlockSites.BlacklistedSiteList();
      this.blacklistedSitesSearchView = new BlockSites.SiteListView({collection: this.blacklistedSitesCollection});
      this.blacklistedSitesSearchView.on('Get:SiteBlocks', this._getSiteBlocks, this);
      this.layout.blacklistedSitesSearchView.show(this.blacklistedSitesSearchView);
    },

    _initializeWhitelistedSitesSearchView: function() {
      this.WhitelistedSitesCollection = new BlockSites.WhitelistedSiteList();
      this.whitelistedSitesSearchView = new BlockSites.SiteListView({collection: this.WhitelistedSitesCollection});
      this.whitelistedSitesSearchView.on('Get:SiteBlocks', this._getSiteBlocks, this);
      this.layout.whitelistedSitesSearchView.show(this.whitelistedSitesSearchView);
    },

    _onSiteTabChange: function(tabName) {
      this.blacklistedSitesSearchView.resetSelection();
      this.whitelistedSitesSearchView.resetSelection();
      this.trigger('Change:SiteTab', tabName);
    },

    _getSiteBlocks: function(sites) {
      this.trigger('Get:SiteBlocks', sites);
    },

  });

  BlockSites.CommitOverviewController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      this._initializeLayout();
      this._initializeBlacklistedAdvertisersOverviewView();
      this._initializeBlacklistedAdvertiserGroupsOverviewView();
      this._initializeWhitelistedAdvertisersOverviewView();
      this._initializeWhitelistedAdvertiserGroupsOverviewView();
    },

    _initializeLayout: function() {
      this.layout = new BlockSites.CommitOverviewLayout();
      this.layout.on('Commit:SiteBlock', this._onCommit, this)
      this.mainRegion.show(this.layout);
    },


    _initializeBlacklistedAdvertisersOverviewView: function() {
      this.blacklistedAdvertiserList = new BlockSites.AdvertiserCommitSummary();
      this.blacklistedAdvertiserList.setState('PENDING_BLOCK');
      this.blacklistedAdvertisersOverviewView = new BlockSites.AdvertisersOverviewView({collection: this.blacklistedAdvertiserList});
      this.layout.blacklistedAdvertisersOverviewView.show(this.blacklistedAdvertisersOverviewView);
      this.blacklistedAdvertiserList.fetch();
    },

    _initializeBlacklistedAdvertiserGroupsOverviewView: function() {
      this.blacklistedAdvertiserGroupList = new BlockSites.AdvertiserGroupCommitSummary();
      this.blacklistedAdvertiserGroupList.setState('PENDING_BLOCK');
      this.blacklistedAdvertiserGroupsOverviewView = new BlockSites.AdvertiserGroupsOverviewView({collection: this.blacklistedAdvertiserGroupList});
      this.layout.blacklistedAdvertiserGroupsOverviewView.show(this.blacklistedAdvertiserGroupsOverviewView);
      this.blacklistedAdvertiserGroupList.fetch();
    },

    _initializeWhitelistedAdvertisersOverviewView: function() {
      this.whitelistedAdvertiserList = new BlockSites.AdvertiserCommitSummary();
      this.whitelistedAdvertiserList.setState('PENDING_UNBLOCK');
      this.whitelistedAdvertisersOverviewView = new BlockSites.AdvertisersOverviewView({collection: this.whitelistedAdvertiserList});
      this.layout.whitelistedAdvertisersOverviewView.show(this.whitelistedAdvertisersOverviewView);
      this.whitelistedAdvertiserList.fetch();
    },

    _initializeWhitelistedAdvertiserGroupsOverviewView: function() {
      this.whitelistedAdvertiserGroupList = new BlockSites.AdvertiserGroupCommitSummary();
      this.whitelistedAdvertiserGroupList.setState('PENDING_UNBLOCK');
      this.whitelistedAdvertiserGroupsOverviewView = new BlockSites.AdvertiserGroupsOverviewView({collection: this.whitelistedAdvertiserGroupList});
      this.layout.whitelistedAdvertiserGroupsOverviewView.show(this.whitelistedAdvertiserGroupsOverviewView);
      this.whitelistedAdvertiserGroupList.fetch();
    },

    _onCommit: function() {
      this.trigger('Commit:SiteBlock');
    },

  });

})(ReachUI.namespace("BlockSites"));