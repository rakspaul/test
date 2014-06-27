(function(ReachClient) {
  'use strict';

// --------------------/ Region /------------------------------------

  ReachClient.ModalRegion = Backbone.Marionette.Region.extend({

    constructor: function(){
      _.bindAll(this);
      this.ensureEl();
      Marionette.Region.prototype.constructor.apply(this, arguments);
    },

    getEl: function(selector){
      var $el = $(selector);
      $el.on("hidden", this.close);
      return $el;
    },

    onShow: function(view){
      view.on("close", this.hideModal, this);
      this.$el.modal('show');
    },

    hideModal: function(){
      this.$el.modal('hide');
    }
  });

// --------------------/ Layout /------------------------------------

  ReachClient.ReachClientDetailsLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/reach_clients/reach_clients_details_layout'],

    regions: {
      client_details: '#client_details',
      client_contacts: '#client_contacts',
      collective_contacts: '#collective_contacts'
    },

    triggers: {
      'click #btnSave': 'save',
    },

    ui:{
      btnSave: '#btnSave',
      btnClose: '#btnClose'
    },

  });

// --------------------/ Models /------------------------------------

  ReachClient.ReachClientModel = Backbone.Model.extend({
    url: function() {
      if(this.isNew()) {
        return '/admin/reach_clients';
      } else {
        return '/admin/reach_clients/' + this.id + '.json';
      }
    },

    toJSON: function() {
      return { reachClient: _.clone(this.attributes) };
    },

    defaults: {
      client_buffer: 0,
      client_network_id: 0
    }
  });

  ReachClient.MediaContact = Backbone.Model.extend({
    url: function(){
      if(this.isNew()){
        return '/admin/media_contacts';
      } else {
        return '/admin/media_contacts/' + this.id +'.json';
      }
    },

    toJSON: function() {
      return { mediaContact: _.clone(this.attributes) };
    }
  });

  ReachClient.MediaContactList = Backbone.Collection.extend({
    url: '/admin/media_contacts',
    model: ReachClient.MediaContact,
  });

  ReachClient.BillingContact = Backbone.Model.extend({
    url: function(){
      if(this.isNew()){
        return '/admin/billing_contacts';
      } else {
        return '/admin/billing_contacts/' + this.id +'.json';
      }
    },

    toJSON: function() {
      return { billingContact: _.clone(this.attributes) };
    }
  });

  ReachClient.BillingContactList = Backbone.Collection.extend({
    url: '/admin/billing_contacts',
    model: ReachClient.BillingContact,
  });

  ReachClient.User = Backbone.Model.extend({});

  ReachClient.UserList = Backbone.Collection.extend({
    url: '/users.json',
    model: ReachClient.User,
  });

  ReachClient.Agency = Backbone.Model.extend({});

  ReachClient.AgencyList = Backbone.Collection.extend({
    url: '/agency.json',
    model: ReachClient.Agency,
  });

