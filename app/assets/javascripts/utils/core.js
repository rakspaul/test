var ReachUI = {
  namespace: function(ns) {
    var parts = ns.split("."),
      object = this,
      i, len;
    for (i=0, len=parts.length; i < len; i++) {
      if (!object[parts[i]]) {
        object[parts[i]] = {};
      }
      object = object[parts[i]];
    }

    return object;
  }
};

ReachUI.formatColumn = function(value, type, precision) {
  if(type === 'number') {
    return accounting.formatNumber(value, precision || 0);
  } else {
    return value;
  }
}

// For the US Government fiscal year
// Oct-Dec = 1
// Jan-Mar = 2
// Apr-Jun = 3
// Jul-Sep = 4
ReachUI.getQuarter = function(d) {
  d = d || new Date();
  var m = Math.floor(d.getMonth()/3) + 2;
  return m > 4? m - 5 : m;
}
