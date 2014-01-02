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
      this.trigger('TabChange', event.target.id);
    },

    _onExportClick: function(event){
      this.trigger('Export');
    },

  });

// --------------------/ Models /------------------------------------

  BlockedAdvertisers.Advertiser = Backbone.Model.extend({});

  BlockedAdvertisers.AdvertisersList = Backbone.Collection.extend({
    url: '/advertisers/search.json',
    model: BlockedAdvertisers.Advertiser,

    comparator: function(model) {
      return model.get('name');
    },


    fetch: function(){
      this.trigger("fetch", this);
      return Backbone.Collection.prototype.fetch.apply( this, arguments );
    }
  });

  BlockedAdvertisers.AdvertisersGroup = Backbone.Model.extend({});

  BlockedAdvertisers.AdvertisersGroupsList = Backbone.Collection.extend({
    url: '/advertiser_blocks/search.json',
    model: BlockedAdvertisers.AdvertisersGroup,

    comparator: function(model) {
      return model.get('name');
    },

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

    comparator: function(model) {
      if(model.has('advertiser_name')) {
        return model.get('advertiser_name');
      } else {
        return model.get('advertiser_group_name');
      }
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
                if(parent.id === this._findId(response[k]) && response[k].site_id !== null) {
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
      this.selectedTab = 'advertisers';
    },

    _initializeLayout: function() {
      this.detailRegion = new BlockedAdvertisers.DetailRegion();
      this.layout = new BlockedAdvertisers.Layout();
      this.layout.on('TabChange', this._onTabChange, this);
      this.layout.on('Export', this._onExport, this);
      this.detailRegion.show(this.layout);
    },

    _initializeAdvertiserSearchView: function() {
      this.advertiserList = new BlockedAdvertisers.AdvertisersList();
      this.advertiserSearchView = new ReachUI.BlockToolComponents.SearchList({collection: this.advertiserList, placeholder:'Advertisers'});
      this.advertiserSearchView.on('SearchList:ItemClick', this._fetchAdvertisers, this);
      this.advertiserSearchView.on('SearchList:SelectedItemReset', this._clearResults, this);
      this.layout.advertiserSearchView.show(this.advertiserSearchView);
      this.advertiserList.fetch({reset: true});
    },

    _initializeAdvertiserGroupSearchView: function() {
      this.advertiserGroupList = new BlockedAdvertisers.AdvertisersGroupsList();
      this.advertiserGroupSearchView = new ReachUI.BlockToolComponents.SearchList({collection: this.advertiserGroupList, placeholder:'Advertiser Groups'});
      this.advertiserGroupSearchView.on('SearchList:ItemClick', this._fetchAdvertiserGroups, this);
      this.advertiserGroupSearchView.on('SearchList:SelectedItemReset', this._clearResults, this);
      this.layout.advertiserGroupSearchView.show(this.advertiserGroupSearchView);
      this.advertiserGroupList.fetch({reset: true});
    },

    _initializeSearchResultsView: function() {
      this.searchResults = new BlockedAdvertisers.SiteBlockList();
      this.searchResultView = new BlockedAdvertisers.SearchResultsView({collection: this.searchResults});
      this.layout.searchResultsView.show(this.searchResultView);
    },

    _onTabChange: function(tab_id) {
      this.selectedTab = tab_id;
      this._clearResults();
      this.advertiserSearchView.resetSelection();
      this.advertiserGroupSearchView.resetSelection();
    },

    _clearResults: function() {
      this.searchResults.reset();
    },

    _onExport: function() {
      if (this.selectedTab === 'advertisers' && this.advertiserSearchView.getSelectedItemIds().length > 0) {
        window.location = '/admin/blocked_advertisers/export_blocked_sites_on_advertisers.xls?advertiser_id='+this.advertiserSearchView.getSelectedItemIds().join(',');
      } else if (this.selectedTab === 'advertiser_groups' && this.advertiserGroupSearchView.getSelectedItemIds().length > 0) {
        window.location = '/admin/blocked_advertisers/export_blocked_sites_on_advertiser_groups.xls?advertiser_group_id='+this.advertiserGroupSearchView.getSelectedItemIds().join(',');
      }
    },

    _fetchAdvertisers: function(items) {
      this.searchResults.setUrl('/admin/blocked_advertisers/get_blocked_sites_on_advertiser.json?advertiser_id=');
      this.searchResults.setIds(items.pluck('id'));
      var self =this;
      this.searchResults.fetch().then(function() {
        self.searchResults.sort();
      });
    },

    _fetchAdvertiserGroups: function(items) {
      this.searchResults.setUrl('/admin/blocked_advertisers/get_blocked_sites_on_advertiser_group.json?advertiser_group_id=');
      this.searchResults.setIds(items.pluck('id'));
      var self =this;
      this.searchResults.fetch().then(function() {
        self.searchResults.sort();
      });
    },

  });

})(ReachUI.namespace("BlockedAdvertisers"));