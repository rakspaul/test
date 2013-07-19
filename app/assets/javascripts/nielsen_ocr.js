(function(Ocr, Orders, Search, DMA) {
  'use strict';

  Ocr.Campaign = Backbone.Model.extend({
    defaults: {
      name: '',
      cost_type: 'cpp',
      trp_goal: 0,
      value: 0,
      target_gender: 'both',
      age_range: '2-PLUS'
    },

    url: function() {
      return ['/orders', this.get('order_id'), 'nielsen_campaign.json'].join('/');
    }
  });

  Ocr.CampaignDetailLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/nielsen_ocr/campaign_detail_layout'],

    regions: {
      details: ".details-region",
      dmas: ".dma-region",
      ads: ".ads-region"
    },

    triggers: {
      'click .save-campaign': 'campaign:save'
    },

    events: {
      'change #enable_ocr': '_onEnableOcr'
    },

    setEnableOcrStatus: function(visible) {
      this.$('.enable-ocr')[visible ? 'show':'hide']();
      this._setRegionsVisibility(!visible);
    },

    _onEnableOcr: function(e) {
      this._setRegionsVisibility(e.target.checked);
    },

    _setRegionsVisibility: function(visible) {
      this.$('.nielsen-campaign-form')[visible ? 'show':'hide']();
    }
  });

  Ocr.CampaignDetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/nielsen_ocr/campaign_detail'],
    ui: {
      name: '#name',
      value: '#value',
      trp_goal: '#trp_goal',
      target_gender: '#target_gender',
      age_range: '#age_range',
      imps_radio: '#imps_radio',
      cpp_radio: '#cpp_radio',
      cost_type_icon: '#cost_type_icon'
    },

    events: {
      'change input:radio[name=cost_type]': '_onCostTypeChange'
    },

    onRender: function() {
      this.ui.age_range.val(this.model.get('age_range'));
      this.ui.target_gender.val(this.model.get('target_gender'));
      this.ui.imps_radio.prop('checked', (this.model.get('cost_type') === "imps"));
      this.ui.cpp_radio.prop('checked', (this.model.get('cost_type') === "cpp"));
      this._onCostTypeChange();
    },

    getCostType: function() {
      return this.$('input:radio[name=cost_type]:checked').val();
    },

    _onCostTypeChange: function() {
      if(this.getCostType() === "cpp") {
        this.ui.cost_type_icon.addClass('icon-usd');
      } else {
        this.ui.cost_type_icon.removeClass('icon-usd');
      }
    }
  });

  Ocr.OcrRegion = Backbone.Marionette.Region.extend({
    el: "#details .content"
  });

  Ocr.OcrController = Marionette.Controller.extend({
    initialize: function(options) {
      var search = new Search.SearchQuery(),
        searchView = new Search.SearchQueryView({model: search}),
        searchOrderListView = null;

      this.ocrRegion = new Ocr.OcrRegion();
      this.orderList = new ReachUI.Orders.OrderList();

      this.dmaList = new DMA.List();
      this.dmaList.on('reset', function(collection, options) {
        collection.add(new DMA.Model(), {at: 0});
      });

      search.on('change:query', function(model) {
        this.orderList.fetch({data: {search: model.get('query'), ocr: true}});
      }, this);

      searchOrderListView = new Orders.ListView({el: '.order-search-result', collection: this.orderList})
      searchOrderListView.on("itemview:selected", function(view) {
        Ocr.router.navigate('/' + view.model.id, {trigger: true});
      });

      _.bindAll(this, '_onSaveCampaignSuccess');

      searchView.bindShortcutKey('s');
    },

    index: function() {
      this.orderList.fetch();
    },

    show: function(orderId) {
      this.selectedOrder = this.orderList.get(orderId);
      this.selectedOrder.select();

      if(!this.campaignDetailLayout) {
        this.campaignDetailLayout = new Ocr.CampaignDetailLayout();
        this.campaignDetailLayout.on('campaign:save', this._saveCampaign, this);

        this.ocrRegion.show(this.campaignDetailLayout);
      }

      this.campaignDetailLayout.setEnableOcrStatus(!this.selectedOrder.get('ocr_enabled'));

      var dmaSelect = new DMA.ChosenView({collection: this.dmaList});

      var campaign = new Ocr.Campaign({'order_id': orderId});
      var campaignDetailView = new Ocr.CampaignDetailView({model: campaign});

      this.campaignDetailLayout.details.show(campaignDetailView);
      this.campaignDetailLayout.dmas.show(dmaSelect);

      if(this.dmaList.length === 0) {
        this.dmaList.fetch({reset: true});
      }

      if(this.selectedOrder.get('ocr_enabled')) {
        campaign.fetch({ success: function() {
          campaignDetailView.render();
          dmaSelect.setDmaIds(campaign.get('dma_ids'));
        }});
      }
    },

    _saveCampaign: function(args) {
      var view = args.view,
        model = view.details.currentView.model,
        detailsView = view.details.currentView,
        dmasView = view.dmas.currentView;

      var _campaign = {
        name: detailsView.ui.name.val(),
        cost_type: detailsView.getCostType(),
        value: detailsView.ui.value.val(),
        trp_goal: detailsView.ui.trp_goal.val(),
        target_gender: detailsView.ui.target_gender.val(),
        age_range: detailsView.ui.age_range.val(),
        dma_ids: dmasView.$el.val()
      };

      model.save(_campaign, {
        success: this._onSaveCampaignSuccess,
        error: this._onSaveCampaignFailure
      });
    },

    _onSaveCampaignSuccess: function(model, response, options) {
      alert('Saved');
      this.selectedOrder.set({ocr_enabled: true});
      this.campaignDetailLayout.setEnableOcrStatus(!this.selectedOrder.get('ocr_enabled'));
    },

    _onSaveCampaignFailure: function(model, xhr, options) {
      if(xhr.responseJSON && xhr.responseJSON.errors) {
        var formErrors = [];

        _.each(xhr.responseJSON.errors, function(value, key) {
          formErrors.push(value);
        });

        alert("Error saving order. \n" + formErrors.join("\n"));
      }
    }
  });

  Ocr.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      '': 'index',
      ':id': 'show'
    }
  });
})(ReachUI.namespace("Ocr"), ReachUI.namespace("Orders"), ReachUI.namespace("Search"), ReachUI.namespace("DMA"));
