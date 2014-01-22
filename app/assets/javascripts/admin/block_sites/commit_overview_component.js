(function(BlockSites) {
  'use strict';

// --------------------/ Region /------------------------------------

// --------------------/ Layout /------------------------------------

  BlockSites.CommitOverviewLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/block_sites/commit_overview_layout'],
    className: 'modal commit-overview-modal',

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

  BlockSites.BlacklistedAdvertisers = Backbone.Collection.extend({
    url: function() {
      return '/admin/block_sites/blacklisted_advertisers.json';
    },
  });

  BlockSites.BlacklistedAdvertiserGroups = Backbone.Collection.extend({
    url: function() {
      return '/admin/block_sites/blacklisted_advertiser_groups.json';
    },
  });


  BlockSites.WhitelistedAdvertisers = Backbone.Collection.extend({
    url: function() {
      return '/admin/block_sites/whitelisted_advertisers.json';
    },
  });

  BlockSites.WhitelistedAdvertiserGroups = Backbone.Collection.extend({
    url: function() {
      return '/admin/block_sites/whitelisted_advertiser_groups.json';
    },
  });

// --------------------/ Views /------------------------------------

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
      this.blacklistedAdvertiserList = new BlockSites.BlacklistedAdvertisers();
      this.blacklistedAdvertisersOverviewView = new BlockSites.AdvertisersOverviewView({collection: this.blacklistedAdvertiserList});
      this.layout.blacklistedAdvertisersOverviewView.show(this.blacklistedAdvertisersOverviewView);
      this.blacklistedAdvertiserList.fetch();
    },

    _initializeBlacklistedAdvertiserGroupsOverviewView: function() {
      this.blacklistedAdvertiserGroupList = new BlockSites.BlacklistedAdvertiserGroups();
      this.blacklistedAdvertiserGroupsOverviewView = new BlockSites.AdvertiserGroupsOverviewView({collection: this.blacklistedAdvertiserGroupList});
      this.layout.blacklistedAdvertiserGroupsOverviewView.show(this.blacklistedAdvertiserGroupsOverviewView);
      this.blacklistedAdvertiserGroupList.fetch();
    },

    _initializeWhitelistedAdvertisersOverviewView: function() {
      this.whitelistedAdvertiserList = new BlockSites.WhitelistedAdvertisers();
      this.whitelistedAdvertisersOverviewView = new BlockSites.AdvertisersOverviewView({collection: this.whitelistedAdvertiserList});
      this.layout.whitelistedAdvertisersOverviewView.show(this.whitelistedAdvertisersOverviewView);
      this.whitelistedAdvertiserList.fetch();
    },

    _initializeWhitelistedAdvertiserGroupsOverviewView: function() {
      this.whitelistedAdvertiserGroupList = new BlockSites.WhitelistedAdvertiserGroups();
      this.whitelistedAdvertiserGroupsOverviewView = new BlockSites.AdvertiserGroupsOverviewView({collection: this.whitelistedAdvertiserGroupList});
      this.layout.whitelistedAdvertiserGroupsOverviewView.show(this.whitelistedAdvertiserGroupsOverviewView);
      this.whitelistedAdvertiserGroupList.fetch();
    },

    _onCommit: function() {
      this.trigger('Commit:SiteBlock');
    },

  });

})(ReachUI.namespace("BlockSites"));