describe('Creative view', function() {
  describe('ReachUI.Creatives.CreativeView', function() {

    beforeEach(function() {
      this.creative = new ReachUI.Creatives.Creative({
        name: 'Test'
      });

      this.view = new ReachUI.Creatives.CreativeView({ model: this.creative });
    });

    it('should be defined', function() {
      expect(ReachUI.Creatives.CreativeView).toBeDefined();
    });

    it('can be instantiated', function() {
      expect(this.view).not.toBeNull();
    });
  });
});
