(function(BlockSites) {
  'use strict';

  BlockSites.BlockSitesController = Marionette.Controller.extend({
    initialize: function() {
      this._isBlacklistedSiteMode = true;
      this._deletedAdvertisers = [];
      this._deletedAdvertiserGroups = [];

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
      this.sitesController.on('SelectedItemReset', this._onSiteSelectedItemReset, this);
      this.sitesController.on('Change:SiteTab', this._onSiteTabChange, this);
    },

    _initializeBlockedAdvertiserListView: function() {
      this.blockedAdvertiserList = new BlockSites.AdvertiserBlockList();
      this.blockedAdvertiserListView = new BlockSites.BlockedAdvertiserListView({collection: this.blockedAdvertiserList, isBlacklistedSiteMode: this._isBlacklistedSiteMode});
      this.blockedAdvertiserListView.on('Show:AdvertiserListView', this._showAdvertiserModalView, this);
      this.blockedAdvertiserListView.on('Delete:Advertiser', this._onAdvertiserDelete, this);
      this.layout.blockedAdvertiserListView.show(this.blockedAdvertiserListView);
    },

    _initializeBlockedAdvertiserGroupListView: function() {
      this.blockedAdvertiserGroupList = new BlockSites.AdvertiserGroupBlockList();
      this.blockedAdvertiserGroupListView = new BlockSites.BlockedAdvertiserGroupListView({collection: this.blockedAdvertiserGroupList});
      this.blockedAdvertiserGroupListView.on('Show:AdvertiserGroupModalView', this._showAdvertiserGroupModalView, this);
      this.blockedAdvertiserGroupListView.on('Delete:AdvertiserGroup', this._onAdvertiserGroupDelete, this);
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

    _onSiteSelectedItemReset: function() {
      this.blockedAdvertiserList.reset();
      this.blockedAdvertiserGroupList.reset();
    },

    _onSiteTabChange: function(siteMode) {
      if (siteMode === this.sitesController.BLACKLISTED_SITE_MODE) {
        this._isBlacklistedSiteMode = true;
        this.blockedAdvertiserListView.setText('Blacklisted Advertisers');
        this.blockedAdvertiserGroupListView.show();
      } else{
        this._isBlacklistedSiteMode = false;
        this.blockedAdvertiserListView.setText('Whitelisted Advertisers');
        this.blockedAdvertiserGroupListView.hide();
      }

      this._deletedAdvertisers = [];
      this._deletedAdvertiserGroups = [];
      this.blockedAdvertiserListView.setSiteMode(this._isBlacklistedSiteMode);
    },

    _fetchSiteBlocks: function() {
      var self = this;

      this._deletedAdvertisers = [];
      this._deletedAdvertiserGroups = [];

      if (this._isBlacklistedSiteMode) {
        this.blockedAdvertiserList.fetchBlacklistedAdvertisers().then(function() {
          self.blockedAdvertiserList.sort();
        });

        this.blockedAdvertiserGroupList.fetch({reset:true}).then(function() {
          self.blockedAdvertiserGroupList.sort();
        });
      } else {
        this.blockedAdvertiserList.fetchWhitelistedAdvertisers().then(function() {
          self.blockedAdvertiserList.sort();
        });
      }
    },

    _onAdvertiserDelete: function(advertiser) {
      this._deletedAdvertisers.push(advertiser);
    },

    _onAdvertiserGroupDelete: function(advertiserGroup) {
      this._deletedAdvertiserGroups.push(advertiserGroup);
    },

    _showAdvertiserModalView: function() {
      var selectedSites = this.sitesController.getSelectedSites();
      if (selectedSites && selectedSites.length > 0) {
        this.advertiserListModalController = new BlockSites.AdvertiserListModalController({
          mainRegion: this.layout.modal,
          isBlacklistedSiteMode: this._isBlacklistedSiteMode
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

          blockedAdvertisers.each(function(blockedAdvertiser) {
            if(!site.hasAdvertiser(blockedAdvertiser.get('advertiser_id'))) {
              site.get('advertisers').add(blockedAdvertiser, {silent: 'true'});
            }
          }, this);

          this.blockedAdvertiserList.trigger('reset');
        }
      }
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
      default_block = advertiser.get('default_block'),
      state = this._isBlacklistedSiteMode ? 'PENDING_BLOCK' : 'PENDING_UNBLOCK';

      return new BlockSites.Advertiser({
        site_id: site_id,
        advertiser_id: advertiser_id,
        advertiser_name: name,
        default_block: default_block,
        state: state
      })
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

          blockedAdvertiserGroups.each(function(blockedAdvertiserGroup) {
            if(!site.hasAdvertiserGroup(blockedAdvertiserGroup.get('advertiser_group_id'))) {
              site.addAdvertiserGroup(blockedAdvertiserGroup);
            }
          }, this);
        }
      }
    },

    _createAdvertiserGroupModelArray: function(vos, site_id) {
      var blockedAdvertiserGroups = new BlockSites.AdvertiserGroupBlockList();
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
      var para = {},
      blacklistedAdvertisers = [],
      whitelistedAdvertisers = [],

      deletedAdvertisers = [],

      blockedAdvertisers = [],
      unblockAdvertisers = [],

      blacklistedAdvertiserGroups = [],
      whitelistedAdvertiserGroups = [],

      deletedAdvertiserGroups = [],
      blockedAdvertiserGroups = [],


      whitelistedAdvertisers = this._getWhitelistedAdvertisers();
      blacklistedAdvertisers = this._getBlacklistedAdvertisers();

      deletedAdvertisers = this._getDeletedAdvertisers();

      blockedAdvertisers = this._getBlockedAdvertisers();
      unblockAdvertisers = this._getUnblockedAdvertisers();

      whitelistedAdvertiserGroups = this._getWhitelistedAdvertiserGroups();
      blacklistedAdvertiserGroups = this._getBlacklistedAdvertiserGroups();

      deletedAdvertiserGroups = this._getDeletedAdvertiserGroups();
      blockedAdvertiserGroups = this._getBlockedAdvertiserGroups();

      if (this._isBlacklistedSiteMode && deletedAdvertisers.length > 0) {
        para.deletedBlacklistedAdvertisers = JSON.stringify(deletedAdvertisers);
      } else if (deletedAdvertisers.length > 0) {
        para.deletedWhitelistedAdvertisers = JSON.stringify(deletedAdvertisers);
      }

      if (whitelistedAdvertisers.length > 0) {
        para.whitelistedAdvertisers = JSON.stringify(whitelistedAdvertisers);
      }

      if (blacklistedAdvertisers.length > 0 ) {
        para.blacklistedAdvertisers = JSON.stringify(blacklistedAdvertisers);
      }

      if (blockedAdvertisers.length > 0 ) {
        para.blockedAdvertisers = JSON.stringify(blockedAdvertisers);
      }

      if (unblockAdvertisers.length > 0 ) {
        para.unblockAdvertisers = JSON.stringify(unblockAdvertisers);
      }

      if (whitelistedAdvertiserGroups.length > 0) {
        para.whitelistedAdvertiserGroups = JSON.stringify(whitelistedAdvertiserGroups);
      }

      if (blacklistedAdvertiserGroups.length > 0) {
        para.blacklistedAdvertiserGroups = JSON.stringify(blacklistedAdvertiserGroups);
      }

      if (deletedAdvertiserGroups.length > 0) {
        para.deletedAdvertiserGroups = JSON.stringify(deletedAdvertiserGroups);
      }

      if (blockedAdvertiserGroups.length > 0) {
        para.blockedAdvertiserGroups = JSON.stringify(blockedAdvertiserGroups);
      }

      if (blacklistedAdvertisers.length > 0 || blacklistedAdvertiserGroups.length > 0 ||
          whitelistedAdvertisers.length > 0 || whitelistedAdvertiserGroups.length > 0 ||
          deletedAdvertisers.length > 0 || blockedAdvertisers.length > 0 ||
          unblockAdvertisers.length > 0 || whitelistedAdvertiserGroups.length > 0 ||
          blacklistedAdvertiserGroups.length > 0 || deletedAdvertiserGroups.length > 0 ||
          blockedAdvertiserGroups.length > 0) {
        this.layout.ui.saveBlock.text('Saving...').attr('disabled','disabled');
        $.ajax({type: "POST", url: '/admin/block_sites', data: para, success: this._onSuccess, error: this._onError, dataType: 'json'});
      } else {
        this._fetchSiteBlocks();
      }

    },

    _getWhitelistedAdvertisers: function() {
      var advertisers = [],
      self = this;

      this.blockedAdvertiserList.each(function(site) {
        site.getAdvertisers().each(function(advertiser) {
          if (self._isBlacklistedSiteMode) {
            if (advertiser.isModified() && advertiser.isPendingUnBlock()) {
              advertisers.push(advertiser);
            }
          } else {
            if (advertiser.isNew() && advertiser.isPendingUnBlock()) {
              advertisers.push(advertiser);
            }
          }
        })
      }, this);
      return advertisers;
    },

    _getBlacklistedAdvertisers: function() {
      var advertisers = [],
      self = this;

      this.blockedAdvertiserList.each(function(site) {
        site.getAdvertisers().each(function(advertiser) {
          if (self._isBlacklistedSiteMode) {
            if (advertiser.isNew() && advertiser.isPendingBlock()) {
              advertisers.push(advertiser);
            }
          } else {
            if (advertiser.isModified() && advertiser.isPendingBlock()) {
              advertisers.push(advertiser);
            }
          }
        })
      }, this);

      return advertisers;
    },

    _getDeletedAdvertisers: function() {
      var advertisers = [];

      for (var i = 0; i < this._deletedAdvertisers.length; i++) {
        var advertiser = this._deletedAdvertisers[i];
          if (!advertiser.isNew()) {
            advertisers.push(advertiser);
          }
      }
      return advertisers;
    },

    _getBlockedAdvertisers: function() {
      var advertisers = [];

      this.blockedAdvertiserList.each(function(site) {
        site.getAdvertisers().each(function(advertiser) {
          if (advertiser.isModified() && advertiser.isBlocked()) {
            advertisers.push(advertiser);
          }
        })
      }, this);
      return advertisers;
    },

    _getUnblockedAdvertisers: function() {
      var advertisers = [];

      this.blockedAdvertiserList.each(function(site) {
        site.getAdvertisers().each(function(advertiser) {
          if (advertiser.isModified() && advertiser.isUnBlocked()) {
            advertisers.push(advertiser);
          }
        })
      }, this);
      return advertisers;
    },

    _getWhitelistedAdvertiserGroups: function() {
      var advertiserGroups = [];

      this.blockedAdvertiserGroupList.each(function(site) {
        site.getAdvertiserGroups().each(function(advertiser_group) {
          if(advertiser_group.isModified() && advertiser_group.isPendingUnBlock()) {
            advertiserGroups.push(advertiser_group.toJSON());
          }
        })
      }, this);

      return advertiserGroups;
    },

    _getBlacklistedAdvertiserGroups: function() {
      var advertiserGroups = [];

      this.blockedAdvertiserGroupList.each(function(site) {
        site.getAdvertiserGroups().each(function(advertiser_group) {
          if(advertiser_group.isNew() && advertiser_group.isPendingBlock()) {
            advertiserGroups.push(advertiser_group.toJSON());
          }
        })
      }, this);

      return advertiserGroups;
    },

    _getDeletedAdvertiserGroups: function() {
      var advertiserGroups = [];

      for (var i = 0; i < this._deletedAdvertiserGroups.length; i++) {
        var advertiser_group = this._deletedAdvertiserGroups[i];
          if(!advertiser_group.isNew()) {
            advertiserGroups.push(advertiser_group.toJSON());
          }
      };

      // this.blockedAdvertiserGroupList.each(function(site) {
      //   site.getAdvertiserGroups().each(function(advertiser_group) {
      //     if(!advertiser_group.isNew() && advertiser_group.isDeleted()) {
      //       advertiserGroups.push(advertiser_group.toJSON());
      //     }
      //   })
      // }, this);
      return advertiserGroups;
    },

    _getBlockedAdvertiserGroups: function() {
      var advertiserGroups = [];

      this.blockedAdvertiserGroupList.each(function(site) {
        site.getAdvertiserGroups().each(function(advertiser_group) {
          if(advertiser_group.isModified() && advertiser_group.isBlocked()) {
            advertiserGroups.push(advertiser_group.toJSON());
          }
        })
      }, this);

      return advertiserGroups;
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
      this._fetchSiteBlocks();
      alert(event.message);

    },

    _onCommitError: function(event) {
      alert('An error occurred while committing your changes.');
    },

    _onExportSiteBlock: function(event) {
      var selectedSiteIds = this.sitesController.getSelectedSiteIds();
      if (selectedSiteIds && selectedSiteIds.length > 0) {
        if(this._isBlacklistedSiteMode) {
          window.location = '/admin/block_sites/export_blacklisted_advertisers_and_groups.xls?site_ids='+selectedSiteIds.join(',');
        } else {
          window.location = '/admin/block_sites/export_whitelisted_advertisers.xls?site_ids='+selectedSiteIds.join(',');
        }
      }
    },

  });

})(ReachUI.namespace("BlockSites"));