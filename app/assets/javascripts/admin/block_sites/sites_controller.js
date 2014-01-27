(function(BlockSites) {
  'use strict';

  BlockSites.SitesController = Marionette.Controller.extend({
    initialize: function() {
      this.BLACKLISTED_SITE_MODE = 'Blacklisted_Site_Mode';
      this.WHITELISTED_SITE_MODE = 'Whitelisted_Site_Mode';

      this.siteMode = this.BLACKLISTED_SITE_MODE;
      this.mainRegion = this.options.mainRegion;
      this._initializeLayout();
      this._initializeBlacklistedSitesSearchView();
      this._initializeWhitelistedSitesSearchView();
    },

    getSelectedSites: function() {
      var selectedblacklistedSites = this.blacklistedSitesSearchView.getSelectedItems(),
      selectedwhitelistedSites = this.whitelistedSitesSearchView.getSelectedItems();

      if (selectedblacklistedSites && selectedblacklistedSites.length > 0) {
        return selectedblacklistedSites;
      } else if(selectedwhitelistedSites && selectedwhitelistedSites.length > 0) {
        return selectedwhitelistedSites;
      }
    },

    getSelectedSiteIds: function() {
      var selectedblacklistedSiteIds = this.blacklistedSitesSearchView.getSelectedItemIds(),
      selectedwhitelistedSiteIds = this.whitelistedSitesSearchView.getSelectedItemIds();

      if (selectedblacklistedSiteIds && selectedblacklistedSiteIds.length > 0) {
        return selectedblacklistedSiteIds;
      } else if(selectedwhitelistedSiteIds && selectedwhitelistedSiteIds.length > 0) {
        return selectedwhitelistedSiteIds;
      }
    },

    getSiteMode: function() {
      return this.siteMode;
    },

    _initializeLayout: function() {
      this.layout = new BlockSites.SiteLayout();
      this.layout.on('Change:SiteTab',this._onSiteTabChange, this);
      this.mainRegion.show(this.layout);
    },

    _initializeBlacklistedSitesSearchView: function() {
      this.blacklistedSitesCollection = new BlockSites.BlacklistedSiteList();
      this.blacklistedSitesSearchView = new ReachUI.BlockToolComponents.SearchList({collection: this.blacklistedSitesCollection, placeholder:'Sites'});
      this.blacklistedSitesSearchView.on('SearchList:ItemClick', this._getSiteBlocks, this);
      this.blacklistedSitesSearchView.on('SearchList:SelectedItemReset', this._onSelectedItemReset, this);
      this.layout.blacklistedSitesSearchView.show(this.blacklistedSitesSearchView);
    },

    _initializeWhitelistedSitesSearchView: function() {
      this.WhitelistedSitesCollection = new BlockSites.WhitelistedSiteList();
      this.whitelistedSitesSearchView = new ReachUI.BlockToolComponents.SearchList({collection: this.WhitelistedSitesCollection, placeholder:'Sites'});
      this.whitelistedSitesSearchView.on('SearchList:ItemClick', this._getSiteBlocks, this);
      this.whitelistedSitesSearchView.on('SearchList:SelectedItemReset', this._onSelectedItemReset, this);
      this.layout.whitelistedSitesSearchView.show(this.whitelistedSitesSearchView);
    },

    _onSiteTabChange: function(tabName) {
      if (tabName === 'blacklistedSitesView') {
        this.siteMode = this.BLACKLISTED_SITE_MODE;
      } else {
        this.siteMode = this.WHITELISTED_SITE_MODE;
      }

      this.blacklistedSitesSearchView.resetSelection();
      this.whitelistedSitesSearchView.resetSelection();
      this.trigger('Change:SiteTab', this.siteMode);
    },

    _getSiteBlocks: function(sites) {
      this.trigger('Get:SiteBlocks', sites.pluck("id"));
    },

    _onSelectedItemReset: function() {
      this.trigger('SelectedItemReset');
    },

  });

})(ReachUI.namespace("BlockSites"));