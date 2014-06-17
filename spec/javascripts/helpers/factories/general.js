var Factories = {};

Factories.Lineitem = BackboneFactory.define('lineitem', ReachUI.LineItems.LineItem, function() {
  return {
    name: 'Pre-roll Video Line Item',
    volume: 300124,
    rate:  1.9856,
    ad_sizes: '1x1',
    creatives: [],
    targeting: BackboneFactory.create('targeting')
  };
});

Factories.Targeting = BackboneFactory.define('targeting', ReachUI.Targeting.Targeting);
