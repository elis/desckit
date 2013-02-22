'use strict';

var program = require('commander')
	, ejs = require('ejs')
  , _ = require('underscore')
  , http = require('http')
  , debug = require('debug')('desckit:core:Desck')
  ;

var Desck = module.exports = function () {
	this.locals = {
    scriptID: 'Eli1',
    title: 'Eli\'s Wallpaper Generator',
    counter: this.counter
  };
};

_.extend(Desck.prototype, {
	counter: 0
});

Desck.prototype.render = function () {}


