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

      xit('should process search', function() {
        /*ReachUI.Search.SearchQuery = function { on: function() {} };
        var searchMock = mock(ReachUI.Search.SearchQuery);
        searchMock.expect('on').once();
        searchMock.verify();
        //this.controller = new ReachUI.Orders.OrderController();
        spyOn(window, ReachUI.Search.SearchQuery).andCallThrough();
        this.controller = new ReachUI.Orders.OrderController();*/
      });

      xit('should bind c key to navigate to new order', function() {
        //var router = ReachUI.Orders.router;
        /*var controller = new ReachUI.Orders.OrderController();
        ReachUI.Orders.router = new ReachUI.Orders.Router({controller: controller});
        Backbone.history.start({
          pushState: true,
          root: "/orders"
        });
        var routeSpy = sinon.spy();
        console.log(routeSpy);
        ReachUI.Orders.router.bind("all", routeSpy);

        Mousetrap.trigger('c o');
        console.log(routeSpy);
        console.log(routeSpy.callCount);
        expect(routeSpy.called).toBeTruthy();*/
      });
    });

    describe('#index', function() {
      beforeEach(function() {
        this.controller = new ReachUI.Orders.OrderController();
      });

      xit("should unselect selected order", function() {

      });

      xit("should show upload view at the top", function() {

      });
    });
  });
});
