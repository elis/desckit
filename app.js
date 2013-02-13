
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , ejs = require('ejs')
  , path = require('path')
  , debug = require('debug')('desckit')

/**
 * Our modules
 */
var routes = require('./routes')(debug)
  , assemble = require('./routes/assemble')(debug)
  , helpers = require('./desckit.helpers')(debug)
  ;

require('datejs');
  
var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 1280);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(function(req, res, next){
        debug('%s %s', req.method, req.url);
        next();
    });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));

    app.use(express.static(path.join(__dirname, 'public')));

    ejs.open = '<?';
    ejs.close = '?>';
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/descks', routes.descks);
app.get('/assemble/:id?/:render?/:reload?', assemble.request);

http.createServer(app).listen(app.get('port'), function(){
    debug("Express server listening on port " + app.get('port'));
    if (!process.env.DEBUG) {
      // Open the base URL
      var open = require('open');
      open('http://' + process.env.COMPUTERNAME + (app.get('port') != 80 ? ':'+app.get('port') : ''));
    }
});

module.exports = app;
 