// --------------------/ Views /-------------------------------------

  ReachClient.ReachClientDetailsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/reach_clients/reach_client_details'],

    ui: {
      agency: '#agency',
      name: '#name',
      abbreviation: '#abbreviation',
      client_buffer: '#client_buffer',
      agency_id_error: '#agency_id_error',
      name_error: '#name_error',
      abbr_error: '#abbr_error',
      client_buffer_error: '#client_buffer_error',
      client_network_id: '#client_network_id',
      client_network_id_error: '#client_network_id_error'
    },

    initialize: function() {
      var self = this;
      this.agencies = new ReachClient.AgencyList();
      this.agencies.fetch().then(function() {
        self.render();
      });
    },

    serializeData: function() {
      return {
        name: this.model.get('name'),
        abbr: this.model.get('abbr'),
        agencies: this.agencies,
        selected_agency_id: this.model.get('agency_id'),
        client_buffer: this.model.get('client_buffer'),
        client_network_id: this.model.get('client_network_id')
      }
    },

    events: {
      'focusout #client_buffer': '_onClientBufferInputFocusOut'
    },

    _onClientBufferInputFocusOut: function(){
      var value = this.ui.client_buffer.val(),
      clientBuffer = parseFloat(value);

      if(!isNaN(clientBuffer)){
         this.ui.client_buffer.val(clientBuffer.toFixed(1));
      }
    },

  });

  ReachClient.ReachClientContactsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/reach_clients/reach_client_contacts'],

    ui: {
      media_contact: '#media_contact',
      billing_contact: '#billing_contact',
      media_contact_id_error: '#media_contact_id_error',
      billing_contact_id_error: '#billing_contact_id_error',
      editMediaContact: '#editMediaContact',
      editBillingContact: '#editBillingContact'
    },

    initialize: function() {
      var self = this;
      this.mediaContacts = this.options.mediaContacts;
      this.billingContacts = this.options.billingContacts;
      this.listenTo(this.mediaContacts, 'add change', this.render);
      this.listenTo(this.billingContacts, 'add change', this.render);

      if (this.options.fetch_records) {
        $.when(this.mediaContacts.fetch(), this.billingContacts.fetch()).then(function(){
          self.render();
        })
      };
    },

    events: {
      'click #editMediaContact' : '_edtMediaContact',
      'click #editBillingContact' : '_edtBillingContact'
    },

    triggers: {
      'click #addMediaContact' : 'Add:MediaContact',
      'click #addBillingContact' : 'Add:BillingContact',
    },

    serializeData: function() {
      return {
        selected_media_id: this.model.get('media_contact_id'),
        mediaContacts: this.mediaContacts,
        selected_billing_id: this.model.get('billing_contact_id'),
        billingContacts: this.billingContacts
      }
    },

    _edtMediaContact: function(event){
      var mediaContactId = this.ui.media_contact.val();
      if(mediaContactId)
      this.trigger('Edit:MediaContact', mediaContactId);
    },

    _edtBillingContact: function(event){
      var billingContactId = this.ui.billing_contact.val();
      if(billingContactId)
      this.trigger('Edit:BillingContact', billingContactId);
    },

    onDomRefresh: function(){
      if(this.mediaContacts.length)
        this.ui.editMediaContact.removeClass('hide');
       if(this.billingContacts.length)
        this.ui.editBillingContact.removeClass('hide');
    }

  });

  ReachClient.CollectiveContactsView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/reach_clients/reach_collective_contacts'],

    ui: {
      sales_person: '#sales_person',
      account_manager: '#account_manager',
      sales_person_id_error: '#sales_person_id_error',
      account_manager_id_error: '#account_manager_id_error'
    },

    initialize: function() {
      var self = this;
      this.users = new ReachClient.UserList();
      this.users.fetch().then(function() {
        self.render();
      });
    },

    serializeData: function() {
      return {
        selected_sales_person_id: this.model.get('sales_person_id'),
        salesPerson: this.users,
        selected_account_manager_id: this.model.get('account_manager_id'),
        accountManager: this.users,
      }
    },

  });

  ReachClient.MediaContactView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/reach_clients/reach_media_contact'],
    className: 'modal',

    ui: {
      name: '#name',
      phone: '#phone',
      email: '#email',
      address: '#address',
      name_error: '#name_error',
      phone_error: '#phone_error',
      email_error: '#email_error',
      address_error: '#address_error'
    },

    triggers: {
      'click #save_media_contact' : 'Save:MediaContact',
    },

    hide: function() {
      $('#modal').modal('hide')
    }

  });

  ReachClient.BillingContactView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/admin/reach_clients/reach_billing_contact'],
    className: 'modal',

    ui: {
      name: '#name',
      phone: '#phone',
      email: '#email',
      address: '#address',
      name_error: '#name_error',
      phone_error: '#phone_error',
      email_error: '#email_error',
      address_error: '#address_error'
    },

    triggers: {
      'click #save_billing_contact' : 'Save:BillingContact',
    },

    hide: function() {
      $('#modal').modal('hide')
    }

  });

