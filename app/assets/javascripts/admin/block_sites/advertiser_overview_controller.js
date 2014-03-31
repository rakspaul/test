(function(BlockSites) {
  'use strict';

// --------------------/ Region /------------------------------------

// --------------------/ Layout /------------------------------------

  BlockSites.AdvertiserOverviewLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/block_sites/advertiser_and_advertiser_group_overview_layout'],
    regions: {
      tableView : '#tableView',
      pagingView : '#pagingView',
    },
  });

// --------------------/ Models /------------------------------------

// --------------------/ Views /------------------------------------

  BlockSites.AdvertiserEmptyView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: _.template('<td colspan="4" style="text-align:center;"> No Advertisers found. </td>'),
  });

  BlockSites.AdvertisersOverviewItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: JST['templates/admin/block_sites/advertiser_overview_row_view'],
  });

  BlockSites.AdvertisersOverviewView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_overview_view'],
    itemView: BlockSites.AdvertisersOverviewItemView,
    itemViewContainer: 'tbody',
    emptyView: BlockSites.AdvertiserEmptyView
  });

// --------------------/ Controller /------------------------------------

  BlockSites. AdvertiserOverviewController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      this._initializeLayout();
      this._initializeAdvertisersOverviewView(this.options.model.advertisers);
      this._initializePagingView(this.options.model);
    },

    _initializeLayout: function() {
      this.layout = new BlockSites.AdvertiserOverviewLayout();
      this.mainRegion.show(this.layout);
    },

    _initializeAdvertisersOverviewView: function(collection) {
      this.advertisersOverviewView = new BlockSites.AdvertisersOverviewView({collection: collection});
      this.layout.tableView.show(this.advertisersOverviewView);
    },

    _initializePagingView: function(model) {
      this.pagingView = new BlockSites.PaginationView({model: model.pagination});
      this.layout.pagingView.show(this.pagingView);
    }
  });

})(ReachUI.namespace("BlockSites"));