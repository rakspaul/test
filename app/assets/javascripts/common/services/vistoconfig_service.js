(function() {
  var vistoconfig = function () {

    this.screenTypeMap = [];
    this.screenTypeMap['desktop'] ='icon-desktop';
    this.screenTypeMap['unknown'] ='icon-help';
    this.screenTypeMap['smartphone'] ='icon-mobile';
    this.screenTypeMap['mobile'] ='icon-mobile';
    this.screenTypeMap['tv'] ='icon-desktop';
    this.screenTypeMap['set-top box'] ='icon-desktop';
    this.screenTypeMap['tablet'] ='icon-tablet';
    this.screenTypeMap['other'] ='icon-image';
    this.screenTypeMap['display'] ='icon-desktop';
    this.screenTypeMap['DISPLAY'] ='icon-desktop';

    this.formatTypeMap = [];
    this.formatTypeMap['desktop'] ='icon-desktop';
    this.formatTypeMap['unknown'] ='icon-help';
    this.formatTypeMap['smartphone'] ='icon-mobile';
    this.formatTypeMap['mobile'] ='icon-mobile';
    this.formatTypeMap['tv'] ='icon-desktop';
    this.formatTypeMap['set-top box'] ='icon-desktop';
    this.formatTypeMap['tablet'] ='icon-tablet';
    this.formatTypeMap['other'] ='icon-image';
    this.formatTypeMap['display'] ='icon-desktop';
    this.formatTypeMap['DISPLAY'] ='icon-desktop';

  };

  commonModule.service("vistoconfig", vistoconfig);

}());