// --------------------/ Controllers /-------------------------------

  ReachClient.ReachClientDetailsController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      _.bindAll(this, '_onSaveSuccess', '_onSaveFailure');
    },

    createNewReachClient: function(model) {
      this.reachClientModel = model;
      this._initializeLayout();
      this._initializeClientDetailsView();
      this._initializeCollectiveContactsView();
    },

    editReachClient: function(model) {
      this.reachClientModel = model;
      this._initializeLayout();
      this._initializeClientDetailsView();
      this._initializeClientContactsView(this.reachClientModel, true);
      this._initializeCollectiveContactsView();
    },

    _initializeLayout: function() {
      this.layout = new ReachClient.ReachClientDetailsLayout();
      this.layout.on('save', this._onSave, this);
      this.mainRegion.show(this.layout);
      this.layout.addRegions({'modal': new ReachClient.ModalRegion({el:'#modal'})});
    },

    _initializeClientDetailsView: function() {
      this.clientDetailsView = new ReachClient.ReachClientDetailsView({model: this.reachClientModel});
      this.layout.client_details.show(this.clientDetailsView);
    },

    _initializeClientContactsView: function(model, fetch_records) {

      this.mediaContacts = new ReachClient.MediaContactList();
      this.mediaContacts.url = '/admin/media_contacts.json?id=' + model.id;

      this.billingContacts = new ReachClient.BillingContactList();
      this.billingContacts.url = '/admin/billing_contacts.json?id=' + model.id;

      this.clientContactsView = new ReachClient.ReachClientContactsView({
        model: this.reachClientModel,
        mediaContacts: this.mediaContacts,
        billingContacts: this.billingContacts,
        fetch_records: fetch_records,
      });

      this.clientContactsView.on('Add:MediaContact', this._addMediaContact, this);
      this.clientContactsView.on('Add:BillingContact', this._addBillingContact, this);
      this.clientContactsView.on('Edit:MediaContact', this._editMediaContact, this);
      this.clientContactsView.on('Edit:BillingContact', this._editBillingContact, this);

      this.layout.client_contacts.show(this.clientContactsView);
    },

    _initializeCollectiveContactsView: function() {
      this.collectiveContactsView = new ReachClient.CollectiveContactsView({model: this.reachClientModel});
      this.layout.collective_contacts.show(this.collectiveContactsView);
    },

    _addMediaContact: function() {
      var model = new ReachClient.MediaContact();
      model.set({reach_client_id: this.reachClientModel.id})
      this.mediaContactController = new ReachClient.MediaContactController({mainRegion: this.layout.modal, mediaContact: model});
      this.mediaContactController.on('onMediaContactSave', this._onMediaContactSave, this);
    },

    _onMediaContactSave: function(model) {
      this.mediaContacts.add(model);
    },

    _addBillingContact: function() {
      var model = new ReachClient.BillingContact();
      model.set({reach_client_id: this.reachClientModel.id})

      this.billingContactController = new ReachClient.BillingContactController({mainRegion: this.layout.modal, billingContact: model});
      this.billingContactController.on('onBillingContactSave', this._onBillingContactSave, this);
    },

    _onBillingContactSave: function(model) {
      this.billingContacts.add(model);
    },

    _editMediaContact: function(id){
      var model = this.mediaContacts.get(id);
      this.mediaContactController = new ReachClient.MediaContactController({mainRegion: this.layout.modal, mediaContact: model});
    },

    _editBillingContact: function(id){
      var model = this.billingContacts.get(id);
      this.billingContactController = new ReachClient.BillingContactController({mainRegion: this.layout.modal, billingContact: model});
    },

    _onSave: function() {
      var clientBufferString = this.clientDetailsView.ui.client_buffer.val(),
        clientBuffer = !isNaN(parseFloat(clientBufferString)) ? parseFloat(clientBufferString).toFixed(1) : clientBufferString

      var prop = {
        name: this.clientDetailsView.ui.name.val(),
        abbr: this.clientDetailsView.ui.abbreviation.val(),
        sales_person_id: this.collectiveContactsView.ui.sales_person.val(),
        account_manager_id: this.collectiveContactsView.ui.account_manager.val(),
        agency_id: this.clientDetailsView.ui.agency.val(),
        client_buffer: clientBuffer,
        client_network_id: this.clientDetailsView.ui.client_network_id.val()
      }

      if(this.clientContactsView) {
        prop['media_contact_id'] = this.clientContactsView.ui.media_contact.val();
        prop['billing_contact_id'] = this.clientContactsView.ui.billing_contact.val();
      }

      var self = this;
      var uiControls = {};

      if (this.clientContactsView) {
        uiControls = $.extend(this.clientDetailsView.ui, this.clientContactsView.ui);
      } else {
        uiControls = this.clientDetailsView.ui
      }

      _.keys(this.clientDetailsView.ui)
        .filter(function(val) {
          return /_error$/.test(val);
        })
        .forEach(function(val) {
          uiControls[val].text("");
        });

      this.layout.ui.btnSave.text('Saving...').attr('disabled','disabled');
      this.layout.ui.btnClose.attr('disabled','disabled');
      this.reachClientModel.save(prop, {success: this._onSaveSuccess, error: this._onSaveFailure})
    },

    _onSaveSuccess: function(model, response, options) {
      this.reachClientModel = model;

      this.layout.ui.btnSave.text('Save').removeAttr('disabled');
      this.layout.ui.btnClose.removeAttr('disabled');

      alert("Client saved successfully.");
      if (!this.clientContactsView) {
        this._initializeClientContactsView(model, false);
      }
    },

    _onSaveFailure: function(model, xhr, options) {
      this.layout.ui.btnSave.text('Save').removeAttr('disabled');
      this.layout.ui.btnClose.removeAttr('disabled');

      if(xhr.responseJSON && xhr.responseJSON.errors) {
        var formErrors = [];
        var uiControls = {};

        if (this.clientContactsView) {
          uiControls = $.extend(this.clientDetailsView.ui, this.clientContactsView.ui, this.collectiveContactsView.ui);
        } else {
          uiControls = $.extend(this.clientDetailsView.ui, this.collectiveContactsView.ui);
        }
        _.each(xhr.responseJSON.errors, function(value, key) {
          var errorLabel = uiControls[key + "_error"];
          if(errorLabel) {
            errorLabel.text(value[0]);
          } else {
            formErrors.push(value);
          }
        }, this);
        alert("Error saving Reach client. \n" + formErrors.join("\n"));
      }
    }

  });

  ReachClient.MediaContactController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      this.mediaContact = this.options.mediaContact;
      this._initializeMediaContactView(this.mediaContact);
      _.bindAll(this, '_onSaveSuccess', '_onSaveFailure');
    },

    _initializeMediaContactView: function(mediaContact) {
      this.mediaContactView = new ReachClient.MediaContactView({model: mediaContact});
      this.mediaContactView.on('Save:MediaContact', this._saveMediaContact, this);
      this.mainRegion.show(this.mediaContactView)
    },

    _saveMediaContact: function() {
      var para = {
        name: this.mediaContactView.ui.name.val(),
        phone: this.mediaContactView.ui.phone.val(),
        email: this.mediaContactView.ui.email.val(),
        address: this.mediaContactView.ui.address.val(),
        reach_client_id: this.mediaContact.get('reach_client_id'),
      }

      var self = this;

      _.keys(this.mediaContactView.ui)
        .filter(function(val) {
          return /_error$/.test(val);
        })
        .forEach(function(val) {
          self.mediaContactView.ui[val].text("");
        });

      this.mediaContact.save(para, {
        success: this._onSaveSuccess,
        error: this._onSaveFailure
      });
    },

    _onSaveSuccess: function(event) {
      this.trigger('onMediaContactSave', this.mediaContact)
      this.mediaContactView.hide();
    },

    _onSaveFailure:function(model, xhr, options) {
      if(xhr.responseJSON && xhr.responseJSON.errors) {
        var formErrors = [];

        _.each(xhr.responseJSON.errors, function(value, key) {
          var errorLabel = this.mediaContactView.ui[key + "_error"];
          if(errorLabel) {
            errorLabel.text(value[0]);
          } else {
            formErrors.push(value);
          }
        }, this);
      }
    },
  });

  ReachClient.BillingContactController = Marionette.Controller.extend({
    initialize: function() {
      this.mainRegion = this.options.mainRegion;
      this.billingContact = this.options.billingContact;
      this._initializeBillingContactView(this.billingContact);
      _.bindAll(this, '_onSaveSuccess', '_onSaveFailure');
    },

    _initializeBillingContactView: function(billingContact) {
      this.billingContactView = new ReachClient.BillingContactView({model: billingContact});
      this.billingContactView.on('Save:BillingContact', this._saveBillingContact, this);
      this.mainRegion.show(this.billingContactView)
    },

    _saveBillingContact: function() {
      var para = {
        name: this.billingContactView.ui.name.val(),
        phone: this.billingContactView.ui.phone.val(),
        email: this.billingContactView.ui.email.val(),
        address: this.billingContactView.ui.address.val(),
        reach_client_id: this.billingContact.get('reach_client_id'),
      }

      var self = this;

      _.keys(this.billingContactView.ui)
        .filter(function(val) {
          return /_error$/.test(val);
        })
        .forEach(function(val) {
          self.billingContactView.ui[val].text("");
        });

      this.billingContact.save(para, {
        success: this._onSaveSuccess,
        error: this._onSaveFailure
      });
    },

    _onSaveSuccess: function(event) {
      this.trigger('onBillingContactSave', this.billingContact)
      this.billingContactView.hide();
    },

    _onSaveFailure:function(model, xhr, options) {
      if(xhr.responseJSON && xhr.responseJSON.errors) {
        var formErrors = [];

        _.each(xhr.responseJSON.errors, function(value, key) {
          var errorLabel = this.billingContactView.ui[key + "_error"];
          if(errorLabel) {
            errorLabel.text(value[0]);
          } else {
            formErrors.push(value);
          }
        }, this);
      }
    },
  });

})(ReachUI.namespace("ReachClients"));
