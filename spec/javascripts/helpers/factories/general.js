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

Factories.VideoLineitem = BackboneFactory.define('video_lineitem', ReachUI.LineItems.LineItem, function() {
  return {
    id: 496,
    name:       'Pre-roll Video Line Item',
    start_date: '2013-06-01',
    end_date:   '2013-06-07',
    volume:     300124,
    rate:       1.9856,
    buffer:     0,
    master_ad_size: '1x1',
    ad_sizes:       '1x1',
    type:       'Video',
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

Factories.emptyTargeting = BackboneFactory.define('emptyTargeting', ReachUI.Targeting.Targeting);
Factories.targeting = BackboneFactory.define('targeting', ReachUI.Targeting.Targeting, function() {
  return {
    selected_zip_codes: [ "14020", "14020", "14482", "14103", "14009", "14427" ],
    selected_geos: [
      { id: 1634, title: "Albany-Schenectady-Troy NY", type: "DMA" },
      { id: 1722, title: "Alexandria LA",              type: "DMA" },
      { id: 1790, title: "Albuquerque-Santa Fe NM",    type: "DMA" }
    ],
    selected_key_values: [
      { id: 61, title: "Age : 18-24", key_values: "btg=pr.km,btg=pr.kn,btg=pr.ko,btg=pr.kp,btg=pr.ca" },
      { id: 62, title: "Age : 25-34", key_values: "btg=pr.kq,btg=pr.kr,btg=pr.ks,btg=pr.kt,btg=pr.cb" },
      { id: 56, title: "Boating",     key_values: "btg=cm.7env,btg=cm.d3yx,btg=cm.gqrr,btg=cm.kyjc,btg=cm.n7z4,btg=cm.yqud,contx=games,contx=s6" }
    ],
    audience_groups: [
      {"id":60,"name":"African American","key_values":"btg=pr.me,btg=pr.mf,btg=pr.mg,btg=pr.mh,btg=pr.ea"},
      {"id":61,"name":"Age : 18-24","key_values":"btg=pr.km,btg=pr.kn,btg=pr.ko,btg=pr.kp,btg=pr.ca"},
      {"id":62,"name":"Age : 25-34","key_values":"btg=pr.kq,btg=pr.kr,btg=pr.ks,btg=pr.kt,btg=pr.cb"},
      {"id":63,"name":"Age : 35-44","key_values":"btg=pr.ku,btg=pr.kv,btg=pr.kw,btg=pr.kx,btg=pr.cc"},
      {"id":64,"name":"Age : 45-54","key_values":"btg=pr.ky,btg=pr.kz,btg=pr.la,btg=pr.lb,btg=pr.cd"},
      {"id":65,"name":"Age : 55-64","key_values":"btg=pr.lc,btg=pr.ld,btg=pr.le,btg=pr.lf,btg=pr.ce"},
      {"id":66,"name":"Age : 65+","key_values":"btg=pr.lg,btg=pr.lh,btg=pr.li,btg=pr.lj,btg=pr.cf"},
      {"id":67,"name":"Asian","key_values":"btg=pr.mi,btg=pr.mj,btg=pr.mk,btg=pr.ml,btg=pr.ke"},
      {"id":56,"name":"Boating","key_values":"btg=cm.7env,btg=cm.d3yx,btg=cm.gqrr,btg=cm.kyjc,btg=cm.n7z4,btg=cm.yqud,contx=games,contx=s6"}
    ],
    frequency_caps: new ReachUI.FrequencyCaps.FrequencyCapsList([
      BackboneFactory.create('frequencyCap')
    ]),
    keyvalue_targeting: "",
    type: 'Display'
  };
});

Factories.frequencyCap = BackboneFactory.define('frequencyCap', ReachUI.FrequencyCaps.FrequencyCap, function() {
  return {
    impressions: 3,
    time_unit:   2,
    time_value:  24
  }
});

Factories.Creative = BackboneFactory.define('creative', ReachUI.Creatives.Creative, function() {
  return {
    ad_size:       "300x600",
    creative_type: "ThirdPartyCreative",
    start_date:    "2014-06-22",
    end_date:      "2014-08-31",
    source_id:     "R_06a26b90-3c4c-4674-a129-09cbc6ce65e2" // this creative is not pushed to DFP
  };
});

