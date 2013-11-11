describe('OrderController', function() {
  describe('ReachUI.Orders.OrderController', function() {
    it('should be defined', function() {
      expect(ReachUI.Orders.OrderController).toBeDefined();
    });

    it('can be instantiated', function() {
      var controller = new ReachUI.Orders.OrderController();
      expect(controller).not.toBeNull();
    });

    describe('on initialize', function() {
      beforeEach(function() {
        var this.search = new ReachUI.Search.SearchQuery();
        sinon.stub(this.search, 'on');
        this.controller = new ReachUI.Orders.OrderController();
      });

      it('should create detail region', function() {
        expect(this.controller.orderDetailRegion).toBeDefined();
      });

      it('should create detail layout', function() {
        expect(this.controller.orderDetailsLayout).toBeDefined();
      });

      it('should create order list', function() {
        expect(this.controller.orderList).toBeDefined();
      });

      it('should create lineitem list', function() {
        expect(this.controller.lineItemList).toBeDefined();
      });

      it('should show detail layout', function() {
        expect(this.controller.orderDetailRegion.currentView).toBeDefined();
      });

      it('should show detail layout', function() {
        this.expect(search.on).toHaveBeenCalled();
      });
    });
  });
});
