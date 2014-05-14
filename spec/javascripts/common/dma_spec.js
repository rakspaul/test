describe('DMA', function() {
  describe('DMA.Model', function() {
    it('should be defined', function() {
      expect(ReachUI.DMA.Model).toBeDefined();
    });

    describe('on initialize', function() {
      beforeEach(function() {
        this.dma = new ReachUI.DMA.Model();
      });

      it('has "id" and "name" attributes', function() {
        expect(this.dma.get('id')).not.toBeNull();
        expect(this.dma.get('name')).not.toBeNull();
      });

      it('has default value for "id"', function() {
        expect(this.dma.get('id')).toBe('');
      });

      it('has default value for "name"', function() {
        expect(this.dma.get('name')).toBe('');
      });
    });
  });

  describe('DMA.List', function() {
    it('should be defined', function() {
      expect(ReachUI.DMA.List).toBeDefined();
    });

    describe('on initialize', function() {
      it('has correct url', function() {
        var list = new ReachUI.DMA.List();
        expect(list.url).toBe('/dmas.json');
      });
    });
  });

  describe('DMA.OptionView', function() {
    it('should be defined', function() {
      expect(ReachUI.DMA.OptionView).toBeDefined();
    });

    it('renders "option" tag', function() {
      var dma = new ReachUI.DMA.Model({code: '501', name: 'New York'});
      var optionView = new ReachUI.DMA.OptionView({model: dma});
      expect(optionView.render().$el).toBe('option');
    });

    describe('option tag', function() {
      beforeEach(function() {
        var dma = new ReachUI.DMA.Model({id: '501', name: 'New York'});
        this.optionView = new ReachUI.DMA.OptionView({model: dma});
      });


      it('has correct value attribute', function() {
        expect(this.optionView.render().$el).toHaveAttr('value', '501');
      });

      it('has correct text', function() {
        expect(this.optionView.render().$el).toHaveText('New York');
      });
    });
  });

  describe('DMA.ChosenView', function() {
    it('should be defined', function() {
      expect(ReachUI.DMA.ChosenView).toBeDefined();
    });

    it('should have DMA.OptionView as itemView', function() {
      expect(new ReachUI.DMA.ChosenView({}).itemView).toBe(ReachUI.DMA.OptionView);
    });

    describe('on render', function() {
      beforeEach(function() {
        var dmaList = new ReachUI.DMA.List();
        dmaList.add(new ReachUI.DMA.Model({id: '501', name: 'New York'}));
        dmaList.add(new ReachUI.DMA.Model({id: '839', name: 'Las Vegas'}));

        this.dmaView = new ReachUI.DMA.ChosenView({collection: dmaList});
        this.dmaView.setDmaIds(['501']);
        this.el = this.dmaView.render().$el;
      });

      it('renders select tag', function() {
        expect(this.el).toBe('select');
      });

      it('has two option tags', function() {
        expect(this.el.find('option')).toHaveLength(2);
      });

      it('has multiple attribute', function() {
        expect(this.el).toHaveAttr('multiple');
      });

      it('has data-placeholder attribute', function() {
        expect(this.el).toHaveAttr('data-placeholder', 'Select dma...');
      });

      it('sets option tag as selected', function() {
        expect(this.el.find('option[selected]')).toHaveAttr('value', '501');
      });
    });
  });
});
