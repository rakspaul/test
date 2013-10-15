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
    },

    _onTabClick: function(event) {
       event.preventDefault();
      $(event.target).tab('show');
      this.trigger('TabChange');
    },

  });

// --------------------/ Models /------------------------------------

  BlockedAdvertisers.Advertiser = Backbone.Model.extend({});

  BlockedAdvertisers.AdvertisersList = Backbone.Collection.extend({
    url: '/advertisers/search.json',
    model: BlockedAdvertisers.Advertiser,
  });

  BlockedAdvertisers.AdvertisersGroup = Backbone.Model.extend({});

  BlockedAdvertisers.AdvertisersGroupsList = Backbone.Collection.extend({
    url: '/advertiser_blocks/search.json',
    model: BlockedAdvertisers.AdvertisersGroup,
  });

  BlockedAdvertisers.Site = Backbone.Model.extend({});

  BlockedAdvertisers.SiteBlock = Backbone.Model.extend({});

  BlockedAdvertisers.SiteList = Backbone.Collection.extend({});

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
    template: _.template('<%= site_name%>'),
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
      this.advertiserList.fetch();
    },

    _initializeAdvertiserGroupSearchView: function() {
      this.advertiserGroupList = new BlockedAdvertisers.AdvertisersGroupsList();
      this.advertiserGroupSearchView = new BlockedAdvertisers.SearchView({collection: this.advertiserGroupList});
      this.advertiserGroupSearchView.on('ItemChange', this._fetchAdvertiserGroups, this);
      this.layout.advertiserGroupSearchView.show(this.advertiserGroupSearchView);
      this.advertiserGroupList.fetch();
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
      this.searchResults.fetch();
    },

    _fetchAdvertiserGroups: function(items) {
      this.searchResults.setUrl('/admin/blocked_advertiser_groups.json?advertiser_group_id=');
      this.searchResults.setIds(items);
      this.searchResults.fetch();
    },

  });

})(ReachUI.namespace("BlockedAdvertisers"));