DateJS is not working in 0.4.x - I'm now investigating it.
==========================================================

DateJS
------

This is a simple NPM wrapper around the excellent datejs client-side library.

It modifies the Date prototype - this technique is looked down upon, but it's
a very useful library.

See [the datejs site](http://www.datejs.com/) for more information.

Usage
-----

In the shell:

    npm install datejs

In your app:

    require('datejs');

Notes
-----

NPM package datejs v0.0.1 corresponds to datejs Alpha1.  It hasn't changed for 
three years, so hopefully it won't be too much of a maintenance nightmare.

I've just included all of the non-US locales in lib - I've not written any way 
to access them yet.

What I'll probably do is create a wrapper which defaults to en-US, but can be
called with other locales.

I am not the author of datejs.  I'm just maintaining an NPM package of it, as I
needed one.
