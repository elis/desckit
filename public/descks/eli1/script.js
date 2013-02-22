// script.js
var	yahooWeather = require('weather')
	, http = require('http')
	, _ = require('underscore')
	, debug = require('debug')('desckit:eli1');
	
	
var settings = {};;
var last_update = 0;
var locals = {};

var Elis = module.exports = {
	_timeout: null,
	update: function (callback) {
		var self = this,
			date = new Date(),
			now = date.getTime();
		
		settings = this.conf;
		
		locals.date = date;
		
		debug('Last update:', last_update);
		debug('diff:', now - last_update);
		if (now - last_update >= 60000) {
			debug('getting stuff...');
			getWeather(function (weather) {
				locals.weather = weather;
			});
			getReddit(function (reddit) {
				locals.reddit = reddit; 
			});
			getBitcoin(function (bitcoin) {
				locals.bitcoin = bitcoin;
			});
			
			last_update = now;
		}
		
		_.extend(self.locals, locals);
		
		if ('function' == typeof callback) {
			callback();
		}
	}
};

function getWeather (callback) {
	var _wc = settings.weatherConfig;
	var weather = null;
	yahooWeather({lat: _wc.lat, long: _wc.long}, function(data) {
		weather = data;
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
		weather.location = _wc.name;
		callback(weather);
	});
}


function getReddit (callback) {
	var _rc = settings.redditConfig;
	var options = {
	  host: 'www.reddit.com',
	  port: 80,
	  path: '/user/' + _rc.user + '/about.json'
	};
	var htoutput = '';

	http.get(options, function(res) {
	  res.on('data', function (raw) {
	  	htoutput += raw.toString();
		}).on('end', function() {
			var data = JSON.parse(htoutput);
			callback(data);
		});
	}).on('error', function(e) {
	  console.log("Reddit got error: " + e.message);
	  callback(e);
	});
}


function getBitcoin (callback) {
	var _bc = settings.bitcoinConfig;
	var options = {
		host: 'bitcoincharts.com',
		port: 80,
		path: '/t/weighted_prices.json'
	};
	
	var htoutput = '';
	http.get(options, function (res) {
		res.on('data', function (raw) {
			htoutput += raw.toString();
		}).on('end', function (){
			try {
				var data = JSON.parse(htoutput);
			} catch (e) {
				console.log('bit error', e);
				var data = {};
			}
			callback(data);
			console.log('got bitcoin');
		}).on('error', function (e) {
			callback(e);
			console.log('Bitcoin got error: ' + e.message);
		});
	});
}


module.exports = Elis;