describe('Line items views', function() {
  describe('ReachUI.LineItems.LineItemView', function() {

    beforeEach(function() {
      this.lineitem = new ReachUI.LineItems.LineItem({
        name: 'Pre-roll Video Line Item',
        volume: 300124,
        rate:  1.9856,
        ad_sizes: '1x1',
        creatives: []
      });

      this.view = new ReachUI.LineItems.LineItemView({ model: this.lineitem });
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

      it('should update name attribute', function() {
        var name = this.view.$el.find('.name');

        name.find('.editable').editable('show');
        name.find('input').val('Test lineitem name');
        name.find('button[type=submit]').click();

        expect(this.view.model.get('name')).toBe('Test lineitem name');
      });

      it('should update rate attribute', function() {
        var rate = this.view.$el.find('.rate');

        rate.find('.editable.custom').editable('show');
        rate.find('input').val(5.3);
        rate.find('button[type=submit]').click();

        expect(parseFloat(this.view.model.get('rate'))).toBe(5.3);
      });

      xit('should update volume attribute', function() {
        var volume = this.view.$el.find('.volume');

        volume.find('.editable.custom').editable('show');
        volume.find('input').val(7.8);
        volume.find('button[type=submit]').click();

        expect(parseFloat(this.view.model.get('volume'))).toBe(7.8);
      });
    });

    describe('create new ad', function() {
      beforeEach(function() {
        var el = this.view.render().$el;
        $('body').append(el);
      });

      xit('create display ad', function() {
        // TODO instantiate Order controller to process add_ad event
        this.view.$el.find('.ad-type-dropdown').click();
        var defaultAdMenuItem = this.view.$el.find('.li-add-ad-btn:first');
        defaultAdMenuItem.click();
      });
    });
  });
});
