// script.js
var	yahooWeather = require('weather')
	, http = require('http');
	
	
var settings = {
	updateInterval: 10*60*1000,
	weatherConfig: {
		lat: 32.0975,
		long: 34.8139,
		name: 'Tel Aviv, Israel'
	},
	bitcoinConfig: {
		
	},
	redditConfig: {
		user: 'the-ace'
	},
	
	something: 'else'
};

var Elis = {
	locals: {},
	_timeout: null,
	update: function () {
		var self = this,
			date = new Date(),
			now = date.getTime();
			
		console.log(now, self.last_update, settings.updateInterval);
		if (now < self.last_update + settings.updateInterval) {
			return true;
		}
		self.last_update = now;
		
		getWeather();
		getReddit();
		getBitcoin();
		
		console.log('getting them...');
		
		clearTimeout(self._timeout);
		self._timeout = setTimeout(self.update, settings.updateInterval);
	}
};

function getWeather () {
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
		Elis.locals.weather = weather;
		console.log('got weather');
	});
	
}


function getReddit () {
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
			Elis.locals.reddit = data;
			console.log('got reddit');
		});
	}).on('error', function(e) {
	  console.log("Reddit got error: " + e.message);
	});
}


function getBitcoin () {
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
			Elis.locals.bitcoin = data;
			console.log('got bitcoin');
		}).on('error', function (e) {
			console.log('Bitcoin got error: ' + e.message);
		});
	});
}


module.exports = Elis;