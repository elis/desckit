var debug = require('debug')('desckit:Desck:base')
	, config = require('config')
	, http = require('http')
	, _ = require('underscore')
;
'use strict';

var base = module.exports = {
	init: function (callback) {
		debug('Initialized');
		
		// Perform here boot functions
		// and trigger the callback or return
		if (callback) { callback(null, this); }
		else return this;
	},
	update: function (callback) {
		var that = this;
		
		this.loadMyStuff(function (err, result) {
			debug('Stuff Loaded!', result);
			that.reddit = result.reddit;
			that.weather = result.weather;
			that.last_update = +new Date();
			
			if (typeof callback == 'function') {
				callback(err, result);
			}
		});
	},
	
	render: function (callback) {
		var that = this
			, date = this.locals.date = new Date();
		if (!this.last_update) {
			this.update(function (err, result) {
				that.locals.reddit = result.reddit;
				that.locals.weather = result.weather;
				callback(err, result);
			});
		} else {
			this.locals.reddit = this.reddit;
			this.locals.weather = this.weather;
			callback(null, 'sup?');
		}
	},
	
	
	loadMyStuff: function (callback) {
		var results = {};
		
		var ready = function (deed, err, result) {
			results[deed] = result || err;
			
			if (results.reddit && results.weather) {
				callback(null, results);
			}
		}
		
		this.getWeather(function (err, result) {
			ready('weather', err, result);
		});
		
		this.getReddit(function (err, result) {
			ready('reddit', err, result);
		});
	},
	
	
	getWeather: function (callback) {
		var yahooWeather = require('weather')
			, options = _.extend({}, this.defaultWeatherOptions, this.conf.weather || {}, config.weather || {});
		
		yahooWeather(options, function(data) {
			var weather = data;
			var ret = '';
			switch (weather.code) {
				case '29':
					ret = "night-morecloudy";
					break;
				case 30:
					ret = "morecloudy";
					break;
				case 33:
					ret = "night-barelycloudy";
					break;
				case 34:
					ret = "barelycloudy";
					break;
				default:
					ret = "clear";
					break;
			}
			weather.textcode = ret;
			weather.location = options.name;
			callback(null, weather);
		});
	},
	
	defaultRedditOptions: {
		  host: 'www.reddit.com',
		  port: 80,
		  path: '/user/%username%/about.json'
	},
	
	getReddit: function (callback) {
		var options = _.extend({}, 
			this.defaultRedditOptions, 
			this.conf.reddit || {},
			config.reddit || {});
		
		if (!options.username) {
			callback('Reddit username is not defined', null);
			return;
		}
		options.path = options.path.replace('%username%', options.username || 'YOU FORGOT TO DEFINE YOUR REDDIT USERNAME');
		
		debug('Ready to fetch reddit with options:', options);
		
		var htoutput = '';

		http.get(options, function(res) {
		  res.on('data', function (raw) {
		  	htoutput += raw.toString();
			}).on('end', function() {
				var data = JSON.parse(htoutput);
				debug('Reddit finished with output:', htoutput);
				callback(null, data);
			});
		}).on('error', function(err) {
		  debug("Reddit got error:", err.message);
		  callback(err, null);
		});
	}
};

if (process.env.DESCKIT_TESTMODE) {
	var mode = process.env.DESCKIT_TESTMODE.split(',');
	base.conf = _.extend({}, 
		require(__dirname + '/desck.json')
	);
	
	debug('config loaded for base:', base.config);
	debug('Running in test mode:', mode);
	
	if (mode.indexOf('reddit') >= 0) {
		base.getReddit(function (err, result) {
			if (err) debug('Got error from reddit:', err);
			debug('Got reddit result:', result);
		});
	}
	
	if (mode.indexOf('weather') >= 0) {
		base.getWeather(function (err, result) {
			if (err) debug('Weather got error:', err);
			debug('Got weather result:', result);
		})
	}
}