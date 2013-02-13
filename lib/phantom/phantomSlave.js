// phantomSlave.js

// requirements from PhatomJS
var page = require('webpage').create()
  , system = require('system')
  ;

// arguments from the invocation from phatomControl.js
var args = system.args
  , url = args[1]
  , output = args[2]
  , viewport = { width: args[3] || 1920, height: args[4] || 1080 };

page.viewportSize = viewport;
console.log('Opening', url);

// https://github.com/ariya/phantomjs/wiki/Screen-Capture
page.open(url, function (status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
    } else {
        console.log('Page opened.');
        window.setTimeout(function () {
            console.log('Rendering...');
            page.render(output);
            console.log('Done.\n\nexiting...');
            phantom.exit();
        }, 1000);
    }
});