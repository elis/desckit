Facebook API
============
Access Facebook with Javascript. This module offers high level and low level calls to the graph API.

**This is an work in process**
I will implement features as I need them.
If you have something valuable to add, send it to me and I will merge it.

Features
-----------

* view information about entities (users, pages, etc.)
* get users friends
* view users wall
* post on walls
* users photos
* users photo albums

Usage
---------

We use the function viewback to display the results of the callbacks

    function viewback(err, data) { 
        if(err) { 
            console.log("Error: " + JSON.stringify(err)); 
        } else { 
            console.log("Data: " + JSON.stringify(data)); 
        }
    }

Use API without Authorization

    var fbapi = require('facebook-api');
    var client = fbapi.user(null); // do not set an access token
    client.get("btaylor").info(viewback);

    > Data: {"id":"220439","name":"Bret Taylor","first_name":"Bret","last_name":"Taylor","link":"http://www.facebook.com/btaylor","gender":"male","locale":"en_US"}

Use API with Authorization

    var fbapi = require('facebook-api');
    var client = fbapi.user(access_token); // needs a valid access_token
    client.me.info(viewback);
    client.me.friends(viewback);

Use Raw API

    var raw = require('facebook-api').raw;
    raw("GET", "cocacola", [], viewback);
    
    > Data: {"id":"40796308305","name":"Coca-Cola" ... }

Contributing
-------------------

I will merge the following merge requests:

* unit tested changes
* refactored old code
* added new feature
* fixed bugs
