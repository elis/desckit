// phantomControl.js

// http://nodejs.org/api.html#_child_processes
var sys = require('sys');
var exec = require('child_process').exec;
var child;
var os = require('os');

var phantom = "phantomjs";
if (os.platform() == "windows") {
	phantom += ".exe"
}

module.exports = {
	last_update: null,
	takeshot: function (url, output, width, height) {
		var self = this;
		var cmd = [
			phantom,
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