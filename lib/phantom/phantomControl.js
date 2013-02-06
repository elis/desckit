// phantomControl.js

// http://nodejs.org/api.html#_child_processes
var sys = require('sys');
var exec = require('child_process').exec;
var child;


module.exports = {
	last_update: null,
	takeshot: function (url, output, width, height) {
		var self = this;
		var cmd = [
			"phantomjs", // TODO: tack on .exe if we're on Windows
			__dirname + "/phantomSlave.js",
			url, output, width, height
		].join(' ');
		
		// cmd = 'ls -al';
		// executes `pwd`
		child = exec(cmd, function (error, stdout, stderr) {
		  if (error !== null) {
		    console.log('exec error: ' + error);
		  }
		  self.last_update = new Date().getTime();
		});
	}
}


// module.exports.takeshot("http://localhost:1280/assemble/eli1", "desk.png", 1920, 1080);