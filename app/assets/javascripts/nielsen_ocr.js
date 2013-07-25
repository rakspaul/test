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

  Ocr.Ad = Backbone.Model.extend({ });

  Ocr.Ads = Backbone.Collection.extend({
    model: Ocr.Ad
  });

  Ocr.AdView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    className: 'ad',
    template: _.template('<td><%= id %></td><td><%= name %></td>')
  });

  Ocr.Lineitem = Backbone.Model.extend({
    constructor: function() {
      this.ads = new Ocr.Ads();
      Backbone.Model.apply(this, arguments);
    },

    parse: function(response, options) {
      this.ads.reset(response.ads);

      delete response.ads;

      return response;
    }
  });

  Ocr.Lineitems = Backbone.Collection.extend({
    model: Ocr.Lineitem
  });

  Ocr.LineItemView = Backbone.Marionette.CompositeView.extend({
    className: 'lineitem-view',
    template: JST['templates/nielsen_ocr/lineitem_with_ads'],
    itemViewContainer: "tbody",
    itemView: Ocr.AdView,

    initialize: function() {
      this.collection = this.model.ads;
    }
  });

  Ocr.LineItemEmptyView = Backbone.Marionette.ItemView.extend({
    className: 'no-ads',
    template: _.template('No ad associated with order.')
  });

  Ocr.LineItemListView = Backbone.Marionette.CollectionView.extend({
    className: 'lineitem-list-view',
    itemView: Ocr.LineItemView,
    emptyView: Ocr.LineItemEmptyView
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

    setEnableOcrStatus: function(enabled) {
      this.$('.enable-ocr')[enabled ? 'show':'hide']();
      this.$('#enable_ocr').prop('checked', !enabled);
      this._setRegionsVisibility(!enabled);
    },

    _onEnableOcr: function(e) {
      this._setRegionsVisibility(e.target.checked);
      this.trigger('enable-ocr:checked', e.target.checked);
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
      this.orderList = new ReachUI.Orders.OrderList([], {
        url: '/nielsen_ocrs/search.json'
      });

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
      var order = this.orderList.get(orderId);
      if(!order) {
        var self = this;
        order = new Orders.Order({'id': orderId});
        order.fetch().done(function() {
          self.orderList.add(order);
          self._showCampaign(order);
        }).fail(function(error) {
          alert('Order not found. Id: ' + orderId);
        });
      } else {
        this._showCampaign(order);
      }
    },

    _showCampaign: function(order) {
      this.selectedOrder = order;
      this.selectedOrder.select();

      if(!this.campaignDetailLayout) {
        this.campaignDetailLayout = new Ocr.CampaignDetailLayout();
        this.campaignDetailLayout.on('campaign:save', this._saveCampaign, this);
        this.campaignDetailLayout.on('enable-ocr:checked', this._loadCampaign, this);

        this.ocrRegion.show(this.campaignDetailLayout);
      }

      this.campaignDetailLayout.setEnableOcrStatus(!this.selectedOrder.get('ocr_enabled'));
      if(this.selectedOrder.get('ocr_enabled')) {
        this._loadCampaign();
      }
    },

    _loadCampaign: function() {
      var dmaSelect = new DMA.ChosenView({collection: this.dmaList});

      var campaign = new Ocr.Campaign({'order_id': this.selectedOrder.id});
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

      this.lineitems = new Ocr.Lineitems([], {url: '/orders/' + this.selectedOrder.id + '/nielsen_campaign/ads.json'});
      var lineitemListView = new Ocr.LineItemListView({collection: this.lineitems});
      this.campaignDetailLayout.ads.show(lineitemListView);
      this.lineitems.fetch();
    },

    _saveCampaign: function(args) {
      var view = args.view,
        model = view.details.currentView.model,
        detailsView = view.details.currentView,
        dmasView = view.dmas.currentView,
        adsView = view.ads.currentView;

      var lis = {};
      adsView.$('input.cpp').each(function(index, cpp) {
        var key = cpp.getAttribute('data-lineitem');
        lis[key] = {name: key, cpp: cpp.value};
      });

      adsView.$('input.trp').each(function(index, trp) {
        var key = trp.getAttribute('data-lineitem');
        lis[key]['trp'] = trp.value;
      });

      var _campaign = {
        name: detailsView.ui.name.val(),
        cost_type: detailsView.getCostType(),
        value: detailsView.ui.value.val(),
        trp_goal: detailsView.ui.trp_goal.val(),
        target_gender: detailsView.ui.target_gender.val(),
        age_range: detailsView.ui.age_range.val(),
        dma_ids: dmasView.$el.val(),
        lineitems: _.values(lis)
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
          formErrors.push(key + " " + value);
        });

        alert("Error saving order: \n\n" + formErrors.join("\n"));
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
