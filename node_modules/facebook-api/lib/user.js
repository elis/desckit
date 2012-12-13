function User(raw) {
    return function(access_token) {

        // TODO refactor the callback function
        function simpleCall(path, callback) {
            var params = {
                "access_token": access_token
            };
            raw("GET", path, params,
            function(error, data) {
                if (error) {
                    callback(error, null);
                } else if (data.error) {
                    callback(data.error, null);
                } else {
                    callback(null, data);
                }
            });
        }

        function publish(path, message, callback) {
            var params = {
                "access_token": access_token,
                "message": message
            };
            raw("POST", path, params,
            function(error, data) {
                if (error) {
                    callback(error, null);
                } else if (data.error) {
                    callback(data.error, null);
                } else {
                    callback(null, data);
                }
            });
        }

        // TODO map all elements to like() and comment()
        function getList(userId, list, callback) {
            simpleCall(userId + list,
            function(error, data) {
                callback(error, data);
            });
        }

        function getFeed(userId, callback) {
            getList(userId, '/feed', callback);
        }

        function getHome(callback) {
            getList('me/home', callback);
        }

        // TODO: make something beautiful
        function getFriends(userId, callback) {
            simpleCall(userId + '/friends',
            function(err, data) {
                if (err) {
                    callback(err, null);
                } else {
                    // structure is { data { list of friends}}
                    var friends = data.data;
                    var updated_friends = [];
                    friends.forEach(function(friend) {
                        var name = friend.name;
                        var f = get(friend.id);
                        f.name = name;
                        updated_friends.push(f);
                    });
                    callback(null, updated_friends);
                }
            });
        }

        function get(userId) {
            return {
                id: userId,
                info: function(callback) {
                    simpleCall(userId, callback);
                },
                friends: function(callback) {
                    getFriends(userId, callback);
                },
                feed: {
                    write: function(message, callback) {
                        publish(userId + "/feed", message, callback);
                    },
                    get: function(callback) {
                        getFeed(userId, callback);
                    }
                },
                photos: function(callback) {
                    simpleCall(userId + '/photos', callback);
                },
                photoAlbums: function(callback) {
                    simpleCall(userId + '/albums', callback);
                }
            };
        };

        var me = get('/me');
        // add home feed (latest activities of your friends), works only with /me
        me.home = function(callback) {
            getList('/me/home', callback);
        };
        
        // options need to be {client_id, redirect_uri, client_secret, code}
        function requestAccessToken(options, callback) {
          raw('GET', '/oauth/access_token', options, function(err, data) {
            if (err) {
                callback(err, null);
            } else if (data.error) {
                callback(data.error, null);
            } else {
                callback(null, data.access_token);
            }
          });
        }

        return {
            get: get,
            me: me,
            requestAccessToken: requestAccessToken
        };
    };
};

if (typeof module == "object" && typeof require == "function") {
    module.exports = User;
}
