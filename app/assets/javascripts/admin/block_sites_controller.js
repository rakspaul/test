(function(BlockSites) {
  'use strict';

  BlockSites.BlockSitesController = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
      this._initializeSiteListView();
      this._initializeBlockedAdvertiserListView();
      this._initializeBlockedAdvertiserGroupListView();
      _.bindAll(this, '_onSuccess', '_onError', '_onCommitSuccess', '_onCommitError');
    },

    _initializeLayout: function() {
      this.detailRegion = new BlockSites.DetailRegion();

      this.layout = new BlockSites.Layout();
      this.layout.on('Save:SiteBlock', this._onSaveSiteBlock, this);
      this.layout.on('Commit:SiteBlock', this._showCommitSummary, this);
      this.layout.on('Export:SiteBlock', this._onExportSiteBlock, this);

      this.detailRegion.show(this.layout);
      this.layout.addRegions({'modal': new BlockSites.ModalRegion({el:'#modal'})});
    },

    _initializeSiteListView: function() {
      this.sitesController = new BlockSites.SitesController({
        mainRegion: this.layout.siteListView
      });
      this.sitesController.on('Get:SiteBlocks', this._getSiteBlocks, this);
      this.sitesController.on('Change:SiteTab', this._onSiteTabChange, this);
    },

    _initializeBlockedAdvertiserListView: function() {
      this.blockedAdvertiserList = new BlockSites.BlockedAdvertiserList();
      this.blockedAdvertiserListView = new BlockSites.BlockedAdvertiserListView({collection: this.blockedAdvertiserList});
      this.blockedAdvertiserListView.on('Show:AdvertiserListView', this._showAdvertiserModalView, this);
      this.blockedAdvertiserListView.on('UnBlock:Advertiser', this._onUnblockAdvertiser, this);
      this.layout.blockedAdvertiserListView.show(this.blockedAdvertiserListView);
    },

    _initializeBlockedAdvertiserGroupListView: function() {
      this.blockedAdvertiserGroupList = new BlockSites.BlockedAdvertiserGroupList();
      this.blockedAdvertiserGroupListView = new BlockSites.BlockedAdvertiserGroupListView({collection: this.blockedAdvertiserGroupList});
      this.blockedAdvertiserGroupListView.on('Show:AdvertiserGroupModalView', this._showAdvertiserGroupModalView, this);
      this.blockedAdvertiserGroupListView.on('UnBlock:AdvertiserGroups', this._onUnblockAdvertiserGroup, this);
      this.layout.blockedAdvertiserGroupListView.show(this.blockedAdvertiserGroupListView);
    },

    _showAdvertiserGroupModalView:function() {
      var selectedSites = this.sitesController.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        this.advertiserGroupListModalView = new BlockSites.AdvertiserGroupListModalView();
        this.advertiserGroupListModalView.on('Block:AdvertiserGroup', this._onBlockAdvertiserGroup, this);
        this.layout.modal.show(this.advertiserGroupListModalView);
      }
    },

    // When user selects the site this method will fetch the blocked advertisers and advertiser blocks
    _getSiteBlocks: function(sites) {
      if(sites && sites.length > 0 ) {
        this.blockedAdvertiserList.setSites(sites);
        this.blockedAdvertiserGroupList.setSites(sites);
        this._fetchSiteBlocks();
      } else {
        this.blockedAdvertiserList.reset();
        this.blockedAdvertiserGroupList.reset();
      }
    },

    _onSiteTabChange: function(tab_name) {
      if (tab_name === 'blacklistedSitesView') {
        this.blockedAdvertiserListView.setText('Blacklisted Advertisers');
        this.blockedAdvertiserGroupListView.show();
      } else{
        this.blockedAdvertiserListView.setText('Whitelisted Advertisers');
        this.blockedAdvertiserGroupListView.hide();
      }
    },

    _fetchSiteBlocks: function() {
      var self = this;
      this.siteToUnblock = [];
      this.blockedAdvertiserList.fetch({reset:true}).then(function() {
        self.blockedAdvertiserList.sort();
      });

      this.blockedAdvertiserGroupList.fetch({reset:true}).then(function() {
        self.blockedAdvertiserGroupList.sort();
      });
    },

    _showAdvertiserModalView: function() {
      var selectedSites = this.sitesController.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        this.advertiserListModalController = new BlockSites.AdvertiserListModalController({
          mainRegion: this.layout.modal
        });

        this.advertiserListModalController.on('Block:Advertiser', this._onBlockAdvertiser, this);
      }
    },

    // When user selects advertiser to block
    // First check if that site exists in the list
    // If No create new object and add it to the list
    // If Yes add selected advertiser to the list

    _onBlockAdvertiser: function(vos) {
      var selectedSites = this.sitesController.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        for (var i = 0; i < selectedSites.length; i++) {
          // check for the site exist in block site list
          var selectedSite = selectedSites[i],
          blockedAdvertisers = this._createAdvertiserModelArray(vos, selectedSite.id),
          site = this.blockedAdvertiserList.findWhere({site_id: selectedSite.id});

          if(!site) {
            // site is not there add to blockedAdvertiserList collection
            var blockedAdvertiser = this._createNewBlockedAdvertiser(selectedSite.id, selectedSite.get('name'), blockedAdvertisers)
            this.blockedAdvertiserList.add(blockedAdvertiser);
          } else {
            // site exist need to check if user is adding same advertisers or new one
            blockedAdvertisers.each(function(blockedAdvertiser) {
              if(!site.hasAdvertiser(blockedAdvertiser.get('advertiser_id'))) {
                site.addAdvertiser(blockedAdvertiser);
              }
            }, this);
          }
        }
      }
    },

    _createNewBlockedAdvertiser: function(site_id, site_name, advertisers) {
      var newBlockedAdvertiser = new BlockSites.BlockedAdvertiser({
        site_id: site_id,
        site_name: site_name,
        advertisers: advertisers
      });
      return newBlockedAdvertiser;
    },

    _createAdvertiserModelArray: function(vos, site_id) {
      var advertisers = new BlockSites.AdvertiserList();
      for (var i = 0; i < vos.length; i++) {
        var advertiser = this._createAdvertiserModel(vos[i], site_id);
        advertisers.add(advertiser);
      }
      return advertisers;
    },

    _createAdvertiserModel: function(advertiser, site_id) {
      var advertiser_id = advertiser.id,
      name = advertiser.get('name'),
      default_block = advertiser.get('default_block');

      return new BlockSites.Advertiser({site_id: site_id, advertiser_id: advertiser_id, advertiser_name: name, default_block: default_block})
    },

    _onUnblockAdvertiser: function(advertisers) {
      this.siteToUnblock = this.siteToUnblock.concat(advertisers);
    },

    _onUnblockAdvertiserGroup: function(advertiser_groups) {
      this.siteToUnblock = this.siteToUnblock.concat(advertiser_groups);
    },

    // When user selects advertiser block to block
    // First check if that site exists in the list
    // If No create new object and add it to the list
    // If Yes add selected advertiser block to the list

    _onBlockAdvertiserGroup: function(vos) {
      var selectedSites = this.sitesController.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        for (var i = 0; i < selectedSites.length; i++) {
          // check for the site exist in block site list
          var selectedSite = selectedSites[i],
          blockedAdvertiserGroups = this._createAdvertiserGroupModelArray(vos, selectedSite.id),
          site = this.blockedAdvertiserGroupList.findWhere({site_id: selectedSite.id});

          if(!site) {
            // site is not there add to blockedAdvertiserBlockList collection
            var blockedAdvertiserGroup = this._createNewBlockedAdvertiserGroup(selectedSite.id, selectedSite.get('name'), blockedAdvertiserGroups);
            this.blockedAdvertiserGroupList.add(blockedAdvertiserGroup);
          } else {
            // site exist need to check if user is adding same advertisers or new one
            blockedAdvertiserGroups.each(function(blockedAdvertiserGroup) {
              if(!site.hasAdvertiserGroup(blockedAdvertiserGroup.get('advertiser_group_id'))) {
                site.addAdvertiserGroup(blockedAdvertiserGroup);
              }
            }, this);
          }
        }
      }
    },

    _createNewBlockedAdvertiserGroup: function(site_id, site_name, blockedAdvertiserGroups) {
      var newBlockedAdvertiserGroup = new BlockSites.BlockedAdvertiserGroup({
        site_id: site_id,
        site_name: site_name,
        advertiserGroups: blockedAdvertiserGroups
      });
      return newBlockedAdvertiserGroup;
    },

    _createAdvertiserGroupModelArray: function(vos, site_id) {
      var blockedAdvertiserGroups = new BlockSites.BlockedAdvertiserGroupList();
      for (var i = 0; i < vos.length; i++) {
        var blockedAdvertiserGroup = this._createAdvertiserGroupModel(vos[i], site_id);
        blockedAdvertiserGroups.push(blockedAdvertiserGroup);
      }
      return blockedAdvertiserGroups;
    },

    _createAdvertiserGroupModel: function(advertiser_group, site_id) {
      var advertiser_group_id = advertiser_group.id,
      name = advertiser_group.get('name');

      return new BlockSites.AdvertiserGroup({site_id: site_id, advertiser_group_id: advertiser_group_id, advertiser_group_name: name})
    },


    // Check the collection for new object using backbone's isNew() method
    _onSaveSiteBlock: function(event) {
      var para = {};
      var blockedAdvertisers = this._blockAdvertiser(),
      blockedAdvertiserGroups = this._blockAdvertiserGroup(),
      unblockedSites = this._unblockedSites();

      if (blockedAdvertisers.length > 0 ) {
        para.blocked_advertisers = JSON.stringify(blockedAdvertisers);
      }

      if (blockedAdvertiserGroups.length > 0) {
        para.blocked_advertiser_groups = JSON.stringify(blockedAdvertiserGroups);
      }

      if (unblockedSites.length > 0) {
        para.unblocked_sites = JSON.stringify(unblockedSites);
      }

      if (blockedAdvertisers.length > 0 || blockedAdvertiserGroups.length > 0 || unblockedSites.length > 0) {
        this.layout.ui.saveBlock.text('Saving...').attr('disabled','disabled');
        $.ajax({type: "POST", url: '/admin/block_sites', data: para, success: this._onSuccess, error: this._onError, dataType: 'json'});
      }

    },

    _blockAdvertiser: function() {
      var newBlockedAdvertisers = [];

      this.blockedAdvertiserList.each(function(site) {
        site.getAdvertisers().each(function(advertiser) {
          if(advertiser.isNew()) {
            newBlockedAdvertisers.push(advertiser.toJSON());
          }
        })
      }, this);

      return newBlockedAdvertisers;
    },

    _blockAdvertiserGroup: function(fetch_records) {
      // find out newly added advertisers
      var newBlockedAdvertiserGroup = [];

      this.blockedAdvertiserGroupList.each(function(site) {
        site.getAdvertiserGroups().each(function(advertiser_group) {
          if(advertiser_group.isNew()) {
            newBlockedAdvertiserGroup.push(advertiser_group.toJSON());
          }
        })
      }, this);

      return newBlockedAdvertiserGroup;
    },

    _unblockedSites: function() {
      var array = this.siteToUnblock,
      unblock = [];

      if (array && array.length > 0) {
        for (var i = 0; i < array.length; i++) {
          if (!array[i].isNew()) {
            unblock.push(array[i]);
          }
        }
      }

      return unblock;
    },

    _onSuccess: function(event) {
      this.layout.ui.saveBlock.text('Save').removeAttr('disabled');
      this._fetchSiteBlocks();
      alert('Your changes were successfully saved.');
    },

    _onError: function(event) {
      this.layout.ui.saveBlock.text('Save').removeAttr('disabled');
      alert('An error occurred while saving your changes.');
    },

    _showCommitSummary: function(event) {
      this.commitOverviewController = new BlockSites.CommitOverviewController({
        mainRegion: this.layout.modal
      });
      this.commitOverviewController.on('Commit:SiteBlock', this._onCommitSiteBlock, this);
    },

    _onCommitSiteBlock: function(event) {
      $.ajax({type: "POST", url: '/admin/block_sites/commit.json', success: this._onCommitSuccess, error: this._onCommitError, dataType: 'json'});
    },

    _onCommitSuccess: function(event) {
      alert(event.message);
    },

    _onCommitError: function(event) {
      alert('An error occurred while committing your changes.');
    },

    _onExportSiteBlock: function(event) {
      var selectedSiteIds = this.sitesController.getSelectedSiteIds();
      if (selectedSiteIds && selectedSiteIds.length > 0) {
        window.location = '/admin/block_sites/export_sites.xls?site_ids='+selectedSiteIds.join(',');
      }
    },

  });

})(ReachUI.namespace("BlockSites"));