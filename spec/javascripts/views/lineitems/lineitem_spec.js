function datepickerClick(datepicker, day) {
  // Enable past date selection
  datepicker.find('.editable').editable('option', 'datepicker', { startDate: new Date(2012, 0, 1), language: 'en' });
  datepicker.find('.editable').editable('show');
  datepicker.find('.datepicker-days tbody td:contains(' + day + ')').click();
  datepicker.find('form').submit();
};

describe('Line items views', function() {
  describe('ReachUI.LineItems.LineItemView', function() {

    beforeEach(function() {
      this.order = new ReachUI.Orders.Order();
      this.lineitem = new ReachUI.LineItems.LineItem({
        name:       'Display Line Item',
        start_date: '2013-06-01',
        end_date:   '2013-06-07',
        volume:     300124,
        rate:       1.9856,
        ad_sizes:   '1x1',
        creatives:  [],
        type:       'Display'
      });

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
    });
  });
});
