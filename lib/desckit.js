'use strict';
var program = require('commander')
  , ejs = require('ejs')
  , _ = require('underscore')
	, fs = require('fs')
  , path = require('path')
	, debug = require('debug')('desckit:core')

var desckit = module.exports = {};
var descks = desckit._loadedDescks = {};
var config = desckit.config = {
  // These are the default configuration, they're overrided by the config by app.js
  descksPath: path.normalize(__dirname + '/../public/descks'),
  tempPath: path.normalize(__dirname + '/../temp'),
  renderWriteTime: 1000/* ms */, 
  renderTime: 1000 
};

/**
 * @param  {Object} conf 
 */
desckit.useConfig = function (conf) {
  _.extend(config, conf);
  if (process.env.DESCKIT_TESTMODE) beginTest();
}


desckit.loadDescks = function (dir, callback) {
  if (!callback) { 
    callback = ('function' == typeof dir) ? dir : function () {};
    dir = path.normalize(config.descksPath)
  }
  
  var i, list = [];
  
  fs.readdir(dir, function (err, result) {
    if (err || (!result || result.length < 1)) { callback(err, null); return; }
    
    for (i = 0; i < result.length; ++i) {
      var desckName = result[i]
        , desckPath = dir + '/' + desckName;
      
      list.push(desckit.getDesck(desckPath));
    }
    callback(null, list);
  });
  
  return list;
}

/**
 * Fetch a Desck based on desckPath
 * Will try to load a desck from local cache, and will
 * load one and store it in local cache if not found
 * @param  {String}   desckPath directory containing the 'desck.json' file
 * @param  {Function} callback  (mixed err, Desck)
 * @return {Desck}              !! Will return an unfinished Desck !!
 */
desckit.getDesck = function (desckPath, callback) {
  var callback = ('function' == typeof callback) ? callback : function () {};
	
	if (desckPath in descks) { callback(null, descks[desckPath]); return descks[desckPath]; }
	
	return desckit.loadDesck(desckPath, function (err, desck) {
		descks[desckPath] = err ? { error: err } : desck;
		callback(err, desck);
	});
}

/**
 * Load a Desck given a desckPath
 * @param  {String}   desckPath directory that contains a 'desck.json' file
 * @param  {Function} callback  (mixed err, Desck)
 * @return {Desck}              !! Will return an unfinshed Desck !!
 */
