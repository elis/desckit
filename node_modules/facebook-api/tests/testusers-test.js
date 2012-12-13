var TestUsers = require('../lib/testusers.js');
var sinon = require('sinon');

var appid = "appid";
var appsecret = "appsecret";
var path = "/" + appid + "/accounts/test_users";
var test_user_dummy = {
    id: "1",
    access_token: "at",
    login_url: "url"
};

exports.testAllValidInput = function(test) {
    var raw = sinon.mock();
    raw.calledWith("GET", path, {
        access_token: appsecret
    });
    var tu = TestUsers(raw)(appid, appsecret);
    tu.all(function(er, data) {});

    raw.verify();
    test.ok(raw.calledOnce, "mock was only called once");
    test.done();
};

exports.testAllValidOutput = function(test) {
    var raw = sinon.mock();
    raw.callsArgWith(3, null, {
        data: [test_user_dummy]
    });

    var tu = TestUsers(raw)(appid, appsecret);
    tu.all(function(er, data) {
        test.equal(data.length, 1, "wrong amount of data found");
        test.equal(data[0], test_user_dummy, "wrong item returned");
        test.done();
    });
};

// TODO: dont know how to verify all parameters except the callback
testAddValidInput = function(test) {
    var lowlevelmock = sinon.mock();
    var params = {
        access_token: appsecret,
        installed: true,
        permissions: ["foo"]
    };
    var tu = TestUsers(lowlevelmock)(appid, appsecret);
    var callback = function(err, data) {};
    tu.add(true, ["foo"], callback);
    lowlevelmock.verify();
    test.ok(lowlevelmock.calledOnce, "mock was called once");
    test.equal(lowlevelmock.args[0], ["POST", path, params, callback]);
    var args = lowlevelmock.args[0];
    test.equal(args[0], "POST", "POST");
    test.equal(args[1], path, "PATH");
    test.equal(args[2], params, "PARAMS");
    test.equal(args[3], callback, "CALLBACK");
    //  test.ok(lowlevelmock.calledWith("POST", path, params, null), "mock was called with the wrong parameters " + JSON.stringify(lowlevelmock.args));
    test.done();
};

exports.testAddOutput = function(test) {
    var lowlevelmock = sinon.mock();
    lowlevelmock.callsArgWith(3, null, test_user_dummy);
    var params = {
        access_token: appsecret,
        installed: true,
        permissions: ["foo"]
    };
    var tu = TestUsers(lowlevelmock)(appid, appsecret);
    var callback = function(err, data) {
        test.ok(err == null, "no error");
        test.equal(data, test_user_dummy);
        test.done();
    };
    tu.add(true, ["foo"], callback);
};


