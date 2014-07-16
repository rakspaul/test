describe('ReachUI.LineItems.LineItem', function() {
  it('should be defined', function() {
    expect(ReachUI.LineItems.LineItem).toBeDefined();
  });

  it('can be instantiated', function() {
    var lineitem = new ReachUI.LineItems.LineItem();
    expect(lineitem).not.toBeNull();
  });

  describe('new instance default values', function() {
    beforeEach(function() {
      this.li = new ReachUI.LineItems.LineItem();
    });

    it('has default value for the .start-date attribute', function() {
      var defaultStartDate = moment().add('days', 1).format("YYYY-MM-DD");
      expect(this.li.get('start_date')).toEqual(defaultStartDate);
    });

    it('has default value for the .end-date attribute', function() {
      var defaultEndDate = moment().add('days', 15).format("YYYY-MM-DD");
      expect(this.li.get('end_date')).toEqual(defaultEndDate);
    });
  });

  describe('getter methods', function() {
    beforeEach(function() {
      this.order = new ReachUI.Orders.Order();
      this.lineitem = BackboneFactory.create('lineitem');
      this.ad = BackboneFactory.create('ad');
      this.secondAd = _.clone(this.ad);
      this.lineitem.ads = [ this.ad, this.secondAd ];

      this.collection = new ReachUI.LineItems.LineItemList();
      this.collection.setOrder(this.order);
      this.collection.add(this.lineitem);
    });

    it('should return unallocated impressions', function() {
      expect(this.lineitem.getUnallocatedImps()).toBe(100124);
    });

    it('should return integer impression', function() {
      this.lineitem.set('volume', '120,000.78');
      expect(this.lineitem.getImps()).toBe(12000078);
    });

    it('should return number buffer', function() {
      this.lineitem.set('buffer', 5.5);
      expect(this.lineitem.getBuffer()).toBe(5.5);
    });

    it('should return number cpm', function() {
      expect(this.lineitem.getCpm()).toBe(1.9856);
    });
  });
});

describe('ReachUI.LineItems.LineItemList', function() {
  it('should be defined', function() {
    expect(ReachUI.LineItems.LineItemList).toBeDefined();
  });


  describe('should calculate on collection', function() {
    beforeEach(function() {
      var order = new ReachUI.Orders.Order();
      var lineitemsList = new ReachUI.LineItems.LineItemList();
      lineitemsList.setOrder(order);
      lineitemsList.add(new ReachUI.LineItems.LineItem({
        name: 'Pre-roll Video Line Item',
        volume: 300124,
        rate:  1.9856,
        ad_sizes: '1x1',
        creatives: []
      }));
      lineitemsList.add(new ReachUI.LineItems.LineItem({
        name: 'Pre-roll with companion',
        volume: 153793,
        rate: 2.2733,
        ad_sizes: '1x1,300x200',
        creatives: []
      }));

      this.lineitemsView = new ReachUI.LineItems.LineItemListView({collection: lineitemsList});
      this.el = this.lineitemsView.render().$el;
      $('body').append(this.el);

      this.lineitemsView.children.each(function(itemView) {
        itemView._recalculateMediaCost();
      });
    });

    it('should calculate total media cost', function() {
      this.lineitemsView.collection._recalculateLiImpressionsMediaCost();
      expect(this.el.find('.total-media-cost').html()).toEqual('$945.55');
    });
  });
});