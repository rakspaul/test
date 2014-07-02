var Factories = {};

Factories.Lineitem = BackboneFactory.define('lineitem', ReachUI.LineItems.LineItem, function() {
  return {
    id: 495,
    name: 'Pre-roll Video Line Item',
    volume: 300124,
    rate:  1.9856,
    ad_sizes: '1x1',
    creatives: new ReachUI.Creatives.CreativesList(),
    targeting: BackboneFactory.create('targeting')
  };
});

Factories.Ad = BackboneFactory.define('ad', ReachUI.Ads.Ad, function() {
  return {
    name: 'Pre-roll Video Line Item',
    volume: 200,
    rate:  1.9856,
    ad_sizes: '1x1',
    io_lineitem_id: 495,
    type: 'Video',
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