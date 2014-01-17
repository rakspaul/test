describe('ReachUI.Ads.Ad', function() {
  it('should be defined', function() {
    expect(ReachUI.Ads.Ad).toBeDefined();
  });

  it('can be instantiated', function() {
    var ad = new ReachUI.Ads.Ad();
    expect(ad).not.toBeNull();
  });

  describe('new instance default values', function() {
    beforeEach(function() {
      this.ad = new ReachUI.Ads.Ad();
    });

    it('has default value for the .start-date attribute', function() {
      var defaultStartDate = moment().add('days', 1).format("YYYY-MM-DD");
      expect(this.ad.get('start_date')).toEqual(defaultStartDate);
    });

    it('has default value for the .end-date attribute', function() {
      var defaultEndDate = moment().add('days', 15).format("YYYY-MM-DD");
      expect(this.ad.get('end_date')).toEqual(defaultEndDate);
    });
  });
});
