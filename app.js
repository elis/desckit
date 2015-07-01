
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , ejs = require('ejs')
  , path = require('path')
  , debug = require('debug')('desckit')
  , config = require('config')

global.appPath = __dirname;

/**
 * Our modules
 */
var routes = require('./routes');

config.appUrl = 'http://' + process.env.COMPUTERNAME + (config.port != 80 ? ':'+config.port : '');

require('datejs');
require('./lib/desckit').useConfig(config);

routes.useConfig(config);

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || config.port || 1280);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(function(req, res, next){
        req.conf = config;
        debug('%s %s', req.method, req.url);
        next();
    });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));

    app.use(express.static(path.join(__dirname, '/public')));

    ejs.open = '<?';
    ejs.close = '?>';
    
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/descks', routes.descks);
app.get('/descks/:desckName/thumbnail/:width', routes.desckThumbnail);
app.get('/descks/:desckName/display', routes.displayDesck);
app.get('/descks/:desckName/render', routes.renderDesck);

http.createServer(app).listen(app.get('port'), function(){
    debug("Express server listening on port " + app.get('port'));
    console.log('Desckit is now running on port:', app.get('port'), ' - open your browser and navigate to http://localhost:' + app.get('port'));
    if (process.env.DEBUG) {
      // Open the base URL
      // var open = require('open');
      // open(config.appUrl);
    }
});

module.exports = app;
