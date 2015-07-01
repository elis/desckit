'use strict';

var debug = require('debug')('desckit:Desck:base')
	, config = require('config')
	, http = require('http')
	, _ = require('underscore')
	, dafuq = require('debug')('desckit:DAFUQ!')

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
	
	defaultWeatherOptions: {
		"lat": 32.0975,
		"long": 34.8139
	},
	
	getWeather: function (callback) {
		if (!config.keys || !config.keys.forecast) { debug('No weather configured, failing'); callback(); return; }
		var Forecast = require('forecast');
		var forecast = new Forecast({
			service: 'forecast.io',
			key: config.keys.forecast,
			units: 'celcius'
		});


		var options = _.extend({}, this.defaultWeatherOptions, this.conf.weather || {}, config.weather || {});
		debug('Ready to fetch weather with options:', options);

		forecast.get([options.lat, options.long], function (err, weather) {
			debug('Result of weather forecast request:', weather);
			callback(err, weather);
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
			debug('No reddit username. failing.');
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