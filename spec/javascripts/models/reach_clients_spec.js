describe('ReachClients', function() {
  describe('ReachClientModel', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.ReachClientModel).toBeDefined();
    });

    it('can be instantiated', function() {
       var model = new ReachUI.ReachClients.ReachClientModel();
      expect(model).not.toBeNull();
    });

    it('has correct url', function() {
      var model = new ReachUI.ReachClients.ReachClientModel();
      expect(model.url()).toBe('/admin/reach_clients');
    });
  });

  describe('MediaContact', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.MediaContact).toBeDefined();
    });

    it('can be instantiated', function() {
      var model = new ReachUI.ReachClients.MediaContact();
      expect(model).not.toBeNull();
    });

    it('has correct url', function() {
      var model = new ReachUI.ReachClients.MediaContact();
      expect(model.url()).toBe('/admin/media_contacts');
    });
  });

  describe('MediaContactList', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.MediaContactList).toBeDefined();
    });

    it('can be instantiated', function() {
      var list = new ReachUI.ReachClients.MediaContactList();
      expect(list).not.toBeNull();
    });

    it('has correct url', function() {
      var list = new ReachUI.ReachClients.MediaContactList();
      expect(list.url).toBe('/admin/media_contacts');
    });
  });

  describe('BillingContact', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.BillingContact).toBeDefined();
    });

    it('can be instantiated', function() {
      var model = new ReachUI.ReachClients.BillingContact();
      expect(model).not.toBeNull();
    });

    it('has correct url', function() {
      var model = new ReachUI.ReachClients.BillingContact();
      expect(model.url()).toBe('/admin/billing_contacts');
    });
  });

  describe('BillingContactList', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.BillingContactList).toBeDefined();
    });

    it('can be instantiated', function() {
      var list = new ReachUI.ReachClients.BillingContactList();
      expect(list).not.toBeNull();
    });

    it('has correct url', function() {
      var list = new ReachUI.ReachClients.BillingContactList();
      expect(list.url).toBe('/admin/billing_contacts');
    });
  });

  describe('User', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.User).toBeDefined();
    });

    it('can be instantiated', function() {
      var model = new ReachUI.ReachClients.User();
      expect(model).not.toBeNull();
    });
  });

  describe('UserList', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.UserList).toBeDefined();
    });

    it('can be instantiated', function() {
      var list = new ReachUI.ReachClients.UserList();
      expect(list).not.toBeNull();
    });

    it('has correct url', function() {
      var list = new ReachUI.ReachClients.UserList();
      expect(list.url).toBe('/users.json');
    });
  });

  describe('Agency', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.Agency).toBeDefined();
    });

    it('can be instantiated', function() {
      var model = new ReachUI.ReachClients.Agency();
      expect(model).not.toBeNull();
    });
  });

  describe('AgencyList', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.AgencyList).toBeDefined();
    });

    it('can be instantiated', function() {
      var list = new ReachUI.ReachClients.AgencyList();
      expect(list).not.toBeNull();
    });

    it('has correct url', function() {
      var list = new ReachUI.ReachClients.AgencyList();
      expect(list.url).toBe('/agency.json');
    });
  });
});
