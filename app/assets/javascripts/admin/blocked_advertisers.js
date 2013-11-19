(function(BlockedAdvertisers) {
  'use strict';

// --------------------/ Region /------------------------------------

  BlockedAdvertisers.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

// --------------------/ Layout /------------------------------------

  BlockedAdvertisers.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/blocked_advertisers/blocked_advertisers_layout'],

    regions: {
      advertiserSearchView: '#advertiserSearchView',
      advertiserGroupSearchView: '#advertiserGroupSearchView',
      searchResultsView: '#searchResultsView'
    },

    events:{
      'click #block_advt_tabs' : '_onTabClick',
      'click #export_btn' : '_onExportClick'
    },

    ui: {
      block_advt_tabs : '#block_advt_tabs',
      searchResultsView: '#searchResultsView'
    },

    _onTabClick: function(event) {
       event.preventDefault();
      $(event.target).tab('show');
      this.trigger('TabChange');
    },

    _onExportClick: function(event){
      event.preventDefault();

      var selectedTab = this.ui.block_advt_tabs.find('li.active').attr('data-name');
      var selectedTabsPane = this.ui.block_advt_tabs.find('li.active a').attr('href').slice(1);
      var selectedVals= $('#'+selectedTabsPane).find('#list').val();
      var excludedSites = this.ui.searchResultsView.find('select option').val();

      if(selectedVals && excludedSites){
        window.location = '/admin/block_sites/export_adv_and_group.xls?block_list='+selectedVals+'&type='+selectedTab
      }
    },

  });

// --------------------/ Models /------------------------------------

  BlockedAdvertisers.Advertiser = Backbone.Model.extend({});

  BlockedAdvertisers.AdvertisersList = Backbone.Collection.extend({
    url: '/advertisers/search.json',
    model: BlockedAdvertisers.Advertiser,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    }
  });

  BlockedAdvertisers.AdvertisersGroup = Backbone.Model.extend({});

  BlockedAdvertisers.AdvertisersGroupsList = Backbone.Collection.extend({
    url: '/advertiser_blocks/search.json',
    model: BlockedAdvertisers.AdvertisersGroup,

    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    }
  });

  BlockedAdvertisers.Site = Backbone.Model.extend({});

  BlockedAdvertisers.SiteList = Backbone.Collection.extend({
    model: BlockedAdvertisers.Site,
    comparator: function(model) {
      return model.get('site_name');
    },
  });

  BlockedAdvertisers.SiteBlock = Backbone.Model.extend({});

  BlockedAdvertisers.SiteBlockList = Backbone.Collection.extend({
    url: function(){
      return this._url + this._ids.join(',');
    },
    model: BlockedAdvertisers.SiteBlock,

    setUrl: function(url) {
      this._url = url;
    },

    setIds: function(ids) {
      this._ids = ids;
    },

    comparator: function(model) {
      return model.get('name');
    },

    parse: function(response) {
      this.reset();
      for (var i = 0; i < response.length; i++) {
        if (response[i] != undefined) {
          var parent = this._createParentNode(response[i]);
            for (var k = 0; k < response.length; k++) {
              if (response[k] != undefined) {
                if(parent.id === this._findId(response[k])) {
                  parent.childs.add(this._createChildNode(response[k]));
                  delete response[k];
                }
              }
            }
          this.push(parent);
        }
      }
      return this.models;
    },

    _createParentNode: function(parent) {
      var parent;
      parent.childs = new BlockedAdvertisers.SiteList();

      if (parent.advertiser_name !== undefined) {
        parent.id = parent.advertiser_id;
        parent.name = parent.advertiser_name;
      } else {
        parent.name = parent.advertiser_group_name;
        parent.id = parent.advertiser_group_id;
      }
      return parent;
    },

    _createChildNode: function(child) {
      return {
        site_name: child.site_name,
        default_block: child.default_block,
      };
    },

    _findId: function(item) {
      if (item.advertiser_id != undefined) {
        return item.advertiser_id;
      } else {
        return item.advertiser_group_id;
      }
    }
  });

