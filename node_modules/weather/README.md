An example of how to get the weather based on geolocation.

```javascript
 var weather = require('weather');

 weather({lat: -50.212, long: 10.829}, function(data) {
	if (data.temp > 30)
		console.log("Damn it's hot!");
 });
 ```
 
 Example JSON result:
 
```javascript
 {
 	temp: 18,	// Current temperature
 	high: 20,	// High for the day
 	low: 9,		// Low for the day
 }
```
