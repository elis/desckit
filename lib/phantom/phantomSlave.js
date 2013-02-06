// phantomSlave.js
var page = require('webpage').create(),
    system = require('system'),
    address, output, size;

var url = "http://localhost:1280/assemble/eli1",
    output = "walls/desk.png",
    viewport = {width: 1920, height: 1080},
    interval = 10,
    counter = 0;
 
var args = system.args
	, url = args[1]
	, output = args[2]
	, viewport = {width: args[3] || 1920, height: args[4] || 1080};

address = url;
output = output;
page.viewportSize = viewport;
console.log('Opening', url);
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