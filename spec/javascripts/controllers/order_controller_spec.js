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
    });

    describe('#index', function() {
      beforeEach(function() {
        controller = new ReachUI.Orders.OrderController();
        layout = controller.orderDetailsLayout;
      });

      it("should unselect selected order", function() {
        controller.selectedOrder = { unselect: function () {}};
        var selectSpy = sinon.spy(controller.selectedOrder, 'unselect');
        controller.index();
        expect(selectSpy.calledOnce).toBeTruthy();
      });

      it("should show upload view at the top", function() {
        controller.index();
        expect(layout.top.currentView.$el.find('div:first')).toHaveClass('upload-io-region');
      });

      it("should reset layout bottom", function() {
        controller.index();
        expect(layout.bottom.$el).toBeUndefined();
      });
    });

  });
});

