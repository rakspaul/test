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

  BlockSites.Advertisers = Backbone.Collection.extend({});

  BlockSites.BlacklistedAdvertiserMetaData = Backbone.Model.extend({
    url: '/admin/block_sites/blacklisted_advertisers_to_commit.json',

    constructor: function() {
      this.pagination = new BlockSites.Pagination();
      this.advertisers = new BlockSites.Advertisers();

      Backbone.Model.apply(this, arguments);
    },

    initialize: function() {
      this.pagination.on('change:current_page', this._fetchRecords, this);
    },

    parse: function(response, options) {
      this.advertisers.reset(response.records);
      this.pagination.setTotalRecords(response.total_records);
      delete response.records;
      return response;
    },

    _fetchRecords: function() {
      this.fetch({data: this._toQueryParam()});
    },

    _toQueryParam: function() {
      var params = {
        pagesize: this.pagination.get('page_size'),
        pagestart: this.pagination.getOffset()
      };

      return params
    }

  });


  BlockSites.WhitelistedAdvertisersMetaData = Backbone.Model.extend({
    url: '/admin/block_sites/whitelisted_advertisers_to_commit.json',

    constructor: function() {
      this.pagination = new BlockSites.Pagination();
      this.advertisers = new BlockSites.Advertisers();

      Backbone.Model.apply(this, arguments);
    },

    initialize: function() {
      this.pagination.on('change:current_page', this._fetchRecords, this);
    },

    parse: function(response, options) {
      this.advertisers.reset(response.records);
      this.pagination.setTotalRecords(response.total_records);

      delete response.records;
      return response;
    },

    _fetchRecords: function() {
      this.fetch({data: this._toQueryParam()});
    },

    _toQueryParam: function() {
      var params = {
        pagesize: this.pagination.get('page_size'),
        pagestart: this.pagination.getOffset()
      };

      return params
    }

  });

  BlockSites.AdvertiserGroups = Backbone.Collection.extend({});

  BlockSites.BlacklistedAdvertiserGroupsMetaData = Backbone.Model.extend({
    url: '/admin/block_sites/blacklisted_advertiser_groups_to_commit.json',

    constructor: function() {
      this.pagination = new BlockSites.Pagination();
      this.advertiserGroups = new BlockSites.AdvertiserGroups();

      Backbone.Model.apply(this, arguments);
    },

    initialize: function() {
      this.pagination.on('change:current_page', this._fetchRecords, this);
    },

    parse: function(response, options) {
      this.advertiserGroups.reset(response.records);
      this.pagination.setTotalRecords(response.total_records);

      delete response.records;
      return response;
    },

    _fetchRecords: function() {
      this.fetch({data: this._toQueryParam()});
    },

    _toQueryParam: function() {
      var params = {
        pagesize: this.pagination.get('page_size'),
        pagestart: this.pagination.getOffset()
      };

      return params
    }

  });

  BlockSites.WhitelistedAdvertiserGroupsMetaData = Backbone.Model.extend({
    url: '/admin/block_sites/whitelisted_advertiser_groups_to_commit.json',

    constructor: function() {
      this.pagination = new BlockSites.Pagination();
      this.advertiserGroups = new BlockSites.AdvertiserGroups();

      Backbone.Model.apply(this, arguments);
    },

    initialize: function() {
      this.pagination.on('change:current_page', this._fetchRecords, this);
    },

    parse: function(response, options) {
      this.advertiserGroups.reset(response.records);
      this.pagination.setTotalRecords(response.total_records);

      delete response.records;
      return response;
    },

    _fetchRecords: function() {
      this.fetch({data: this._toQueryParam()});
    },

    _toQueryParam: function() {
      var params = {
        pagesize: this.pagination.get('page_size'),
        pagestart: this.pagination.getOffset()
      };

      return params
    }

  });

// --------------------/ Views /------------------------------------

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
      this.blacklistedAdvertiserMetaData = new BlockSites.BlacklistedAdvertiserMetaData();
      this.blacklistedAdvertiserOverviewController = new BlockSites.AdvertiserOverviewController({
        mainRegion: this.layout.blacklistedAdvertisersOverviewView,
        model: this.blacklistedAdvertiserMetaData
      });
      this.blacklistedAdvertiserMetaData.fetch();
    },

    _initializeBlacklistedAdvertiserGroupsOverviewView: function() {
      this.blacklistedAdvertiserGroupMetaData = new BlockSites.BlacklistedAdvertiserGroupsMetaData();
      this.blacklistedAdvertiserGroupsOverviewView = new BlockSites.AdvertiserGroupOverviewController({
        mainRegion: this.layout.blacklistedAdvertiserGroupsOverviewView,
        model: this.blacklistedAdvertiserGroupMetaData
      });
      this.blacklistedAdvertiserGroupMetaData.fetch();
    },

    _initializeWhitelistedAdvertisersOverviewView: function() {
      this.whitelistedAdvertisersMetaData = new BlockSites.WhitelistedAdvertisersMetaData();
      this.whitelistedAdvertiserOverviewController = new BlockSites.AdvertiserOverviewController({
        mainRegion: this.layout.whitelistedAdvertisersOverviewView,
        model: this.whitelistedAdvertisersMetaData
      });
      this.whitelistedAdvertisersMetaData.fetch();
    },

    _initializeWhitelistedAdvertiserGroupsOverviewView: function() {
      this.whitelistedAdvertiserGroupsMetaData = new BlockSites.WhitelistedAdvertiserGroupsMetaData();
      this.whitelistedAdvertiserGroupsOverviewView = new BlockSites.AdvertiserGroupOverviewController({
        mainRegion: this.layout.whitelistedAdvertiserGroupsOverviewView,
        model: this.whitelistedAdvertiserGroupsMetaData
      });
      this.whitelistedAdvertiserGroupsMetaData.fetch();
    },

    _onCommit: function() {
      this.trigger('Commit:SiteBlock');
    },

  });

})(ReachUI.namespace("BlockSites"));