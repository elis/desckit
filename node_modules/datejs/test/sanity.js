var vows = require('vows')
  , assert = require('assert')
  , datejs = require('datejs')
  ;

vows.describe('A sanity test').addBatch({
    'parse': { topic: "2011-02-02 10:25:00" 
	               , 'parses"': function(topic) {
						var date = Date.parse(topic);
						assert.equal(date.getFullYear(), 2011);
						assert.equal(date.getMonth(), 1);
						assert.equal(date.getDate(), 2);
						assert.equal(date.getHours(), 10);
						assert.equal(date.getMinutes(), 25);
						assert.equal(date.getSeconds(), 0);
						
						assert.equal(date.is().wednesday(), true);
					 }
				   } 
}).export(module);
