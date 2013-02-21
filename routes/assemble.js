// assemble.js
var ejs = require('ejs')
  , _ = require('underscore')
  , http = require('http')
  , phantomControl = require( __dirname + '/../lib/phantom/phantomControl')
  , descksPath = __dirname + '/../public/descks'
  ;

var counter = 0;
var counts = {};

module.exports = function(debug) {

  function request(req, res, next) {
    if (req.params.id) {
      if (!(req.params.id in counts)) counts[req.params.id] = 0;
      
      if (req.params.render) {
        if (req.params.render == 'thumbnail') {
          var desckPath = req.conf.descksPath + '/' + req.params.id;
          
          helpers.getDesck(desckPath, function (err, desck) {
            desck.renderToFile({
              width: 186,
              filename: desckPath + '/thumbnail.png'
            }, function (err, result) {
              
            })
          })
        }
        counts[req.params.id]++;
        render(req, res, next);
        res.render('renderer', _.extend({}, req.params, {
          counter: counts[req.params.id]
        }));
      } else {
        output(req, res, next);
      }
    }
  }

  function render(req, res, next) {
    phantomControl.takeshot(
      'http://localhost:1280/assemble/' + req.params.id,
      'walls/desk' + (counts[req.params.id] % 2 ? '-b' : '') + '.png',
      '1920', '1080'
    ); 
  };
  
  var log = require('debug')('desckit:e');

  function output(req, res, next) {
      var helpers = require(__dirname + '/../lib/desckit.helpers')(debug)
        , desckName = req.params.id
        , desckPath = descksPath + '/' + desckName
      ;
    
    var desckit = require('../lib/desckit');
    
    desckit.getDesck(desckPath, function (err, desck) {
      if (err) { 
        res.send(501);
      } else {
        // Compile the desck
        desckit.compileDesck(desck, function (err, output) {
          debug('Got response from compileDesck:', err, output);
          if (err) {
            next(err);
            return;
          }
          var locals = _.extend({}, desck.locals, {desck: desck, req: req});
          
          // Render the desck template
          ejs.renderFile(desck.conf.templateFile, locals, 
            function (err, output) {
              if (err) {
                next(err);
                return;
              }
              locals.output = output;
              locals.title = 'Desckit // ' + desck.name;
              
              // Render the desckit-page and write response with it
              res.render('desckit-page', locals);
            }
          );
        })
      }
    })
    
    if (false)
      helpers.getDesck(desckPath, function (err, desck) {


        var template = desck.conf.templateFile;
        var date = new Date();
        var Script = require(__dirname + '/../public/descks/' + req.params.id + '/script');
        
        var locals = _.extend({
          scriptID: req.params.id,
          title: 'Eli\'s Wallpaper Generator',
          time: date.toString('HH:mm'),
          counter: req.query.counter || counts[req.params.id],
          date: date
        }, req.params);
        
        function ready () {
            console.log('Desck is ready, showing:', desck);
            ejs.renderFile(template, _.extend(locals, Script.locals), function (islike, output) {
              locals.output = output;
              debug('render file args:', arguments);
              res.render('desckit-page', _.extend(locals, Script.locals));
            });
        }
        
        if ('function' == typeof desck.script.update) {
            desck.script.update(function (err, result) {
              debug('Desck after script update, firing ready...');
               ready(); 
            });
        } else {
            ready();
        }
      });
  }

  return {
    'request' : request,
    'render' : render,
    'output' : output
  }
}