describe('Shared targeting methods', function() {
  beforeEach(function() {
    jasmine.Ajax.install();

    jasmine.Ajax.stubRequest('/admin/audience_groups.json').andReturn({
      "responseText": 'immediate response'
    });

    noty = jasmine.createSpy('noty spy');

    this.order = new ReachUI.Orders.Order();
    this.lineitem      = BackboneFactory.create('lineitem');
    this.secondLineitem = BackboneFactory.create('lineitem');
    this.secondLineitem.set('id', 496);
    this.secondLineitem.set('targeting', BackboneFactory.create('emptyTargeting'));

    // TODO reuse factory that exists in 704 branch
    this.ad = new ReachUI.Ads.Ad({
      name:     'Display ad',
      volume:   100000,
      rate:     1.9856,
      size: '150x100',
      type: 'Display',
      io_lineitem_id: 495,
      creatives: new ReachUI.Creatives.CreativesList(),
      targeting: BackboneFactory.create('emptyTargeting')
    });

    this.secondAd = new ReachUI.Ads.Ad(_.clone(this.ad.attributes));
    this.lineitem.ads = [ this.ad, this.secondAd ];

    this.liCollection = new ReachUI.LineItems.LineItemList([ this.lineitem, this.secondLineitem ]);
    this.liCollection.setOrder(this.order);

    this.liListView = new ReachUI.LineItems.LineItemListView({ collection: this.liCollection });
    var el = this.liListView.render().$el;
    $('body').append(el);
    this.liView = this.liListView.children.findByModel(this.lineitem);

    this.targeting = BackboneFactory.create('targeting');
  });

  afterEach(function () {
    jasmine.Ajax.uninstall();
  });

  describe('copy', function() {
    beforeEach(function() {
      ReachUI.LineItems.LineItem.setCopyBuffer('targeting', null); // clear copy buffer
    });
    it('should copy key values targeting', function() {
      this.liView.ui.copy_targeting_btn.find('.copy-targeting-item[data-type="key_values"]').click();
      var copied = {
        selected_key_values: this.targeting.get('selected_key_values'),
        keyvalue_targeting:  this.targeting.get('keyvalue_targeting')
      };
      expect(ReachUI.LineItems.LineItem.getCopyBuffer('targeting')).toEqual(copied);
    });

    it('should copy geo targeting', function() {
      this.liView.ui.copy_targeting_btn.find('.copy-targeting-item[data-type="geo"]').click();
      var copied = {
        selected_zip_codes: this.targeting.get('selected_zip_codes'),
        selected_geos:      this.targeting.get('selected_geos')
      };
      expect(ReachUI.LineItems.LineItem.getCopyBuffer('targeting')).toEqual(copied);
    });

    it('should copy frequency caps', function() {
      this.liView.ui.copy_targeting_btn.find('.copy-targeting-item[data-type="freq_cap"]').click();
      var copied = {
        frequency_caps: [
          _.omit(this.targeting.get('frequency_caps').models[0].attributes, 'id')
        ]
      };
      expect(ReachUI.LineItems.LineItem.getCopyBuffer('targeting')).toEqual(copied);
    });

    it('should collect selected targetings', function() {
      this.liView.ui.copy_targeting_btn.find('.copy-targeting-item[data-type="key_values"]').click();
      this.liView.ui.copy_targeting_btn.find('.copy-targeting-item[data-type="geo"]').click();
      var copied = {
        selected_key_values: this.targeting.get('selected_key_values'),
        keyvalue_targeting:  this.targeting.get('keyvalue_targeting'),
        selected_zip_codes: this.targeting.get('selected_zip_codes'),
        selected_geos:      this.targeting.get('selected_geos')
      };
      expect(ReachUI.LineItems.LineItem.getCopyBuffer('targeting')).toEqual(copied);
    });

    it('should deselect all selected items', function() {
      spyOn(this.liView, "_deselectAllItems");
      this.liView.ui.copy_targeting_btn.find('.copy-targeting-item[data-type="key_values"]').click();
      expect(this.liView._deselectAllItems).toHaveBeenCalled();
    });
  });

  describe('paste', function() {
    beforeEach(function() {
      this.secondLiView = this.liListView.children.findByModel(this.secondLineitem);
      ReachUI.LineItems.LineItem.setCopyBuffer('targeting', null); // clear copy buffer
      var targeting = this.lineitem.get('targeting');
      this.targeting = {
        selected_key_values: targeting.get('selected_key_values'),
        keyvalue_targeting:  targeting.get('keyvalue_targeting')
      };
      ReachUI.LineItems.LineItem.setCopyBuffer('targeting', this.targeting);
    });
    it('should paste targeting into selected items', function() {
      this.secondLiView.$el.find('.li-number').click();
      this.secondLiView.ui.paste_targeting_btn.click();
      var pasted = this.secondLineitem.get('targeting').get('selected_key_values');
      expect(pasted).toEqual(this.targeting.selected_key_values);
    });

    it('should paste targeting from lineitem to ads', function() {
      //select first ad
      this.liView.$el.find('.ad-row .item-selection')[0].click();
      this.liView.$el.find('.ad-paste-targeting-btn')[0].click();
      var pasted = this.ad.get('targeting').get('selected_key_values');
      expect(pasted).toEqual(this.targeting.selected_key_values);
    });

    it('should call cancel targeting', function() {
      this.secondLiView.$el.find('.li-number').click();

      spyOn(this.secondLiView, "cancelTargeting");
      this.secondLiView.ui.paste_targeting_btn.click();
      expect(this.secondLiView.cancelTargeting).toHaveBeenCalled();
    });
  });

  describe('cancel', function() {
    beforeEach(function() {
      this.secondLiView = this.liListView.children.findByModel(this.secondLineitem);
      ReachUI.LineItems.LineItem.setCopyBuffer('targeting', null); // clear copy buffer
      var targeting = this.lineitem.get('targeting');
      this.targeting = {
        selected_key_values: targeting.get('selected_key_values'),
        keyvalue_targeting:  targeting.get('keyvalue_targeting')
      };
      ReachUI.LineItems.LineItem.setCopyBuffer('targeting', this.targeting);
    });

    it('should clear copy buffer', function() {
      this.secondLiView.$el.find('.li-number').click();
      this.secondLiView.cancelTargeting();
      expect(ReachUI.LineItems.LineItem.getCopyBuffer('targeting')).toBeNull();
    });

    it('should deselect all selected items', function() {
      this.secondLiView.$el.find('.li-number').click();

      spyOn(this.secondLiView, "_deselectAllItems");
      this.secondLiView.cancelTargeting();
      expect(this.secondLiView._deselectAllItems).toHaveBeenCalled();
    });
  });

  describe('toggleItemSelection', function() {
    it('should select item', function() {
      this.liView.$el.find('.li-number').click();
      expect(this.liView.ui.item_selection).toHaveClass('selected');
    });

    it('should remember selected item', function() {
      this.liView.$el.find('.li-number').click();
      expect(ReachUI.LineItems.LineItem.getSelectedItem('li')).toEqual([ this.liView ]);
    });
  });

  describe('deselectAllItems', function() {
    beforeEach(function() {
      this.liView.$el.find('.li-number').click();
      this.liView._deselectAllItems();
    });

    it('should remove selected class', function() {
      expect(this.liView.ui.item_selection).not.toHaveClass('selected');
    });

    it('should hide copy buttons', function() {
      expect(this.liView.ui.copy_targeting_btn).toBeHidden();
    });
  });
});
