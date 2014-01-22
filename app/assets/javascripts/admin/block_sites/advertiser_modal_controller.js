(function(BlockSites) {
  'use strict';

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
      this.advertiserListView = new BlockSites.AdvertiserListView({siteMode: this.options.siteMode});
      this.advertiserListView.on('AdvertiserListView:Block:Advertiser', this._onBlockAdvertiser , this)
      this.layout.advertiserSearchView.show(this.advertiserListView);
    },

    _initializeAdvertiserPasteView: function() {
      this.pasteAdvertiserView = new BlockSites.PasteAdvertiserView({siteMode: this.options.siteMode});
      this.pasteAdvertiserView.on('PasteAdvertiserView:Block:Advertiser', this._onBlockAdvertiser, this)
      this.layout.advertiserPasteView.show(this.pasteAdvertiserView);
    },

    _onBlockAdvertiser: function(vos) {
      this.trigger('Block:Advertiser', vos);
    },

  });

})(ReachUI.namespace("BlockSites"));