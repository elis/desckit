var _ = require('underscore')
  , fs = require('fs')
  , debug = require('debug')('desckit:routes')
  , desckit = require('../lib/desckit')
  ;
/*
 * GET home page.
 */

var routes = module.exports = {};
var config = routes.config = {
  cachePath: __dirname + '../cache'
};
var renderOptions = {
  config: config,
  title: 'Desckit',
  currentPage: 'routes'
};

routes.useConfig = function (conf) {
  _.extend(config, conf);
}
routes.parseRequest = function (req, res, next) {
  
};

routes.index = function (req, res) {
  res.render('desckit', _.extend({}, renderOptions));
};

var counter = {};
routes.renderDesck = function (req, res) {
  desckit.getDesckByName(req.params.desckName, function (err, desck) {
    if (err) { throw err; }
    counter[desck.name] = counter[desck.name] ? counter[desck.name] + 1 : 1;
    
    var renderPath = config.cachePath + '/' + desck.name
      , filename = (counter[desck.name] % 2 ? 'a' : 'b') + '.png';
    
    if (!fs.existsSync(renderPath)) {
      fs.mkdirSync(renderPath);
    }
    
    desckit.renderToFile({
      url: config.appUrl + '/descks/' + desck.name + '/display',
      outputFile: config.cachePath + '/' + desck.name + '/' + filename
    }, function (err, output) {
      if (err) { throw err; }
      setTimeout(function(){
        res.json({
          localFile: output, 
          url: config.appUrl + '/cache/' + desck.name + '/' + filename
        });
        // res.redirect('/cache/' + desck.name + '/' + filename);
      }, config.renderWriteTime);
    })
  });
}

routes.descks = function (req, res, next) {
  desckit.loadDescks(function (err, descks) {
    if (err) { next(err); return; }
    res.render('desckit', _.extend({}, renderOptions, {
        descks: descks,
        currentPage: 'descks'
      })
    );
  });
};

routes.displayDesck = function (req, res, next) {
  desckit.getDesckByName(req.params.desckName, function (err, desck) {
    if (err) { next(err); return; }
    
    desckit.compileDesck(desck, function (err, output) {
      if (err) { next(err); return; }
      res.render('desckit-page', _.extend({}, renderOptions, {
        output: output,
        desck: desck
      }));
    })
  });
}

routes.desckThumbnail = function (req, res, next) {
  var desckName = req.params.desckName
    , width = req.params.width.split('x')[0]
    , thumbPath = '/thumbnails/' + desckName + '-' + width + '.png'
    ;
  
  debug('exists?', fs.existsSync(config.cachePath + '/' + desckName + '/a.png'));
  // See if in cache
  if (fs.existsSync(config.cachePath + thumbPath)) {
    res.redirect('/cache/' + thumbPath);
  } 
  
  // See if in desckPath
  else if (fs.existsSync(config.descksPath + '/' + desckName + '/thumbnail-'+width+'.png')) {
    res.redirect('/descks' + '/' + desckName + '/thumbnail-'+width+'.png');
  }
  
  // See if rendered exists and resize it
  else if (fs.existsSync(config.cachePath + '/' + desckName + '/a.png')) {
    debug('file exists, gonna resize');
    desckit.resizeImage({
      srcPath: config.cachePath + '/' + desckName + '/a.png',
      dstPath: config.cachePath + thumbPath,
      width: width
    }, function (err, filename) {
      if (err) { throw err; }
      res.redirect('/cache/' + thumbPath);
    })
  }
  
  // Load a new one?
  else {
    // A good place to just put a default one
    res.send(404, "No such thumbnail");
  }
  
    
}