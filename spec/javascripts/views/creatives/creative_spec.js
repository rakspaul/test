describe('Creative view', function() {
  describe('ReachUI.Creatives.CreativeView', function() {

    beforeEach(function() {
      this.creative = BackboneFactory.create('creative');

      this.view = new ReachUI.Creatives.CreativeView({ model: this.creative });
    });

    it('should be defined', function() {
      expect(ReachUI.Creatives.CreativeView).toBeDefined();
    });

    it('can be instantiated', function() {
      expect(this.view).not.toBeNull();
    });

    describe('creative row', function() {
      beforeEach(function() {
        this.lineitem = BackboneFactory.create('lineitem');
        this.liView = new ReachUI.LineItems.LineItemView({ model: this.lineitem });

        this.view = new ReachUI.Creatives.CreativeView({
          model:       this.creative,
          parent_view: this.liView
        });
        var el = this.view.render().$el;
        $('body').append(el);
        this.deleteBtnContainer = this.view.$el.find('.delete-btn-container');
      });

      xit('show delete button for not pushed creative', function() {
        //console.log(this.deleteBtnContainer);
        console.log('ACTUAL');
        console.log($(this.deleteBtnContainer).html());
        console.log('END');
        //expect($('<div><div class="delete-btn"></div></div>')).toContainElement('div.delete-btn');
        //expect($(this.deleteBtnContainer)).toContainElement('div.delete-btn');
        
        //expect(this.view.$el.)
        //creative.get('source_id')
      });
    })
  });
});