// --------------------/ Views /------------------------------------

  BlockedAdvertisers.SearchItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'option',
    template: _.template('<%= name %>'),
    attributes: function() {
      return {value: this.model.id};
    },
  });

  BlockedAdvertisers.SearchView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/blocked_advertisers/search_blocked_advertisers'],
    itemView: BlockedAdvertisers.SearchItemView,
    itemViewContainer: '#list',

    events: {
      'click #search_button': 'onSearch',
      'keypress #search_input': 'onSearch',
      'change #list' : 'onListChange',
    },

    ui: {
      search_input: '#search_input',
      list: '#list',
      loading_div: '#loading_div'
    },

    initialize: function(){
      this.collection.on("fetch", this.onFetch, this);
      this.collection.on("reset", this.onReset, this);
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
      var searchString = this.ui.search_input.val().trim();
      this.collection.fetch({data:{search: searchString}, reset: true});
    },

    onListChange: function(event) {
      var selectedItems = this.ui.list.val();
      if(selectedItems && selectedItems.length > 0) {
        this.trigger('ItemChange', selectedItems);
      }
    },

    resetListSelection: function() {
      this.ui.list.val([]);
    }
  });


  BlockedAdvertisers.SearchResultItemView = Backbone.Marionette.ItemView.extend({
    tagName:'option',
    template: _.template('<%= site_name%> <% if(default_block === true) {%> (Default Block)<%}%>'),
    className: function() {
      if (this.model.get('default_block')) {
        return 'italics';
      }
    },
  });

  BlockedAdvertisers.SearchResultGroupView = Backbone.Marionette.CollectionView.extend({
    tagName: 'optgroup',
    itemView: BlockedAdvertisers.SearchResultItemView,
    attributes: function() {
      return {label: this.model.get('name')};
    },

    initialize: function() {
      this.collection = this.model.get('childs');
    },
  });

  BlockedAdvertisers.SearchResultsView = Backbone.Marionette.CollectionView.extend({
    tagName: 'select',
    attributes: {
        multiple: 'multiple',
    },
    itemView: BlockedAdvertisers.SearchResultGroupView,

    initialize: function() {
      this.collection.on('sort', this.render, this);
    },
  });

// --------------------/ Controller /------------------------------------

  BlockedAdvertisers.Controller = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
      this._initializeAdvertiserSearchView();
      this._initializeAdvertiserGroupSearchView();
      this._initializeSearchResultsView();
    },

    _initializeLayout: function() {
      this.detailRegion = new BlockedAdvertisers.DetailRegion();
      this.layout = new BlockedAdvertisers.Layout();
      this.layout.on('TabChange', this._onTabChange, this);
      this.detailRegion.show(this.layout);
    },

    _initializeAdvertiserSearchView: function() {
      this.advertiserList = new BlockedAdvertisers.AdvertisersList();
      this.advertiserSearchView = new BlockedAdvertisers.SearchView({collection: this.advertiserList});
      this.advertiserSearchView.on('ItemChange', this._fetchAdvertisers, this);
      this.layout.advertiserSearchView.show(this.advertiserSearchView);
      this.advertiserList.fetch({reset: true});
    },

    _initializeAdvertiserGroupSearchView: function() {
      this.advertiserGroupList = new BlockedAdvertisers.AdvertisersGroupsList();
      this.advertiserGroupSearchView = new BlockedAdvertisers.SearchView({collection: this.advertiserGroupList});
      this.advertiserGroupSearchView.on('ItemChange', this._fetchAdvertiserGroups, this);
      this.layout.advertiserGroupSearchView.show(this.advertiserGroupSearchView);
      this.advertiserGroupList.fetch({reset: true});
    },

    _initializeSearchResultsView: function() {
      this.searchResults = new BlockedAdvertisers.SiteBlockList();
      this.searchResultView = new BlockedAdvertisers.SearchResultsView({collection: this.searchResults});
      this.layout.searchResultsView.show(this.searchResultView);
    },

    _onTabChange: function() {
      this.searchResults.reset();
      this.advertiserSearchView.resetListSelection();
      this.advertiserGroupSearchView.resetListSelection();
    },

    _fetchAdvertisers: function(items) {
      this.searchResults.setUrl('/admin/blocked_advertiser.json?advertiser_id=');
      this.searchResults.setIds(items);
      var self =this;
      this.searchResults.fetch().then(function() {
        self.searchResults.sort();
      });
    },

    _fetchAdvertiserGroups: function(items) {
      this.searchResults.setUrl('/admin/blocked_advertiser_groups.json?advertiser_group_id=');
      this.searchResults.setIds(items);
      var self =this;
      this.searchResults.fetch().then(function() {
        self.searchResults.sort();
      });
    },

  });

})(ReachUI.namespace("BlockedAdvertisers"));