var querystring = require('querystring');
var https = require('https');
var URL = require('url');

function raw(method, path, params, callback) {
    var facebook_graph_url = 'https://graph.facebook.com';
    path = path[0] == '/' ? path: '/' + path;
    var url = joinUrl(facebook_graph_url + path, params);
    var parser = JSON.parse;
    // oauth/access_token's data is not in json
    if (path == "/oauth/access_token") {
        parser = querystring.parse;
    }
    function cb(er, data) {
        if(er) {
            callback(er, null);
        } else {
            parsed = parser(data);
            callback(er, parsed);
        }
    }
    doRequest(method, url, cb);
};

function doRequest(method, url, callback) {
    var parsedUrl = URL.parse(url, true);
    var result = '';

    var options = {
        host: parsedUrl.host,
        port: parsedUrl.protocol == 'https:' ? 443: 80,
        path: joinUrl(parsedUrl.pathname, parsedUrl.query),
        method: method
    };

    var req = https.request(options,
    function(res) {
        res.on('data',
        function(chunk) {
            result += chunk;
        });
        res.on('end',
        function() {
            if (res.statusCode !== 200) {
                callback({
                    statusCode: res.statusCode,
                    data: result
                },
                null);
            } else {
                callback(null, result);
            }
        });
    });
    req.on('error', function(err) {
      callback(err);
    });
    req.end();
};

function joinUrl(path, params) {
    return path + "?" + querystring.stringify(params);
}

if (typeof module == "object" && typeof require == "function") {
    module.exports = raw;
}
