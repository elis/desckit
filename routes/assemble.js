// assemble.js
var ejs = require('ejs')
	,	yahooWeather = require('weather')
	, _ = require('underscore')
	, http = require('http')
	, phantomControl = require('phantom/phantomControl');

var counter = 0;
var counts = {};

exports.test = function (req, res, next) {
	if (req.params.id) {
		if (!(req.params.id in counts)) counts[req.params.id] = 0;
		
		if (req.params.render) {
			counts[req.params.id]++;
			exports.render(req, res, next);
			res.render('renderer', _.extend({}, req.params, {
				counter: counts[req.params.id]
			}));
		} else {
			exports.output(req, res, next);
		}
	}
}

exports.render = function (req, res, next) {
	phantomControl.takeshot(
		'http://localhost:1280/assemble/' + req.params.id,
		'walls/desk' + (counts[req.params.id] % 2 ? '-b' : '') + '.png',
		'1920', '1080'
	); 
};

exports.output = function (req, res, next) {
	var template = __dirname + '/../public/scripts/' + req.params.id + '/script.ejs';
	var date = new Date();
	var Script = require(__dirname + '/../public/scripts/' + req.params.id + '/script');
	
	var locals = _.extend({
  	scriptID: req.params.id,
  	title: 'Eli\'s Wallpaper Generator',
  	time: date.toString('HH:mm'),
  	counter: counts[req.params.id],
  	date: date
	}, req.params);
	Script.update();
	
	ejs.renderFile(template, _.extend(locals, Script.locals), function (islike, output) {
		locals.output = output;
		console.log('render file args:', arguments);
		console.log(locals); 	
		// Output is broken :(
	  res.render('index', _.extend(locals, Script.locals));
	});
}