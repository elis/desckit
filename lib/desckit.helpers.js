'use strict';

var fs = require('fs')
  , _ = require('underscore')
;

module.exports = function (debug) {
  var descks = {}
  , baseDesck = {
      id: '',
      name: '',
      path: ''
    }
  ;
  function getDescks (dir, callback) {
    var callback = ('function' == typeof callback) ? callback : function () {};
    
    fs.readdir(dir, function (err, result) {
      if (err || (!result || result.length < 1)) { callback(err, null); return; }
      var i, list = [];
      
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
        list.push(desck);
      }
      callback(null, list);
    });
  }
  
  function getDesck (path, callback) {
    var callback = ('function' == typeof callback) ? callback : function () {};
    
    if (path in descks) { callback(null, descks[path]); return; }
    
    var desck = {}
      , path = path.trim('/').trim('\\')
      , desckConfFile = path + '/desck.json'
    ;
    
    desck.path = path.split('/');
    desck.name = desck.path[desck.path.length-1];
    
    function ready () {
      if (!desck.conf) return;
      
      desck.conf.templateFile = desck.conf.templateFile || path + '/script.ejs'
      
      console.log('Conf loaded, this is desck:', desck);
      // see if script is loadable and has init function
      var scriptFile = desck.conf.scriptFile || path + '/script.js';
      
      if (fs.existsSync(scriptFile)) {
        desck.script = require(scriptFile);
        if ('function' == typeof desck.script.init) {
          desck.script.init(desck, function () {
            callback(null, desck);
          });
        }
      } else {
        callback(null, desck);
      }
      
    }
    
    
    // check if desck.json exists and load it
    if (fs.existsSync(desckConfFile)) {
      fs.readFile(desckConfFile, 'utf8', function (err, content) {
        if (err) { callback(err, content); return; }
        
        desck.conf = JSON.parse(content);
        descks[path] = desck;
        
        ready();
      });
    } else {
      desck.conf = {};
      ready();
    }
    
    
  }
  
  return {
    getDescks: getDescks,
    getDesck: getDesck
  }
}