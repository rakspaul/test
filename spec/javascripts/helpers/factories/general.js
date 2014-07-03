var Factories = {};

Factories.Lineitem = BackboneFactory.define('lineitem', ReachUI.LineItems.LineItem, function() {
  return {
    id: 495,
    name:       'Display Line Item',
    start_date: '2013-06-01',
    end_date:   '2013-06-07',
    volume:     300124,
    rate:       1.9856,
    buffer:     0,
    ad_sizes:  '150x100',
    creatives:  new ReachUI.Creatives.CreativesList(),
    ads:        [],
    targeting:  BackboneFactory.create('targeting')
  };
});

Factories.Ad = BackboneFactory.define('ad', ReachUI.Ads.Ad, function() {
  return {
    name:     'Display ad',
    volume:   100000,
    rate:     1.9856,
    ad_sizes: '150x100',
    io_lineitem_id: 495,
    type: 'Display',
    creatives: new ReachUI.Creatives.CreativesList(),
    targeting: BackboneFactory.create('targeting')
  };
});

Factories.Targeting = BackboneFactory.define('targeting', ReachUI.Targeting.Targeting);

Factories.Creative = BackboneFactory.define('creative', ReachUI.Creatives.Creative, function() {
  return {
    ad_size:       "300x600",
    creative_type: "ThirdPartyCreative",
    start_date:    "2014-06-22",
    end_date:      "2014-08-31",
    source_id:     "R_06a26b90-3c4c-4674-a129-09cbc6ce65e2" // this creative is not pushed to DFP
  };
});