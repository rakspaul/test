describe('Ad views', function() {
  describe('ReachUI.Ads.AdView', function() {
    beforeEach(function() {
      this.order = new ReachUI.Orders.Order();
      this.lineitem = BackboneFactory.create('lineitem');
      this.liView = new ReachUI.LineItems.LineItemView({ model: this.lineitem });

      this.liCollection = new ReachUI.LineItems.LineItemList();
      this.liCollection.setOrder(this.order);
      this.liCollection.add(this.lineitem);
      this.ad = BackboneFactory.create('ad');

      this.view = new ReachUI.Ads.AdView({ model: this.ad, parent_view: this.liView });
      var el = this.view.render().$el;
      $('body').append(el);
    });

    it('should be defined', function() {
      expect(ReachUI.Ads.AdView).toBeDefined();
    });

    it('should include copy targeting button', function() {
      expect(this.view.$el).toContainElement('.ad-copy-targeting-btn');
    });

    it('should include paste targeting button', function() {
      expect(this.view.$el).toContainElement('.ad-paste-targeting-btn');
    });

    it('should include cancel copy targeting button', function() {
      expect(this.view.$el).toContainElement('.ad-cancel-targeting-btn');
    });

    it('should render only once', function() {
      spyOn(this.view, 'onRender');

      this.view.model.set('volume', 1000);
      // ReachUI.Ads.AdView should be refactored to change this call to 0
      expect(this.view.onRender.calls.count()).toEqual(1);
    });


    describe('init', function() {
      beforeEach(function() {
        this.blankAd = new ReachUI.Ads.Ad({
          type:      'Display',
          size:      '100x120',
          creatives: new ReachUI.Creatives.CreativesList()
        });
        this.blandAdView = new ReachUI.Ads.AdView({ model: this.blankAd, parent_view: this.liView });
        this.blandAdView.render();
      });

      it('should set targeting', function() {
        expect(this.blankAd.get('targeting')).toBeDefined();;
      });

      it('should set media cost', function() {
        expect(this.ad.get('value')).toEqual(198.56);
      });
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
        datepickerClick(endDate, 4);
        expect(this.view.model.get('end_date')).toBe("2013-06-04");
      });

      it('should update name attribute', function() {
        var name = this.view.$el.find('.name');

        name.find('.editable').editable('show');
        name.find('input').val('Test lineitem name');
        name.find('button[type=submit]').click();

        expect(this.view.model.get('name')).toBe('Display ad');
      });

      /*it('should update rate attribute', function() {
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
      });*/
    });
  });
});