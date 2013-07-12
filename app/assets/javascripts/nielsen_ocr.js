(function(Ocr, Orders, Search) {
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
      var p = ['/orders', this.get('order_id'), 'nielsen_campaigns'];

      if(!this.isNew()) p.push(this.id);

      return p.join('/') + '.json';
    },
  });

  Ocr.CampaignList = Backbone.Collection.extend({
    model: Ocr.Campaign,
    url: function() {
      return '/orders/' + this.order.id + '/nielsen_campaigns.json';
    },

    setOrder: function(order) {
      this.order = order;
    }
  });

  Ocr.CampaignRowView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    className: 'campaign-row',
    template: JST['templates/nielsen_ocr/campaign_row'],

    triggers : {
      'click': 'selected'
    },

    initialize: function() {
      this.listenTo(this.model, 'change:selected', this._onSelected);
    },

    _onSelected: function() {
      if(this.model.get('selected')) {
        this.$el.addClass('selected');
      } else {
        this.$el.removeClass('selected');
      }
    }
  });

  Ocr.CampaignTableView = Backbone.Marionette.CompositeView.extend({
    itemView: Ocr.CampaignRowView,
    itemViewContainer: 'tbody',
    template: JST['templates/nielsen_ocr/campaign_table'],
    className: 'table-container nielsen-campaign-table',

    triggers: {
      'click .create': 'campaign:create'
    }
  });

  Ocr.CampaignDetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/nielsen_ocr/campaign_detail'],
    className: 'ocr-campaign-detail',
    ui: {
      name: '#name',
      value: '#value',
      trp_goal: '#trp_goal',
      target_gender: '#target_gender',
      age_range: '#age_range',
      imps_radio: '#imps_radio',
      cpp_radio: '#cpp_radio'
    },

    triggers: {
      'click .save-campaign': 'campaign:save'
    },

    onRender: function() {
      this.ui.age_range.val(this.model.get('age_range'));
      this.ui.target_gender.val(this.model.get('target_gender'));
      this.ui.imps_radio.prop('checked', (this.model.get('cost_type') === "imps"));
      this.ui.cpp_radio.prop('checked', (this.model.get('cost_type') === "cpp"));
    },

    getCostType: function() {
      return this.$('input:radio[name=cost_type]:checked').val();
    }
  });

  Ocr.OcrRegion = Backbone.Marionette.Region.extend({
    el: "#details .content"
  });

  Ocr.OcrLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/nielsen_ocr/ocr_layout'],

    regions: {
      top: ".top-region",
      bottom: ".bottom-region"
    }
  });

  Ocr.OcrController = Marionette.Controller.extend({
    initialize: function(options) {
      var search = new Search.SearchQuery(),
        searchView = new Search.SearchQueryView({model: search}),
        searchOrderListView = null;

      this.ocrRegion = new Ocr.OcrRegion(),
      this.ocrLayout = new Ocr.OcrLayout();
      this.orderList = new ReachUI.Orders.OrderList();

      this.ocrRegion.show(this.ocrLayout);

      search.on('change:query', function(model) {
        this.orderList.fetch({data: {search: model.get('query')}});
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

      this.campaignList = new Ocr.CampaignList();
      this.campaignList.setOrder(this.selectedOrder);
      this.campaignList.fetch();

      var campaignTableView = new Ocr.CampaignTableView({collection: this.campaignList});
      campaignTableView.on('campaign:create', function(args) {
        ReachUI.Ocr.router.navigate('/'+ orderId +'/campaigns/new', {trigger: true});
      }, this);

      campaignTableView.on('itemview:selected', this._onCampaignSelect, this);

      this.selectCampaign = null;
      this.ocrLayout.bottom.close();
      this.ocrLayout.top.show(campaignTableView);
    },

    _onCampaignSelect: function(view) {
      ReachUI.Ocr.router.navigate('/' + this.selectedOrder.id + '/campaigns/' + view.model.id, {trigger: true});
    },

    newCampaign: function(orderId) {
      if(this.selectCampaign) {
        this.selectCampaign.set({selected: false});
      }

      var campaign = new Ocr.Campaign({'order_id': orderId});
      var campaignDetailView = new Ocr.CampaignDetailView({model: campaign});
      campaignDetailView.on('campaign:save', this._saveCampaign, this);

      this.ocrLayout.bottom.show(campaignDetailView);
    },

    showCampaign: function(id, campaignId) {
      if(this.selectCampaign) {
        this.selectCampaign.set({selected: false});
      }

      this.selectCampaign = this.campaignList.get(campaignId);
      this.selectCampaign.set({selected: true});

      var campaignDetailView = new Ocr.CampaignDetailView({model: this.selectCampaign});
      campaignDetailView.on('campaign:save', this._saveCampaign, this);

      this.ocrLayout.bottom.show(campaignDetailView);
    },

    _saveCampaign: function(args) {
      var model = args.model,
        view = args.view;

      var _campaign = {
        name: view.ui.name.val(),
        cost_type: view.getCostType(),
        value: view.ui.value.val(),
        trp_goal: view.ui.trp_goal.val(),
        target_gender: view.ui.target_gender.val(),
        age_range: view.ui.age_range.val()
      };

      model.save(_campaign, {
        success: this._onSaveCampaignSuccess,
        error: this._onSaveCampaignFailure
      });
    },

    _onSaveCampaignSuccess: function(model, response, options) {
      alert('Saved');
      this.campaignList.unshift(model);
      ReachUI.Ocr.router.navigate('/' + this.selectedOrder.id + '/campaigns/' + model.id, {trigger: true});
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
      ':id': 'show',
      ':id/campaigns/new': 'newCampaign',
      ':id/campaigns/:campaign_id': 'showCampaign'
    }
  });
})(ReachUI.namespace("Ocr"), ReachUI.namespace("Orders"), ReachUI.namespace("Search"));
