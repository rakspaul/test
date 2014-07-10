describe('Ad views', function() {
  describe('ReachUI.Ads.AdView', function() {
    beforeEach(function() {
      this.lineitem = this.lineitem = BackboneFactory.create('lineitem');
      this.liView = new ReachUI.LineItems.LineItemView({ model: this.lineitem });
      // TODO reuse factory that exists in 704 branch
      this.ad = new ReachUI.Ads.Ad({
        name:     'Display ad',
        volume:   100000,
        rate:     1.9856,
        size: '150x100',
        io_lineitem_id: 495,
        type: 'Display',
        creatives: new ReachUI.Creatives.CreativesList(),
         targeting: BackboneFactory.create('targeting')
      });

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
  });
});