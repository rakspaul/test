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
      it('should update rate attribute', function() {
        var el = this.view.render().$el;
        $('body').append(el);

        var rateEl = el.find('.rate .editable.custom');

        $(rateEl).editable('setValue', 5.3);
        //$(rateEl).editable().submit();

      });
    });
  });
});