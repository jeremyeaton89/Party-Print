var Utils = {
  merge: function() {
    var result = {};
    for (var i in arguments) {
      var arg = arguments[i];
      for (var prop in arg) {
        result[prop] = arg[prop];
      }
    }
    return result;
  },
  objEqual: function(obj1, obj2) {
    for (var prop in obj1) {
      if (obj1[prop] !== obj2[prop]) return false; 
    }
    return true;
  },
  objInArr: function(obj, array) {
    for (var i = 0; i < array.length; i++) {
      if (Utils.objEqual(obj, array[i])) return true;
    };

    return false;
  }
}

module.exports = Utils;
