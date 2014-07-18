describe('Line items views', function() {
  describe('ReachUI.LineItems.LineItemView', function() {

    beforeEach(function() {
      this.order = new ReachUI.Orders.Order();
      this.lineitem = BackboneFactory.create('lineitem');

      this.view = new ReachUI.LineItems.LineItemView({ model: this.lineitem });
      this.collection = new ReachUI.LineItems.LineItemList();
      this.collection.setOrder(this.order);
      this.collection.add(this.lineitem);
    });

    it('should be defined', function() {
      expect(ReachUI.LineItems.LineItemView).toBeDefined();
    });

    it('can be instantiated', function() {
      expect(this.view).not.toBeNull();
    });

    describe('should update model attributes', function() {
      beforeEach(function() {
        var el = this.view.render().$el;
        $('body').append(el);
      });

      it('should update start date attribute', function() {
        var startDate = this.view.$el.find('.start-date');
        datepickerClick(startDate, 14);
        expect(this.view.model.get('start_date')).toBe("2013-06-14");
      });

      it('should update end date attribute', function() {
        var endDate = this.view.$el.find('.end-date');
        datepickerClick(endDate, 17);
        expect(this.view.model.get('end_date')).toBe("2013-06-17");
      });

      it('should update name attribute', function() {
        var name = this.view.$el.find('.name');

        name.find('.editable').editable('show');
        name.find('input').val('Test lineitem name');
        name.find('button[type=submit]').click();

        expect(this.view.model.get('name')).toBe('Test lineitem name');
      });

      it('should update rate attribute', function() {
        var rate = this.view.$el.find('.rate');

        rate.find('.rate-editable').editable('show');
        rate.find('input').val(5.3);
        rate.find('button[type=submit]').click();

        expect(parseFloat(this.view.model.get('rate'))).toBe(5.3);
      });

      it('should update volume attribute', function() {
        var volume = this.view.$el.find('.volume');

        volume.find('.volume-editable').editable('show');
        volume.find('input').val(78);
        volume.find('button[type=submit]').click();

        expect(parseFloat(this.view.model.get('volume'))).toBe(78);
      });

      it('should round off the volume attribute', function() {
        var volume = this.view.$el.find('.volume');

        volume.find('.volume-editable').editable('show');
        volume.find('input').val(30000.55);
        volume.find('button[type=submit]').click();

        expect(parseFloat(this.view.model.get('volume'))).toBe(30001);
      });

      it('should round down the volume attribute', function() {
        var volume = this.view.$el.find('.volume');

        volume.find('.volume-editable').editable('show');
        volume.find('input').val(30000.45);
        volume.find('button[type=submit]').click();

        expect(parseFloat(this.view.model.get('volume'))).toBe(30000);
      });
    });

    describe('visual layout', function() {
      beforeEach(function() {
        this.ad = BackboneFactory.create('ad');
        this.secondAd = _.clone(this.ad);
        this.lineitem.ads = [ this.ad, this.secondAd ];

        var el = this.view.render().$el;
        $('body').append(el);
      });

      /*afterEach(function() {
        this.view.render();
      });*/

      it('should display unallocated imps block', function() {
        expect(this.view.$el).toContainElement('.unallocated-imps');
      });

      it('should calculate unallocated imps from li imps, buffer and ads imps', function() {
        var impsValueEl = this.view.$el.find('.unallocated-imps-value');
        expect(impsValueEl.html()).toBe(accounting.formatNumber(100124));
      });

      it('should not change lineitem buffer if ad is added', function() {
        this.lineitem.set('buffer', 10.5);
        this.lineitem.pushAd(_.clone(this.lineitem.ads[0]));
        expect(this.lineitem.getBuffer()).toBe(10.5);
      });

      it('should not change lineitem buffer if ad is removed', function() {
        this.lineitem.set('buffer', 10.5);
        this.lineitem.ads = [ _.clone(this.lineitem.ads[0]) ];
        expect(this.lineitem.getBuffer()).toBe(10.5);
      });

      it('should change unallocated imps if ad is added', function() {
        var newAd = _.clone(this.lineitem.ads[0]);
        this.lineitem.pushAd(newAd);
        this.view.renderAd(newAd);

        var impsValueEl = this.view.$el.find('.unallocated-imps-value');
        expect(impsValueEl.html()).toBe(accounting.formatNumber(124));
      });

      it('should change unallocated imps if ad is removed', function() {
        var newAd = _.clone(this.lineitem.ads[0]);
        this.lineitem.ads = [ newAd ];
        this.view.renderAd(newAd);

        var impsValueEl = this.view.$el.find('.unallocated-imps-value');
        expect(impsValueEl.html()).toBe(accounting.formatNumber(200124));
      });

      it('should hide unallocated impression block if it is zero', function() {
        var newAd = _.clone(this.lineitem.ads[0]);
        newAd.set('volume', this.lineitem.get('volume'));
        this.lineitem.ads = [ newAd ];
        this.view.render();

        var impsValueEl = this.view.$el.find('.unallocated-imps');
        expect(impsValueEl).toBeHidden();
      });

      it('should include copy targeting button', function() {
        expect(this.view.$el).toContainElement('.copy-targeting-btn');
      });

      it('should include paste targeting button', function() {
        expect(this.view.$el).toContainElement('.paste-targeting-btn');
      });

      it('should include cancel copy targeting button', function() {
        expect(this.view.$el).toContainElement('.cancel-targeting-btn');
      });
    });

    /*describe('create new ad', function() {
      beforeEach(function() {
        var el = this.view.render().$el;
        $('body').append(el);
      });

      it('create display ad', function() {
        // TODO instantiate Order controller to process add_ad event
        this.view.$el.find('.ad-type-dropdown').click();
        var defaultAdMenuItem = this.view.$el.find('.li-add-ad-btn:first');
        defaultAdMenuItem.click();
      });
    });*/
  });


  describe('ReachUI.LineItems.LineItemListView', function() {

    beforeEach(function() {
      this.order = new ReachUI.Orders.Order();
      this.lineitem = BackboneFactory.create('lineitem');
      this.ad = BackboneFactory.create('ad');
      this.secondAd = _.clone(this.ad);
      this.lineitem.ads = [ this.ad, this.secondAd ];

      this.collection = new ReachUI.LineItems.LineItemList();
      this.collection.setOrder(this.order);
      this.collection.add(this.lineitem);

      this.view = new ReachUI.LineItems.LineItemListView({collection: this.collection});
    });

    it('should be defined', function() {
      expect(ReachUI.LineItems.LineItemListView).toBeDefined();
    });

    it('can be instantiated', function() {
      expect(this.view).not.toBeNull();
    });

    describe('visual layout', function() {
      beforeEach(function() {
        var el = this.view.render().$el;
        $('body').append(el);
      });

      /*it('should display summary container', function() {
        expect(this.view.$el).toContainElement('.lineitems-summary-container');
      });*/
    });
  });
});
