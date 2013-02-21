var _ = require('underscore')
  , fs = require('fs')
  ;
/*
 * GET home page.
 */

module.exports = function(debug) {
    var data = {
        currentPage: ''
      }
      , helpers = require('../lib/desckit.helpers')(debug)
      ;
    function index(req, res) {
        res.render('desckit', _.extend({}, data, {currentPage: 'home'}));
    };
    
    function descks (req, res) {
      // Find all descks
      helpers.getDescks('public/descks', function (err, result) {
        var data = _.extend({}, data, {
          currentPage: 'descks',
          descks: result
        });
        
        res.render('desckit', data)
      });
    }
    
    
    return {
      'index' : index,
      'descks': descks
    };
}
