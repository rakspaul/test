describe('Order views', function() {
  describe('ReachUI.Orders.EmptyView', function() {
    it('should be defined', function() {
      expect(ReachUI.Orders.EmptyView).toBeDefined();
    });

    it('can be instantiated', function() {
      var view = new ReachUI.Orders.EmptyView();
      expect(view).not.toBeNull();
    });

    it('should have a class of "order-empty"', function() {
      var view = new ReachUI.Orders.EmptyView();
      view.render();
      expect(view.$el).toHaveClass('no-order-found');
    });
  });
});