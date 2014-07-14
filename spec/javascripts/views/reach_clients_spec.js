describe('ReachClients', function() {
  describe('ReachClientDetailsView', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.ReachClientDetailsView).toBeDefined();
    });

    describe('on ReachClientDetailsView', function() {
      var reachClient,
      reachClientDetailsView;

      beforeEach(function() {
        var abcAgency = new ReachUI.ReachClients.Agency({id: 1, name: 'abc'}),
        xyzAgency = new ReachUI.ReachClients.Agency({id: 2, name: 'xyz'});

        reachClient = new ReachUI.ReachClients.ReachClientModel({name: 'ReachClient', abbr: 'rc', client_buffer: 1.0, agency_id: 1, client_network_id: 1234});
        reachClientDetailsView = new ReachUI.ReachClients.ReachClientDetailsView({model: reachClient});
        reachClientDetailsView.agencies =  new ReachUI.ReachClients.AgencyList();

        reachClientDetailsView.agencies.add(abcAgency);
        reachClientDetailsView.agencies.add(xyzAgency);
      });

      it('should render empty view', function() {
        expect(reachClientDetailsView.render().$el.find('legend')).toHaveText('Client Details');
      });

      it('should render field values', function() {
        var $el = reachClientDetailsView.render().$el;

        expect($el.find('input#name')).toHaveValue(reachClient.get('name'));
        expect($el.find('input#client_buffer')).toHaveValue(reachClient.get('client_buffer').toString());
        expect($el.find('input#abbreviation')).toHaveValue(reachClient.get('abbr'));
        expect($el.find('select#agency')).toHaveValue(reachClient.get('agency_id').toString());
        expect($el.find('input#client_network_id')).toHaveValue(reachClient.get('client_network_id').toString());
      });
    });
  });

  describe('ReachClientContactsView', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.ReachClientContactsView).toBeDefined();
    });

    describe('on ReachClientContactsView', function() {
      var reachClient,
      mediaContacts,
      billingContacts,
      reachClientContactsView;

      beforeEach(function() {
        var mediaContact = new ReachUI.ReachClients.MediaContact({id: 1, name: 'abc', phone: '1234567890', email: 'dev@cm', address: 'USA'}),
        billingContact = new ReachUI.ReachClients.BillingContact({id: 5, name: 'abc', phone: '1234567890', email: 'dev@cm', address: 'USA'});

        reachClient = new ReachUI.ReachClients.ReachClientModel({media_contact_id: 1, billing_contact_id: 5});
        mediaContacts = new ReachUI.ReachClients.MediaContactList();
        billingContacts = new ReachUI.ReachClients.BillingContactList();

        mediaContacts.add(mediaContact);
        billingContacts.add(billingContact);

        reachClientContactsView = new ReachUI.ReachClients.ReachClientContactsView({
          model: reachClient,
          mediaContacts: mediaContacts,
          billingContacts: billingContacts,
          fetch_records: false
        });

      });

      it('should render empty view', function() {
        expect(reachClientContactsView.render().$el).toBeTruthy();
      });

      it('should render media and billing contacts', function() {
        var $el = reachClientContactsView.render().$el;

        expect($el.find('select#media_contact')).toHaveValue(reachClient.get('media_contact_id').toString());
        expect($el.find('select#billing_contact')).toHaveValue(reachClient.get('billing_contact_id').toString());
      });

    });
  });

  describe('CollectiveContactsView', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.CollectiveContactsView).toBeDefined();
    });

    describe('on CollectiveContactsView', function() {
      var reachClient,
      users,
      collectiveContactsView;

      beforeEach(function() {
        reachClient = new ReachUI.ReachClients.ReachClientModel({sales_person_id: 1, account_manager_id: 2});
        users = new ReachUI.ReachClients.UserList([{id: 1, name: 'abc'}, {id: 2, name: 'xyz'}])
        collectiveContactsView = new ReachUI.ReachClients.CollectiveContactsView({model: reachClient});
        collectiveContactsView.users = users;
      });

      it('should render empty view', function() {
        expect(collectiveContactsView.render().$el.find('legend')).toHaveText('Collective Contacts');
      });

      it('should render media and billing contacts', function() {
        var $el = collectiveContactsView.render().$el;

        expect($el.find('select#sales_person')).toHaveValue(reachClient.get('sales_person_id').toString());
        expect($el.find('select#account_manager')).toHaveValue(reachClient.get('account_manager_id').toString());
      });

    });
  });

  describe('MediaContactView', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.MediaContactView).toBeDefined();
    });

    describe('on MediaContactView', function() {
      var mediaContact,
      mediaContactView;

      beforeEach(function() {
        mediaContact = new ReachUI.ReachClients.MediaContact({name: 'Abc', phone: '0987654321', email:'dev@cm', address:'USA'});
        mediaContactView = new ReachUI.ReachClients.MediaContactView({model: mediaContact});
      });

      it('renders empty view', function() {
        expect(mediaContactView.render().$el.find('div form legend')).toHaveText('New Media Contact');
      });

      it('renders all fields', function() {
        var $el = mediaContactView.render().$el;

        expect($el.find('input#name')).toHaveValue(mediaContact.get('name'));
        expect($el.find('input#phone')).toHaveValue(mediaContact.get('phone'));
        expect($el.find('input#email')).toHaveValue(mediaContact.get('email'));
        expect($el.find('textarea#address')).toHaveValue(mediaContact.get('address'));
      });
    });
  });

  describe('BillingContactView', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.BillingContactView).toBeDefined();
    });

    describe('on BillingContactView', function() {
      var billingContact,
      billingContactView;

      beforeEach(function() {
        billingContact = new ReachUI.ReachClients.BillingContact({name: 'Abc', phone: '0987654321', email:'dev@cm', address:'USA'});
        billingContactView = new ReachUI.ReachClients.BillingContactView({model: billingContact});
      });

      it('renders empty view', function() {
        expect(billingContactView.render().$el.find('div form legend')).toHaveText('New Billing Contact');
      });

      it('renders all fields', function() {
        var $el = billingContactView.render().$el;

        expect($el.find('input#name')).toHaveValue(billingContact.get('name'));
        expect($el.find('input#phone')).toHaveValue(billingContact.get('phone'));
        expect($el.find('input#email')).toHaveValue(billingContact.get('email'));
        expect($el.find('textarea#address')).toHaveValue(billingContact.get('address'));
      });
    });
  });
});