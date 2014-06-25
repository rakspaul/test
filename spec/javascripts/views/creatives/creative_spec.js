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
        this.liCollection = new ReachUI.LineItems.LineItemList([ this.lineitem ]);
        this.lineitemView = new ReachUI.LineItems.LineItemView({
          model: this.lineitem
        });

        this.view = new ReachUI.Creatives.CreativeView({
          model:       this.creative,
          parent_view: this.lineitemView
        });
        var el = this.view.render().$el;
        $('body').append(el);
        this.deleteBtnContainer = this.view.$el.find('.delete-btn-container');
      });

      it('show delete button for not pushed creative', function() {
        expect($(this.deleteBtnContainer)).toContainElement('div.delete-btn');
      });

      it('hide delete button for pushed creative', function() {
        this.view.model.set({'source_id': 25781692}, {silent: true});
        this.view.render();
        this.deleteBtnContainer = this.view.$el.find('.delete-btn-container');
        expect($(this.deleteBtnContainer)).not.toContainElement('div.delete-btn');
      });

      it('show tooltip for video type', function() {
        this.lineitem.set({'type': 'Video'}, {silent: true});
        this.view.render();
        this.deleteBtnContainer = this.view.$el.find('.delete-btn-container');
        expect($(this.deleteBtnContainer)).toContainElement('span.video-creatives-caution');
      });
    })
  });
});
