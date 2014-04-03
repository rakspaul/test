(function(BlockSites) {
  'use strict';

// --------------------/ Region /------------------------------------

// --------------------/ Layout /------------------------------------

  BlockSites.AdvertiserGroupOverviewLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/block_sites/advertiser_and_advertiser_group_overview_layout'],
    regions: {
      tableView : '#tableView',
      pagingView : '#pagingView',
    },
  });

// --------------------/ Models /------------------------------------

// --------------------/ Views /-------------------------------------

  BlockSites.AdvertiserGroupEmptyView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: _.template('<td colspan="4" style="text-align:center;"> No Advertiser Groups found. </td>'),
  });


  BlockSites.AdvertiserGroupsOverviewItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: JST['templates/admin/block_sites/advertiser_group_overview_row_view'],
  });


  BlockSites.AdvertiserGroupsOverviewView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/advertiser_group_overview_view'],
    itemView: BlockSites.AdvertiserGroupsOverviewItemView,
    itemViewContainer: 'tbody',
    emptyView: BlockSites.AdvertiserGroupEmptyView
  });

// --------------------/ Controller /------------------------------------

  BlockSites.AdvertiserGroupOverviewController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      this._initializeLayout();
      this._initializeAdvertiserGroupsOverviewView(this.options.model.advertiserGroups);
      this._initializePagingView(this.options.model);
    },

    _initializeLayout: function() {
      this.layout = new BlockSites.AdvertiserGroupOverviewLayout();
      this.mainRegion.show(this.layout);
    },

    _initializeAdvertiserGroupsOverviewView: function(advertiserGroups) {
      this.advertiserGroupsOverviewView = new BlockSites.AdvertiserGroupsOverviewView({collection: advertiserGroups})
      this.layout.tableView.show(this.advertiserGroupsOverviewView);
    },

    _initializePagingView: function(model) {
      this.pagingView = new BlockSites.PaginationView({model: model.pagination});
      this.layout.pagingView.show(this.pagingView);
    },
  });

})(ReachUI.namespace("BlockSites"));