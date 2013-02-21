// phantomControl.js

// http://nodejs.org/api.html#_child_processes
var sys = require('sys')
  , os = require('os')
  , _ = require('underscore')
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
    },
    render: function (options, callback) {
        var opts = _.extend({
                url: '',
                output: '',
                width: '',
                height: ''
            }, options || {});
        
        var self = this;
        var cmd = [
            phantom,
            __dirname + "/phantomSlave.js",
            opts.url, opts.outputFile, opts.width, opts.height
        ].join(' ');
        
        debug('Requested to render with the following command:');
        debug("`" + cmd + "`");
        exec(cmd, function (error, stdout, stderr) {
            console.log('Dafuq?');
            debug('error:', error);
            debug('stdout:', stdout);
            debug('stderr:', stderr);
            if (error !== null) {
                debug('exec error: ' + error);
            }
            debug('all done');
            console.log('Testig?!')
            self.last_update = new Date().getTime();
        });
    }
}