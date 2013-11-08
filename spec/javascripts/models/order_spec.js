describe('ReachUI.Orders.Order', function() {
  it('should be defined', function() {
    expect(ReachUI.Orders.Order).toBeDefined();
  });

  it('can be instantiated', function() {
    var order = new ReachUI.Orders.Order();
    expect(order).not.toBeNull();
  });

  describe('new instance default values', function() {
    beforeEach(function() {
      this.order = new ReachUI.Orders.Order();
    });

    it('has default value for the .start-date attribute', function() {
      var defaultStartDate = moment().add('days', 1).format("YYYY-MM-DD");
      expect(this.order.get('start_date')).toEqual(defaultStartDate);
    });

    it('has default value for the .end-date attribute', function() {
      var defaultEndDate = moment().add('days', 15).format("YYYY-MM-DD");
      expect(this.order.get('end_date')).toEqual(defaultEndDate);
    });
  });

  describe('selected property', function() {
    beforeEach(function() {
      this.order = new ReachUI.Orders.Order();
    });

    it('#select', function() {
      this.order.select();
      expect(this.order.get('selected')).toBeTruthy();
    });

    it('#unselect', function() {
      this.order.unselect();
      expect(this.order.get('selected')).toBeFalsy();
    });
  });
});
