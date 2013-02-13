// phantomControl.js

// http://nodejs.org/api.html#_child_processes
var sys = require('sys')
  , os = require('os')
  , exec = require('child_process').exec
  , debug = require('debug')('desckit:phantom')
  ;

// on Windows, phantomjs needs a .exe on the end
var phantom = "phantomjs";
if (os.platform() == "win32") {
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
        
        exec(cmd, function (error, stdout, stderr) {
            if (error !== null) {
                debug('exec error: ' + error);
            }
            self.last_update = new Date().getTime();
        });
    }
    debug('Dirname:', __dirname);
}