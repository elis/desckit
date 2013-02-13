
/*
 * GET home page.
 */

module.exports = function(debug) {
    function index(req, res) {
        res.render('desckit');
    };
    return { 'index' : index };
}
