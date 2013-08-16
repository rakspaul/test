(function(ReachClient) {
  'use strict';

  ReachClient.ReachClientModel = Backbone.Model.extend({
    url: function() {
      if(this.isNew()) {
        return '/reach_clients';
      } else {
        return '/reach_clients/' + this.id + '.json';
      }
    },

    toJSON: function() {
      return { reachClient: _.clone(this.attributes) };
    }
  });

  ReachClient.MediaContact = Backbone.Model.extend({
    url: '/admin/media_contacts',

    toJSON: function() {
      return { mediaContact: _.clone(this.attributes) };
    }
  });

  ReachClient.MediaContactList = Backbone.Collection.extend({
    url: '/admin/media_contacts',
    model: ReachClient.MediaContact,
  });

  ReachClient.BillingContact = Backbone.Model.extend({
    url: '/admin/billing_contacts',

    toJSON: function() {
      return { billingContact: _.clone(this.attributes) };
    }
  });

  ReachClient.BillingContactList = Backbone.Collection.extend({
    url: '/admin/billing_contacts',
    model: ReachClient.BillingContact,
  });

  ReachClient.SalesPerson = Backbone.Model.extend({});

  ReachClient.SalesPersonList = Backbone.Collection.extend({
    model: ReachClient.SalesPerson,
  });

  ReachClient.AccountManager = Backbone.Model.extend({});

  ReachClient.AccountManagerList = Backbone.Collection.extend({
    model: ReachClient.AccountManager,
  });

  ReachClient.Trafficker = Backbone.Model.extend({});

  ReachClient.TraffickerList = Backbone.Collection.extend({
    model: ReachClient.Trafficker,
  });

  ReachClient.ReachClientDetailsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/reach_clients/reach_client_details'],
  });

  ReachClient.ReachClientContactsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/reach_clients/reach_client_contacts'],

    initialize: function() {
      this.mediaContacts = this.options.mediaContacts;
      this.billingContacts = this.options.billingContacts;
    },

    serializeData: function() {
      return {
        mediaContacts: this.mediaContacts,
        billingContacts: this.billingContacts
      }
    },
  });

  ReachClient.CollectiveContactsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/reach_clients/reach_collective_contacts'],
  });

  ReachClient.ReachClientDetailsLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/reach_clients/reach_clients_details_layout'],

    regions: {
      client_details: '#client_details',
      client_contacts: '#client_contacts',
      collective_contacts: '#collective_contacts'
    },
  });

  ReachClient.ReachClientDetailsController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      this.reachClientModel = this.options.model;
      this._initializeLayout();
      this._initializeClientDetailsView();
      this._initializeClientContactsView();
      this._initializeCollectiveContactsView();
    },

    _initializeLayout: function() {
      this.layout = new ReachClient.ReachClientDetailsLayout();
      this.mainRegion.show(this.layout);
    },

    _initializeClientDetailsView: function() {
      this.clientDetailsView = new ReachClient.ReachClientDetailsView({model: this.reachClientModel});
      this.layout.client_details.show(this.clientDetailsView);
    },

    _initializeClientContactsView: function() {
      this.mediaContacts = new ReachClient.MediaContactList();
      this.billingContacts = new ReachClient.BillingContactList();
      var self =this;

      this.clientContactsView = new ReachClient.ReachClientContactsView({
        model: this.reachClientModel,
        mediaContacts: this.mediaContacts,
        billingContacts: this.billingContacts
      });

      $.when(this.mediaContacts.fetch(), this.billingContacts.fetch()).then(function(){
        self.layout.client_contacts.show(self.clientContactsView);
      })
    },

    _initializeCollectiveContactsView: function() {
      this.collectiveContactsView = new ReachClient.CollectiveContactsView({model: this.reachClientModel});
      this.layout.collective_contacts.show(this.collectiveContactsView);
    },

  });


})(ReachUI.namespace("ReachClients"));
