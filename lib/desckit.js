'use strict';
var program = require('commander')
  , ejs = require('ejs')
  , _ = require('underscore')
	, fs = require('fs')
  , phantomControl = require( __dirname + '/../lib/phantom/phantomControl')
	, debug = require('debug')('desckit:core')
	;

var desckit = module.exports = {};
var descks = desckit._loadedDescks = {};


desckit.getDesck = function (desckPath, callback) {
  var callback = ('function' == typeof callback) ? callback : function () {};
	
	if (desckPath in descks) { callback(null, descks[desckPath]); }
	
	desckit.loadDesck(desckPath, function (err, desck) {
		descks[desckPath] = err ? { error: err } : desck;
		callback(err, desck);
	});
}

desckit.loadDesck = function (desckPath, callback) {
  var callback = ('function' == typeof callback) ? callback : function () {};
  
  var desck = new (require('./Desck.js'))
    , desckPath = desckPath.trim('/').trim('\\')
    , desckConfFile = desckPath + '/desck.json'
  ;
  
  desck.desckPath = desckPath.split('/');
  desck.name = desck.desckPath[desck.desckPath.length-1];
  
  function ready () {
    if (!desck.conf) return; // wait for the config to be ready
    
    desck.conf.templateFile = desck.conf.templateFile || desckPath + '/script.ejs'
    
    // see if script is loadable and has init function
    var scriptFile = desck.conf.scriptFile || desckPath + '/script.js';
    
    if (fs.existsSync(scriptFile)) {
    	debug('"%s" script file exists', scriptFile)
      _.extend(desck, require(scriptFile));
      debug('script loaded:', '\n', 'Desck:', desck);
      if ('function' == typeof desck.init) {
        desck.init(function () { 
          callback(null, desck);
        }) ? callback(null, desck) : null;
        return;
      }
    }
    callback(null, desck);
  }
  
  // check if desck.json exists and load it
  if (fs.existsSync(desckConfFile)) {
    fs.readFile(desckConfFile, 'utf8', function (err, content) {
      if (err) { callback(err, content); return; }
      
      desck.conf = JSON.parse(content);
      descks[desckPath] = desck;
      
      ready();
    });
  } else {
    desck.conf = {};
    ready();
  }
}

desckit.compileDesck = function (desck, callback) {
  var template = desck.conf.templateFile;
  
  function ready () {
    var locals = _.extend({}, desck.locals);
    ejs.renderFile(template, locals, function (err, output) {
      if (err) {
        callback(err, output);
        return;
      }
      locals.output = output;
      callback(null, output);
    });
  }
  
  if ('function' == typeof desck.update) {
      desck.update(function (err, result) {
        debug('Desck after script update, firing ready...');
        ready(); 
      });
  } else {
      ready();
  }
}


desckit.renderToFile = function (settings, callback) {
  var settings = _.extend({
      url: '',
      outputFile: '',
      width: '1920', 
      height: '1080'
    }, settings);
  
  debug('Request to render to file with the following settings:');
  debug('Settings:', settings);
  
  phantomControl.render({
      url: settings.url,
      outputFile: settings.outputFile,
      width: settings.width, 
      height: settings.height
    }, 
    function (err, result) {
      debug('got result:', result)
    }
  ); 
}

// Testing
if (process.env.DESCKIT_TESTMODE) {
  var beginTest = function () {
    console.log('\n\n.--------------------------------------------------.');
    console.log('.                Test Mode Activated               .');
    console.log('.__________________________________________________.\n\n');
    
    program.prompt('Render filename:', function (filename) {
      desckit.renderToFile({
        outputFile: __dirname + '/../../test.png' || filename,
        url: 'http://localhost:1280/assemble/eli1'
      },
        function (err, desck) {
          debug('============ render ot file ==========');
          debug('err:', err);
          debug('desck:', desck);
          beginTest();
        });
    });
  }
  beginTest();
}