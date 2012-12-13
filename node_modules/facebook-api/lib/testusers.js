// http://developers.facebook.com/docs/test_users/
// TODO friending, deleting
function TestUsers(rawapi) {
    return function(appid, appaccesstoken) {
        var path = "/" + appid + "/accounts/test_users";
        var params = {
            access_token: appaccesstoken
        };

        function add(installed, permissions, callback) {
            var params = {
                access_token: appaccesstoken,
                installed: installed,
                permissions: permissions
            };

            rawapi("POST", path, params,
            function(err, data) {
                if (err) {
                    callback(err, null);
                } else if (data.error) {
                    callback(data.error, null);
                } else {
                    callback(null, data);
                }
            });
        };

        function all(callback) {
            rawapi("GET", path, params,
            function(err, data) {
                if (err) {
                    callback(err, null);
                } else if (data.error) {
                    callback(data.error, null);
                }
                else {
                    callback(null, data.data);
                }
            });
        };

        return {
            add: add,
            all: all
        };
    };
};

if (typeof module == "object" && typeof require == "function") {
    module.exports = TestUsers;
}