var raw = require('./lib/raw.js');

function user(appid, appsecret) {
    return
}

function testusers(appid, appsecret) {
    return;
}

if (typeof module == "object" && typeof require == "function") {
    exports.raw = raw;
    exports.user = require('./lib/user.js')(raw);
    exports.testusers = require('./lib/testusers.js')(raw);
}
