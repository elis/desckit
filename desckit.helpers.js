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
    if (path in descks) callback(null, descks[path]);
    
    var desck = function(){}
      , path = path.trim('/').trim('\\')
      , desckConfFile = path + '/desck.json'
    ;
    
    desck.path = path.split('/');
    desck.name = desck.path[desck.path.length-1];
    
    function ready () {
      if (!desck.conf) return;
      
      // see if script is loadable and has init function
      var scriptFile = desck.conf.scriptFile || path + '/script.js';
      
      if (fs.existsSync(scriptFile)) {
        script = require(scriptFile);
        if ('function' == typeof script.init) {
          script.init(desck);
        }
      }
      
      callback(null, desck);
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
    getDescks: getDescks
  }
}