// script.js
var yahooWeather = require('weather')
    , http = require('http');
    
var settings = {
    updateInterval: 10*60*1000,
    weatherConfig: {
        lat: 39.7589,
        long: 84.1917,
        name: 'Dayton, OH'
    }
};

var foggy = {
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
        foggy.locals.weather = weather;
        console.log('got weather');
    });
    
}

module.exports = foggy;