desckit.loadDesck = function (desckPath, callback) {
  var callback = ('function' == typeof callback) ? callback : function () {};
  
  var desck = new (require('./Desck.js'))
    , desckPath = desckPath.trim('/').trim('\\')
    , desckConfFile = desckPath + '/desck.json'
  ;
  
  desck.desckPath = desckPath.split('/');
  desck.path = path.resolve.apply(null, desck.desckPath)
  desck.name = desck.desckPath[desck.desckPath.length-1];
  
  function ready () {
    if (!desck.conf) return; // wait for the config to be ready
    
    desck.conf.templateFile = desck.conf.templateFile ?
      path.resolve(desckPath, desck.conf.templateFile) :
      path.resolve(desckPath, 'script.ejs');
    
    // see if script is loadable and has init function
    var scriptFile = desck.conf.scriptFile ?
      path.normalize(desckPath + '/' + desck.conf.scriptFile) :
      desckPath + '/script.js' ;
    
    if (fs.existsSync(scriptFile)) {
    	debug('"%s" script file exists', scriptFile)
      _.extend(desck, require(scriptFile));
      debug('Script file loaded for:', desck.name);
      
      if ('function' == typeof desck.init) {
        desck.init(callback) ? 
          callback(null, desck) : 
          null ;
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
  
  return desck;
}

/**
 * (un)Intelligent Desck retrieval based on desckName
 * @param  {String}   desckName 
 * @param  {Function} callback  (mixed err, Desck)
 * @return {Desck}              !! Will return an unfinished Desck !!
 */
desckit.getDesckByName = function (desckName, callback) {
  var desckPath = config.descksPath + "/" + desckName;
  return desckit.getDesck(desckPath, callback);
}

/**
 * Compile a Desck and return the HTML output for the desck
 * @param  {Desck}   desck     
 * @param  {Function} callback (mixed err, String output)
 */
desckit.compileDesck = function (desck, callback) {
  var template = path.resolve(desck.path, desck.conf.templateFile);

  if (!fs.existsSync(template)) {
    callback("Desck template file is missing ("+template+")");
    return;
  }
  function ready () {
    debug('Ready to render file, this is desck.locals:', desck.locals);
    var locals = _.extend({}, desck.locals, {desck: desck});
    ejs.renderFile(template, locals, function (err, output) {
      if (err) {
        callback(err, output);
        return;
      }
      locals.output = output;
      callback(null, output);
    });
  }
  
  if ('function' == typeof desck.render) {
    desck.render(function (err, result) {
      debug('Desck rendered, firing ready...');
      ready(); 
    });
  } else {
    ready();
  }
}


/**
 * Default rendering settings for renderToFile
 * @type {Object}
 */
var defaultRenderSettings = {
    url: '',
    outputFile: ''
};

/**
 * Render a URL to a file
 * @param  {Object}   settings See defaultRenderSettings above
 * @param  {Function} callback (mixed err, String filename)
 */
desckit.renderToFile = function (settings, callback) {
  var settings = _.extend({}, defaultRenderSettings, settings)
    , phantom = require('phantom')
    , im = require('imagemagick')
    , fs = require('fs')
  
  debug('Begin renderToFile with settings:', settings);
  
  phantom.create(function (ph) {
    ph.createPage(function (page) {
      page.open(settings.url, function (status) {
        if (status !== 'success') {
          debug('Failed to load page :(', settings.url, status);
          callback({
            error: "Unable to load page",
            status: status
          }, status);
        } else {
          // Setting a timeout here to wait for the page to complete load
          setTimeout(function() {
            page.render(settings.outputFile);
            
            // setting a short timeout to allow phantom to write image to disk
            setTimeout(function() { 
              callback(null, settings.outputFile); 
              
            }, config.renderWriteTime);
            
          }, config.renderTime)
        }
      })
    })
  }, {
      dnodeOpts: {
        weak: false
      }
    });
}


/**
 * Default settings for resizeImage
 * @type {Object}
 */
var defaultResizeSettings = {
  srcPath: undefined,
  dstPath: undefined,
  quality: 1,
  format: 'png'
}

/**
 * Resize an image
 * @param  {Object}   settings see defaultResizeSettings above
 * @param  {Function} callback (mixed err, String output filename)
 */
desckit.resizeImage = function (settings, callback) {
  var im = require('imagemagick')
    , fs = require('fs')
    
  var settings = _.extend({}, defaultResizeSettings, settings);
    
  debug('Generating thumbnail with the following options:', settings);
  
  im.resize(settings, function(err, stdout, stderr){
    callback(err, err ? [err, stdout, stderr] : settings.dstPath);
  });
}

desckit.setImageAsWallpaper = function (filename, callback) {
  var spawn = require('child_process').spawn,
    dwc  = spawn('./dwc/WallpaperChanger.exe', [filename, 1]);

    debug('running DWC for file:', filename);
    dwc.stdout.on('data', function (data) {
      debug('DWC stdout: ', data);
    });

    dwc.stderr.on('data', function (data) {
      debug('DWC stderr: ', data);
    });
    dwc.on('close',function(code){
      debug('Result of DWC:', code, arguments);
      callback();
    })
}

// Testing
if (process.env.DESCKIT_TESTMODE) {
  var beginTest = function () {
    debug('start testing...');
    desckit.getDesckByName('base', function (err, desck) {
      debug('desck loaded?', err, desck)
    });
    // desckit.setImageAsWallpaper('public/cache/base-desck/a.png', function(err, res) {
    //   debug('done!', err, res);
    // })
  }
  var beginTesti = function () {
    console.log('\n\n.--------------------------------------------------.');
    console.log('.                Test Mode Activated               .');
    console.log('.__________________________________________________.\n\n');
    
    program.prompt('Render filename:', function (filename) {
      debug('Begin render...');
      desckit.renderToFile({
        outputFile: config.tempPath + '/testing.png' || filename,
        url: 'http://localhost:1280/assemble/eli1'
      },
        function (err, outputFile) {
          debug('============ render ot file ==========');
          debug('Arguments:', arguments);
          debug('--------------------------------------');
          debug('------------ Begin resize ------------');
          
          setTimeout(function() {
            var sizeA = 360, sizeB = 640;
            
            desckit.resizeImage({
              srcPath: outputFile,
              dstPath: config.tempPath + '/thumbnail-'+sizeA+'.png',
              width: sizeA
            }, function() {
              debug('Result of sizeA:', arguments);
              desckit.resizeImage({
                srcPath: outputFile,
                dstPath: config.tempPath + '/thumbnail-'+sizeB+'.png',
                width: sizeB
              }, function () {
                debug('Result of sizeB:', arguments, '\n\n\n');
                debug('Test Copmlete');
                beginTest();
              })
            });
          }, config.renderWriteTime);
          
        });
    });
  }
}
