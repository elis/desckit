// execute with nodeunit testfacebookapi.js
var testCase = require('nodeunit').testCase;
var sinon = require('sinon');
var User = require('../lib/user.js')

 var access_token = "access_token"
var userid = "userid";

exports.requiresFunction = function(test) {
    test.ok(User instanceof Function, "User is no function");
    test.done();
};

exports.interfaceUser = function(test) {
    var api = User(null)(null);
    test.ok(api.get instanceof Function, "user has no get function");
    test.equal(typeof api.me, "object", "fb api has no me function");
    test.done();
};

exports.interfaceGetUser = function(test) {
    var get = User(null)(null).get(userid);

    test.equal(get.id, userid, 'userid does not match');
    assertUser(get, test);
    test.done();
};

exports.interfaceMe = function(test) {
    var me = User(null)(null).me;

    test.ok(me.home instanceof Function, "no home function");

    // TODO refactor copy pasta
    test.equal(me.id, '/me', 'userid does not match');
    assertUser(me, test);
    test.done();
};

exports.get_friends = testCase({
    setUp: function(callback) {
        this.userid = "random";
        this.access_token = "access_token";
        this.raw = sinon.mock();
        // TODO expect lowleve("GET", "{at}/friends" {access_token: ...}, cb);
        this.raw.calledWith("GET", "/random/friends");
        this.friendsData = {
            data: [{
                name: "Friend 1",
                id: 1
            },
            {
                name: "Friend 2",
                id: 2
            }]
        };
        this.raw.callsArgWith(3, null, this.friendsData);

        this.api = User(this.raw)(access_token);
        callback();
    },
    tearDown: function(callback) {
        callback();
    },
    verify_mock: function(test) {
        this.api.get(this.userid).friends(function(er, friends) {});
        this.raw.verify();
        test.ok(this.raw.calledOnce, "mock was only called once");
        test.done();
    },
    check_friends: function(test) {
        // both friends avail
        this.api.get(this.userid).friends(function(er, friends) {
            test.ok(er == null, "no error");
            test.ok(friends.length == 2, "friend size is not correct");
            test.equal(friends[0].name, "Friend 1", "name is not correct");
            test.equal(friends[0].id, 1, "id is not correct");
            test.equal(friends[1].name, "Friend 2", "name is not correct");
            test.equal(friends[1].id, 2, "id is not correct");
            test.done();
        });
    },
    check_functions: function(test) {
        var test_functions = function(er, friends) {
            var f1 = friends[0];
            assertUser(friends[0], test);
            assertUser(friends[1], test);
            test.done();
        };
        this.api.get(this.userid).friends(test_functions);
    }
});

function assertUser(actual, test) {
    test.ok(actual.info instanceof Function, "no info function");
    test.ok(actual.friends instanceof Function, "no friends function");
    test.ok(actual.feed.write instanceof Function, "no feed.write function");
    test.ok(actual.feed.get instanceof Function, "no feed.get function");
    test.ok(actual.photos instanceof Function, "no photos function");
    test.ok(actual.photoAlbums instanceof Function, "no photos function");
}
