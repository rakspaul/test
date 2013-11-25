describe('ReachClients', function() {
  describe('ReachClientContactsView', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.ReachClientContactsView).toBeDefined();
    });

    it('should render media contacts', function() {
      var mediaContacts = new ReachUI.ReachClients.MediaContactList();
      var billingContacts = new ReachUI.ReachClients.BillingContactList();
      var reachClient = new ReachUI.ReachClients.ReachClientModel();

    });
  });

  describe('MediaContactView', function() {
    it('should be defined', function() {
      expect(ReachUI.ReachClients.MediaContactView).toBeDefined();
    });

    describe('on new media contact', function() {
      var mediaContact;
      var mediaContactView;

      beforeEach(function() {
        mediaContact = new ReachUI.ReachClients.MediaContact();
        mediaContactView = new ReachUI.ReachClients.MediaContactView({model: mediaContact});
      });

      it('renders empty view', function() {
        expect(mediaContactView.render().$el.find('div form legend')).toHaveText('New Media Contact');
      });

      describe('on save', function() {
        var fakeServer;

        beforeEach(function() {
          fakeServer = sinon.fakeServer.create();
        });

        afterEach(function() {
          fakeServer.restore();
        });

        it('display errors for missing required fields', function() {
          fakeServer.respondWith('/admin/media_contacts', function(xhr) {
            xhr.respond(422, { "Content-Type": "application/json" }, '{"errors":{"name":["can\'t be blank"],"email":["can\'t be blank"," not valid."]}}');
          });

          var $el = mediaContactView.render().$el;
          $el.find("#save_media_contact").click();
          fakeServer.respond();

          expect($el.find("#name_error")).toHaveText('can\'t be blank');
        });

        it('closes view on success', function() {
          fakeServer.respondWith('POST','/admin/media_contacts',
            [201, { "Content-Type": "application/json" }, '{"id":24}']);

          var eventSpy = sinon.spy();
          mediaContactView.on('onMediaContactSave', eventSpy);

          var $el = mediaContactView.render().$el;
          $el.find("#save_media_contact").click();

          fakeServer.respond();

          expect(eventSpy.calledOnce).toBeTruthy();
        });
      });
    });

    describe('on existing media contact', function() {
      var mediaContact;
      var mediaContactView;
      var mediaContactReq = {id: 1, name: 'AA', phone: '21088789876', email: 'client@cm.com', address:''};

      beforeEach(function() {
        mediaContact = new ReachUI.ReachClients.MediaContact(mediaContactReq);
        mediaContactView = new ReachUI.ReachClients.MediaContactView({model: mediaContact});
      });

      xit('has edit legend', function() {
        expect(mediaContactView.render().$el.find('div form legend')).toHaveText('Edit Media Contact');
      });

      it('renders all fields', function() {
        var $el = mediaContactView.render().$el;

        expect($el.find('input#name')).toHaveValue(mediaContact.get('name'));
        expect($el.find('input#phone')).toHaveValue(mediaContact.get('phone'));
        expect($el.find('input#email')).toHaveValue(mediaContact.get('email'));
      });

      describe('on save', function() {
        var fakeServer;

        beforeEach(function () {
          fakeServer = sinon.fakeServer.create();
          fakeServer.respondWith('PUT','/admin/media_contacts/1.json',
            [200, { "Content-Type": "application/json" }, '{"id":1}']);
        });

        afterEach(function () {
          fakeServer.restore();
        });

        it('triggers onMediaContactSave event on success', function() {
          var eventSpy = sinon.spy();
          mediaContactView.on('onMediaContactSave', eventSpy);

          var $el = mediaContactView.render().$el;
          $el.find("#save_media_contact").click();

          fakeServer.respond();

          expect(eventSpy.calledOnce).toBeTruthy();
        });

        it('closes view on success', function() {
          var $el = mediaContactView.render().$el;
          $('body').append($el);

          var closeEventSpy = spyOnEvent($el.find('#close_modal'), 'click');

          $el.find("#save_media_contact").click();

          fakeServer.respond();

          expect(closeEventSpy).toHaveBeenTriggered();
          closeEventSpy.reset();
        });
      });
    });
  })
});
