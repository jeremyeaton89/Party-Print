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
}

module.exports = Utils;
