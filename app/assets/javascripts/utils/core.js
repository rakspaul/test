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

// Jan-Mar = 1
// Apr-Jun = 2
// Jul-Sep = 3
// Oct-Dec = 4
ReachUI.getQuarter = function(d) {
  d = d || new Date();
  return Math.ceil((d.getMonth() + 1) / 3);
}
