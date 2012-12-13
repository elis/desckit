var api = require('../facebook-api.js');

exports.testInterface = function(test) {
    test.ok(api.raw instanceof Function, "raw is not a function");
    test.ok(api.user instanceof Function, "user is not a function");
    test.ok(api.testusers instanceof Function, "testusers is not a function");
    test.done();
}

