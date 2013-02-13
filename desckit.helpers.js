var fs = require('fs')
  , _ = require('underscore')
;

module.exports = function (debug) {
  var baseDesck = {
      id: '',
      name: '',
      path: ''
    }
  ;
  function getDescks (dir, callback) {
    fs.readdir(dir, function (err, result) {
      if (err || (!result || result.length < 1)) { callback(err, null); return; }
      var i, descks = [];
      
      for (i = 0; i < result.length; ++i) {
        var desck = _.extend({}, baseDesck)
          , desckName = result[i]
          , desckPath = dir + '/' + desckName
          , desckFile = desckPath + '/desck.json';
        
        // See if we have desck.json file
        if (fs.existsSync(desckFile)) {
          desck = _.extend(baseDesck, JSON.parse(fs.readFileSync(desckFile, 'utf8')));
        } else {
          desck.name = desckName;
        }
        
        
        desck.id = desckName;
        desck.path = desckPath;
        descks.push(desck);
      }
      callback(null, descks);
    });
  }
  
  return {
    getDescks: getDescks
  }
}